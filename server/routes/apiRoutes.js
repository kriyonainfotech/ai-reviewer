const express = require('express');
const router = express.Router();

// --- Import Middlewares ---
const {
    validateBody,
    clientCreateSchema,
    clientUpdateSchema,
    addReviewSchema
} = require('../middleware/validationMiddleware');

const uploadReviewFile = require('../middleware/uploadMiddleware');

// Optional safety middleware to avoid "_id is not allowed" error
const stripMongoFields = (req, res, next) => {
    delete req.body._id;
    delete req.body.__v;
    next();
};

// --- Import Controllers ---
const clientController = require('../controller/clientController');
const reviewController = require('../controller/reviewController');
const miscController = require('../controller/miscController');


// ==============================
// CLIENT ROUTES
// ==============================

// Get all clients
router.get('/clients', clientController.getClients);

// Create client
router.post(
    '/client',
    uploadReviewFile,
    validateBody(clientCreateSchema),
    clientController.createClient
);

// Get + Delete client by clientId (string)
router.route('/client/:clientId')
    .get(clientController.getClientDetails)
    .delete(clientController.deleteClient);

// Update client using MongoDB "_id"
router.put(
    '/client/:id',
    stripMongoFields,                     // prevents "_id is not allowed" error
    validateBody(clientUpdateSchema),     // Joi validation
    clientController.updateClient         // Controller
);


// ==============================
// REVIEW ROUTES
// ==============================

router.route('/client/:clientId/reviews')
    .get(reviewController.getReviews)
    .post(validateBody(addReviewSchema), reviewController.addReview)
    .delete(reviewController.deleteReview);

router.get('/client/:clientId/random-review', reviewController.getRandomReview);


// ==============================
// MISC ROUTES
// ==============================

router.get('/data-files', miscController.getDataFiles);

router.post('/client/:clientId/generate-qr', miscController.generateQR);


module.exports = router;
