require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require('./config/db');
const loggingMiddleware = require('./middleware/loggingMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

// --- 1. Connect to Database ---
connectDB();

// --- 2. Initialize App ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- 3. Core Middleware ---

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://pocketreview.vercel.app"
];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}));

app.use(express.json()); // for parsing application/json
app.use(loggingMiddleware);

// --- 4. API Routes ---
// This is the main router for all your API endpoints
app.use('/api', require('./routes/apiRoutes'));

// --- 5. Error Handling ---
// This must be the last middleware
app.use(errorHandler);

// --- 6. Start Server ---
app.listen(PORT, () => {
    console.log(
        `[Server] Review Booster server running on http://localhost:${PORT}`
    );
});