const { GoogleGenerativeAI } = require("@google/generative-ai");
const AIAnalysis = require("../Models/aiAnalysis");
const Transaction = require("../Models/Transaction");
const { buildAIPrompt } = require("../utils/aiPrompt");
const https = require("https");

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Fallback: Generate basic analysis without AI
function generateBasicAnalysis(summary, totalSpent, transactionCount) {
  const categories = Object.entries(summary)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => ({ category: cat, amount }));

  const topCategory = categories[0];
  const analysis = `
**Spending Overview:**
You spent a total of ₹${totalSpent.toFixed(2)} across ${transactionCount} transactions this month.

**Top Spending Categories:**
${categories.slice(0, 3).map((c, i) => `${i + 1}. ${c.category.charAt(0).toUpperCase() + c.category.slice(1)}: ₹${c.amount.toFixed(2)}`).join("\n")}

**Insights & Recommendations:**
- Your highest spending category is ${topCategory.category} (₹${topCategory.amount.toFixed(2)})
- Consider reviewing expenses in this category to identify potential savings
- Track your spending patterns to better manage your budget

**Savings Goal:**
Based on your current spending, consider setting a savings goal of 10-20% of your monthly income. This would help build an emergency fund and achieve long-term financial goals.
  `.trim();

  return analysis;
}

// Try REST API directly as fallback
async function tryRestAPI(prompt, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    });

    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: "/v1beta/models/gemini-pro:generateContent?key=" + apiKey,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(responseData);
            if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content) {
              resolve(parsed.candidates[0].content.parts[0].text);
            } else {
              reject(new Error("Unexpected API response format"));
            }
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error(`API returned status ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Helper function to get available models (for debugging)
async function getAvailableModels() {
  if (!genAI) return [];
  try {
    // Note: listModels might not be available in all SDK versions
    // This is just for debugging purposes
    return [];
  } catch (err) {
    return [];
  }
}

// ANALYZE MONTHLY SPENDING
exports.analyzeSpending = async (req, res) => {
  try {
    const { month } = req.body;

    if (!month) {
      return res.status(400).json({ error: "Month is required (format: YYYY-MM)" });
    }

    // Filter transactions by month
    const [year, monthNum] = month.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    });

    if (!transactions.length) {
      return res.status(404).json({ message: "No transactions found for this month" });
    }

    // Calculate summary
    const summary = {};
    let totalSpent = 0;
    transactions.forEach((t) => {
      summary[t.category] = (summary[t.category] || 0) + t.amount;
      totalSpent += t.amount;
    });

    // Check if analysis already exists
    let analysis = await AIAnalysis.findOne({
      userId: req.user._id,
      month,
    });

    // Generate AI response if API key is available
    let aiResponse = null;
    let usedAI = false;

    if (genAI && process.env.GEMINI_API_KEY) {
      const prompt = buildAIPrompt(summary, totalSpent, transactions.length);
      
      // Try multiple model names in order of preference
      const modelNamesToTry = [
        process.env.GEMINI_MODEL, // User-specified model (highest priority)
        "gemini-pro", // Most widely available model
        "gemini-1.5-pro",
        "gemini-1.5-flash",
      ].filter(Boolean); // Remove undefined values

      let success = false;
      let lastError = null;

      // Method 1: Try SDK with different models
      for (const modelName of modelNamesToTry) {
        try {
          console.log(`Attempting to use SDK model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          aiResponse = result.response.text();
          console.log(`Successfully used SDK model: ${modelName}`);
          success = true;
          usedAI = true;
          break;
        } catch (modelError) {
          console.log(`SDK Model ${modelName} failed:`, modelError.message);
          lastError = modelError;
          continue;
        }
      }

      // Method 2: Try REST API directly as fallback
      if (!success) {
        try {
          console.log("Attempting REST API fallback...");
          aiResponse = await tryRestAPI(prompt, process.env.GEMINI_API_KEY);
          console.log("Successfully used REST API");
          success = true;
          usedAI = true;
        } catch (restError) {
          console.error("REST API also failed:", restError.message);
          lastError = restError;
        }
      }

      // If all AI methods fail, use basic analysis
      if (!success) {
        console.log("All AI methods failed, generating basic analysis...");
        aiResponse = generateBasicAnalysis(summary, totalSpent, transactions.length);
        aiResponse += `\n\n*Note: AI analysis unavailable. This is a basic analysis. Please check your GEMINI_API_KEY and ensure the Gemini API is enabled in Google Cloud Console.*`;
      }
    } else {
      // No API key - generate basic analysis
      aiResponse = generateBasicAnalysis(summary, totalSpent, transactions.length);
      aiResponse += `\n\n*Note: Add GEMINI_API_KEY to your .env file to enable AI-powered analysis.*`;
    }

    // Update or create analysis
    if (analysis) {
      analysis.summary = aiResponse;
      await analysis.save();
    } else {
      analysis = await AIAnalysis.create({
        userId: req.user._id,
        month,
        summary: aiResponse,
      });
    }

    return res.json(analysis);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET EXISTING ANALYSIS
exports.getAnalysis = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ error: "Month is required (format: YYYY-MM)" });
    }

    const analysis = await AIAnalysis.findOne({
      userId: req.user._id,
      month,
    });

    if (!analysis) {
      return res.status(404).json({ message: "No analysis found for this month" });
    }

    return res.json(analysis);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET ALL ANALYSES (for history)
exports.getAllAnalyses = async (req, res) => {
  try {
    const analyses = await AIAnalysis.find({
      userId: req.user._id,
    })
      .sort({ month: -1 })
      .select("month summary createdAt");

    return res.json(analyses);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// TEST GEMINI CONNECTION
exports.testGeminiConnection = async (req, res) => {
  try {
    if (!genAI || !process.env.GEMINI_API_KEY) {
      return res.status(400).json({ 
        error: "GEMINI_API_KEY not configured",
        message: "Please add GEMINI_API_KEY to your .env file"
      });
    }

    const modelNamesToTry = [
      process.env.GEMINI_MODEL,
      "gemini-pro",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
    ].filter(Boolean);

    const results = [];

    for (const modelName of modelNamesToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say 'Hello' in one word.");
        results.push({
          model: modelName,
          status: "success",
          response: result.response.text(),
        });
      } catch (error) {
        results.push({
          model: modelName,
          status: "failed",
          error: error.message,
        });
      }
    }

    const successful = results.find(r => r.status === "success");
    
    return res.json({
      apiKeyConfigured: true,
      successfulModel: successful?.model || null,
      results,
      message: successful 
        ? `Successfully connected! Use model: ${successful.model}`
        : "All models failed. Please check your API key and ensure Gemini API is enabled in Google Cloud Console.",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
