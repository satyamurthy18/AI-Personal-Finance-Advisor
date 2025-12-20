import { useState } from "react";
import { forgotPassword } from "../api/auth.api";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setSuccess(res.data.message);
      
      // In development, show the reset token if provided
      if (res.data.resetToken) {
        console.log("Reset Token:", res.data.resetToken);
        console.log("Reset URL:", res.data.resetUrl);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Forgot Password
          </h1>
          <p style={{ color: "var(--text-light)" }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={submit}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || !!success}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "8px" }}
            disabled={loading || !!success}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Sending...
              </>
            ) : success ? (
              "Email Sent"
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {success && (
          <div style={{
            marginTop: "20px",
            padding: "16px",
            background: "#f0f9ff",
            borderRadius: "8px",
            border: "1px solid #bae6fd",
          }}>
            <p style={{ fontSize: "14px", color: "#0369a1", marginBottom: "8px" }}>
              <strong>Note:</strong> In development mode, check the browser console for the reset token.
            </p>
            <p style={{ fontSize: "14px", color: "#0369a1" }}>
              In production, you would receive an email with the reset link.
            </p>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link to="/" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none", fontSize: "14px" }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}


