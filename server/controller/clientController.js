const Client = require('../ClientModel');
const getReviews = require('../utils/getReviews');

// @desc    Get all clients (ID and Name only)
// @route   GET /api/clients
exports.getClients = async (req, res, next) => {
    try {
        const clients = await Client.find({}, 'clientId clientName');
        res.json(clients);
    } catch (error) {
        next(error); // Pass error to global handler
    }
};

// @desc    Get a single client's details (no reviews)
// @route   GET /api/client/:clientId
exports.getClientDetails = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        const data = await Client.findOne({ clientId: clientId }).select('-reviews');

        if (!data) {
            return res.status(404).json({ message: "Client not found." });
        }
        res.json(data);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new client
// @route   POST /api/client
exports.createClient = async (req, res, next) => {
    // Note: req.body is pre-validated by Joi middleware
    // Note: req.file is provided by multer middleware
    const { clientId, sourceReviewFile, ...clientDetails } = req.body;

    try {
        const existingClient = await Client.findOne({ clientId: clientId });
        if (existingClient) {
            return res.status(409).json({ message: "Client ID already exists." });
        }

        // getReviews helper now handles buffer OR file name
        const initialReviews = await getReviews({
            buffer: req.file ? req.file.buffer : null,
            fileName: sourceReviewFile
        });

        const newClientData = {
            ...clientDetails,
            clientId: clientId,
            reviews: initialReviews,
        };

        const client = new Client(newClientData);
        await client.save();

        res.status(201).json(client);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a client's details
// @route   PUT /api/client/:clientId
exports.updateClient = async (req, res, next) => {
    try {
        const { id } = req.params; // this is MongoDB _id
        console.log(id, "id-------------------------")

        // Remove fields that should never be updated
        delete req.body._id;
        // delete req.body.clientId;
        delete req.body.__v;

        const updatedClient = await Client.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedClient) {
            return res.status(404).json({
                success: false,
                message: "Client not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Client updated successfully.",
            data: updatedClient
        });

    } catch (error) {
        console.error("Update Client Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating client.",
            error: error.message
        });
    }
};

// @desc    Delete a client
// @route   DELETE /api/client/:clientId
exports.deleteClient = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        const deletedClient = await Client.findOneAndDelete({ clientId: clientId });

        if (!deletedClient) {
            return res.status(404).json({ message: "Client not found." });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};