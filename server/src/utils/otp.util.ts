import bcrypt from "bcryptjs";
import { OTP_LENGTH } from "../config/constants.config";

export function generateOtp(length = OTP_LENGTH): string {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export async function compareOtp(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

export function otpExpiry(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function isExpired(date?: Date | null): boolean {
  if (!date) return true;
  return date.getTime() < Date.now();
}
