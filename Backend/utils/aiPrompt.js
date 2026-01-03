const buildAIPrompt = (summary, totalSpent, transactionCount) => {
  const categories = Object.entries(summary)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => `${cat}: ₹${amount.toFixed(2)}`)
    .join("\n");

  return `
You are a professional personal finance advisor. Analyze the spending data and provide clear, actionable insights.

MONTHLY SPENDING SUMMARY:
Total Spent: ₹${totalSpent.toFixed(2)}
Number of Transactions: ${transactionCount}

Category Breakdown:
${categories}

CRITICAL: Provide your response in this EXACT format. DO NOT use asterisks (*), bold markers (**), or any special formatting characters.

1. Spending Overview: 
Write 2-3 concise sentences summarizing the month's spending patterns. Be specific and mention key observations. Use plain text only.

2. Top Spending Categories: 
List exactly the top 3 categories, one per line, in this exact format:
Category Name: ₹amount
Category Name: ₹amount
Category Name: ₹amount

3. Insights & Recommendations: 
Provide 3-4 actionable recommendations, one per line. Each recommendation should be a complete sentence. Focus on specific areas to reduce spending and improve financial management. Use plain text, no bullets or dashes.

4. Savings Goal: 
Suggest a realistic monthly savings target (as a percentage or amount) with a brief explanation of why this is achievable. Write 2-3 sentences.

IMPORTANT RULES:
- NO asterisks (*) anywhere in your response
- NO bold markers (**) anywhere
- NO bullet points or dashes
- Use plain text only
- Be concise and direct
- Use ₹ symbol for all amounts
- Focus on actionable advice
- Keep each section brief and clear
- Use simple, professional language
`;
};

module.exports = {
  buildAIPrompt,
};
