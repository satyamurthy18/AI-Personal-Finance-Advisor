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

  const formatAnalysis = (text) => {
    if (!text) return "";
    // Split by numbered points or sections
    const sections = text.split(/\d+\.\s*\*\*/).filter(Boolean);
    return sections.map((section, idx) => {
      const lines = section.split("\n").filter(Boolean);
      const title = lines[0]?.replace(/\*\*/g, "").trim() || "";
      const content = lines.slice(1).join("\n").trim();
      return { title, content };
    });
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
          AI Spending Analysis
        </h3>
        <div className="input-group" style={{ margin: 0, width: "auto" }}>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            disabled={loading || fetching}
            style={{ width: "150px", padding: "8px 12px" }}
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

      {analysis && analysis.summary ? (
        <div style={{
          background: "linear-gradient(135deg, #667eea10 0%, #764ba210 100%)",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "16px",
        }}>
          <div style={{
            whiteSpace: "pre-wrap",
            lineHeight: "1.8",
            color: "var(--text)",
            fontSize: "14px",
          }}>
            {analysis.summary}
          </div>
          <div style={{
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border)",
            fontSize: "12px",
            color: "var(--text-light)",
          }}>
            Generated on {new Date(analysis.createdAt).toLocaleDateString()}
          </div>
        </div>
      ) : !fetching && (
        <div style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "var(--text-light)",
        }}>
          <p style={{ marginBottom: "16px" }}>No analysis available for this month.</p>
          <p style={{ fontSize: "14px", marginBottom: "20px" }}>
            Click the button below to generate AI-powered insights about your spending.
          </p>
        </div>
      )}

      <button
        onClick={analyze}
        className="btn btn-secondary"
        disabled={loading || fetching}
        style={{ width: "100%" }}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Analyzing...
          </>
        ) : analysis ? (
          "Refresh Analysis"
        ) : (
          "Generate AI Analysis"
        )}
      </button>
    </div>
  );
}
