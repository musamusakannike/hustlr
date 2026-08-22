import { apiClient } from "./api.client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "seller" | "buyer" | "admin";
  isVerified?: boolean;
  avatar?: string;
  referralCode?: string;
  storeId?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  tempUserId: string;
  requiresOtp: boolean;
  email: string;
  storeId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const authService = {
  // --- Seller Authentication ---
  async registerSeller(input: {
    name: string;
    email: string;
    password: string;
    referralCode?: string;
  }): Promise<RegisterResponse> {
    const res = await apiClient.post<ApiResponse<RegisterResponse>>(
      "/auth/seller/register",
      input
    );
    return res.data.data;
  },

  async verifySellerOtp(email: string, otp: string): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/seller/verify-otp",
      { email, otp }
    );
    if (res.data.data.token && typeof window !== "undefined") {
      localStorage.setItem("hustlr_token", res.data.data.token);
      localStorage.setItem("hustlr_user", JSON.stringify(res.data.data.user));
    }
    return res.data.data;
  },

  async resendSellerOtp(email: string): Promise<{ email: string }> {
    const res = await apiClient.post<ApiResponse<{ email: string }>>(
      "/auth/seller/resend-otp",
      { email }
    );
    return res.data.data;
  },

  async loginSeller(email: string, password: string): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/seller/login",
      { email, password }
    );
    if (res.data.data.token && typeof window !== "undefined") {
      localStorage.setItem("hustlr_token", res.data.data.token);
      localStorage.setItem("hustlr_user", JSON.stringify(res.data.data.user));
    }
    return res.data.data;
  },

  async googleSeller(
    idToken: string,
    referralCode?: string
  ): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/seller/google",
      { idToken, referralCode }
    );
    if (res.data.data.token && typeof window !== "undefined") {
      localStorage.setItem("hustlr_token", res.data.data.token);
      localStorage.setItem("hustlr_user", JSON.stringify(res.data.data.user));
    }
    return res.data.data;
  },

  async forgotSellerPassword(email: string): Promise<{ email: string }> {
    const res = await apiClient.post<ApiResponse<{ email: string }>>(
      "/auth/seller/forgot-password",
      { email }
    );
    return res.data.data;
  },

  async resetSellerPassword(
    email: string,
    otp: string,
    password: string
  ): Promise<{ email: string }> {
    const res = await apiClient.post<ApiResponse<{ email: string }>>(
      "/auth/seller/reset-password",
      { email, otp, password }
    );
    return res.data.data;
  },

  async logoutSeller(): Promise<void> {
    try {
      await apiClient.post("/auth/seller/logout");
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("hustlr_token");
        localStorage.removeItem("hustlr_user");
      }
    }
  },

  async getSellerMe(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>("/auth/seller/me");
    return res.data.data;
  },
};
