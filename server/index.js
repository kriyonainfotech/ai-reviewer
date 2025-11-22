// /*
//  * ===============================================
//  * Google Review Booster - MERN Backend Server
//  * ===============================================
//  * This server handles all API logic and connects
//  * to MongoDB via Mongoose.
//  * ===============================================
//  */

// // --- 1. Imports ---
// const express = require("express");
// const cors = require("cors");
// const Joi = require("joi");
// const mongoose = require("mongoose");
// const fs = require("fs-extra"); // Still used for seeding reviews
// const path = require("path");
// const qrcode = require("qrcode");
// require("dotenv").config(); // Loads .env file variables

// // --- Import the Mongoose Model ---
// const Client = require('./ClientModel');

// // --- 2. App Initialization ---
// const app = express();
// const PORT = process.env.PORT || 5000;
// // Note: APP_BASE_URL is now handled by the React client's .env file
// // But we need a value for QR codes (Vercel/production variable is best)
// const APP_BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:5173`;

// // --- 3. Paths and Constants ---
// const DATA_DIR = path.join(__dirname, "data"); // Used for seeding
// const SAMPLE_REVIEWS_FILE = path.join(DATA_DIR, "sample-reviews-200.json");

// // --- 4. Middleware ---
// app.use(cors()); // Enable Cross-Origin Resource Sharing
// app.use(express.json()); // Parse JSON request bodies

// // Custom logging middleware
// app.use((req, res, next) => {
//     console.log(`[Server] ${req.method} ${req.url}`);
//     next();
// });

// // --- 5. Helper Function (Only for Seeding) ---

// /**
//  * Reads all sample reviews from a specified file.
//  * @param {string} [fileName] - The JSON file to read from
//  * @returns {Promise<string[]>} List of reviews
//  */
// async function getReviewsFromFile(fileName = "sample-reviews-200.json") {
//     if (!fileName) {
//         fileName = "sample-reviews-200.json";
//     }
//     const filePath = path.join(DATA_DIR, fileName);

//     try {
//         if (await fs.pathExists(filePath)) {
//             const data = await fs.readJson(filePath);
//             if (Array.isArray(data.reviews)) {
//                 return data.reviews;
//             }
//         }
//         const defaultData = await fs.readJson(SAMPLE_REVIEWS_FILE);
//         return defaultData.reviews || ["Excellent service!"];
//     } catch (error) {
//         console.error(`[Server] CRITICAL: Could not read reviews from ${fileName}.`, error);
//         return ["Excellent service!", "Very professional."];
//     }
// }

// // --- 6. Joi Validation Schemas (Unchanged) ---

// const clientCreateSchema = Joi.object({
//     clientId: Joi.string().alphanum().min(3).max(50).required(),
//     clientName: Joi.string().min(3).max(100).required(),
//     googleReviewLink: Joi.string().uri().required(),
//     logoUrl: Joi.string().uri().allow("").optional(),
//     primaryColor: Joi.string().regex(/^#[0-9a-fA-F]{6}$/).required(),
//     secondaryColor: Joi.string().regex(/^#[0-9a-fA-F]{6}$/).required(),
//     sourceReviewFile: Joi.string().pattern(/^[\w\.-]+\.json$/).allow("").optional(),
// });

// const clientUpdateSchema = Joi.object({
//     clientName: Joi.string().min(3).max(100).required(),
//     googleReviewLink: Joi.string().uri().required(),
//     logoUrl: Joi.string().uri().allow("").optional(),
//     primaryColor: Joi.string().regex(/^#[0-9a-fA-F]{6}$/).required(),
//     secondaryColor: Joi.string().regex(/^#[0-9a-fA-F]{6}$/).required(),
// });

// const addReviewSchema = Joi.object({
//     review: Joi.string().min(5).max(500).required(),
// });

// // Validation Middleware
// const validateBody = (schema) => (req, res, next) => {
//     const { error } = schema.validate(req.body);
//     if (error) {
//         return res.status(400).json({ message: error.details[0].message });
//     }
//     next();
// };

// // --- 7. API Routes ---

// /*
//  * =======================
//  * DATA & CLIENT API
//  * =======================
//  */

