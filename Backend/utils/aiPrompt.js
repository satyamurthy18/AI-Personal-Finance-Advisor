const buildAIPrompt = (summary, totalSpent, transactionCount) => {
  const categories = Object.entries(summary)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => `${cat}: ₹${amount.toFixed(2)}`)
    .join("\n");

  return `
You are a helpful personal finance advisor. Analyze the following spending data and provide clear, actionable insights.

MONTHLY SPENDING SUMMARY:
Total Spent: ₹${totalSpent.toFixed(2)}
Number of Transactions: ${transactionCount}

Category Breakdown:
${categories}

IMPORTANT: Provide your response in this EXACT format:

1. **Spending Overview**: 
[Write 2-3 concise sentences summarizing the month's spending patterns. Be specific and mention key observations.]

2. **Top Spending Categories**: 
[List exactly the top 3 categories, one per line, in this format: Category Name: ₹amount]

3. **Insights & Recommendations**: 
[Provide 3-4 actionable recommendations, one per line, each starting with a dash (-). Focus on specific areas to reduce spending and improve financial management.]

4. **Savings Goal**: 
[Suggest a realistic monthly savings target (as a percentage or amount) with a brief explanation of why this is achievable.]

Guidelines:
- Be concise and direct
- Use ₹ symbol for all amounts
- Focus on actionable advice
- Keep each section brief (2-4 sentences max)
- Use simple, clear language
`;
};

module.exports = {
  buildAIPrompt,
};
