import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.config";

let client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!env.r2Endpoint || !env.r2AccessKeyId || !env.r2SecretAccessKey) {
    throw new Error("Cloudflare R2 is not configured. Set R2_* environment variables.");
  }
  if (!client) {
    client = new S3Client({
      region: env.awsRegion,
      endpoint: env.r2Endpoint,
      credentials: {
        accessKeyId: env.r2AccessKeyId,
        secretAccessKey: env.r2SecretAccessKey,
      },
      forcePathStyle: true,
    });
  }
  return client;
}

export function isR2Configured(): boolean {
  return Boolean(env.r2Endpoint && env.r2AccessKeyId && env.r2SecretAccessKey && env.r2BucketName);
}
