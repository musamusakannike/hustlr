"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaTwitter,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import type { StorefrontInfo } from "@/types/storefront";
import { storeHref } from "@/lib/store-path";
import { useOptionalBuyerAuth } from "@/context/BuyerAuthContext";
import { useCartCount } from "@/hooks/useStorefront";
import { resolveTheme } from "@/lib/storefront-theme";

export function StorefrontHeader({ info }: { info: StorefrontInfo }) {
  const buyerAuth = useOptionalBuyerAuth();
  const slug = buyerAuth?.slug ?? info.slug;
  const isAuthenticated = buyerAuth?.isAuthenticated ?? false;
  const { data: count } = useCartCount();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const href = (path: string) => storeHref(slug, path);
  const wa = info.socialLinks?.whatsappNumber;
  const headerVariant = resolveTheme(info.themeSettings).headerVariant;
  const showTopbar = headerVariant === "topbar" || headerVariant === "market";
  const isCentered = headerVariant === "centered";

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors"
      style={{
        backgroundColor: "color-mix(in srgb, var(--store-bg, #FFFFFF) 92%, transparent)",
        color: "var(--store-text, #0A0E11)",
        borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)",
      }}
    >
      {showTopbar && (
        <div
          className="hidden sm:flex items-center justify-between text-[11px] font-semibold px-4 sm:px-6 lg:px-8 py-2"
          style={{
            backgroundColor: headerVariant === "market" ? "var(--store-secondary)" : "var(--store-accent)",
            color: headerVariant === "market" ? "var(--store-bg)" : "var(--store-text)",
          }}
        >
          <span>{info.contactPhone || "Welcome to our store"}</span>
          <span className="opacity-80">{info.contactEmail}</span>
        </div>
      )}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isCentered ? "py-4 flex flex-col items-center gap-3" : "h-18 sm:h-20 flex items-center justify-between gap-4"}`}>
        {/* Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="lg:hidden p-2 -ml-2 rounded-xl text-[var(--store-text,#0A0E11)] hover:bg-black/5"
            aria-label="Menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href={href("/")} className="flex items-center gap-3 min-w-0 group">
            {info.logo ? (
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-xs border shrink-0"
                style={{ borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 12%, transparent)" }}
              >
                <Image
                  src={info.logo}
                  alt={info.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ) : null}
            <span className="font-extrabold text-lg sm:text-xl tracking-tight truncate font-space-grotesk group-hover:opacity-85">
              {info.name}
            </span>
          </Link>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className={`hidden lg:flex items-center gap-8 text-sm font-semibold ${isCentered ? "order-last" : ""}`}>
          <Link
            href={href("/")}
            className="transition-colors hover:text-[var(--store-primary,#E05315)]"
          >
            Home
          </Link>
          <Link
            href={href("/products")}
            className="transition-colors hover:text-[var(--store-primary,#E05315)]"
          >
            Collections
          </Link>
          <Link
            href={href("/#how-it-works")}
            className="transition-colors hover:text-[var(--store-primary,#E05315)]"
          >
            How It Works
          </Link>
          <Link
            href={href("/shipping")}
            className="transition-colors hover:text-[var(--store-primary,#E05315)] opacity-80"
          >
            Shipping & FAQ
          </Link>
        </nav>

        {/* Search Bar (Tablet/Desktop) */}
        <form
          className="hidden md:flex flex-1 max-w-xs relative"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = href(`/products?q=${encodeURIComponent(q)}`);
          }}
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 rounded-full text-xs sm:text-sm border bg-white/50 focus:bg-white focus:outline-none transition-all shadow-2xs"
            style={{
              borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 15%, transparent)",
              color: "var(--store-text, #0A0E11)",
            }}
          />
        </form>

        {/* Actions (Wishlist, Cart, Account, WhatsApp) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {wa && (
            <a
              href={`https://wa.me/${wa.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full text-white shadow-xs transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#25D366" }}
            >
              <FaWhatsapp className="w-3.5 h-3.5" />
              Chat
            </a>
          )}

          <Link
            href={href(isAuthenticated ? "/account/wishlist" : "/auth/login")}
            className="p-2.5 rounded-full hover:bg-black/5 transition-colors relative"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5 text-[var(--store-text,#0A0E11)]" />
          </Link>

          <Link
            href={href(isAuthenticated ? "/cart" : "/auth/login")}
            className="p-2.5 rounded-full hover:bg-black/5 transition-colors relative"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5 text-[var(--store-text,#0A0E11)]" />
            {(count?.count ?? 0) > 0 && (
              <span
                className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-xs animate-in zoom-in"
                style={{ backgroundColor: "var(--store-primary, #E05315)" }}
              >
                {count?.count}
              </span>
            )}
          </Link>

          <Link
            href={href(isAuthenticated ? "/account" : "/auth/login")}
            className="hidden sm:inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border transition-all hover:bg-black/5"
            style={{
              borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 20%, transparent)",
              color: "var(--store-text, #0A0E11)",
            }}
          >
            <User className="w-3.5 h-3.5" />
            {isAuthenticated ? "My Account" : "Sign in"}
          </Link>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
          onClick={() => setOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 h-full w-80 max-w-[85vw] p-6 flex flex-col gap-6 shadow-2xl overflow-y-auto"
            style={{
              backgroundColor: "var(--store-bg, #FFFFFF)",
              color: "var(--store-text, #0A0E11)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b">
              <span className="font-extrabold text-lg truncate font-space-grotesk">
                {info.name}
              </span>
              <button
                className="p-2 rounded-lg hover:bg-black/5"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-3 font-semibold text-base">
              <Link
                href={href("/")}
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-black/5"
              >
                Home
              </Link>
              <Link
                href={href("/products")}
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-black/5"
              >
                All Collections
              </Link>
              <Link
                href={href("/#how-it-works")}
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-black/5"
              >
                How It Works
              </Link>
              <Link
                href={href("/shipping")}
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-black/5"
              >
                Shipping Policy
              </Link>
              <Link
                href={href("/returns")}
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-black/5"
              >
                Returns & Refunds
              </Link>
              <Link
                href={href(isAuthenticated ? "/account" : "/auth/login")}
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-black/5 flex items-center justify-between"
              >
                <span>{isAuthenticated ? "My Account" : "Sign In / Register"}</span>
                <User className="w-4 h-4 opacity-60" />
              </Link>
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
}

export function StorefrontLeftRail({ info }: { info: StorefrontInfo }) {
  const buyerAuth = useOptionalBuyerAuth();
  const slug = buyerAuth?.slug ?? info.slug;
  const href = (path: string) => storeHref(slug, path);
  return (
    <aside
      className="hidden lg:flex w-56 shrink-0 flex-col gap-3 border-r px-5 py-8 sticky top-20 h-[calc(100vh-5rem)]"
      style={{ borderColor: "color-mix(in srgb, var(--store-text) 10%, transparent)" }}
    >
      <p className="text-[11px] font-bold uppercase tracking-widest opacity-50">Shop</p>
      <Link href={href("/")} className="text-sm font-semibold hover:text-[var(--store-primary)]">
        Home
      </Link>
      <Link href={href("/products")} className="text-sm font-semibold hover:text-[var(--store-primary)]">
        Collections
      </Link>
      <Link href={href("/shipping")} className="text-sm font-semibold hover:text-[var(--store-primary)]">
        Shipping
      </Link>
      <Link href={href("/returns")} className="text-sm font-semibold hover:text-[var(--store-primary)]">
        Returns
      </Link>
    </aside>
  );
}

export function StorefrontFooter({ info }: { info: StorefrontInfo }) {
  const buyerAuth = useOptionalBuyerAuth();
  const slug = buyerAuth?.slug ?? info.slug;
  const href = (path: string) => storeHref(slug, path);
  const social = info.socialLinks || {};
  const footerVariant = resolveTheme(info.themeSettings).footerVariant;
  const isDark = footerVariant === "dark";
  const isSimple = footerVariant === "simple";

  return (
    <footer
      className="mt-auto border-t transition-colors"
      style={{
        backgroundColor: isDark
          ? "var(--store-secondary)"
          : "color-mix(in srgb, var(--store-bg, #FFFFFF) 94%, var(--store-text, #0A0E11) 3%)",
        color: isDark ? "var(--store-bg)" : "var(--store-text, #0A0E11)",
        borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className={`grid grid-cols-1 ${isSimple ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-5"} gap-10 lg:gap-12`}>
          {/* Brand Bio & Socials */}
          <div className="lg:col-span-2 flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              {info.logo && (
                <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                  <Image src={info.logo} alt="" fill className="object-cover" />
                </div>
              )}
              <span className="font-extrabold text-xl tracking-tight font-space-grotesk">
                {info.name}
              </span>
            </div>

            <p className="text-sm text-[var(--store-text,#0A0E11)] opacity-70 leading-relaxed max-w-sm">
              {info.description ||
                "Your trusted destination for curated goods, verified merchants, and guaranteed escrow protection."}
            </p>

            {/* Escrow badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Escrow Protected Store
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-3 text-[var(--store-text,#0A0E11)] opacity-80">
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center hover:bg-[var(--store-primary,#E05315)] hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <FaInstagram className="w-4 h-4" />
                </a>
              )}
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center hover:bg-[var(--store-primary,#E05315)] hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <FaFacebookF className="w-3.5 h-3.5" />
                </a>
              )}
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center hover:bg-[var(--store-primary,#E05315)] hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <FaTwitter className="w-3.5 h-3.5" />
                </a>
              )}
              {social.tiktok && (
                <a
                  href={social.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center hover:bg-[var(--store-primary,#E05315)] hover:text-white transition-colors"
                  aria-label="TikTok"
                >
                  <FaTiktok className="w-3.5 h-3.5" />
                </a>
              )}
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center hover:bg-[var(--store-primary,#E05315)] hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <FaYoutube className="w-4 h-4" />
                </a>
              )}
              {social.whatsappNumber && (
                <a
                  href={`https://wa.me/${social.whatsappNumber.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3 text-sm">
            <p className="font-bold text-xs uppercase tracking-widest text-[var(--store-text,#0A0E11)] opacity-50 mb-1">
              Shop & Explore
            </p>
            <Link
              href={href("/products")}
              className="text-[var(--store-text,#0A0E11)] opacity-75 hover:opacity-100 hover:text-[var(--store-primary,#E05315)]"
            >
              All Collections
            </Link>
            <Link
              href={href("/#how-it-works")}
              className="text-[var(--store-text,#0A0E11)] opacity-75 hover:opacity-100 hover:text-[var(--store-primary,#E05315)]"
            >
              How It Works
            </Link>
            <Link
              href={href("/cart")}
              className="text-[var(--store-text,#0A0E11)] opacity-75 hover:opacity-100 hover:text-[var(--store-primary,#E05315)]"
            >
              Shopping Cart
            </Link>
            <Link
              href={href("/account/wishlist")}
              className="text-[var(--store-text,#0A0E11)] opacity-75 hover:opacity-100 hover:text-[var(--store-primary,#E05315)]"
            >
              Wishlist
            </Link>
          </div>

          {/* Policies & Care */}
          <div className="flex flex-col gap-3 text-sm">
            <p className="font-bold text-xs uppercase tracking-widest text-[var(--store-text,#0A0E11)] opacity-50 mb-1">
              Customer Care
            </p>
            <Link
              href={href("/shipping")}
              className="text-[var(--store-text,#0A0E11)] opacity-75 hover:opacity-100 hover:text-[var(--store-primary,#E05315)]"
            >
              Shipping Policy
            </Link>
            <Link
              href={href("/returns")}
              className="text-[var(--store-text,#0A0E11)] opacity-75 hover:opacity-100 hover:text-[var(--store-primary,#E05315)]"
            >
              Returns & Refunds
            </Link>
            <Link
              href={href("/terms")}
              className="text-[var(--store-text,#0A0E11)] opacity-75 hover:opacity-100 hover:text-[var(--store-primary,#E05315)]"
            >
              Terms of Service
            </Link>
            <Link
              href={href("/privacy")}
              className="text-[var(--store-text,#0A0E11)] opacity-75 hover:opacity-100 hover:text-[var(--store-primary,#E05315)]"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-3 text-sm">
            <p className="font-bold text-xs uppercase tracking-widest text-[var(--store-text,#0A0E11)] opacity-50 mb-1">
              Contact & Store
            </p>
            {info.contactEmail && (
              <p className="text-xs text-[var(--store-text,#0A0E11)] opacity-75 break-all">
                {info.contactEmail}
              </p>
            )}
            {info.contactPhone && (
              <p className="text-xs text-[var(--store-text,#0A0E11)] opacity-75">
                {info.contactPhone}
              </p>
            )}
            {info.address && (
              <p className="text-xs text-[var(--store-text,#0A0E11)] opacity-60 leading-relaxed">
                {info.address}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--store-text,#0A0E11)] opacity-60"
          style={{ borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 8%, transparent)" }}
        >
          <p>© {new Date().getFullYear()} {info.name}. All rights reserved.</p>
          <p>Powered by Hustlr • Secure Escrow Commerce</p>
        </div>
      </div>
    </footer>
  );
}
