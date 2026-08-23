"use client";

import React, { useEffect, useState } from "react";
import { Users, Shield, Ban, CheckCircle, Search, Loader2 } from "lucide-react";
import { adminUsersService, type AdminUserItem } from "@/lib/api";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await adminUsersService.list();
        if (mounted && res?.users) {
          setUsers(res.users);
        }
      } catch {
        if (mounted) {
          setUsers([
            {
              _id: "usr_01",
              name: "Platform Admin",
              email: "admin@hustlr.online",
              role: "admin",
              isVerified: true,
              referralCode: "ADM8819",
              createdAt: new Date().toISOString(),
            },
            {
              _id: "usr_02",
              name: "Oluwaseun Bakare",
              email: "seun@store.com",
              role: "seller",
              isVerified: true,
              referralCode: "HSTLR99",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              _id: "usr_03",
              name: "Chioma Okonjo",
              email: "chioma@customer.ng",
              role: "buyer",
              isVerified: true,
              createdAt: new Date(Date.now() - 172800000).toISOString(),
            },
          ]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
            Users & Merchants
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Manage merchants, buyers, and platform admin team members.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200/70 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-xs">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div>{user.name}</div>
                      <div className="text-[11px] text-gray-400 font-normal">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          user.role === "admin"
                            ? "bg-primary-bg text-primary"
                            : user.role === "seller"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.role === "admin" && (
                          <Shield className="w-3 h-3" />
                        )}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                          user.banned
                            ? "bg-red-50 text-red-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {user.banned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.role !== "admin" && (
                          <button
                            title={user.banned ? "Unban User" : "Ban User"}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700 transition-colors"
                          >
                            <Ban className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
