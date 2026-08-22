import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return fallback ?? "";
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT ?? 5000),
  mongodbUri: required("MONGODB_URI", "mongodb://localhost:27017/hustlr"),
  jwtSecret: required("JWT_SECRET", "dev-only-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  clientOrigins: (process.env.CLIENT_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  adminWebsiteUrl: process.env.ADMIN_WEBSITE_URL ?? "http://localhost:3001",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  platformDomain: process.env.PLATFORM_DOMAIN ?? "hustlr.shop",
  devPlatformDomain: process.env.DEV_PLATFORM_DOMAIN ?? "lvh.me",
  cookieDomain: process.env.COOKIE_DOMAIN ?? "",
  awsRegion: process.env.AWS_REGION ?? "auto",
  r2Endpoint: process.env.R2_ENDPOINT ?? "",
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  r2BucketName: process.env.R2_BUCKET_NAME ?? "",
  r2PublicUrl: process.env.R2_PUBLIC_URL ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "",
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPassword: process.env.SMTP_PASSWORD ?? "",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
  firebasePrivateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY ?? "",
  paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY ?? "",
  xaiApiKey: process.env.XAI_API_KEY ?? "",
  xaiModel: process.env.XAI_MODEL ?? "grok-4.5",
  xaiBaseUrl: process.env.XAI_BASE_URL ?? "https://api.x.ai/v1",
  deepseekApiKey: process.env.DEEPSEEK_API_KEY ?? "",
  deepseekModel: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
  deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
  platformServerIp: process.env.PLATFORM_SERVER_IP ?? "",
  customDomainCnameTarget: process.env.CUSTOM_DOMAIN_CNAME_TARGET ?? "stores.hustlr.shop",
};
