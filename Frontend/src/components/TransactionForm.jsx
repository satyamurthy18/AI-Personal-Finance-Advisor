import { useState } from "react";
import { addTransaction } from "../api/transaction.api";
import "../App.css";

export default function TransactionForm({ onAdd }) {
  const [form, setForm] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.amount || !form.description || !form.date) {
      setError("All fields are required");
      return;
    }

    if (parseFloat(form.amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setLoading(true);

    try {
      await addTransaction({
        ...form,
        amount: parseFloat(form.amount),
      });
      setSuccess("Transaction added successfully!");
      setForm({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      // Call onAdd callback to refresh transactions
      if (onAdd) {
        // Small delay to ensure backend has processed the transaction
        setTimeout(() => {
          onAdd();
        }, 500);
      }
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: "20px", fontSize: "20px", fontWeight: "600" }}>
        Add New Transaction
      </h3>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={submit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="input-group">
            <label htmlFor="amount">Amount (₹)</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="description">Description</label>
          <input
            id="description"
            type="text"
            placeholder="e.g., Swiggy order, Uber ride, etc."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            disabled={loading}
          />
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
              Adding...
            </>
          ) : (
            "Add Transaction"
          )}
        </button>
      </form>
    </div>
  );
}
