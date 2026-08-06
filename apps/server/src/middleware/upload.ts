import multer from 'multer';

// Memory storage engine for handling file uploads (ideal for Cloudflare R2 / S3 streaming)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
