export type WalletTxType =
  | "escrow_credit"
  | "withdrawal"
  | "withdrawal_reversal"
  | "referral_bonus"
  | "subscription_credit"
  | "adjustment";

export type WalletTxStatus =
  | "completed"
  | "awaiting_approval"
  | "approved"
  | "dispatched"
  | "failed"
  | "rejected";

export interface Wallet {
  id: string;
  sellerId: string;
  balance: number;
  pendingBalance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  sellerId: string;
  walletId: string;
  type: WalletTxType;
  status: WalletTxStatus;
  amount: number;
  description: string;
  orderId?: string | null;
  paystackReference?: string;
  bankSnapshot?: {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
  };
  rejectionReason?: string;
  createdAt: string;
}