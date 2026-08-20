import type { Kyc } from "@/types/kyc";

/** KYC fixture: fresh draft, nothing filled in yet. */
export const DEMO_KYC: Kyc = {
  id: "kyc_0001",
  sellerId: "seller_0001",
  status: "draft",
  firstName: "",
  lastName: "",
  otherName: "",
  verificationType: undefined,
  documentId: "",
  idDocumentUrl: "",
  selfieUrl: "",
  address: "",
  proofOfAddressUrl: "",
  businessRegistrationUrl: "",
  bankDetails: undefined,
  reviewerNote: "",
  requestedFiles: [],
  submittedAt: null,
  reviewedAt: null,
  createdAt: "2026-08-10T10:00:00.000Z",
  updatedAt: "2026-08-10T10:00:00.000Z",
};
