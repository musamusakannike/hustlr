"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import { useSellerAuth } from "@/context/SellerAuthContext";
import type {
  SellerRegisterInput,
  SellerLoginInput,
  VerifyOtpInput,
  ResetPasswordInput,
} from "@/types/auth";

export function useRegister() {
  return useMutation({
    mutationFn: (input: SellerRegisterInput) => authService.register(input),
  });
}

export function useVerifyOtp() {
  const { setUser } = useSellerAuth();
  const router = useRouter();
  return useMutation({
    mutationFn: (input: VerifyOtpInput) => authService.verifyOtp(input),
    onSuccess: ({ user }) => {
      setUser(user);
      router.replace("/dashboard");
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: (email: string) => authService.resendOtp(email),
  });
}

export function useLogin() {
  const { setUser } = useSellerAuth();
  const router = useRouter();
  return useMutation({
    mutationFn: (input: SellerLoginInput) => authService.login(input),
    onSuccess: ({ user }) => {
      setUser(user);
      router.replace("/dashboard");
    },
  });
}

export function useGoogleAuth() {
  const { setUser } = useSellerAuth();
  const router = useRouter();
  return useMutation({
    mutationFn: () => authService.google({ idToken: "mock-google-id-token" }),
    onSuccess: ({ user }) => {
      setUser(user);
      router.replace("/dashboard");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword({ email }),
  });
}

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => authService.resetPassword(input),
    onSuccess: () => router.replace("/login"),
  });
}

export function useLogout() {
  const { logout } = useSellerAuth();
  const router = useRouter();
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => router.replace("/login"),
  });
}
