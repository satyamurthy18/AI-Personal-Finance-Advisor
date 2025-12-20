const categorizeTransaction = (description = "") => {
  const text = description.toLowerCase();

  if (text.includes("swiggy") || text.includes("zomato") || text.includes("restaurant"))
    return "food";

  if (text.includes("rent") || text.includes("house"))
    return "rent";

  if (text.includes("uber") || text.includes("ola") || text.includes("fuel"))
    return "transport";

  if (text.includes("amazon") || text.includes("flipkart"))
    return "shopping";

  if (text.includes("netflix") || text.includes("spotify"))
    return "subscriptions";

  return "others";
};

module.exports = {
  categorizeTransaction,
};
