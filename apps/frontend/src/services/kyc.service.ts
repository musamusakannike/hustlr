import { getTransport } from "@/lib/transport";
import type { Bank, BankDetails, Kyc, KycStatus, VerificationType } from "@/types/kyc";

const transport = getTransport();

export type { Bank, VerificationType };
export type { KycStatus };
export type IBankDetails = BankDetails;
export type IKyc = Kyc;

export const kycService = {
  async getMyKyc(): Promise<IKyc | null> {
    try {
      return await transport.getMyKyc();
    } catch {
      return null;
    }
  },

  upsertKyc(payload: Partial<IKyc>): Promise<IKyc> {
    return transport.upsertKyc(payload);
  },

  submitKyc(): Promise<IKyc> {
    return transport.submitKyc();
  },

  async uploadKycFile(
    file: File | Blob,
    _kind:
      | "idDocument"
      | "selfie"
      | "proofOfAddress"
      | "businessRegistration"
      | "document" = "document"
  ): Promise<string> {
    const asFile =
      file instanceof File ? file : new File([file], "upload.jpg", { type: file.type || "image/jpeg" });
    const res = await transport.uploadAsset({ kind: "kyc-document", file: asFile });
    return res.url;
  },

  async getBanks(): Promise<Bank[]> {
    try {
      const banks = await transport.listBanks();
      if (Array.isArray(banks) && banks.length > 0) return banks;
    } catch {
      // fall through
    }
    return [
      { name: "Access Bank", code: "044" },
      { name: "First Bank of Nigeria", code: "011" },
      { name: "Guaranty Trust Bank (GTBank)", code: "058" },
      { name: "Kuda Bank", code: "50211" },
      { name: "OPay", code: "999992" },
      { name: "Palmpay", code: "999991" },
      { name: "United Bank for Africa (UBA)", code: "033" },
      { name: "Zenith Bank", code: "057" },
    ];
  },
};
