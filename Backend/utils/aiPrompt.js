const buildAIPrompt = (summary, totalSpent, transactionCount) => {
  const categories = Object.entries(summary)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => {
      const percentage = ((amount / totalSpent) * 100).toFixed(1);
      return `${cat}: ₹${amount.toFixed(2)} (${percentage}%)`;
    })
    .join("\n");

  const topCategory = Object.entries(summary).sort((a, b) => b[1] - a[1])[0];
  const topCategoryPercentage = ((topCategory[1] / totalSpent) * 100).toFixed(1);

  return `
You are an expert personal finance advisor. Analyze the spending data below and provide specific, actionable insights based on the actual numbers.

MONTHLY SPENDING DATA:
Total Spent: ₹${totalSpent.toFixed(2)}
Number of Transactions: ${transactionCount}
Average Transaction: ₹${(totalSpent / transactionCount).toFixed(2)}

Category Breakdown (with percentages):
${categories}

Top Spending Category: ${topCategory[0]} - ₹${topCategory[1].toFixed(2)} (${topCategoryPercentage}% of total)

ANALYSIS REQUIREMENTS:
Provide your response in this EXACT format. Each section must be complete and specific.

1. Spending Overview:
Write 2-3 sentences that analyze the spending patterns. Mention the total amount, transaction frequency, and highlight the most significant spending category. Be specific with numbers and percentages.

2. Top Spending Categories:
List the top 3 categories in this exact format (one per line):
Category Name: ₹amount
Category Name: ₹amount
Category Name: ₹amount

3. Insights & Recommendations:
Provide 4 specific, actionable recommendations based on the actual spending data. Each recommendation must:
- Be a complete sentence (not cut off)
- Reference specific categories or amounts from the data
- Be actionable and practical
- Focus on concrete steps the user can take
- One recommendation per line

Example format:
Reduce ${topCategory[0]} spending by 20% to save approximately ₹${(topCategory[1] * 0.2).toFixed(2)} monthly
Set a monthly limit of ₹${(topCategory[1] * 0.8).toFixed(2)} for ${topCategory[0]} category
Review transactions in ${topCategory[0]} to identify unnecessary expenses
Consider alternatives to reduce ${topCategory[0]} costs by tracking daily spending

4. Savings Goal:
Calculate a realistic savings target based on the current spending. Suggest a specific amount (₹X) or percentage, and explain how to achieve it by reducing spending in specific categories. Write 2-3 complete sentences.

CRITICAL RULES:
- NO asterisks, bold markers, or special characters
- NO incomplete sentences
- Use actual numbers from the data provided
- Be specific and data-driven
- Each recommendation must be actionable
- All sentences must be complete
- Use ₹ symbol for all amounts
`;
};

module.exports = {
  buildAIPrompt,
};
