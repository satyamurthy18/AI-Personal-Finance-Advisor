const mongoose = require("mongoose");

const aiAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: String, // e.g. "2025-01"
      required: true,
    },
    summary: {
      type: String, // AI-generated text
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIAnalysis", aiAnalysisSchema);
