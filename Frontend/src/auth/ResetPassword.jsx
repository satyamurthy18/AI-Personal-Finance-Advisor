import { useState, useEffect } from "react";
import { resetPassword } from "../api/auth.api";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import "../App.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid reset link");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, form.password);
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Reset Password
          </h1>
          <p style={{ color: "var(--text-light)" }}>
            Enter your new password below.
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {!token ? (
          <div>
            <div className="error-message">
              Invalid or missing reset token. Please request a new password reset.
            </div>
            <Link to="/forgot-password" className="btn btn-primary" style={{ width: "100%", marginTop: "16px", textDecoration: "none", display: "block", textAlign: "center" }}>
              Request New Reset Link
            </Link>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="input-group">
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                disabled={loading || !!success}
              />
              <small style={{ color: "var(--text-light)", fontSize: "12px", marginTop: "4px", display: "block" }}>
                Must be at least 8 characters with uppercase, lowercase, number, and symbol
              </small>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
                  Resetting...
                </>
              ) : success ? (
                "Password Reset!"
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
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


