import { useState, useEffect } from "react";
import { setBudget, getBudgetStatus } from "../api/budget.api";
import "../App.css";

export default function BudgetCard() {
  const [form, setForm] = useState({
    month: new Date().toISOString().slice(0, 7),
    totalBudget: "",
    categoryBudgets: {
      food: "",
      rent: "",
      transport: "",
      shopping: "",
      subscriptions: "",
      others: "",
    },
  });
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBudgetStatus = async () => {
    if (!form.month) return;
    setStatusLoading(true);
    try {
      const res = await getBudgetStatus(form.month);
      if (res.data.message) {
        setBudgetStatus(null);
      } else {
        setBudgetStatus(res.data);
      }
    } catch (err) {
      console.error("Failed to load budget status");
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    loadBudgetStatus();
  }, [form.month]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.totalBudget || parseFloat(form.totalBudget) <= 0) {
      setError("Total budget must be greater than 0");
      return;
    }

    setLoading(true);

    try {
      const categoryBudgets = {};
      Object.keys(form.categoryBudgets).forEach((key) => {
        if (form.categoryBudgets[key]) {
          categoryBudgets[key] = parseFloat(form.categoryBudgets[key]);
        }
      });

      await setBudget({
        month: form.month,
        totalBudget: parseFloat(form.totalBudget),
        categoryBudgets,
      });
      setSuccess("Budget set successfully!");
      loadBudgetStatus();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to set budget");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    if (status === "exceeded") return <span className="badge badge-danger">Exceeded</span>;
    if (status === "warning") return <span className="badge badge-warning">Warning</span>;
    return <span className="badge badge-success">Safe</span>;
  };

  const getSpentPercentage = () => {
    if (!budgetStatus || !budgetStatus.limit) return 0;
    return Math.min((budgetStatus.spent / budgetStatus.limit) * 100, 100);
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: "20px", fontSize: "20px", fontWeight: "600" }}>
        Monthly Budget
      </h3>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Budget Status Display */}
      {budgetStatus && (
        <div style={{
          background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "24px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <p style={{ color: "var(--text-light)", fontSize: "14px", marginBottom: "4px" }}>Spent this month</p>
              <h2 style={{ fontSize: "28px", fontWeight: "700", margin: 0 }}>
                ₹{budgetStatus.spent?.toFixed(2) || 0}
              </h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "var(--text-light)", fontSize: "14px", marginBottom: "4px" }}>Budget limit</p>
              <h3 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>
                ₹{budgetStatus.limit?.toFixed(2) || 0}
              </h3>
            </div>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <div style={{
              width: "100%",
              height: "8px",
              background: "var(--border)",
              borderRadius: "4px",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${getSpentPercentage()}%`,
                height: "100%",
                background: budgetStatus.status === "exceeded" ? "var(--danger)" :
                  budgetStatus.status === "warning" ? "var(--warning)" : "var(--success)",
                transition: "width 0.3s ease",
              }}></div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "14px", color: "var(--text-light)" }}>
              {getSpentPercentage().toFixed(1)}% used
            </span>
            {getStatusBadge(budgetStatus.status)}
          </div>

          {/* Budget Alerts */}
          {budgetStatus.alerts && budgetStatus.alerts.length > 0 && (
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
              {budgetStatus.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    background:
                      alert.type === "danger"
                        ? "#fee2e2"
                        : alert.type === "warning"
                        ? "#fef3c7"
                        : "#dbeafe",
                    color:
                      alert.type === "danger"
                        ? "#991b1b"
                        : alert.type === "warning"
                        ? "#92400e"
                        : "#1e40af",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>
                    {alert.type === "danger" ? "⚠️" : alert.type === "warning" ? "⚡" : "ℹ️"}
                  </span>
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <form onSubmit={submit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div className="input-group">
            <label htmlFor="month">Month</label>
            <input
              id="month"
              type="month"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="totalBudget">Total Budget (₹)</label>
            <input
              id="totalBudget"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="5000"
              value={form.totalBudget}
              onChange={(e) => setForm({ ...form, totalBudget: e.target.value })}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "500" }}>
            Category Budgets (Optional)
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
            {Object.keys(form.categoryBudgets).map((category) => (
              <div key={category} className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor={category} style={{ textTransform: "capitalize", fontSize: "13px" }}>
                  {category}
                </label>
                <input
                  id={category}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={form.categoryBudgets[category]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      categoryBudgets: {
                        ...form.categoryBudgets,
                        [category]: e.target.value,
                      },
                    })
                  }
                  disabled={loading}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: "100%" }}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Setting Budget...
            </>
          ) : (
            "Set Budget"
          )}
        </button>
      </form>

      {statusLoading && (
        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <span className="spinner"></span>
          <span style={{ marginLeft: "8px", color: "var(--text-light)" }}>Loading status...</span>
        </div>
      )}
    </div>
  );
}
