"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const db_js_1 = require("./config/db.js");
const firebase_js_1 = require("./config/firebase.js");
const api_js_1 = __importDefault(require("./routes/api.js"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Connect Database & Initialize Firebase
(0, db_js_1.connectDB)();
(0, firebase_js_1.initFirebase)();
// Core Security & Logging Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Sanitize MongoDB inputs against NoSQL injection
app.use((0, express_mongo_sanitize_1.default)());
// Mount API Routes
app.use('/api', api_js_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Server Error]:', err.stack || err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});
exports.default = app;
