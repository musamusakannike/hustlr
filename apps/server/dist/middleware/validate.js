"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], { abortEarly: false });
        if (error) {
            const details = error.details.map((detail) => detail.message);
            return res.status(400).json({ error: 'Validation Error', details });
        }
        next();
    };
};
exports.validateRequest = validateRequest;
