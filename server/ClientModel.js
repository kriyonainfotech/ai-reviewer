const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    clientName: {
        type: String,
        required: true
    },
    googleReviewLink: {
        type: String,
        required: true
    },
    logoUrl: {
        type: String
    },
    primaryColor: {
        type: String,
        default: '#3b82f6'
    },
    secondaryColor: {
        type: String,
        default: '#ffffff'
    },
    reviews: [String] // An array of strings
});

// Create the model
const Client = mongoose.model('Client', clientSchema);

module.exports = Client;