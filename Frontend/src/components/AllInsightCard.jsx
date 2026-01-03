import { useState, useEffect } from "react";
import { analyzeSpending, getAnalysis } from "../api/ai.api";
import "../App.css";

export default function AllInsightCard() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalysis();
  }, [month]);

  const loadAnalysis = async () => {
    setFetching(true);
    setError("");
    try {
      const res = await getAnalysis(month);
      setAnalysis(res.data);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.error || "Failed to load analysis");
      } else {
        setAnalysis(null);
      }
    } finally {
      setFetching(false);
    }
  };

  const analyze = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await analyzeSpending(month);
      setAnalysis(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to generate analysis");
    } finally {
      setLoading(false);
    }
  };

  const cleanText = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\*/g, '') // Remove all asterisks
      .replace(/^[-•]\s*/gm, '') // Remove bullet points
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .trim();
  };

  const parseAnalysis = (text) => {
    if (!text) return null;

    const sections = {
      overview: "",
      topCategories: [],
      insights: [],
      savingsGoal: "",
    };

    // Clean the text first
    const cleanTextContent = cleanText(text);

    // Try to extract structured sections with better patterns
    const overviewMatch = cleanTextContent.match(/(?:Spending Overview|Overview|Summary)[:：]?\s*(.+?)(?=\n\n|\n\d+\.|Top Spending|Insights|Savings|$)/is);
    if (overviewMatch) {
      sections.overview = cleanText(overviewMatch[1]);
    }

    // Extract top categories - look for patterns like "Category: ₹amount" or numbered lists
    const categoriesMatch = cleanTextContent.match(/(?:Top Spending Categories|Top Categories)[:：]?\s*(.+?)(?=\n\n|\n\d+\.|Insights|Recommendations|Savings|$)/is);
    if (categoriesMatch) {
      const categoryText = categoriesMatch[1];
      const categoryLines = categoryText
        .split('\n')
        .filter(line => line.trim() && !line.match(/^\d+\.?\s*$/)) // Remove empty or just numbers
        .map(line => cleanText(line))
        .filter(line => line.length > 0);
      
      // Extract category:amount pairs
      sections.topCategories = categoryLines
        .slice(0, 3)
        .map(line => {
          // Try to match "Category: ₹amount" or "Category: amount"
          const match = line.match(/(.+?):\s*₹?([\d,]+\.?\d*)/i);
          if (match) {
            return `${match[1].trim()}: ₹${match[2]}`;
          }
          // If no match, return cleaned line
          return line.replace(/^\d+\.?\s*/, '').trim();
        })
        .filter(cat => cat && cat !== '*');
    }

    // Extract insights - look for bullet points or numbered items
    const insightsMatch = cleanTextContent.match(/(?:Insights|Recommendations|Insights & Recommendations)[:：]?\s*(.+?)(?=\n\n|\n\d+\.|Savings|Goal|$)/is);
    if (insightsMatch) {
      const insightsText = insightsMatch[1];
      const insightLines = insightsText
        .split('\n')
        .filter(line => line.trim() && !line.match(/^\d+\.?\s*$/))
        .map(line => cleanText(line))
        .filter(line => line.length > 0 && line !== '*');
      
      sections.insights = insightLines.slice(0, 5); // Limit to 5 insights
    }

    // Extract savings goal
    const savingsMatch = cleanTextContent.match(/(?:Savings Goal|Savings|Goal)[:：]?\s*(.+?)(?=\n\n|$)/is);
    if (savingsMatch) {
      sections.savingsGoal = cleanText(savingsMatch[1]);
    }

    // If structured parsing failed, try to split by numbered sections
    if (!sections.overview && !sections.topCategories.length) {
      const numberedSections = cleanTextContent.split(/\n\s*\d+\.\s*/);
      if (numberedSections.length > 1) {
        sections.overview = cleanText(numberedSections[1]?.split('\n').slice(1).join(' ') || numberedSections[1] || "");
        if (numberedSections[2]) {
          const categories = numberedSections[2]
            .split('\n')
            .filter(l => l.trim() && l !== '*')
            .map(l => cleanText(l))
            .filter(l => l.length > 0);
          sections.topCategories = categories.slice(0, 3);
        }
        if (numberedSections[3]) {
          const insights = numberedSections[3]
            .split('\n')
            .filter(l => l.trim() && l !== '*')
            .map(l => cleanText(l))
            .filter(l => l.length > 0);
          sections.insights = insights.slice(0, 5);
        }
        if (numberedSections[4]) {
          sections.savingsGoal = cleanText(numberedSections[4]);
        }
      }
    }

    // Final cleanup - remove any remaining asterisks or empty items
    sections.overview = sections.overview.replace(/\*/g, '').trim();
    sections.topCategories = sections.topCategories.filter(cat => cat && cat !== '*' && cat.length > 0);
    sections.insights = sections.insights.filter(insight => insight && insight !== '*' && insight.length > 0);
    sections.savingsGoal = sections.savingsGoal.replace(/\*/g, '').trim();

    // Fallback: if still no structure, use the whole text as overview (cleaned)
    if (!sections.overview && !sections.topCategories.length) {
      sections.overview = cleanText(text);
    }

    return sections;
  };

  const formatMonth = (monthString) => {
    const [year, month] = monthString.split("-");
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  const parsedAnalysis = analysis?.summary ? parseAnalysis(analysis.summary) : null;

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600", marginBottom: "4px" }}>
            🤖 AI Spending Analysis
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-light)" }}>
            {formatMonth(month)}
          </p>
        </div>
        <div className="input-group" style={{ margin: 0, width: "auto" }}>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            disabled={loading || fetching}
            style={{ width: "150px", padding: "8px 12px", fontSize: "14px" }}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {fetching && !analysis && (
        <div className="loading">
          <span className="spinner"></span>
          Loading analysis...
        </div>
      )}

      {parsedAnalysis ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Overview Section */}
          {parsedAnalysis.overview && (
            <div style={{
              background: "linear-gradient(135deg, #667eea15 0%, #764ba210 100%)",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #667eea30",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}>
                  📊
                </div>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "var(--text)" }}>
                  Spending Overview
                </h4>
              </div>
              <p style={{
                margin: 0,
                lineHeight: "1.7",
                color: "var(--text)",
                fontSize: "15px",
                fontWeight: "400",
              }}>
                {parsedAnalysis.overview.replace(/\*\*/g, '').replace(/\*/g, '')}
              </p>
            </div>
          )}

          {/* Top Categories Section */}
          {parsedAnalysis.topCategories && parsedAnalysis.topCategories.length > 0 && (
            <div style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              border: "2px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#f59e0b20",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}>
                  🏆
                </div>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "var(--text)" }}>
                  Top Spending Categories
                </h4>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {parsedAnalysis.topCategories.map((category, idx) => {
                  // Clean category string
                  const cleanCategory = category.replace(/\*/g, '').trim();
                  const match = cleanCategory.match(/(.+?):\s*₹?([\d,]+\.?\d*)/i);
                  const categoryName = match ? match[1].trim() : cleanCategory.replace(/:\s*₹?[\d,]+\.?\d*/i, '').trim();
                  const amount = match ? match[2] : cleanCategory.match(/₹?([\d,]+\.?\d*)/)?.[1] || "";
                  
                  if (!categoryName || categoryName === '*' || categoryName.length === 0) return null;
                  
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          background: idx === 0 ? "#f59e0b" : idx === 1 ? "#64748b" : "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "700",
                          fontSize: "13px",
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ 
                          fontSize: "15px", 
                          fontWeight: "600", 
                          color: "var(--text)",
                          textTransform: "capitalize",
                        }}>
                          {categoryName}
                        </span>
                      </div>
                      {amount && (
                        <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--danger)" }}>
                          ₹{amount}
                        </span>
                      )}
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            </div>
          )}

          {/* Insights Section */}
          {parsedAnalysis.insights && parsedAnalysis.insights.length > 0 && (
            <div style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              border: "2px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#10b98120",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}>
                  💡
                </div>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "var(--text)" }}>
                  Insights & Recommendations
                </h4>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {parsedAnalysis.insights
                  .filter(insight => insight && insight.trim() !== '*' && insight.trim().length > 0)
                  .map((insight, idx) => {
                    const cleanInsight = insight.replace(/\*/g, '').trim();
                    if (!cleanInsight || cleanInsight.length === 0) return null;
                    
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: "12px",
                          padding: "14px",
                          background: "#f0f9ff",
                          borderRadius: "8px",
                          borderLeft: "3px solid #3b82f6",
                        }}
                      >
                        <span style={{ 
                          fontSize: "18px", 
                          flexShrink: 0,
                          color: "#3b82f6",
                        }}>✓</span>
                        <p style={{
                          margin: 0,
                          fontSize: "15px",
                          lineHeight: "1.7",
                          color: "var(--text)",
                          fontWeight: "400",
                        }}>
                          {cleanInsight}
                        </p>
                      </div>
                    );
                  })
                  .filter(Boolean)}
              </div>
            </div>
          )}

          {/* Savings Goal Section */}
          {parsedAnalysis.savingsGoal && (
            <div style={{
              background: "linear-gradient(135deg, #10b98115 0%, #3b82f615 100%)",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #10b98130",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}>
                  🎯
                </div>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "var(--text)" }}>
                  Savings Goal
                </h4>
              </div>
              <p style={{
                margin: 0,
                lineHeight: "1.7",
                color: "var(--text)",
                fontSize: "15px",
                fontWeight: "500",
              }}>
                {parsedAnalysis.savingsGoal.replace(/\*/g, '').trim()}
              </p>
            </div>
          )}

          {/* Fallback: If parsing failed, show original text (cleaned) */}
          {!parsedAnalysis.overview && !parsedAnalysis.topCategories.length && analysis?.summary && (
            <div style={{
              background: "linear-gradient(135deg, #667eea10 0%, #764ba210 100%)",
              padding: "20px",
              borderRadius: "10px",
            }}>
              <div style={{
                whiteSpace: "pre-wrap",
                lineHeight: "1.8",
                color: "var(--text)",
                fontSize: "15px",
              }}>
                {cleanText(analysis.summary)}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "16px",
            borderTop: "1px solid var(--border)",
            fontSize: "12px",
            color: "var(--text-light)",
          }}>
            <span>
              Generated on {new Date(analysis.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {analysis.summary?.includes("AI analysis unavailable") && (
              <span style={{ color: "#f59e0b", fontWeight: "500" }}>
                ⚠️ Basic Analysis
              </span>
            )}
          </div>
        </div>
      ) : !fetching && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--text-light)",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <p style={{ marginBottom: "8px", fontSize: "18px", fontWeight: "600", color: "var(--text)" }}>
            No analysis available
          </p>
          <p style={{ fontSize: "14px", marginBottom: "24px" }}>
            Generate AI-powered insights about your spending patterns
          </p>
        </div>
      )}

      <button
        onClick={analyze}
        className="btn btn-secondary"
        disabled={loading || fetching}
        style={{ width: "100%", marginTop: "24px", padding: "12px", fontSize: "15px", fontWeight: "600" }}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Analyzing...
          </>
        ) : analysis ? (
          "🔄 Refresh Analysis"
        ) : (
          "✨ Generate AI Analysis"
        )}
      </button>
    </div>
  );
}
