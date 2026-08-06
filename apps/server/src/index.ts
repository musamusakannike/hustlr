import dotenv from 'dotenv';
dotenv.config();

import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import { connectDB } from './config/db.js';
import { initFirebase } from './config/firebase.js';
import apiRouter from './routes/api.js';

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Connect Database & Initialize Firebase
connectDB();
initFirebase();

// Core Security & Logging Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize MongoDB inputs against NoSQL injection
app.use(mongoSanitize());

// Mount API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server Error]:', err.stack || err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});

export default app;
