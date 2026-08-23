export type KycStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "info_requested";

export type VerificationType =
  | "NIN"
  | "Driver's License"
  | "International Passport"
  | "Voter's Card";

export interface BankDetails {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface Kyc {
  id: string;
  sellerId: string;
  status: KycStatus;
  firstName: string;
  lastName: string;
  otherName: string;
  verificationType?: VerificationType;
  documentId: string;
  idDocumentUrl: string;
  selfieUrl: string;
  address: string;
  proofOfAddressUrl: string;
  businessRegistrationUrl: string;
  bankDetails?: BankDetails;
  reviewerNote: string;
  requestedFiles: string[];
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Partial update payload — mirrors PUT /kyc (save-progress wizard). */
export type KycInput = Partial<
  Pick<
    Kyc,
    | "firstName"
    | "lastName"
    | "otherName"
    | "verificationType"
    | "documentId"
    | "idDocumentUrl"
    | "selfieUrl"
    | "address"
    | "proofOfAddressUrl"
    | "businessRegistrationUrl"
    | "bankDetails"
  >
>;

export interface Bank {
  name: string;
  code: string;
  acronym?: string;
}
