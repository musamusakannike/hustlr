"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Package,
  MapPin,
  Edit2,
  Loader2,
  X,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { adminOrdersService, type AdminOrderListItem, type AdminOrderDetail, type ShippingAddress } from "@/lib/api";
import ConfirmDialog, { type ConfirmDialogConfig } from "@/components/ConfirmDialog";

const PAYMENT_STATUS_BADGES: Record<string, { label: string; classes: string }> = {
  paid: { label: "Paid", classes: "bg-emerald-50 text-emerald-700" },
  pending: { label: "Pending Payment", classes: "bg-amber-50 text-amber-700" },
  failed: { label: "Failed", classes: "bg-rose-50 text-rose-700" },
  refunded: { label: "Refunded", classes: "bg-purple-50 text-purple-700" },
  partially_refunded: { label: "Partial Refund", classes: "bg-purple-50 text-purple-700" },
};

const DELIVERY_STATUS_BADGES: Record<string, { label: string; classes: string }> = {
  processing: { label: "Processing", classes: "bg-blue-50 text-blue-700" },
  shipped: { label: "Dispatched", classes: "bg-indigo-50 text-indigo-700" },
  in_transit: { label: "In Transit", classes: "bg-sky-50 text-sky-700" },
  delivered: { label: "Delivered", classes: "bg-amber-50 text-amber-700" },
  confirmed: { label: "Confirmed / Completed", classes: "bg-emerald-50 text-emerald-700" },
  disputed: { label: "Disputed", classes: "bg-rose-50 text-rose-700" },
  refunded: { label: "Returned & Refunded", classes: "bg-gray-100 text-gray-600" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("All");
  const [deliveryStatus, setDeliveryStatus] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddress, setEditAddress] = useState<ShippingAddress>({
    fullName: "",
    streetAddress: "",
    city: "",
    state: "",
    country: "Nigeria",
    phoneNumber: "",
  });

  const [dialog, setDialog] = useState<ConfirmDialogConfig | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const limit = 20;

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminOrdersService.list({
        search: search.trim() || undefined,
        paymentStatus: paymentStatus !== "All" ? paymentStatus : undefined,
        deliveryStatus: deliveryStatus !== "All" ? deliveryStatus : undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        limit,
      });
      setOrders(res.orders || []);
      setTotal(res.total || 0);
    } catch {
      setOrders([]);
      setTotal(0);
      setError("Failed to load orders. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, [page, paymentStatus, deliveryStatus, from, to]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void loadOrders();
  };

  const openOrderDetail = async (orderId: string) => {
    setDetailLoading(true);
    try {
      const res = await adminOrdersService.getById(orderId);
      if (res?.order) {
        setSelectedOrder(res.order);
        setEditAddress(res.order.shippingAddress || {
          fullName: "",
          streetAddress: "",
          city: "",
          state: "",
          country: "Nigeria",
          phoneNumber: "",
        });
      }
    } catch {
      flash("Failed to load order details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!selectedOrder) return;
    try {
      await adminOrdersService.updateAddress(selectedOrder._id, editAddress);
      setSelectedOrder((prev) => (prev ? { ...prev, shippingAddress: editAddress } : prev));
      setIsEditingAddress(false);
      flash("Shipping address updated.");
      await loadOrders();
    } catch {
      flash("Failed to update address.");
    }
  };

  const handleConfirmOrder = (orderId: string) => {
    setDialog({
      title: "Confirm Order Fulfillment?",
      message: "This marks the order as confirmed and releases escrow funds into the merchant's withdrawable wallet.",
      variant: "success",
      confirmLabel: "Confirm Order",
      onConfirm: async () => {
        setDialog(null);
        try {
          await adminOrdersService.confirm(orderId);
          flash("Order confirmed and escrow unlocked.");
          setSelectedOrder(null);
          await loadOrders();
        } catch {
          flash("Failed to confirm order.");
        }
      },
    });
  };

  const handleCancelOrder = (orderId: string) => {
    setDialog({
      title: "Cancel Order & Refund?",
      message: "Are you sure you want to cancel this order and refund payment to the customer?",
      variant: "danger",
      showInput: true,
      inputLabel: "Cancellation Reason",
      inputPlaceholder: "e.g. Unfulfillable item or customer request",
      inputRequired: true,
      confirmLabel: "Cancel & Refund",
      onConfirm: async (reason) => {
        setDialog(null);
        try {
          await adminOrdersService.cancel(orderId, reason);
          flash("Order cancelled and refunded.");
          setSelectedOrder(null);
          await loadOrders();
        } catch {
          flash("Failed to cancel order.");
        }
      },
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Merchant Orders & Escrow
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Supervise platform order lifecycles, shipping status milestones, and escrow hold releases.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-white border border-gray-200 px-4 py-2.5 pr-8 rounded-full text-xs font-bold text-slate-800 outline-none focus:border-primary cursor-pointer shadow-xs"
            >
              <option value="All">Payment: All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={deliveryStatus}
              onChange={(e) => {
                setDeliveryStatus(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-white border border-gray-200 px-4 py-2.5 pr-8 rounded-full text-xs font-bold text-slate-800 outline-none focus:border-primary cursor-pointer shadow-xs"
            >
              <option value="All">Delivery: All</option>
              <option value="processing">Processing</option>
              <option value="shipped">Dispatched</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="confirmed">Confirmed</option>
              <option value="disputed">Disputed</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search order #, customer, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 rounded-full text-xs font-medium text-slate-800 placeholder-gray-400 shadow-xs outline-none focus:border-primary transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
              <tr>
                <th className="px-6 py-4">Order #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Fulfillment</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    <p className="mt-2">Loading marketplace orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const payBadge = PAYMENT_STATUS_BADGES[ord.paymentStatus] || { label: ord.paymentStatus, classes: "bg-gray-100 text-gray-600" };
                  const delivBadge = DELIVERY_STATUS_BADGES[ord.deliveryStatus] || { label: ord.deliveryStatus, classes: "bg-gray-100 text-gray-600" };
                  const buyerName = typeof ord.buyerProfileId === "object" ? ord.buyerProfileId?.name : ord.shippingAddress?.fullName || "Buyer";

                  return (
                    <tr key={ord._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        {ord.orderNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{buyerName}</div>
                        <div className="text-[11px] text-gray-400">{ord.shippingAddress?.city}, {ord.shippingAddress?.state}</div>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">
                        ₦{ord.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${payBadge.classes}`}>
                          {payBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${delivBadge.classes}`}>
                          {delivBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(ord.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openOrderDetail(ord._id)}
                          className="px-3.5 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pager */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 text-xs">
            <span className="text-gray-500">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-full border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 font-bold text-slate-700">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-full border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl overflow-y-auto border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">Order #{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-gray-400">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs sm:text-sm">
              {/* Top Banner Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Amount</span>
                  <span className="font-extrabold text-slate-900 text-base">₦{selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Payment Status</span>
                  <span className="font-bold text-emerald-700 capitalize">{selectedOrder.paymentStatus}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Fulfillment</span>
                  <span className="font-bold text-indigo-700 capitalize">{selectedOrder.deliveryStatus}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Escrow Hold</span>
                  <span className="font-bold text-amber-700 capitalize">{selectedOrder.escrowStatus || "Locked"}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Ordered Items</h4>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-gray-50/40">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-gray-400 shrink-0">
                          {item.image ? (
                            <Image src={item.image} alt={item.title} width={40} height={40} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{item.title}</p>
                          <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 text-xs">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    Delivery Destination
                  </h4>
                  <button
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    {isEditingAddress ? "Cancel" : "Edit Address"}
                  </button>
                </div>

                {isEditingAddress ? (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                    <input
                      type="text"
                      value={editAddress.fullName}
                      onChange={(e) => setEditAddress({ ...editAddress, fullName: e.target.value })}
                      placeholder="Full Name"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      value={editAddress.streetAddress}
                      onChange={(e) => setEditAddress({ ...editAddress, streetAddress: e.target.value })}
                      placeholder="Street Address"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editAddress.city}
                        onChange={(e) => setEditAddress({ ...editAddress, city: e.target.value })}
                        placeholder="City"
                        className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs"
                      />
                      <input
                        type="text"
                        value={editAddress.state}
                        onChange={(e) => setEditAddress({ ...editAddress, state: e.target.value })}
                        placeholder="State"
                        className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                    <button
                      onClick={handleSaveAddress}
                      className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold"
                    >
                      Save Destination
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1">
                    <p className="font-bold text-slate-800">{selectedOrder.shippingAddress?.fullName}</p>
                    <p className="text-gray-600">{selectedOrder.shippingAddress?.streetAddress}</p>
                    <p className="text-gray-600">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                    <p className="text-gray-400">{selectedOrder.shippingAddress?.phoneNumber}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleCancelOrder(selectedOrder._id)}
                  className="px-4 py-2 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold"
                >
                  Cancel & Refund
                </button>
                <button
                  onClick={() => handleConfirmOrder(selectedOrder._id)}
                  className="px-5 py-2 rounded-full bg-primary text-white hover:bg-primary-hover text-xs font-bold shadow-xs"
                >
                  Confirm Fulfillment & Release Escrow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog & Toast */}
      <ConfirmDialog config={dialog} onClose={() => setDialog(null)} />
      {toast && (
        <div className="fixed bottom-5 right-5 z-[110] bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl animate-in fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
