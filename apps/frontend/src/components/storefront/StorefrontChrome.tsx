"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  ChevronDown,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaTwitter,
  FaWhatsapp,
  FaYoutube,
  FaGithub,
} from "react-icons/fa";
import type { StorefrontInfo } from "@/types/storefront";
import { storeHref } from "@/lib/store-path";
import { useOptionalBuyerAuth } from "@/context/BuyerAuthContext";
import { useCartCount } from "@/hooks/useStorefront";
import { resolveTheme } from "@/lib/storefront-theme";

export function StorefrontAnnouncementBar({ info }: { info: StorefrontInfo }) {
  const [visible, setVisible] = useState(true);
  const buyerAuth = useOptionalBuyerAuth();
  const slug = buyerAuth?.slug ?? info.slug;

  if (!visible) return null;

  return (
    <aside
      className="text-white text-xs sm:text-sm py-2 sm:py-2.5 px-4 relative flex items-center justify-center z-50 transition-colors"
      style={{ backgroundColor: "var(--store-primary, #000000)" }}
      aria-label="Announcement"
    >
      <p className="text-center font-normal">
        Sign up and get 20% off to your first order.{" "}
        <Link
          href={storeHref(slug, "/products")}
          className="underline font-medium hover:opacity-80 ml-1 transition-opacity"
        >
          Sign Up Now
        </Link>
      </p>
      <button
        onClick={() => setVisible(false)}
        aria-label="Close announcement"
        className="absolute right-4 sm:right-8 text-white hover:opacity-75 transition-opacity focus:outline-none p-1"
        type="button"
      >
        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </aside>
  );
}

