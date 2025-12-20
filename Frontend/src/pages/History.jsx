import { useEffect, useState } from "react";
import { getAllAnalyses } from "../api/ai.api";
import Navbar from "../components/Navbar";
import "../App.css";

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const res = await getAllAnalyses();
      setAnalyses(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (monthString) => {
    const [year, month] = monthString.split("-");
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: "40px" }}>
      <div className="content-wrapper">
        <Navbar />

        <div style={{ marginBottom: "32px" }}>
          <h1 style={{
            fontSize: "36px",
            fontWeight: "700",
            marginBottom: "8px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Analysis History
          </h1>
          <p style={{ color: "var(--text-light)", fontSize: "16px" }}>
            View your past monthly spending analyses
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">
            <span className="spinner"></span>
            Loading history...
          </div>
        ) : analyses.length === 0 ? (
          <div className="card">
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-light)" }}>
              <p style={{ fontSize: "18px", marginBottom: "8px" }}>No analysis history found</p>
              <p style={{ fontSize: "14px" }}>
                Generate your first AI analysis from the dashboard to see it here.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {analyses.map((analysis) => (
              <div key={analysis._id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h3 style={{ fontSize: "24px", fontWeight: "600", margin: 0, marginBottom: "4px" }}>
                      {formatMonth(analysis.month)}
                    </h3>
                    <p style={{ color: "var(--text-light)", fontSize: "14px", margin: 0 }}>
                      Generated on {new Date(analysis.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="badge badge-primary">{analysis.month}</span>
                </div>

                <div style={{
                  background: "linear-gradient(135deg, #667eea10 0%, #764ba210 100%)",
                  padding: "20px",
                  borderRadius: "10px",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.8",
                  color: "var(--text)",
                  fontSize: "14px",
                }}>
                  {analysis.summary}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

