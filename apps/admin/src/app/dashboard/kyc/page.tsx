"use client";

import React, { useEffect, useState } from "react";
import {
  IdCard,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Filter,
  Loader2,
} from "lucide-react";
import { adminKycService, type KycRecord } from "@/lib/api";

export default function KycPage() {
  const [kycs, setKycs] = useState<KycRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await adminKycService.list();
        if (mounted && res?.kycs) {
          setKycs(res.kycs);
        }
      } catch {
        // Fallback demo data
        if (mounted) {
          setKycs([
            {
              _id: "kyc_01",
              sellerId: "usr_01",
              status: "pending",
              idType: "National Identity Number (NIN)",
              idNumber: "12345678901",
              idDocumentUrl: "#",
              businessRegistrationUrl: "#",
              proofOfAddressUrl: "#",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              seller: {
                _id: "usr_01",
                name: "Ibrahim Adeleke",
                email: "ibrahim@adelekestore.ng",
              },
            },
            {
              _id: "kyc_02",
              sellerId: "usr_02",
              status: "approved",
              idType: "CAC Business Registration",
              idNumber: "RC-998214",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              updatedAt: new Date().toISOString(),
              seller: {
                _id: "usr_02",
                name: "Amara Nwachukwu",
                email: "amara@luxuryltd.com",
              },
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
            KYC & Merchant Verification
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Review government identification, CAC business documents, and proof
            of address.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by merchant name or ID..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 outline-none text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
              <tr>
                <th className="px-6 py-4">Merchant</th>
                <th className="px-6 py-4">Document Type</th>
                <th className="px-6 py-4">ID / Reg Number</th>
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
                    <p className="mt-2 text-xs">Loading KYC submissions...</p>
                  </td>
                </tr>
              ) : kycs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No KYC submissions found.
                  </td>
                </tr>
              ) : (
                kycs.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div>{item.seller?.name || "Merchant"}</div>
                      <div className="text-[11px] text-gray-400 font-normal">
                        {item.seller?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {item.idType || "Identity Document"}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {item.idNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                          item.status === "approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : item.status === "rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          title="Inspect Documents"
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {item.status === "pending" && (
                          <>
                            <button
                              title="Approve"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              title="Reject"
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
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
