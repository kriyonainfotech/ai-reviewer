const multer = require('multer');

// --- Vercel-Compatible Storage ---
// We use memoryStorage() to store the file as a buffer in RAM,
// NOT on the Vercel file system, which is read-only.
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/json') {
            cb(null, true);
        } else {
            cb(new Error('Only .json files are allowed!'), false);
        }
    }
});

// Middleware for a single file upload with the field name 'reviewFile'
const uploadReviewFile = upload.single('reviewFile');

module.exports = uploadReviewFile;