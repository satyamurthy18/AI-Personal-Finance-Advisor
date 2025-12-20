const calculateBudgetStatus = (spent, limit) => {
  if (spent > limit) {
    return "exceeded";
  } else if (spent >= limit * 0.9) {
    return "warning";
  } else {
    return "safe";
  }
};

module.exports = {
  calculateBudgetStatus,
};


