"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const lastScroll = useRef(0);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Reveal on load
    gsap.fromTo(
      nav,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.3 }
    );

    // Hide/show on scroll
    const handleScroll = () => {
      const current = window.scrollY;
      if (current <= 60) {
        nav.style.transform = "translateY(0)";
        nav.style.backgroundColor =
          current < 10
            ? "transparent"
            : "color-mix(in oklch, #ffffff 85%, transparent)";
        nav.style.backdropFilter = current < 10 ? "none" : "blur(20px)";
        nav.style.borderBottomColor =
          current < 10 ? "transparent" : "#e6e5e2";
      } else if (current > lastScroll.current) {
        nav.style.transform = "translateY(-100%)";
      } else {
        nav.style.transform = "translateY(0)";
        nav.style.backgroundColor =
          "color-mix(in oklch, #ffffff 90%, transparent)";
        nav.style.backdropFilter = "blur(20px)";
        nav.style.borderBottomColor = "#e6e5e2";
      }
      lastScroll.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      id="nav"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: "transparent",
        borderBottom: "1px solid transparent",
        transition:
          "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div
        className="container-wide"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "68px",
        }}
      >
        {/* Wordmark */}
        <a
          href="/"
          id="nav-logo"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.375rem",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "var(--ink-900)",
          }}
        >
          Hustlr
          <span style={{ color: "var(--accent)" }}>.</span>
        </a>

        {/* Nav links */}
        <ul
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            listStyle: "none",
          }}
          className="nav-links"
        >
          {["For Sellers", "How It Works", "Features"].map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  color: "var(--ink-700)",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLAnchorElement).style.color =
                    "var(--ink-900)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLAnchorElement).style.color =
                    "var(--ink-700)";
                }}
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <a
            href="/login"
            id="nav-login"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "var(--ink-700)",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLAnchorElement).style.color = "var(--ink-900)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLAnchorElement).style.color = "var(--ink-700)";
            }}
          >
            Log in
          </a>
          <a
            href="/signup"
            id="nav-cta"
            className="btn btn-primary btn-sm"
          >
            Start selling
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none; }
        }
      `}</style>
    </nav>
  );
}