// /**
//  * GET /api/data-files
//  * (Kept for seeding new clients from the UI)
//  */
// app.get("/api/data-files", async (req, res) => {
//     try {
//         const files = await fs.readdir(DATA_DIR);
//         const jsonFiles = files.filter((file) => file.endsWith(".json"));
//         res.json(jsonFiles);
//     } catch (error) {
//         console.error("[Server] Error reading data directory:", error);
//         res.status(500).json({ message: "Error reading data directory." });
//     }
// });


// /**
//  * GET /api/clients
//  * Get a list of all existing client IDs and names.
//  * --- REFACTORED FOR MONGOOSE ---
//  */
// app.get("/api/clients", async (req, res) => {
//     try {
//         // Find all clients, but only return their clientId and clientName
//         const clients = await Client.find({}, 'clientId clientName');
//         res.json(clients);
//     } catch (error) {
//         console.error("[Server] Error reading client list from DB:", error);
//         res.status(500).json({ message: "Error reading client directory." });
//     }
// });

// /**
//  * POST /api/client
//  * Create a new client.
//  * --- REFACTORED FOR MONGOOSE ---
//  */
// app.post("/api/client", validateBody(clientCreateSchema), async (req, res) => {
//     const { clientId, sourceReviewFile, ...clientDetails } = req.body;

//     try {
//         const existingClient = await Client.findOne({ clientId: clientId });
//         if (existingClient) {
//             return res.status(409).json({ message: "Client ID already exists." });
//         }

//         const initialReviews = await getReviewsFromFile(sourceReviewFile);

//         const newClientData = {
//             ...clientDetails,
//             clientId: clientId,
//             reviews: initialReviews,
//         };

//         const client = new Client(newClientData);
//         await client.save();

//         res.status(201).json(client);
//     } catch (error) {
//         console.error("[Server] Failed to create client:", error);
//         res.status(500).json({ message: "Failed to create client file." });
//     }
// });

// /**
//  * GET /api/client/:clientId
//  * Get a specific client's details (WITHOUT review list).
//  * --- REFACTORED FOR MONGOOSE ---
//  */
// app.get("/api/client/:clientId", async (req, res) => {
//     try {
//         const { clientId } = req.params;
//         // Find by clientId, and exclude the 'reviews' and MongoDB '_id' fields
//         const data = await Client.findOne({ clientId: clientId }).select('-reviews -_id');

//         if (!data) {
//             return res.status(404).json({ message: "Client not found." });
//         }
//         res.json(data);
//     } catch (error) {
//         res.status(500).json({ message: "Server error" });
//     }
// });

// /**
//  * PUT /api/client/:clientId
//  * Update a specific client's details.
//  * --- REFACTORED FOR MONGOOSE ---
//  */
// app.put(
//     "/api/client/:clientId",
//     validateBody(clientUpdateSchema),
//     async (req, res) => {
//         try {
//             const { clientId } = req.params;

//             const updatedData = await Client.findOneAndUpdate(
//                 { clientId: clientId },
//                 req.body,
//                 { new: true } // Return the updated document
//             );

//             if (!updatedData) {
//                 return res.status(404).json({ message: "Client not found." });
//             }

//             res.json(updatedData);
//         } catch (error) {
//             res.status(500).json({ message: "Failed to update client data." });
//         }
//     }
// );

// /**
//  * DELETE /api/client/:clientId
//  * Delete a client.
//  * --- REFACTORED FOR MONGOOSE ---
//  */
// app.delete("/api/client/:clientId", async (req, res) => {
//     try {
//         const { clientId } = req.params;

//         const deletedClient = await Client.findOneAndDelete({ clientId: clientId });

//         if (!deletedClient) {
//             return res.status(404).json({ message: "Client not found." });
//         }

//         res.status(204).send(); // 204 No Content
//     } catch (error) {
//         res.status(500).json({ message: "Error deleting client file." });
//     }
// });

// /*
//  * =======================
//  * REVIEW MANAGEMENT API
//  * =======================
//  */

// /**
//  * GET /api/client/:clientId/reviews
//  * Get all reviews for a specific client.
//  * --- REFACTORED FOR MONGOOSE ---
//  */
// app.get("/api/client/:clientId/reviews", async (req, res) => {
//     try {
//         const { clientId } = req.params;
//         const data = await Client.findOne({ clientId: clientId });

//         if (!data) {
//             return res.status(404).json({ message: "Client not found." });
//         }
//         res.json({ reviews: data.reviews || [] });
//     } catch (error) {
//         res.status(500).json({ message: "Server error" });
//     }
// });

