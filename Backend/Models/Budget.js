const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
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
    totalBudget: {
      type: Number,
      required: true,
    },
    categoryBudgets: {
      food: Number,
      rent: Number,
      transport: Number,
      shopping: Number,
      subscriptions: Number,
      others: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Budget", budgetSchema);
