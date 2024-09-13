const { validationResult } = require('express-validator');
const { query, body } = require('express-validator');

// Validation error messages
const ErrorMessage = {
    id: {
        required: 'Query parameter is required.'
    },
    general: {
        required: 'Field is required.'
    }
};

// Function to check for the Validation of query parameters
exports.checkQuery = (params) => {
    return params.map(param => query(param).trim().isLength({ min: 1 }).withMessage(ErrorMessage.id.required));
};

// Function to check for the Validation of body arguments
exports.checkBody = (params) => {
    return params.map(param => body(param).trim().isLength({ min: 1 }).withMessage(ErrorMessage.general.required));
};
