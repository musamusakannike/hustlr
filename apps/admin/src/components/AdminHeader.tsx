"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Shield,
  CheckCheck,
} from "lucide-react";
import { authService, User } from "@/lib/api";

interface AdminHeaderProps {
  onMenuClick: () => void;
  pageTitle?: string;
}

export default function AdminHeader({
  onMenuClick,
  pageTitle,
}: AdminHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(() => authService.getUser());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [bellOpen, setBellOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Refresh user from local state/auth
    const stored = authService.getUser();
    if (stored) setUser(stored);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setBellOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-8 py-3 flex items-center justify-between gap-4 shadow-2xs">
      {/* Left side: Mobile menu toggle + Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 md:hidden transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        {pageTitle && (
          <h1 className="text-lg font-bold text-[#0A0E11] hidden md:block tracking-tight">
            {pageTitle}
          </h1>
        )}
      </div>

      {/* Center: Search Input Bar */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative flex items-center w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search stores, users, orders, tickets..."
            className="w-full pl-11 pr-4 py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm outline-none text-slate-800 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Right side: Notifications & Profile Pill */}
      <div className="flex items-center justify-end gap-3">
        {/* Notification Bell + Dropdown */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen((open) => !open)}
            className="relative w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200/60 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shrink-0"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[9px] font-bold leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-bold text-slate-800">Admin Alerts</p>
                {unreadCount > 0 && (
                  <button
                    onClick={() => setUnreadCount(0)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="mt-2 text-xs font-semibold text-gray-600">
                  No new alerts
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  New KYC submissions, disputes, and payouts will appear here in
                  real time.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 bg-gray-50/80 hover:bg-gray-100/80 border border-gray-200/60 px-2.5 py-1.5 rounded-2xl transition-all cursor-pointer select-none"
          >
            {/* Avatar Badge */}
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
            </div>

            {/* Name & Role */}
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                {user?.name || "Admin"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-2.5 h-2.5 text-primary" />
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                  Platform Admin
                </span>
              </div>
            </div>

            {/* Dropdown Chevron */}
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-0.5" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {user?.name || "Platform Admin"}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {user?.email || "admin@hustlr.online"}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
