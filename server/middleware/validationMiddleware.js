const Joi = require('joi');

const clientCreateSchema = Joi.object({
    clientId: Joi.string().alphanum().min(3).max(50).required(),
    clientName: Joi.string().min(3).max(100).required(),
    googleReviewLink: Joi.string().uri().required(),
    logoUrl: Joi.string().uri().allow("").optional(),
    primaryColor: Joi.string().regex(/^#[0-9a-fA-F]{6}$/).required(),
    secondaryColor: Joi.string().regex(/^#[0-9a-fA-F]{6}$/).required(),
    sourceReviewFile: Joi.string().pattern(/^[\w\.-]+\.json$/).allow("").optional(),
});

const clientUpdateSchema = Joi.object({
    clientName: Joi.string().min(3).max(100).required(),
    googleReviewLink: Joi.string().uri().required(),
    logoUrl: Joi.string().uri().allow("").optional(),
    primaryColor: Joi.string().regex(/^#[0-9a-fA-F]{6}$/).required(),
    secondaryColor: Joi.string().regex(/^#[0-9a-fA-F]{6}$/).required(),
});

const addReviewSchema = Joi.object({
    review: Joi.string().min(5).max(500).required(),
});

// Reusable Validation Middleware
const validateBody = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

module.exports = {
    validateBody,
    clientCreateSchema,
    clientUpdateSchema,
    addReviewSchema
};