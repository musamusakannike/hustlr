import type { User } from "@/types/auth";
import type { Subscription } from "@/types/subscription";
import { DEMO_SELLER, MOCK_OTP } from "@/fixtures/seller";
import { DEMO_STORE, TAKEN_SLUGS } from "@/fixtures/store";
import { DEMO_KYC } from "@/fixtures/kyc";
import { DEMO_PRODUCTS } from "@/fixtures/products";
import { DEMO_CATEGORIES } from "@/fixtures/categories";

/**
 * Mock-mode session persistence.
 *
 * Architecture decision 3 mandates HttpOnly cookies for real sessions; mock
 * mode cannot create them from client JS, so a localStorage marker stands in
 * for the `hustlr_session` cookie while NEXT_PUBLIC_TRANSPORT=mock. The real
 * ApiTransport relies exclusively on cookies sent by the Express backend.
 */
const MOCK_SESSION_KEY = "hustlr_mock_session";

export const mockDb = {
  seller: DEMO_SELLER,
  store: DEMO_STORE,
  kyc: DEMO_KYC,
  products: [...DEMO_PRODUCTS],
  categories: [...DEMO_CATEGORIES],
  subscription: null as Subscription | null,
  takenSlugs: [...TAKEN_SLUGS],
  pendingRegistration: null as {
    name: string;
    email: string;
    password: string;
  } | null,
  /** Plan intent captured by initialize/change-plan, consumed by verify. */
  pendingSubscriptionPlan: null as {
    planId: string;
    cycle: "monthly" | "yearly";
  } | null,
  mockOtp: MOCK_OTP,
  /** Timestamp (ms) when the simulated admin review approves the KYC. */
  kycApprovalAt: null as number | null,
};

export function readMockSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MOCK_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function writeMockSession(user: User | null): void {
  if (typeof window === "undefined") return;
  if (user === null) {
    window.localStorage.removeItem(MOCK_SESSION_KEY);
    return;
  }
  window.localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
}

export function resetMockDb(): void {
  mockDb.seller = DEMO_SELLER;
  mockDb.store = DEMO_STORE;
  mockDb.kyc = DEMO_KYC;
  mockDb.products = [...DEMO_PRODUCTS];
  mockDb.categories = [...DEMO_CATEGORIES];
  mockDb.subscription = null;
  mockDb.takenSlugs = [...TAKEN_SLUGS];
  mockDb.pendingRegistration = null;
  mockDb.kycApprovalAt = null;
}
