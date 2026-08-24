"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, CreditCard, Gift, LifeBuoy, ShieldCheck, Store, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useSellerAuth } from "@/context/SellerAuthContext";
import { useLogout } from "@/hooks/useAuth";
import { initialsOf } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard/setup", label: "Store profile", icon: Store },
  { href: "/dashboard/kyc", label: "KYC & payout bank", icon: ShieldCheck },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/referrals", label: "Referrals", icon: Gift },
  { href: "/dashboard/support", label: "Help & support", icon: LifeBuoy },
];

export default function SettingsPage() {
  const { user } = useSellerAuth();
  const logout = useLogout();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted mt-0.5">Account and store shortcuts.</p>
      </div>

      <Card className="p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
          {user ? initialsOf(user.name) : <User className="w-6 h-6" />}
        </div>
        <div className="min-w-0">
          <p className="font-bold truncate">{user?.name}</p>
          <p className="text-sm text-muted truncate">{user?.email}</p>
          {user?.referralCode && (
            <p className="text-xs font-mono text-muted mt-1">Code {user.referralCode}</p>
          )}
        </div>
      </Card>

      <ul className="flex flex-col gap-2">
        {LINKS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 hover:border-primary/40"
            >
              <item.icon className="w-5 h-5 text-primary" />
              <span className="flex-1 font-semibold text-sm">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-muted" />
            </Link>
          </li>
        ))}
      </ul>

      <Button variant="danger" onClick={() => logout.mutate()}>
        Log out
      </Button>
    </div>
  );
}
