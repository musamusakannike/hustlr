"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FiCheck } from "react-icons/fi";
import AuthLayout from "@/components/auth/AuthLayout";

export default function PasswordChangedSuccessPage() {
  const router = useRouter();

  return (
    <AuthLayout
      backUrl="/auth/login"
      bannerTitle="Your account is fully secured."
      bannerSubtitle="You can now log in with your updated credentials and manage your store."
      bannerQuote="“Quick and smooth. Hustlr makes managing an online store feel effortless.”"
    >
      <div className="flex flex-col items-center text-center py-6 space-y-6 animate-[fade-in_0.4s_ease-out]">
        {/* Animated Checkmark Circle */}
        <div className="relative flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-primary-light/60 flex items-center justify-center animate-pulse">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/25 transition-transform hover:scale-105">
              <FiCheck className="w-10 h-10 stroke-[3.5]" />
            </div>
          </div>
        </div>

        {/* Text Section */}
        <div className="space-y-2 max-w-xs mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold font-archivo tracking-tight text-[#0A0E11]">
            Password Changed
          </h1>
          <p className="text-sm text-neutral-500 font-normal leading-relaxed">
            Your password has been changed successfully. Login with your new
            password to continue.
          </p>
        </div>

        {/* Action Button */}
        <div className="w-full pt-4">
          <button
            type="button"
            onClick={() => router.replace("/auth/login")}
            className="w-full h-13.5 rounded-full bg-primary hover:bg-[#660817] text-white font-bold text-sm sm:text-base flex items-center justify-center transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            Login
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
