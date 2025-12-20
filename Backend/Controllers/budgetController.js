const Budget = require("../Models/Budget");
const Transaction = require("../Models/Transaction");
const { calculateBudgetStatus } = require("../utils/budgetCalculator");

// SET OR UPDATE BUDGET
exports.setBudget = async (req, res) => {
  try {
    const { month, totalBudget, categoryBudgets } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, month },
      { totalBudget, categoryBudgets },
      { upsert: true, new: true }
    );

    return res.json(budget);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET BUDGET STATUS
exports.getBudgetStatus = async (req, res) => {
  try {
    const { month } = req.query;

    const budget = await Budget.findOne({
      userId: req.user._id,
      month,
    });

    if (!budget) return res.json({ message: "No budget set" });

    // Filter transactions by month
    const [year, monthNum] = month.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    });

    const spent = transactions.reduce((sum, t) => sum + t.amount, 0);

    const status = calculateBudgetStatus(spent, budget.totalBudget);

    // Calculate category spending
    const categorySpending = {};
    transactions.forEach((t) => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

    // Calculate alerts
    const percentageUsed = (spent / budget.totalBudget) * 100;
    const alerts = [];

    if (percentageUsed >= 100) {
      alerts.push({
        type: "danger",
        message: `You have exceeded your budget by ₹${(spent - budget.totalBudget).toFixed(2)}`,
      });
    } else if (percentageUsed >= 90) {
      alerts.push({
        type: "warning",
        message: `You have used ${percentageUsed.toFixed(1)}% of your budget. Only ₹${(budget.totalBudget - spent).toFixed(2)} remaining.`,
      });
    } else if (percentageUsed >= 75) {
      alerts.push({
        type: "info",
        message: `You have used ${percentageUsed.toFixed(1)}% of your budget.`,
      });
    }

    // Check category budgets
    if (budget.categoryBudgets) {
      Object.keys(budget.categoryBudgets).forEach((category) => {
        const categoryLimit = budget.categoryBudgets[category];
        const categorySpent = categorySpending[category] || 0;
        if (categoryLimit && categorySpent > 0) {
          const categoryPercentage = (categorySpent / categoryLimit) * 100;
          if (categoryPercentage >= 100) {
            alerts.push({
              type: "danger",
              message: `${category.charAt(0).toUpperCase() + category.slice(1)} budget exceeded by ₹${(categorySpent - categoryLimit).toFixed(2)}`,
            });
          } else if (categoryPercentage >= 90) {
            alerts.push({
              type: "warning",
              message: `${category.charAt(0).toUpperCase() + category.slice(1)} budget: ${categoryPercentage.toFixed(1)}% used`,
            });
          }
        }
      });
    }

    return res.json({ 
      spent, 
      limit: budget.totalBudget, 
      status,
      percentageUsed: percentageUsed.toFixed(1),
      alerts,
      categorySpending,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
