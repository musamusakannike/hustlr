import { getTransport } from "@/lib/transport";
import { setAuthCookie } from "@/lib/auth-cookie";
import type { User } from "@/types/auth";

const transport = getTransport();

export type { User };

export interface AuthResponse {
  token?: string;
  user: User;
}

export interface RegisterResponse {
  tempUserId: string;
  requiresOtp: boolean;
  email: string;
  storeId?: string;
}

export const authService = {
  async registerSeller(input: {
    name: string;
    email: string;
    password: string;
    referralCode?: string;
  }): Promise<RegisterResponse> {
    const res = await transport.registerSeller(input);
    return { ...res, requiresOtp: true };
  },

  async verifySellerOtp(email: string, otp: string): Promise<AuthResponse> {
    return transport.verifySellerOtp({ email, otp });
  },

  async resendSellerOtp(email: string): Promise<{ email: string }> {
    const res = await transport.resendSellerOtp(email);
    return { email: res.email };
  },

  async loginSeller(email: string, password: string): Promise<AuthResponse> {
    return transport.loginSeller({ email, password });
  },

  async googleSeller(idToken: string, referralCode?: string): Promise<AuthResponse> {
    return transport.googleSeller({ idToken, referralCode });
  },

  async forgotSellerPassword(email: string): Promise<{ message: string }> {
    return transport.forgotSellerPassword({ email });
  },

  async resetSellerPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return transport.resetSellerPassword({ email, otp, newPassword });
  },

  async logoutSeller(): Promise<{ message: string }> {
    return transport.logoutSeller();
  },

  async getPostAuthRedirect(): Promise<string> {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("hustlr_token") || localStorage.getItem("token")
          : null;
      if (token) setAuthCookie(token);

      const [kyc, store] = await Promise.all([
        transport.getMyKyc().catch(() => null),
        transport.getStore().catch(() => null),
      ]);

      const isKycSubmittedOrApproved = Boolean(
        kyc &&
          (kyc.status === "approved" ||
            kyc.status === "pending" ||
            Boolean(kyc.submittedAt))
      );

      const isStoreConfigured = Boolean(
        store &&
          typeof store.name === "string" &&
          store.name.trim().length > 0 &&
          store.name.trim().toLowerCase() !== "my store"
      );

      if (isKycSubmittedOrApproved && isStoreConfigured) {
        return "/dashboard";
      }
      return "/onboarding";
    } catch {
      return "/onboarding";
    }
  },
};
