import { useState } from "react";
import { uploadCSV } from "../api/transaction.api";
import "../App.css";

export default function CSVUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile);
        setError("");
      } else {
        setError("Please select a CSV file");
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await uploadCSV(file);
      setSuccess(
        `Successfully imported ${res.data.count} transactions!${
          res.data.errors ? ` (${res.data.errors.length} errors)` : ""
        }`
      );
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById("csv-file");
      if (fileInput) fileInput.value = "";

      if (onUpload) {
        setTimeout(() => {
          onUpload();
        }, 500);
      }
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to upload CSV file"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: "20px", fontSize: "20px", fontWeight: "600" }}>
        Upload Bank Statement (CSV)
      </h3>

      <div style={{ marginBottom: "16px", padding: "16px", background: "#f0f9ff", borderRadius: "8px", fontSize: "14px", color: "#0369a1" }}>
        <strong>CSV Format:</strong> Your CSV file should have columns: <code>date</code>, <code>description</code>, <code>amount</code>
        <br />
        <small style={{ display: "block", marginTop: "8px" }}>
          Example: <code>2025-01-15,Swiggy Order,500.00</code>
        </small>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="input-group">
        <label htmlFor="csv-file">Select CSV File</label>
        <input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={loading}
          style={{
            padding: "8px",
            border: "2px solid var(--border)",
            borderRadius: "8px",
            fontSize: "14px",
            width: "100%",
          }}
        />
        {file && (
          <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--text-light)" }}>
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      <button
        onClick={handleUpload}
        className="btn btn-primary"
        disabled={loading || !file}
        style={{ width: "100%" }}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Uploading...
          </>
        ) : (
          "Upload CSV"
        )}
      </button>
    </div>
  );
}

