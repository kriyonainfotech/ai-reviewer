const fs = require('fs-extra');
const path = require('path');
const qrcode = require('qrcode');

const DATA_DIR = path.join(__dirname, "../data");

// @desc    Get list of seedable .json files
// @route   GET /api/data-files
exports.getDataFiles = async (req, res, next) => {
    try {
        const files = await fs.readdir(DATA_DIR);
        const jsonFiles = files.filter((file) => file.endsWith(".json"));
        res.json(jsonFiles);
    } catch (error) {
        console.error("[Server] Error reading data directory:", error);
        next(error);
    }
};

// @desc    Generate a QR code
// @route   POST /api/client/:clientId/generate-qr
exports.generateQR = async (req, res, next) => {
    // This URL will be your *React* app's URL
    const APP_BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:5173`;

    try {
        const { clientId } = req.params;
        const reviewPageUrl = `${APP_BASE_URL}/review/${clientId}`;

        const dataUrl = await qrcode.toDataURL(reviewPageUrl, {
            errorCorrectionLevel: "H",
            type: "image/png",
            margin: 2,
            width: 300,
        });
        res.json({ qrDataUrl: dataUrl, link: reviewPageUrl });
    } catch (err) {
        console.error("[Server] QR Code generation failed:", err);
        next(err);
    }
};