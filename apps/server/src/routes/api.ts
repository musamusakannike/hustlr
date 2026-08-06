import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { authenticateJWT, generateToken, hashPassword, comparePassword } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import { uploadToR2 } from '../config/r2.js';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Sample Auth Validation Schema
const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Sample Register Route
router.post('/auth/register', validateRequest(authSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await hashPassword(password);
    const token = generateToken({ email });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { email, hashedPassword },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Sample Protected Route
router.get('/protected', authenticateJWT, (req: Request, res: Response) => {
  res.json({ message: 'Welcome to protected route!', user: (req as any).user });
});

// Sample File Upload Route to Cloudflare R2
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const bucketName = process.env.R2_BUCKET_NAME || 'uploads';
    const key = `uploads/${Date.now()}-${req.file.originalname}`;

    await uploadToR2(bucketName, key, req.file.buffer, req.file.mimetype);

    const publicUrl = process.env.R2_PUBLIC_DOMAIN ? `${process.env.R2_PUBLIC_DOMAIN}/${key}` : key;

    res.json({
      message: 'File uploaded successfully to Cloudflare R2',
      key,
      url: publicUrl,
    });
  } catch (error) {
    console.error('R2 Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

export default router;
