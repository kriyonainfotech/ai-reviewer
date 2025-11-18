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
    businessDescription: {
        type: String,
        default: ""
    },
    businessServices: {
        type: String, // We can store it as a comma-separated string for simplicity
        default: ""
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