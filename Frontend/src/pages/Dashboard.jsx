import { useEffect, useState } from "react";
import { getTransactions, deleteTransaction } from "../api/transaction.api";
import Navbar from "../components/Navbar";
import AllInsightCard from "../components/AllInsightCard";
import BudgetCard from "../components/BudgetCard";
import TransactionForm from "../components/TransactionForm";
import CSVUpload from "../components/CSVUpload";
import SpendingChart from "../components/SpendingChart";
import "../App.css";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
  });
  const [deleting, setDeleting] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  const loadTransactions = async (showAll = false) => {
    try {
      setLoading(true);
      const params = {};
      
      if (!showAll) {
        if (filters.category) params.category = filters.category;
        if (filters.startDate && filters.endDate) {
          params.startDate = filters.startDate;
          params.endDate = filters.endDate;
        }
      }
      
      const res = await getTransactions(params);
      const transactionData = Array.isArray(res.data) ? res.data : [];
      
      if (showAll || (!filters.category && !filters.startDate && !filters.endDate)) {
        setAllTransactions(transactionData);
      }
      
      setTransactions(transactionData);
    } catch (err) {
      console.error("Failed to load transactions", err);
      setTransactions([]);
      setAllTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  useEffect(() => {
    loadTransactions(true);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    setDeleting(id);
    try {
      await deleteTransaction(id);
      loadTransactions();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete transaction");
    } finally {
      setDeleting(null);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      food: "#ef4444",
      rent: "#f59e0b",
      transport: "#3b82f6",
      shopping: "#8b5cf6",
      subscriptions: "#10b981",
      others: "#64748b",
    };
    return colors[category] || colors.others;
  };

  const getTotalSpent = () => {
    const dataToUse = (filters.category || filters.startDate || filters.endDate) 
      ? transactions 
      : allTransactions.length > 0 ? allTransactions : transactions;
    return dataToUse.reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalCount = () => {
    const dataToUse = (filters.category || filters.startDate || filters.endDate) 
      ? transactions 
      : allTransactions.length > 0 ? allTransactions : transactions;
    return dataToUse.length;
  };

  const getCategoryTotals = () => {
    const totals = {};
    transactions.forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    return totals;
  };

  const clearFilters = () => {
    setFilters({ category: "", startDate: "", endDate: "" });
  };

  const tabs = [
    { id: "overview", label: "📊 Overview", icon: "📊" },
    { id: "transactions", label: "💳 Transactions", icon: "💳" },
    { id: "budget", label: "💰 Budget", icon: "💰" },
    { id: "insights", label: "🤖 AI Insights", icon: "🤖" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: "40px" }}>
      <div className="content-wrapper">
        <Navbar />

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{
            fontSize: "32px",
            fontWeight: "700",
            marginBottom: "8px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Dashboard
          </h1>
        </div>

        {/* Summary Cards - Always Visible */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}>
          <div className="card" style={{ textAlign: "center", padding: "20px", background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)" }}>
            <p style={{ color: "var(--text-light)", fontSize: "13px", marginBottom: "8px", fontWeight: "500" }}>Total Transactions</p>
            <h2 style={{ fontSize: "28px", fontWeight: "700", margin: 0, color: "var(--primary)" }}>
              {loading ? "..." : getTotalCount()}
            </h2>
          </div>
          <div className="card" style={{ textAlign: "center", padding: "20px", background: "linear-gradient(135deg, #ef444415 0%, #f59e0b15 100%)" }}>
            <p style={{ color: "var(--text-light)", fontSize: "13px", marginBottom: "8px", fontWeight: "500" }}>Total Spent</p>
            <h2 style={{ fontSize: "28px", fontWeight: "700", margin: 0, color: "var(--danger)" }}>
              {loading ? "..." : `₹${getTotalSpent().toFixed(2)}`}
            </h2>
          </div>
          <div className="card" style={{ textAlign: "center", padding: "20px", background: "linear-gradient(135deg, #10b98115 0%, #3b82f615 100%)" }}>
            <p style={{ color: "var(--text-light)", fontSize: "13px", marginBottom: "8px", fontWeight: "500" }}>Avg per Transaction</p>
            <h2 style={{ fontSize: "28px", fontWeight: "700", margin: 0, color: "var(--success)" }}>
              {loading ? "..." : getTotalCount() > 0 ? `₹${(getTotalSpent() / getTotalCount()).toFixed(2)}` : "₹0.00"}
            </h2>
          </div>
          <div className="card" style={{ textAlign: "center", padding: "20px", background: "linear-gradient(135deg, #8b5cf615 0%, #764ba215 100%)" }}>
            <button
              onClick={() => loadTransactions(true)}
              className="btn btn-outline"
              disabled={loading}
              style={{ width: "100%", marginTop: "8px", fontSize: "13px", padding: "10px" }}
            >
              {loading ? "🔄" : "🔄 Refresh"}
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          flexWrap: "wrap",
          borderBottom: "2px solid var(--border)",
          paddingBottom: "8px",
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setShowAddForm(false);
                setShowCSVUpload(false);
              }}
              style={{
                padding: "12px 24px",
                border: "none",
                background: activeTab === tab.id ? "var(--primary)" : "transparent",
                color: activeTab === tab.id ? "white" : "var(--text)",
                borderRadius: "8px 8px 0 0",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s",
                borderBottom: activeTab === tab.id ? "3px solid var(--primary)" : "3px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div style={{ display: "grid", gap: "24px" }}>
              {/* Quick Actions */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
                <button
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    setShowCSVUpload(false);
                  }}
                  className="btn btn-primary"
                  style={{ padding: "16px", fontSize: "16px", fontWeight: "600" }}
                >
                  ➕ Add Transaction
                </button>
                <button
                  onClick={() => {
                    setShowCSVUpload(!showCSVUpload);
                    setShowAddForm(false);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: "16px", fontSize: "16px", fontWeight: "600" }}
                >
                  📄 Upload CSV
                </button>
              </div>

              {showAddForm && (
                <div style={{ animation: "slideDown 0.3s ease" }}>
                  <TransactionForm onAdd={() => { loadTransactions(); setShowAddForm(false); }} />
                </div>
              )}

              {showCSVUpload && (
                <div style={{ animation: "slideDown 0.3s ease" }}>
                  <CSVUpload onUpload={() => { loadTransactions(); setShowCSVUpload(false); }} />
                </div>
              )}

              {/* Charts */}
              <SpendingChart transactions={allTransactions.length > 0 ? allTransactions : transactions} />

              {/* Category Summary */}
              {Object.keys(getCategoryTotals()).length > 0 && (
                <div className="card">
                  <h3 style={{ marginBottom: "20px", fontSize: "20px", fontWeight: "600" }}>Spending by Category</h3>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "12px",
                  }}>
                    {Object.entries(getCategoryTotals()).map(([category, amount]) => (
                      <div
                        key={category}
                        style={{
                          padding: "16px",
                          background: `${getCategoryColor(category)}15`,
                          borderRadius: "10px",
                          border: `2px solid ${getCategoryColor(category)}40`,
                          textAlign: "center",
                        }}
                      >
                        <div style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: getCategoryColor(category),
                          margin: "0 auto 12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "700",
                          fontSize: "18px",
                        }}>
                          {category.charAt(0).toUpperCase()}
                        </div>
                        <p style={{
                          textTransform: "capitalize",
                          fontWeight: "600",
                          fontSize: "14px",
                          marginBottom: "4px",
                          color: getCategoryColor(category),
                        }}>
                          {category}
                        </p>
                        <p style={{
                          fontSize: "18px",
                          fontWeight: "700",
                          margin: 0,
                          color: "var(--text)",
                        }}>
                          ₹{amount.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>All Transactions</h3>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    style={{
                      padding: "8px 12px",
                      border: "2px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">All Categories</option>
                    <option value="food">Food</option>
                    <option value="rent">Rent</option>
                    <option value="transport">Transport</option>
                    <option value="shopping">Shopping</option>
                    <option value="subscriptions">Subscriptions</option>
                    <option value="others">Others</option>
                  </select>
                  <input
                    type="date"
                    placeholder="Start Date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    style={{
                      padding: "8px 12px",
                      border: "2px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                  <input
                    type="date"
                    placeholder="End Date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    style={{
                      padding: "8px 12px",
                      border: "2px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                  {(filters.category || filters.startDate || filters.endDate) && (
                    <button
                      onClick={clearFilters}
                      className="btn btn-outline"
                      style={{ fontSize: "14px", padding: "8px 16px" }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="loading">
                  <span className="spinner"></span>
                  Loading transactions...
                </div>
              ) : transactions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-light)" }}>
                  <p style={{ fontSize: "18px", marginBottom: "8px" }}>No transactions found</p>
                  <p style={{ fontSize: "14px" }}>
                    {filters.category || filters.startDate || filters.endDate
                      ? "Try adjusting your filters"
                      : "Add your first transaction"}
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "600px", overflowY: "auto" }}>
                  {transactions.map((t) => (
                    <div
                      key={t._id}
                      style={{
                        border: "2px solid var(--border)",
                        borderRadius: "10px",
                        padding: "16px",
                        background: "white",
                        transition: "all 0.2s ease",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = getCategoryColor(t.category);
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                          <div
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              background: getCategoryColor(t.category),
                            }}
                          ></div>
                          <strong style={{ fontSize: "16px", color: "var(--text)" }}>
                            {t.description}
                          </strong>
                          <span
                            className="badge"
                            style={{
                              background: `${getCategoryColor(t.category)}20`,
                              color: getCategoryColor(t.category),
                              textTransform: "capitalize",
                              fontSize: "11px",
                              padding: "4px 10px",
                            }}
                          >
                            {t.category}
                          </span>
                        </div>
                        <div style={{ fontSize: "14px", color: "var(--text-light)", marginLeft: "24px" }}>
                          {new Date(t.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: "700",
                            color: "var(--danger)",
                            marginBottom: "4px",
                          }}
                        >
                          ₹{t.amount.toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="btn btn-danger"
                          disabled={deleting === t._id}
                          style={{ fontSize: "12px", padding: "6px 12px" }}
                        >
                          {deleting === t._id ? (
                            <>
                              <span className="spinner" style={{ width: "12px", height: "12px", borderWidth: "2px" }}></span>
                            </>
                          ) : (
                            "Delete"
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === "budget" && (
            <BudgetCard />
          )}

          {/* AI Insights Tab */}
          {activeTab === "insights" && (
            <AllInsightCard />
          )}
        </div>
      </div>
    </div>
  );
}
