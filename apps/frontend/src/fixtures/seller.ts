import type { User } from "@/types/auth";

export const DEMO_SELLER: User = {
  id: "seller_0001",
  name: "Musa Abdullahi",
  email: "demo@hustlr.shop",
  role: "seller",
  isVerified: true,
  googleId: null,
  avatar: null,
  referralCode: "MUSA2026",
  banned: false,
  createdAt: "2026-07-02T10:00:00.000Z",
  updatedAt: "2026-08-10T10:00:00.000Z",
};

/** Mock OTP used by the mock transport for every OTP flow. */
export const MOCK_OTP = "123456";
