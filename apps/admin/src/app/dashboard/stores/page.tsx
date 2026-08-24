"use client";

import React, { useEffect, useState } from "react";
import {
  Store,
  Globe,
  Search,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { adminStoresService, type AdminStoreItem } from "@/lib/api";

export default function StoresPage() {
  const [stores, setStores] = useState<AdminStoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await adminStoresService.list();
        if (mounted && res?.stores) {
          setStores(res.stores);
        }
      } catch {
        if (mounted) {
          setStores([]);
          setError("Failed to load stores. Please check your network connection.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.subdomain?.toLowerCase().includes(search.toLowerCase()) ||
      s.customDomain?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
            Storefront Management
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Oversee active merchant stores, custom domain routing, and store
            status.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-gray-200/70 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by store name or subdomain..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
              <tr>
                <th className="px-6 py-4">Store Name</th>
                <th className="px-6 py-4">Domains</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                    Loading merchant stores...
                  </td>
                </tr>
              ) : filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                    No merchant stores found.
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => (
                  <tr
                    key={store._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-primary-bg text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{store.name}</p>
                          <p className="text-gray-400 text-[11px]">
                            ID: {store._id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{store.subdomain}</span>
                      </div>
                      {store.customDomain && (
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {store.customDomain}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                          store.isLive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {store.isLive ? "Live / Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(store.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          title="Toggle Live State"
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700 transition-colors"
                        >
                          {store.isLive ? (
                            <ToggleRight className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <a
                          href={`https://${store.subdomain}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Visit Store"
                          className="p-1.5 rounded-lg bg-primary-bg text-primary hover:bg-primary-light transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
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
