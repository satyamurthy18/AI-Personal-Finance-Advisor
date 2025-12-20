import { logout } from "../api/auth.api";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../App.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/");
    }
  };

  return (
    <nav style={{
      background: "white",
      padding: "16px 24px",
      borderRadius: "12px",
      boxShadow: "var(--shadow)",
      marginBottom: "24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <Link to="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "700",
          fontSize: "20px"
        }}>
          ₹
        </div>
        <h2 style={{ margin: 0, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Finance Advisor
        </h2>
      </Link>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <Link
          to="/history"
          style={{
            color: location.pathname === "/history" ? "var(--primary)" : "var(--text)",
            textDecoration: "none",
            fontWeight: location.pathname === "/history" ? "600" : "500",
            fontSize: "14px",
            padding: "8px 16px",
            borderRadius: "8px",
            transition: "all 0.2s",
            background: location.pathname === "/history" ? "#f0f9ff" : "transparent",
          }}
        >
          📜 History
        </Link>
        <button
          onClick={handleLogout}
          className="btn btn-outline"
          style={{ fontSize: "14px" }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
