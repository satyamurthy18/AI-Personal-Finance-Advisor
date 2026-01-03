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

  const parseAnalysis = (text) => {
    if (!text) return null;

    const sections = {
      overview: "",
      topCategories: [],
      insights: [],
      savingsGoal: "",
    };

    // Try to extract structured sections
    const overviewMatch = text.match(/(?:Spending Overview|Overview|Summary)[:：]\s*(.+?)(?=\n\n|\n\d+\.|$)/is);
    if (overviewMatch) {
      sections.overview = overviewMatch[1].trim();
    }

    // Extract top categories
    const categoriesMatch = text.match(/(?:Top Spending Categories|Top Categories)[:：]\s*(.+?)(?=\n\n|\n\d+\.|Insights|Recommendations|$)/is);
    if (categoriesMatch) {
      const categoryText = categoriesMatch[1];
      const categoryLines = categoryText.split('\n').filter(line => line.trim());
      sections.topCategories = categoryLines.slice(0, 3).map(line => line.trim().replace(/^[-•*]\s*/, ''));
    }

    // Extract insights
    const insightsMatch = text.match(/(?:Insights|Recommendations|Insights & Recommendations)[:：]\s*(.+?)(?=\n\n|\n\d+\.|Savings|$)/is);
    if (insightsMatch) {
      const insightsText = insightsMatch[1];
      const insightLines = insightsText.split('\n').filter(line => line.trim());
      sections.insights = insightLines.map(line => line.trim().replace(/^[-•*]\s*/, ''));
    }

    // Extract savings goal
    const savingsMatch = text.match(/(?:Savings Goal|Savings|Goal)[:：]\s*(.+?)(?=\n\n|$)/is);
    if (savingsMatch) {
      sections.savingsGoal = savingsMatch[1].trim();
    }

    // If structured parsing failed, try to split by numbered sections
    if (!sections.overview && !sections.topCategories.length) {
      const numberedSections = text.split(/\n\s*\d+\.\s*\*\*/);
      if (numberedSections.length > 1) {
        sections.overview = numberedSections[1]?.split('\n').slice(1).join(' ').trim() || "";
        if (numberedSections[2]) {
          const categories = numberedSections[2].split('\n').filter(l => l.trim());
          sections.topCategories = categories.slice(0, 3);
        }
        if (numberedSections[3]) {
          const insights = numberedSections[3].split('\n').filter(l => l.trim());
          sections.insights = insights;
        }
        if (numberedSections[4]) {
          sections.savingsGoal = numberedSections[4].trim();
        }
      }
    }

    // Fallback: if still no structure, use the whole text as overview
    if (!sections.overview && !sections.topCategories.length) {
      sections.overview = text;
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
                lineHeight: "1.6",
                color: "var(--text)",
                fontSize: "14px",
              }}>
                {parsedAnalysis.overview}
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
                  const match = category.match(/(.+?):\s*₹?([\d,]+\.?\d*)/i);
                  const categoryName = match ? match[1].trim() : category;
                  const amount = match ? match[2] : "";
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "6px",
                          background: idx === 0 ? "#f59e0b" : idx === 1 ? "#64748b" : "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "700",
                          fontSize: "12px",
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)" }}>
                          {categoryName}
                        </span>
                      </div>
                      {amount && (
                        <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--danger)" }}>
                          ₹{amount}
                        </span>
                      )}
                    </div>
                  );
                })}
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
                {parsedAnalysis.insights.map((insight, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px",
                      background: "#f0f9ff",
                      borderRadius: "8px",
                      borderLeft: "3px solid #3b82f6",
                    }}
                  >
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>✓</span>
                    <p style={{
                      margin: 0,
                      fontSize: "14px",
                      lineHeight: "1.6",
                      color: "var(--text)",
                    }}>
                      {insight}
                    </p>
                  </div>
                ))}
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
                lineHeight: "1.6",
                color: "var(--text)",
                fontSize: "14px",
                fontWeight: "500",
              }}>
                {parsedAnalysis.savingsGoal}
              </p>
            </div>
          )}

          {/* Fallback: If parsing failed, show original text */}
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
                fontSize: "14px",
              }}>
                {analysis.summary}
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
