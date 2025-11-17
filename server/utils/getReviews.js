const fs = require('fs-extra');
const path = require('path');

const DATA_DIR = path.join(__dirname, "../data"); // Note the ../ to go up
const SAMPLE_REVIEWS_FILE = path.join(DATA_DIR, "sample-reviews-200.json");

/**
 * Reads reviews from various sources.
 * @param {Object} options
 * @param {Buffer} [options.buffer] - A file buffer from multer
 * @param {string} [options.fileName] - A file name from the /data dir
 * @returns {Promise<string[]>} List of reviews
 */
async function getReviews(options = {}) {
    const { buffer, fileName } = options;

    try {
        // --- Priority 1: Read from Buffer ---
        if (buffer) {
            console.log("[Server] Reading reviews from uploaded file buffer.");
            const data = JSON.parse(buffer.toString());
            if (Array.isArray(data.reviews)) {
                return data.reviews;
            }
        }

        // --- Priority 2: Read from selected file name ---
        if (fileName) {
            const filePath = path.join(DATA_DIR, fileName);
            if (await fs.pathExists(filePath)) {
                console.log(`[Server] Reading reviews from data/${fileName}`);
                const data = await fs.readJson(filePath);
                if (Array.isArray(data.reviews)) {
                    return data.reviews;
                }
            }
        }
    } catch (error) {
        console.error(`[Server] Failed to parse reviews:`, error);
        // Fallthrough to default if parsing fails
    }

    // --- Priority 3: Fallback to default sample file ---
    try {
        console.log("[Server] Falling back to sample-reviews-200.json");
        const defaultData = await fs.readJson(SAMPLE_REVIEWS_FILE);
        return defaultData.reviews || ["Excellent service!"];
    } catch (error) {
        console.error(`[Server] CRITICAL: Could not read default sample file.`, error);
        return ["Excellent service!", "Very professional."];
    }
}

module.exports = getReviews;