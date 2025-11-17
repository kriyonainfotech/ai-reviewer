const Client = require('../ClientModel');

// @desc    Get all reviews for a client
// @route   GET /api/client/:clientId/reviews
exports.getReviews = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        const data = await Client.findOne({ clientId: clientId });

        if (!data) {
            return res.status(404).json({ message: "Client not found." });
        }
        res.json({ reviews: data.reviews || [] });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a random review for a client
// @route   GET /api/client/:clientId/random-review
exports.getRandomReview = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        const data = await Client.findOne({ clientId: clientId });

        if (!data || !data.reviews || data.reviews.length === 0) {
            return res.status(404).json({ message: "Client not found or has no reviews." });
        }

        const randomIndex = Math.floor(Math.random() * data.reviews.length);
        const randomReview = data.reviews[randomIndex];
        res.json({ review: randomReview });
    } catch (error) {
        next(error);
    }
};

// @desc    Add a new review to a client's list
// @route   POST /api/client/:clientId/reviews
exports.addReview = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        const { review } = req.body; // pre-validated

        const updatedClient = await Client.findOneAndUpdate(
            { clientId: clientId },
            { $push: { reviews: { $each: [review], $position: 0 } } },
            { new: true }
        );

        if (!updatedClient) {
            return res.status(404).json({ message: "Client not found." });
        }
        res.status(201).json({ review });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a specific review
// @route   DELETE /api/client/:clientId/reviews
exports.deleteReview = async (req, res, next) => {
    const { clientId } = req.params;
    const { review } = req.body;

    if (!review) {
        return res.status(400).json({ message: "Review text is required." });
    }

    try {
        const updatedClient = await Client.findOneAndUpdate(
            { clientId: clientId },
            { $pull: { reviews: review } },
            { new: true }
        );

        if (!updatedClient) {
            return res.status(404).json({ message: "Client not found." });
        }
        res.status(200).json({ message: "Review deleted." });
    } catch (error) {
        next(error);
    }
};