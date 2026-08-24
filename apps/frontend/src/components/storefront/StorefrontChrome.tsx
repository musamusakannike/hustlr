"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import type { StorefrontInfo } from "@/types/storefront";
import { storeHref } from "@/lib/store-path";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { useCartCount } from "@/hooks/useStorefront";

export function StorefrontHeader({ info }: { info: StorefrontInfo }) {
  const { slug, isAuthenticated } = useBuyerAuth();
  const { data: count } = useCartCount();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const href = (path: string) => storeHref(slug, path);
  const wa = info.socialLinks?.whatsappNumber;

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{ background: "var(--store-bg)", color: "var(--store-text)", borderColor: "color-mix(in srgb, var(--store-text) 10%, transparent)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
        <button className="lg:hidden p-2" aria-label="Menu" onClick={() => setOpen(true)}>
          <Menu className="w-5 h-5" />
        </button>
        <Link href={href("/")} className="flex items-center gap-2 min-w-0">
          {info.logo ? (
            <Image src={info.logo} alt="" width={36} height={36} className="rounded-lg object-cover" />
          ) : null}
          <span className="font-bold truncate">{info.name}</span>
        </Link>
        <form
          className="hidden sm:flex flex-1 max-w-md mx-auto relative"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = href(`/products?q=${encodeURIComponent(q)}`);
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            className="w-full pl-9 pr-3 py-2 rounded-full text-sm border bg-transparent"
            style={{ borderColor: "color-mix(in srgb, var(--store-text) 15%, transparent)" }}
          />
        </form>
        <div className="ml-auto flex items-center gap-1">
          {wa && (
            <a
              href={`https://wa.me/${wa.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline text-xs font-semibold px-3 py-2"
            >
              WhatsApp
            </a>
          )}
          <Link href={href(isAuthenticated ? "/account/wishlist" : "/auth/login")} className="p-2" aria-label="Wishlist">
            <Heart className="w-5 h-5" />
          </Link>
          <Link href={href(isAuthenticated ? "/cart" : "/auth/login")} className="p-2 relative" aria-label="Cart">
            <ShoppingBag className="w-5 h-5" />
            {(count?.count ?? 0) > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                style={{ background: "var(--store-primary)" }}
              >
                {count?.count}
              </span>
            )}
          </Link>
          <Link href={href(isAuthenticated ? "/account" : "/auth/login")} className="hidden sm:inline text-sm font-semibold px-2">
            {isAuthenticated ? "Account" : "Sign in"}
          </Link>
        </div>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
          <aside
            className="absolute left-0 top-0 h-full w-72 p-5 flex flex-col gap-4"
            style={{ background: "var(--store-bg)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="self-end p-2" onClick={() => setOpen(false)} aria-label="Close">
              <X className="w-5 h-5" />
            </button>
            <Link href={href("/")} onClick={() => setOpen(false)}>Home</Link>
            <Link href={href("/products")} onClick={() => setOpen(false)}>Shop</Link>
            <Link href={href("/cart")} onClick={() => setOpen(false)}>Cart</Link>
            <Link href={href("/account")} onClick={() => setOpen(false)}>Account</Link>
          </aside>
        </div>
      )}
    </header>
  );
}

export function StorefrontFooter({ info }: { info: StorefrontInfo }) {
  const { slug } = useBuyerAuth();
  const href = (path: string) => storeHref(slug, path);
  return (
    <footer
      className="mt-auto border-t py-10 px-4 sm:px-6"
      style={{ borderColor: "color-mix(in srgb, var(--store-text) 10%, transparent)" }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div className="col-span-2 md:col-span-1">
          <p className="font-bold">{info.name}</p>
          <p className="opacity-70 mt-2 text-xs leading-relaxed line-clamp-4">{info.description}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href={href("/products")}>Shop</Link>
          <Link href={href("/shipping")}>Shipping</Link>
          <Link href={href("/returns")}>Returns</Link>
        </div>
        <div className="flex flex-col gap-2">
          <Link href={href("/terms")}>Terms</Link>
          <Link href={href("/privacy")}>Privacy</Link>
          <Link href={href("/account")}>My account</Link>
        </div>
        <div className="text-xs opacity-70">
          {info.contactEmail && <p>{info.contactEmail}</p>}
          {info.contactPhone && <p className="mt-1">{info.contactPhone}</p>}
        </div>
      </div>
    </footer>
  );
}
