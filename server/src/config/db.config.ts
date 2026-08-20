import mongoose from "mongoose";
import { env } from "./env.config";
import { APP_NAME } from "./constants.config";

export async function connectDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri);
  console.log(`[${APP_NAME}] MongoDB connected`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
