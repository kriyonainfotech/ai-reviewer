const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log("[Server] Connecting to MongoDB...");
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`[Server] MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[Server] Failed to connect to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;