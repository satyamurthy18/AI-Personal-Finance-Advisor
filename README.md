# 💰 AI Personal Finance Advisor

A comprehensive MERN stack web application that helps users understand and manage their personal finances. The application uses AI-powered analysis to provide spending insights, budgeting suggestions, and financial recommendations.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-ISC-blue)

## ✨ Features

### 🔐 Authentication & User Management
- User registration and login with secure password storage (bcrypt)
- JWT-based session management
- Forgot password functionality with email reset tokens
- Protected routes and secure API endpoints

### 💳 Transaction Management
- **Manual Entry**: Add transactions with description, amount, and date
- **CSV Upload**: Bulk import transactions from bank statements
- **Automatic Categorization**: AI-powered category detection based on transaction descriptions
- **Transaction Categories**: Food, Rent, Transport, Shopping, Subscriptions, Others
- **Filter & Search**: Filter by category and date range
- **Transaction History**: View and manage all past transactions

### 🤖 AI-Powered Analysis
- **Spending Analysis**: Monthly AI-generated insights using Google Gemini API
- **Smart Recommendations**: 
  - Spending pattern overview
  - Top spending categories identification
  - Areas to reduce spending
  - Monthly saving goals
- **Fallback System**: Basic analysis if AI API is unavailable
- **History Storage**: All analyses saved per month for future reference

### 💰 Budget Management
- **Monthly Budget Setting**: Set total budget and category-wise budgets
- **Real-time Tracking**: Compare spending against budget limits
- **Visual Indicators**: 
  - ✅ Within Budget (Green)
  - ⚠️ Close to Limit (Yellow)
  - ❌ Over Budget (Red)
- **Smart Alerts**: 
  - 75% threshold: Info alert
  - 90% threshold: Warning alert
  - 100%+ threshold: Danger alert
- **Category Budget Alerts**: Individual category budget monitoring

### 📊 Dashboard & Insights
- **Overview Tab**: 
  - Summary cards (Total Transactions, Total Spent, Average)
  - Spending charts (Line chart for time series, Bar chart for categories)
  - Category-wise breakdown with visual indicators
- **Transactions Tab**: Complete transaction list with filters
- **Budget Tab**: Budget management and status
- **AI Insights Tab**: Monthly AI analysis and recommendations

### 📈 Data Visualization
- **Spending Over Time**: Line chart showing daily spending trends (last 30 days)
- **Category Breakdown**: Bar chart displaying spending by category
- **Budget Progress**: Visual progress bars with percentage indicators
- **Interactive Charts**: Built with Recharts library

### 📜 History & Reports
- **Monthly History**: View past months' AI analyses
- **Filtered Views**: Filter transactions by date range and category
- **Export Ready**: Data structured for easy export

### 📱 Responsive Design
- **Mobile-First**: Fully responsive design for all screen sizes
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Tab-Based Navigation**: Organized content in tabs to reduce scrolling
- **Accessible**: Keyboard navigation and screen reader friendly

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Vite** - Build tool and dev server
- **CSS3** - Custom styling with CSS variables

### Backend
- **Node.js** - Runtime environment
- **Express.js 5** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **csv-parser** - CSV file parsing
- **Google Generative AI** - AI analysis (Gemini API)

### Security
- JWT-based authentication
- Password encryption with bcrypt
- HTTP-only cookies
- CORS configuration
- Rate limiting
- Input validation

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Google Gemini API key (optional, for AI features)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd "AI Personal Finance Advisor"
```

### Step 2: Backend Setup
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory:
```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/finance-advisor
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/finance-advisor

# JWT Secret Key (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=3000

# Google Gemini API Key (optional - for AI analysis)
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key-here

# Environment
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173,http://localhost:5174
```

### Step 3: Frontend Setup
```bash
cd ../Frontend
npm install
```

### Step 4: Start the Application

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173 (or 5174)
- Backend API: http://localhost:3000

## 🚀 Usage

### Getting Started

1. **Register a New Account**
   - Navigate to the signup page
   - Fill in your details (First Name, Last Name, Email, Password)
   - Password must be at least 8 characters with uppercase, lowercase, number, and symbol

2. **Login**
   - Use your credentials to login
   - You'll be redirected to the dashboard

3. **Add Transactions**
   - Click "Add Transaction" button in the Overview tab
   - Fill in amount, description, and date
   - Category is automatically detected based on description

4. **Upload CSV File**
   - Click "Upload CSV" button
   - CSV format: `date,description,amount`
   - Example: `2025-01-15,Swiggy Order,500.00`

5. **Set Budget**
   - Navigate to the Budget tab
   - Select month and set total budget
   - Optionally set category-wise budgets
   - View real-time budget status and alerts

6. **Generate AI Analysis**
   - Navigate to AI Insights tab
   - Select the month you want to analyze
   - Click "Generate AI Analysis"
   - View spending insights and recommendations

7. **View History**
   - Click "History" in the navbar
   - Browse past months' AI analyses
   - Review your financial journey

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/signup          - Register new user
POST   /api/auth/login            - Login user
POST   /api/auth/logout           - Logout user
POST   /api/auth/forgot-password  - Request password reset
POST   /api/auth/reset-password   - Reset password with token
GET    /api/auth/me               - Get current user
```

