const buildAIPrompt = (summary, totalSpent, transactionCount) => {
  const categories = Object.entries(summary)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => `${cat}: ₹${amount.toFixed(2)}`)
    .join("\n");

  return `
You are a helpful personal finance advisor. Analyze the following spending data and provide actionable insights.

MONTHLY SPENDING SUMMARY:
Total Spent: ₹${totalSpent.toFixed(2)}
Number of Transactions: ${transactionCount}

Category Breakdown:
${categories}

Please provide a comprehensive analysis in the following format:

1. **Spending Overview**: A brief summary of the month's spending patterns (2-3 sentences)

2. **Top Spending Categories**: Identify the top 3 categories where most money was spent

3. **Insights & Recommendations**: 
   - Areas where spending can be reduced
   - Suggestions for better financial management
   - Any unusual spending patterns noticed

4. **Savings Goal**: Suggest a realistic monthly savings target based on current spending

Keep the response clear, concise, and actionable. Use bullet points where appropriate. Format numbers with ₹ symbol.
`;
};

module.exports = {
  buildAIPrompt,
};
