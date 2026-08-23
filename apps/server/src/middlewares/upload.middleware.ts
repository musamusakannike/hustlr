import multer from "multer";
import { ApiError } from "../utils/api-error.util";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/x-icon", "image/svg+xml"]);
const documentTypes = new Set([...imageTypes, "application/pdf"]);

const storage = multer.memoryStorage();

function fileFilter(allowed: Set<string>) {
  return (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ): void => {
    if (!allowed.has(file.mimetype)) {
      cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  };
}

export const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(imageTypes),
});

export const documentUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter(documentTypes),
});

export const productImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: fileFilter(imageTypes),
});