### Transactions
```
GET    /api/transactions          - Get all transactions (with filters)
POST   /api/transactions/add      - Add new transaction
POST   /api/transactions/upload    - Upload CSV file
DELETE /api/transactions/:id      - Delete transaction
```

### Budget
```
POST   /api/budget/set            - Set/update budget
GET    /api/budget/status         - Get budget status
```

### AI Analysis
```
POST   /api/ai/analyze            - Generate AI analysis
GET    /api/ai/analysis           - Get analysis for month
GET    /api/ai/analyses           - Get all analyses (history)
GET    /api/ai/test               - Test Gemini API connection
```

## 📁 Project Structure

```
AI Personal Finance Advisor/
├── Backend/
│   ├── config/
│   │   └── ConnectDB.js          # MongoDB connection
│   ├── Controllers/
│   │   ├── aiAnalysisController.js
│   │   ├── authController.js
│   │   ├── budgetController.js
│   │   └── transactionController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT verification
│   │   ├── csvUpload.js          # File upload handling
│   │   ├── errorHandler.js       # Error handling
│   │   ├── logger.js             # Request logging
│   │   ├── notFound.js           # 404 handler
│   │   ├── rateLimiter.js        # Rate limiting
│   │   └── validateRequest.js    # Request validation
│   ├── Models/
│   │   ├── aiAnalysis.js         # AI analysis schema
│   │   ├── Budget.js             # Budget schema
│   │   ├── Transaction.js        # Transaction schema
│   │   └── User.js               # User schema
│   ├── routes/
│   │   ├── aiAnalysisRoutes.js
│   │   ├── authRoutes.js
│   │   ├── budgetRoutes.js
│   │   └── transactionRoutes.js
│   ├── utils/
│   │   ├── aiPrompt.js           # AI prompt builder
│   │   ├── budgetCalculator.js   # Budget calculations
│   │   ├── categorizer.js        # Transaction categorization
│   │   ├── dateUtils.js          # Date utilities
│   │   └── validation.js         # Input validation
│   ├── index.js                  # Server entry point
│   └── package.json
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/                  # API client functions
│   │   ├── auth/                 # Auth components
│   │   ├── components/           # Reusable components
│   │   ├── pages/                # Page components
│   │   ├── App.jsx               # Main app component
│   │   ├── App.css               # Global styles
│   │   ├── index.css             # Base styles
│   │   └── main.jsx              # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🔧 Configuration

### MongoDB Setup

**Option 1: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/finance-advisor`

**Option 2: MongoDB Atlas**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGO_URI` in `.env`

### Google Gemini API Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env` as `GEMINI_API_KEY`
4. The app will work without it but AI features will use basic analysis

## 🎨 Features Breakdown

### Dashboard Tabs

1. **Overview Tab**
   - Summary statistics
   - Spending charts
   - Category breakdown
   - Quick action buttons

2. **Transactions Tab**
   - Complete transaction list
   - Advanced filtering
   - Delete functionality
   - Scrollable list

3. **Budget Tab**
   - Budget setting form
   - Real-time status
   - Visual progress bars
   - Alert system

4. **AI Insights Tab**
   - Month selector
   - AI analysis display
   - Generate/refresh analysis
   - Historical insights

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT tokens with 7-day expiration
- HTTP-only cookies
- CORS protection
- Rate limiting on auth endpoints
- Input validation and sanitization
- Secure password reset flow

## 📝 CSV Format

The CSV upload expects the following format:

```csv
date,description,amount
2025-01-15,Swiggy Order,500.00
2025-01-16,Uber Ride,250.00
2025-01-17,Netflix Subscription,799.00
```

**Supported column names:**
- Date: `date`, `Date`, `DATE`, `transaction_date`
- Description: `description`, `Description`, `DESCRIPTION`, `desc`, `narration`
- Amount: `amount`, `Amount`, `AMOUNT`, `value`

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check network connectivity

2. **CORS Errors**
   - Ensure frontend URL is in `FRONTEND_URL` in `.env`
   - Check backend CORS configuration

3. **AI Analysis Not Working**
   - Verify `GEMINI_API_KEY` is set
   - Check API key validity
   - App will use basic analysis as fallback

4. **CSV Upload Fails**
   - Ensure CSV format is correct
   - Check file size (max 5MB)
   - Verify column names match expected format

## 🚧 Future Enhancements

- [ ] Email notifications for budget alerts
- [ ] Export transactions to PDF/Excel
- [ ] Recurring transaction support
- [ ] Multi-currency support
- [ ] Dark mode toggle
- [ ] Advanced analytics and reports
- [ ] Mobile app (React Native)
- [ ] Bank account integration (Plaid/Stripe)

## 📄 License

ISC License

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ using MERN Stack**

