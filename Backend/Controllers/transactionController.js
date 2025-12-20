const Transaction = require("../Models/Transaction");
const { categorizeTransaction } = require("../utils/categorizer");
const csv = require("csv-parser");
const { Readable } = require("stream");

// ADD TRANSACTION (Manual)
exports.addTransaction = async (req, res) => {
  try {
    const { amount, description, date } = req.body;

    if (!amount || !description || !date) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Validate amount
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    // Validate date
    const transactionDate = new Date(date);
    if (isNaN(transactionDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      amount: amountNum,
      description,
      date: transactionDate,
      category: categorizeTransaction(description),
    });

    return res.status(201).json(transaction);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET TRANSACTIONS (Filter by date/category)
exports.getTransactions = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;

    const filter = { userId: req.user._id };

    if (category) filter.category = category;
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(100); // Limit to prevent large responses

    return res.json(transactions);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE TRANSACTION
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await Transaction.findByIdAndDelete(id);

    return res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// UPLOAD CSV
exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBuffer = req.file.buffer;
    const results = [];
    const errors = [];

    await new Promise((resolve, reject) => {
      const stream = Readable.from(fileBuffer.toString());
      
      stream
        .pipe(csv())
        .on("data", (row) => {
          // Expected CSV format: date, description, amount
          // Try different column name variations
          const date = row.date || row.Date || row.DATE || row.transaction_date || row.Date;
          const description = row.description || row.Description || row.DESCRIPTION || row.desc || row.narration || row.Description;
          const amount = row.amount || row.Amount || row.AMOUNT || row.value || row.Amount;

          if (!date || !description || !amount) {
            errors.push(`Row missing required fields: ${JSON.stringify(row)}`);
            return;
          }

          const amountNum = parseFloat(amount);
          if (isNaN(amountNum) || amountNum <= 0) {
            errors.push(`Invalid amount in row: ${amount}`);
            return;
          }

          const transactionDate = new Date(date);
          if (isNaN(transactionDate.getTime())) {
            errors.push(`Invalid date in row: ${date}`);
            return;
          }

          results.push({
            date: transactionDate,
            description: description.trim(),
            amount: Math.abs(amountNum), // Ensure positive
            category: categorizeTransaction(description),
          });
        })
        .on("end", () => {
          resolve();
        })
        .on("error", (err) => {
          reject(err);
        });
    });

    if (results.length === 0) {
      return res.status(400).json({ 
        error: "No valid transactions found in CSV",
        errors 
      });
    }

    // Insert all transactions
    const transactions = await Transaction.insertMany(
      results.map((t) => ({
        userId: req.user._id,
        ...t,
      }))
    );

    return res.json({
      message: `Successfully imported ${transactions.length} transactions`,
      count: transactions.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
