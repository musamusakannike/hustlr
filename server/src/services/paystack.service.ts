import crypto from "crypto";
import axios from "axios";
import { BANK_CACHE_TTL_MS, KOBO_MULTIPLIER } from "../config/constants.config";
import { env } from "../config/env.config";
import { ApiError } from "../utils/api-error.util";

const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: { "Content-Type": "application/json" },
});

paystack.interceptors.request.use((config) => {
  if (!env.paystackSecretKey) {
    throw ApiError.serviceUnavailable("Paystack is not configured");
  }
  config.headers.Authorization = `Bearer ${env.paystackSecretKey}`;
  return config;
});

let banksCache: { data: unknown; at: number } | null = null;

export function toKobo(naira: number): number {
  return Math.round(naira * KOBO_MULTIPLIER);
}

export async function initializeTransaction(params: {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<{ authorizationUrl: string; accessCode: string; reference: string }> {
  const { data } = await paystack.post("/transaction/initialize", {
    email: params.email,
    amount: toKobo(params.amount),
    reference: params.reference,
    callback_url: params.callbackUrl,
    metadata: params.metadata,
  });
  if (!data.status) throw ApiError.badRequest(data.message || "Unable to initialize payment");
  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
  };
}

export async function verifyTransaction(reference: string): Promise<{
  success: boolean;
  amount: number;
  status: string;
  paidAt?: string;
  data: Record<string, unknown>;
}> {
  const { data } = await paystack.get(`/transaction/verify/${encodeURIComponent(reference)}`);
  const payload = data.data as Record<string, unknown>;
  return {
    success: Boolean(data.status) && payload?.status === "success",
    amount: Number(payload?.amount ?? 0) / KOBO_MULTIPLIER,
    status: String(payload?.status ?? "unknown"),
    paidAt: payload?.paid_at as string | undefined,
    data: payload ?? {},
  };
}

export async function listBanks(): Promise<unknown> {
  if (banksCache && Date.now() - banksCache.at < BANK_CACHE_TTL_MS) return banksCache.data;
  const { data } = await paystack.get("/bank", { params: { currency: "NGN" } });
  banksCache = { data: data.data, at: Date.now() };
  return data.data;
}

export async function refundTransaction(reference: string, amount?: number): Promise<unknown> {
  const body: Record<string, unknown> = { transaction: reference };
  if (amount) body.amount = toKobo(amount);
  const { data } = await paystack.post("/refund", body);
  if (!data.status) throw ApiError.badRequest(data.message || "Refund failed");
  return data.data;
}

export async function createTransferRecipient(params: {
  name: string;
  accountNumber: string;
  bankCode: string;
}): Promise<string> {
  const { data } = await paystack.post("/transferrecipient", {
    type: "nuban",
    name: params.name,
    account_number: params.accountNumber,
    bank_code: params.bankCode,
    currency: "NGN",
  });
  if (!data.status) throw ApiError.badRequest(data.message || "Unable to create transfer recipient");
  return data.data.recipient_code as string;
}

export async function initiateTransfer(params: {
  amount: number;
  recipient: string;
  reference: string;
  reason: string;
}): Promise<{ reference: string; transferCode: string }> {
  const { data } = await paystack.post("/transfer", {
    source: "balance",
    amount: toKobo(params.amount),
    recipient: params.recipient,
    reference: params.reference,
    reason: params.reason,
  });
  if (!data.status) throw ApiError.badRequest(data.message || "Transfer failed");
  return {
    reference: data.data.reference,
    transferCode: data.data.transfer_code,
  };
}

export function verifyPaystackSignature(rawBody: Buffer | string, signature?: string): boolean {
  if (!signature || !env.paystackSecretKey) return false;
  const hash = crypto
    .createHmac("sha512", env.paystackSecretKey)
    .update(typeof rawBody === "string" ? rawBody : rawBody)
    .digest("hex");
  return hash === signature;
}
