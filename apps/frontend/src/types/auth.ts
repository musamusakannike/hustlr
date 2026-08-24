export type UserRole = "seller" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  googleId?: string | null;
  avatar?: string | null;
  referralCode: string;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SellerRegisterInput {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface SellerLoginInput {
  email: string;
  password: string;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

export interface GoogleAuthInput {
  idToken: string;
  referralCode?: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
}

/** Response of register/resend-otp while OTP verification is pending. */
export interface RegisterPendingResponse {
  tempUserId: string;
  email: string;
  requiresOtp: true;
}

export interface AuthResponse {
  user: User;
  token?: string;
}