export function StorefrontHeader({ info }: { info: StorefrontInfo }) {
  const buyerAuth = useOptionalBuyerAuth();
  const slug = buyerAuth?.slug ?? info.slug;
  const isAuthenticated = buyerAuth?.isAuthenticated ?? false;
  const { data: count } = useCartCount();
  const [q, setQ] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const href = (path: string) => storeHref(slug, path);

  const headerVariant = resolveTheme(info.themeSettings).headerVariant;
  const showTopbar = headerVariant === "topbar" || headerVariant === "market";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      window.location.href = href(`/products?q=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <>
      <StorefrontAnnouncementBar info={info} />
      <header
        className="border-b sticky top-0 z-40 bg-white transition-colors"
        style={{
          borderColor: "color-mix(in srgb, var(--store-text, #000000) 10%, transparent)",
        }}
      >
        {showTopbar && (
          <div
            className="hidden sm:flex items-center justify-between text-[11px] font-semibold px-4 sm:px-6 lg:px-8 py-2"
            style={{
              backgroundColor: "var(--store-primary, #000000)",
              color: "#FFFFFF",
            }}
          >
            <span>{info.contactPhone || "Welcome to our store"}</span>
            <span className="opacity-80">{info.contactEmail}</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4 sm:gap-8">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="lg:hidden text-black focus:outline-none p-1 hover:opacity-75 transition-opacity"
              type="button"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link
              href={href("/")}
              className="flex items-center gap-2.5 font-extrabold uppercase tracking-tighter text-xl sm:text-2xl md:text-3xl font-integral text-black"
            >
              {info.logo ? (
                <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={info.logo}
                    alt={info.name}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
              ) : null}
              <span className="truncate max-w-[200px] sm:max-w-xs">{info.name}</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm lg:text-base font-normal">
            {/* Shop with Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShopDropdownOpen(true)}
              onMouseLeave={() => setShopDropdownOpen(false)}
            >
              <button
                onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                className="flex items-center gap-1 hover:opacity-70 transition-opacity py-2 font-medium"
                type="button"
              >
                <span>Shop</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    shopDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {shopDropdownOpen && (
                <div className="absolute top-full left-0 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <Link
                    href={href("/products")}
                    className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 font-medium"
                    onClick={() => setShopDropdownOpen(false)}
                  >
                    All Products
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <span className="block px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Styles
                  </span>
                  <Link
                    href={href("/products?category=Casual")}
                    className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                    onClick={() => setShopDropdownOpen(false)}
                  >
                    Casual
                  </Link>
                  <Link
                    href={href("/products?category=Formal")}
                    className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                    onClick={() => setShopDropdownOpen(false)}
                  >
                    Formal
                  </Link>
                  <Link
                    href={href("/products?category=Party")}
                    className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                    onClick={() => setShopDropdownOpen(false)}
                  >
                    Party
                  </Link>
                  <Link
                    href={href("/products?category=Gym")}
                    className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                    onClick={() => setShopDropdownOpen(false)}
                  >
                    Gym
                  </Link>
                </div>
              )}
            </div>

            <Link
              href={href("/products?sale=true")}
              className="hover:opacity-70 transition-opacity font-medium"
            >
              On Sale
            </Link>
            <Link
              href={href("/#new-arrivals")}
              className="hover:opacity-70 transition-opacity font-medium"
            >
              New Arrivals
            </Link>
            <Link
              href={href("/#brands")}
              className="hover:opacity-70 transition-opacity font-medium"
            >
              Brands
            </Link>
          </nav>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-xl hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-[#F0F0F0] rounded-full py-2.5 pl-12 pr-4 text-sm text-gray-800 placeholder-gray-400 border-none outline-none transition-all focus:ring-2"
                style={{
                  color: "#000000",
                }}
                placeholder="Search for products..."
                type="search"
              />
            </form>
          </div>

          {/* User, Wishlist & Cart Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Search"
              className="sm:hidden text-black hover:opacity-70 p-1"
              type="button"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Wishlist Link */}
            <Link
              href={href(isAuthenticated ? "/account/wishlist" : "/auth/login")}
              className="p-1 text-black hover:opacity-70 transition-opacity relative"
              aria-label="Wishlist"
            >
              <Heart className="w-6 h-6 text-black" />
            </Link>

            {/* Cart Icon with Dynamic Badge */}
            <Link
              href={href(isAuthenticated ? "/cart" : "/auth/login")}
              aria-label="Shopping Cart"
              className="text-black hover:opacity-70 transition-opacity relative p-1"
            >
              <ShoppingBag className="w-6 h-6" />
              {(count?.count ?? 0) > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-in zoom-in duration-200"
                  style={{ backgroundColor: "var(--store-primary, #000000)" }}
                >
                  {count?.count}
                </span>
              )}
            </Link>

            {/* Profile / Account Icon */}
            <Link
              href={href(isAuthenticated ? "/account" : "/auth/login")}
              aria-label="Account profile"
              className="text-black hover:opacity-70 transition-opacity p-1"
            >
              <User className="w-6 h-6" />
            </Link>
          </div>
        </div>

        {/* Mobile Search Input Expanded */}
        {mobileSearchOpen && (
          <div className="sm:hidden px-4 pb-3 border-t border-gray-100 pt-2 animate-in fade-in duration-150">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-[#F0F0F0] rounded-full py-2 pl-10 pr-4 text-xs text-gray-800 placeholder-gray-400 border-none outline-none"
                placeholder="Search products..."
                type="search"
                autoFocus
              />
            </form>
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
          />

          {/* Slide-over Panel */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-left duration-250">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <Link
                  href={href("/")}
                  onClick={() => setOpen(false)}
                  className="font-extrabold text-2xl tracking-tighter uppercase font-integral text-black"
                >
                  {info.name}
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="p-1 text-gray-500 hover:text-black"
                  type="button"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="mt-6 flex flex-col space-y-4">
                <Link
                  href={href("/")}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-black hover:opacity-70 py-1"
                >
                  Home
                </Link>
                <Link
                  href={href("/products")}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-black hover:opacity-70 py-1"
                >
                  Shop All Products
                </Link>
                <div className="pl-4 border-l-2 border-gray-100 space-y-2">
                  <Link
                    href={href("/products?category=Casual")}
                    onClick={() => setOpen(false)}
                    className="block text-sm text-gray-600 hover:text-black"
                  >
                    Casual Style
                  </Link>
                  <Link
                    href={href("/products?category=Formal")}
                    onClick={() => setOpen(false)}
                    className="block text-sm text-gray-600 hover:text-black"
                  >
                    Formal Style
                  </Link>
                  <Link
                    href={href("/products?category=Party")}
                    onClick={() => setOpen(false)}
                    className="block text-sm text-gray-600 hover:text-black"
                  >
                    Party Style
                  </Link>
                  <Link
                    href={href("/products?category=Gym")}
                    onClick={() => setOpen(false)}
                    className="block text-sm text-gray-600 hover:text-black"
                  >
                    Gym Style
                  </Link>
                </div>
                <Link
                  href={href("/products?sale=true")}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-black hover:opacity-70 py-1"
                >
                  On Sale
                </Link>
                <Link
                  href={href("/#new-arrivals")}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-black hover:opacity-70 py-1"
                >
                  New Arrivals
                </Link>
                <Link
                  href={href("/#brands")}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-black hover:opacity-70 py-1"
                >
                  Brands
                </Link>
                <Link
                  href={href(isAuthenticated ? "/cart" : "/auth/login")}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-black hover:opacity-70 py-1 flex items-center justify-between"
                >
                  <span>My Cart</span>
                  {(count?.count ?? 0) > 0 && (
                    <span
                      className="text-white text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--store-primary, #000000)" }}
                    >
                      {count?.count}
                    </span>
                  )}
                </Link>
                <Link
                  href={href(isAuthenticated ? "/account" : "/auth/login")}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-black hover:opacity-70 py-1 flex items-center justify-between"
                >
                  <span>{isAuthenticated ? "My Account" : "Sign In / Register"}</span>
                  <User className="w-5 h-5 opacity-60" />
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-gray-100 text-xs text-gray-400">
              <p>{info.name} © {new Date().getFullYear()}. All rights reserved.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function StorefrontLeftRail({ info }: { info: StorefrontInfo }) {
  const buyerAuth = useOptionalBuyerAuth();
  const slug = buyerAuth?.slug ?? info.slug;
  const href = (path: string) => storeHref(slug, path);
  return (
    <aside
      className="hidden lg:flex w-56 shrink-0 flex-col gap-3 border-r px-5 py-8 sticky top-20 h-[calc(100vh-5rem)] bg-white"
      style={{ borderColor: "color-mix(in srgb, var(--store-text, #000000) 10%, transparent)" }}
    >
      <p className="text-[11px] font-bold uppercase tracking-widest opacity-50">Shop</p>
      <Link href={href("/")} className="text-sm font-semibold hover:opacity-70">
        Home
      </Link>
      <Link href={href("/products")} className="text-sm font-semibold hover:opacity-70">
        Collections
      </Link>
      <Link href={href("/shipping")} className="text-sm font-semibold hover:opacity-70">
        Shipping
      </Link>
      <Link href={href("/returns")} className="text-sm font-semibold hover:opacity-70">
        Returns
      </Link>
    </aside>
  );
}

export function StorefrontFooter({ info }: { info: StorefrontInfo }) {
  const buyerAuth = useOptionalBuyerAuth();
  const slug = buyerAuth?.slug ?? info.slug;
  const isAuthenticated = buyerAuth?.isAuthenticated ?? false;
  const href = (path: string) => storeHref(slug, path);
  const social = info.socialLinks || {};
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <div className="relative mt-24 sm:mt-32">
      {/* Floating ShopCo Newsletter Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mb-20 sm:-mb-24">
        <div
          className="rounded-[24px] sm:rounded-[32px] px-6 py-8 sm:px-12 sm:py-10 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl transition-colors"
          style={{ backgroundColor: "var(--store-primary, #000000)" }}
        >
          <h2 className="font-integral text-2xl sm:text-3xl lg:text-[40px] text-white font-extrabold uppercase max-w-lg leading-tight text-center lg:text-left tracking-tight">
            STAY UPTO DATE ABOUT OUR LATEST OFFERS
          </h2>

          <div className="w-full lg:w-88 flex flex-col gap-3">
            {subscribed ? (
              <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-200 text-sm px-5 py-3 rounded-full text-center">
                ✓ Thank you for subscribing to our newsletter!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                <div className="relative w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white rounded-full py-3 pl-12 pr-4 text-sm text-black placeholder-gray-400 outline-none border-none focus:ring-2 focus:ring-gray-300"
                    placeholder="Enter your email address"
                    type="email"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 px-6 rounded-full text-sm transition-colors shadow-sm cursor-pointer"
                >
                  Subscribe to Newsletter
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main ShopCo Footer */}
      <footer className="bg-[#F0F0F0] pt-32 sm:pt-36 pb-12 relative z-10 text-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 pb-12 border-b border-gray-200">
            {/* Col 1: ShopCo Branding & Socials */}
            <div className="col-span-2 md:col-span-4 pr-0 md:pr-8">
              <Link
                href={href("/")}
                className="text-3xl font-integral tracking-tighter font-extrabold text-black uppercase"
              >
                {info.name}
              </Link>
              <p className="mt-4 text-sm text-gray-500 leading-relaxed font-normal">
                {info.description ||
                  "We have clothes that suits your style and which you're proud to wear. From women to men."}
              </p>

              {/* Social links */}
              <div className="mt-6 flex items-center space-x-3">
                {social.twitter ? (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black hover:opacity-80 transition-opacity"
                  >
                    <FaTwitter className="w-3.5 h-3.5 fill-current" />
                  </a>
                ) : (
                  <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black">
                    <FaTwitter className="w-3.5 h-3.5 fill-current" />
                  </span>
                )}

                {social.facebook ? (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: "var(--store-primary, #000000)" }}
                  >
                    <FaFacebookF className="w-3.5 h-3.5 fill-current" />
                  </a>
                ) : (
                  <span
                    className="w-8 h-8 rounded-full text-white flex items-center justify-center"
                    style={{ backgroundColor: "var(--store-primary, #000000)" }}
                  >
                    <FaFacebookF className="w-3.5 h-3.5 fill-current" />
                  </span>
                )}

                {social.instagram ? (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black hover:opacity-80 transition-opacity"
                  >
                    <FaInstagram className="w-3.5 h-3.5 fill-current" />
                  </a>
                ) : (
                  <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black">
                    <FaInstagram className="w-3.5 h-3.5 fill-current" />
                  </span>
                )}

                {social.whatsappNumber ? (
                  <a
                    href={`https://wa.me/${social.whatsappNumber.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <FaWhatsapp className="w-3.5 h-3.5 fill-current" />
                  </a>
                ) : (
                  <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black">
                    <FaGithub className="w-3.5 h-3.5 fill-current" />
                  </span>
                )}
              </div>
            </div>

            {/* Col 2: Company */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-sm font-bold tracking-widest text-black uppercase mb-4">
                COMPANY
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-500 font-normal">
                <li>
                  <Link className="hover:text-black transition-colors" href={href("/products")}>
                    About
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-black transition-colors" href={href("/products")}>
                    Features
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-black transition-colors" href={href("/products")}>
                    Works
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-black transition-colors" href={href("/products")}>
                    Career
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Help */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-sm font-bold tracking-widest text-black uppercase mb-4">
                HELP
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-500 font-normal">
                <li>
                  <Link className="hover:text-black transition-colors" href={href("/shipping")}>
                    Customer Support
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-black transition-colors" href={href("/shipping")}>
                    Delivery Details
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-black transition-colors" href={href("/terms")}>
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-black transition-colors" href={href("/privacy")}>
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: FAQ */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-sm font-bold tracking-widest text-black uppercase mb-4">
                FAQ
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-500 font-normal">
                <li>
                  <Link className="hover:text-black transition-colors" href={href(isAuthenticated ? "/account" : "/auth/login")}>
                    Account
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-black transition-colors" href={href("/shipping")}>
                    Manage Deliveries
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-black transition-colors" href={href(isAuthenticated ? "/cart" : "/auth/login")}>
                    Orders
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-black transition-colors" href={href(isAuthenticated ? "/cart" : "/auth/login")}>
                    Payments
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 5: Resources */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-sm font-bold tracking-widest text-black uppercase mb-4">
                RESOURCES
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-500 font-normal">
                <li>
                  <Link className="hover:text-black transition-colors" href={href("/products")}>
                    Free eBooks
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-black transition-colors" href={href("/products")}>
                    Development Tutorial
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-black transition-colors" href={href("/products")}>
                    How to - Blog
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-black transition-colors" href={href("/products")}>
                    Youtube Playlist
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer Subbar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>{info.name} © 2000-{new Date().getFullYear()}, All Rights Reserved</p>
            <div className="flex items-center space-x-2">
              {/* Visa */}
              <span className="bg-white px-2.5 py-1 rounded shadow-xs border border-gray-200 text-blue-800 font-bold italic tracking-tighter text-xs">
                VISA
              </span>
              {/* Mastercard */}
              <span className="bg-white px-2 py-1 rounded shadow-xs border border-gray-200 flex items-center justify-center">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 inline-block -mr-1.5 opacity-90"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block opacity-90"></span>
              </span>
              {/* PayPal */}
              <span className="bg-white px-2.5 py-1 rounded shadow-xs border border-gray-200 text-blue-600 font-bold italic text-xs">
                PayPal
              </span>
              {/* Apple Pay */}
              <span className="bg-white px-2 py-1 rounded shadow-xs border border-gray-200 text-black font-semibold text-xs flex items-center gap-0.5">
                <span></span>Pay
              </span>
              {/* Google Pay */}
              <span className="bg-white px-2 py-1 rounded shadow-xs border border-gray-200 text-gray-700 font-medium text-xs">
                G Pay
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