// /**
//  * GET /api/client/:clientId/random-review
//  * Get one random review for a client.
//  * --- REFACTORED FOR MONGOOSE ---
//  */
// app.get("/api/client/:clientId/random-review", async (req, res) => {
//     try {
//         const { clientId } = req.params;
//         const data = await Client.findOne({ clientId: clientId });

//         if (!data || !data.reviews || data.reviews.length === 0) {
//             return res.status(404).json({ message: "Client not found or has no reviews." });
//         }

//         const randomIndex = Math.floor(Math.random() * data.reviews.length);
//         const randomReview = data.reviews[randomIndex];

//         res.json({ review: randomReview });
//     } catch (error) {
//         res.status(500).json({ message: "Server error" });
//     }
// });

// /**
//  * POST /api/client/:clientId/reviews
//  * Add a new review to a client's list.
//  * --- REFACTORED FOR MONGOOSE ---
//  */
// app.post(
//     "/api/client/:clientId/reviews",
//     validateBody(addReviewSchema),
//     async (req, res) => {
//         try {
//             const { clientId } = req.params;
//             const { review } = req.body;

//             // Use $push to add the new review to the beginning of the array
//             const updatedClient = await Client.findOneAndUpdate(
//                 { clientId: clientId },
//                 { $push: { reviews: { $each: [review], $position: 0 } } },
//                 { new: true }
//             );

//             if (!updatedClient) {
//                 return res.status(404).json({ message: "Client not found." });
//             }

//             res.status(201).json({ review });
//         } catch (error) {
//             res.status(500).json({ message: "Failed to add review." });
//         }
//     }
// );

// /**
//  * DELETE /api/client/:clientId/reviews
//  * Delete a specific review.
//  * --- REFACTORED FOR MONGOOSE ---
//  */
// app.delete("/api/client/:clientId/reviews", async (req, res) => {
//     const { clientId } = req.params;
//     const { review } = req.body; // Expects { "review": "The review text to delete" }

//     if (!review) {
//         return res.status(400).json({ message: "Review text is required." });
//     }

//     try {
//         // Use $pull to remove a specific review from the array
//         const updatedClient = await Client.findOneAndUpdate(
//             { clientId: clientId },
//             { $pull: { reviews: review } },
//             { new: true }
//         );

//         if (!updatedClient) {
//             return res.status(404).json({ message: "Client not found." });
//         }

//         res.status(200).json({ message: "Review deleted." });
//     } catch (error) {
//         res.status(500).json({ message: "Failed to delete review." });
//     }
// });

// /*
//  * =======================
//  * QR CODE API (Unchanged)
//  * =======================
//  */

// app.post("/api/client/:clientId/generate-qr", async (req, res) => {
//     const { clientId } = req.params;
//     const reviewPageUrl = `${APP_BASE_URL}/review/${clientId}`;

//     try {
//         const dataUrl = await qrcode.toDataURL(reviewPageUrl, {
//             errorCorrectionLevel: "H",
//             type: "image/png",
//             margin: 2,
//             width: 300,
//         });
//         res.json({ qrDataUrl: dataUrl, link: reviewPageUrl });
//     } catch (err) {
//         console.error("[Server] QR Code generation failed:", err);
//         res.status(500).json({ message: "Failed to generate QR code." });
//     }
// });

// // --- 8. Start Server ---

// // --- FRONTEND ROUTE HANDLERS (REMOVED) ---
// // The React app now handles all frontend routing.
// // This server is API-ONLY.

// // --- ERROR HANDLER ---
// app.use((err, req, res, next) => {
//     console.error("[Server] Unhandled Error:", err.stack);
//     res.status(500).send("Something broke!");
// });

// // Connect to MongoDB and start the server
// console.log("[Server] Connecting to MongoDB...");
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => {
//         console.log("[Server] MongoDB Connected.");
//         app.listen(PORT, () => {
//             console.log(
//                 `[Server] Review Booster server running on http://localhost:${PORT}`
//             );
//         });
//     })
//     .catch((err) => {
//         console.error("[Server] Failed to connect to MongoDB", err);
//         process.exit(1);
//     });
/*
 * ===============================================
 * Google Review Booster - MERN Backend Server
 * ===============================================
 */
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
    "http://localhost:5174",
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