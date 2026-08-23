import { apiClient } from "./api.client";

export type KycStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "info_requested"
  | null;

export type VerificationType =
  | "NIN"
  | "Driver's License"
  | "International Passport"
  | "Voter's Card";

export interface IBankDetails {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface Bank {
  name: string;
  code: string;
  slug?: string;
}

export interface IKyc {
  _id?: string;
  sellerId?: string;
  status: KycStatus;
  firstName?: string;
  lastName?: string;
  otherName?: string;
  verificationType?: VerificationType;
  documentId?: string;
  idDocumentUrl?: string;
  selfieUrl?: string;
  address?: string;
  proofOfAddressUrl?: string;
  businessRegistrationUrl?: string;
  bankDetails?: IBankDetails;
  reviewerNote?: string;
  requestedFiles?: string[];
  submittedAt?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const kycService = {
  /**
   * Fetch current seller's KYC application
   */
  async getMyKyc(): Promise<IKyc | null> {
    try {
      const res = await apiClient.get<ApiResponse<IKyc | null>>("/seller/kyc");
      return res.data.data;
    } catch {
      return null;
    }
  },

  /**
   * Save or update draft KYC fields
   */
  async upsertKyc(payload: Partial<IKyc>): Promise<IKyc> {
    const res = await apiClient.put<ApiResponse<IKyc>>("/seller/kyc", payload);
    return res.data.data;
  },

  /**
   * Submit the completed KYC application for admin review
   */
  async submitKyc(): Promise<IKyc> {
    const res = await apiClient.post<ApiResponse<IKyc>>("/seller/kyc/submit");
    return res.data.data;
  },

  /**
   * Upload an image/document file to Cloudflare R2 through backend
   */
  async uploadKycFile(
    file: File | Blob,
    kind: "idDocument" | "selfie" | "proofOfAddress" | "businessRegistration" | "document" = "document"
  ): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<ApiResponse<{ url: string }>>(
      `/seller/kyc/upload?kind=${encodeURIComponent(kind)}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data.data.url;
  },

  /**
   * List African / Nigerian banks for payout configuration
   */
  async getBanks(): Promise<Bank[]> {
    try {
      const res = await apiClient.get<ApiResponse<Bank[]>>("/paystack-banks");
      if (Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data;
      }
    } catch {
      // fallback if API is unreachable
    }

    // Default Nigerian banks fallback
    return [
      { name: "Access Bank", code: "044" },
      { name: "First Bank of Nigeria", code: "011" },
      { name: "Guaranty Trust Bank (GTBank)", code: "058" },
      { name: "Kuda Bank", code: "50211" },
      { name: "OPay", code: "999992" },
      { name: "Palmpay", code: "999991" },
      { name: "United Bank for Africa (UBA)", code: "033" },
      { name: "Zenith Bank", code: "057" },
      { name: "Fidelity Bank", code: "070" },
      { name: "Stanbic IBTC Bank", code: "221" },
      { name: "Sterling Bank", code: "232" },
      { name: "Union Bank of Nigeria", code: "032" },
      { name: "Wema Bank", code: "035" },
      { name: "Moniepoint MFB", code: "50515" },
    ];
  },
};
