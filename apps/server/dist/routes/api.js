"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const auth_js_1 = require("../middleware/auth.js");
const validate_js_1 = require("../middleware/validate.js");
const upload_js_1 = require("../middleware/upload.js");
const r2_js_1 = require("../config/r2.js");
const router = (0, express_1.Router)();
// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Sample Auth Validation Schema
const authSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
});
// Sample Register Route
router.post('/auth/register', (0, validate_js_1.validateRequest)(authSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await (0, auth_js_1.hashPassword)(password);
        const token = (0, auth_js_1.generateToken)({ email });
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { email, hashedPassword },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to register user' });
    }
});
// Sample Protected Route
router.get('/protected', auth_js_1.authenticateJWT, (req, res) => {
    res.json({ message: 'Welcome to protected route!', user: req.user });
});
// Sample File Upload Route to Cloudflare R2
router.post('/upload', upload_js_1.upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }
        const bucketName = process.env.R2_BUCKET_NAME || 'uploads';
        const key = `uploads/${Date.now()}-${req.file.originalname}`;
        await (0, r2_js_1.uploadToR2)(bucketName, key, req.file.buffer, req.file.mimetype);
        const publicUrl = process.env.R2_PUBLIC_DOMAIN ? `${process.env.R2_PUBLIC_DOMAIN}/${key}` : key;
        res.json({
            message: 'File uploaded successfully to Cloudflare R2',
            key,
            url: publicUrl,
        });
    }
    catch (error) {
        console.error('R2 Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});
exports.default = router;
