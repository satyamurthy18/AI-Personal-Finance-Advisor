import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../App.css";

export default function SpendingChart({ transactions, type = "line" }) {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Group transactions by date
    const dailyData = {};
    transactions.forEach((t) => {
      const date = new Date(t.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!dailyData[date]) {
        dailyData[date] = { date, amount: 0, count: 0 };
      }
      dailyData[date].amount += t.amount;
      dailyData[date].count += 1;
    });

    // Convert to array and sort by date
    return Object.values(dailyData)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30); // Last 30 days
  }, [transactions]);

  const categoryData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const categoryTotals = {};
    transactions.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        amount: parseFloat(amount.toFixed(2)),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="card">
        <h3 style={{ marginBottom: "20px", fontSize: "20px", fontWeight: "600" }}>
          Spending Over Time
        </h3>
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-light)" }}>
          <p>No transaction data available for chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: "20px", fontSize: "20px", fontWeight: "600" }}>
        Spending Analysis
      </h3>

      <div style={{ marginBottom: "32px" }}>
        <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
          Spending Over Time (Last 30 Days)
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value) => `₹${value.toFixed(2)}`}
              labelStyle={{ color: "var(--text)" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#667eea"
              strokeWidth={2}
              name="Amount (₹)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
          Spending by Category
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip
              formatter={(value) => `₹${value.toFixed(2)}`}
              labelStyle={{ color: "var(--text)" }}
            />
            <Legend />
            <Bar dataKey="amount" fill="#764ba2" name="Amount (₹)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

