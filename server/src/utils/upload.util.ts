import { PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import { env } from "../config/env.config";
import { getR2Client, isR2Configured } from "../config/r2.config";
import { APP_SLUG } from "../config/constants.config";
import { ApiError } from "./api-error.util";
import { randomSuffix } from "./slug.util";

function sanitizeFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const base = path
    .basename(filename, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "file"}-${Date.now()}-${randomSuffix(6)}${ext}`;
}

export async function uploadBufferToR2(params: {
  buffer: Buffer;
  key: string;
  contentType: string;
}): Promise<string> {
  if (!isR2Configured()) {
    throw ApiError.serviceUnavailable("File storage is not configured");
  }
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: env.r2BucketName,
      Key: params.key,
      Body: params.buffer,
      ContentType: params.contentType,
    }),
  );
  const base = env.r2PublicUrl.replace(/\/$/, "");
  return `${base}/${params.key}`;
}

export async function uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
  const filename = sanitizeFilename(file.originalname);
  const key = `${APP_SLUG}/${folder}/${filename}`;
  return uploadBufferToR2({
    buffer: file.buffer,
    key,
    contentType: file.mimetype,
  });
}

export async function uploadNamedBuffer(
  buffer: Buffer,
  folder: string,
  filename: string,
  contentType: string,
): Promise<string> {
  const key = `${APP_SLUG}/${folder}/${filename}`;
  return uploadBufferToR2({ buffer, key, contentType });
}
