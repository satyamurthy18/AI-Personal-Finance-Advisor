require("dotenv").config();
const express = require("express");

const cookieParser = require("cookie-parser");
const cors = require("cors"); // ✅ ADD THIS

const connectDB = require("./config/ConnectDB");

const logger = require("./middlewares/logger");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const apiLimiter = require("./middlewares/rateLimiter");

// Routes
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const aiAnalysisRoutes = require("./routes/aiAnalysisRoutes");

const app = express();
app.set("trust proxy", 1);


/* ------------------- GLOBAL MIDDLEWARES ------------------- */
app.use(express.json());
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map(url => url.trim())
  : [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://localhost:5175",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ];

app.use(
  cors({
    origin: function (origin, callback) {
      // In development, allow all localhost origins
      if (process.env.NODE_ENV !== "production") {
        if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) {
          return callback(null, true);
        }
      }
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
      }
    },
    credentials: true, // ✅ ALLOW COOKIES
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(logger);
app.use("/api/auth", apiLimiter);

/* ------------------- ROUTES ------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/ai", aiAnalysisRoutes);

/* ------------------- ERROR HANDLING ------------------- */
app.use(notFound);
app.use(errorHandler);

/* ------------------- DB + SERVER ------------------- */
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
