"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M11 2L13.5 8H20L14.5 12L16.5 18L11 14.5L5.5 18L7.5 12L2 8H8.5L11 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Instant PWA storefront",
    body: "Your store goes live as a mobile-first Progressive Web App buyers can install on their phone — zero app store friction.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <rect x="2" y="5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M2 9h18" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M6 14h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: "Fast, secure checkout",
    body: "One-tap checkout with local payment methods. Funds hit your balance the same day, no delays.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M3 3h2l2.5 10h9L19 7H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="19" r="1.25" stroke="currentColor" strokeWidth="1.6"/>
        <circle cx="17" cy="19" r="1.25" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
    ),
    title: "Order management",
    body: "Track every order, update status, and communicate with buyers from a single, beautiful dashboard.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M11 3C6.58 3 3 6.58 3 11s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M11 7v4l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Real-time analytics",
    body: "See what's selling, where buyers come from, and how your revenue grows — updated the moment it happens.",
  },
];

export default function ForSellersSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const featsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Text block slides in from left
      gsap.fromTo(
        textRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: textRef.current, start: "top 78%" },
        }
      );
      // Image slides in from right
      gsap.fromTo(
        imgRef.current,
        { x: 60, opacity: 0, scale: 0.96 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.95,
          ease: "power3.out",
          scrollTrigger: { trigger: imgRef.current, start: "top 78%" },
        }
      );
      // Feature pills stagger
      const feats = featsRef.current?.querySelectorAll(".feat-item");
      if (feats) {
        gsap.fromTo(
          feats,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: featsRef.current, start: "top 80%" },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="for-sellers"
      className="section section--dark"
    >
      <div className="container-wide">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(3rem, 6vw, 6rem)",
            alignItems: "center",
          }}
        >
          {/* Left: image */}
          <div ref={imgRef} style={{ position: "relative" }}>
            <div
              style={{
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                position: "relative",
                aspectRatio: "4/5",
              }}
            >
              <Image
                src="/assets/flower-seller.jpg"
                alt="A seller arranging flowers in their shop"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Lime tint overlay */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(135deg, color-mix(in oklch, var(--lime-400) 12%, transparent), transparent 70%)",
                }}
              />
            </div>

            {/* Floating stat card */}
            <div
              style={{
                position: "absolute",
                bottom: "1.75rem",
                right: "-1.5rem",
                backgroundColor: "var(--lime-400)",
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem 1.5rem",
                boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: "var(--ink-900)",
                  lineHeight: 1,
                }}
              >
                ₦2B+
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: "var(--ink-800)",
                  marginTop: "0.35rem",
                }}
              >
                Paid to sellers
              </div>
            </div>
          </div>

          {/* Right: copy */}
          <div ref={textRef}>
            <span className="eyebrow eyebrow--dark">
              <span className="eyebrow-dot eyebrow-dot--dark" />
              For sellers
            </span>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4vw, 3.125rem)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "var(--ink-0)",
                marginTop: "1rem",
                marginBottom: "1.25rem",
                lineHeight: 1.1,
              }}
            >
              Everything you need
              <br />
              to{" "}
              <span style={{ color: "var(--lime-400)" }}>
                sell at full speed.
              </span>
            </h2>

            <p
              style={{
                fontSize: "1.0625rem",
                color: "color-mix(in oklch, var(--ink-0) 62%, transparent)",
                lineHeight: 1.65,
                marginBottom: "2.5rem",
                maxWidth: "42ch",
              }}
            >
              From listing your first product to managing hundreds of orders —
              Hustlr has the tools built for the way independent sellers
              actually work.
            </p>

            {/* Feature list */}
            <div
              ref={featsRef}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {features.map((f) => (
                <div
                  key={f.title}
                  className="feat-item"
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                    padding: "1.125rem 1.375rem",
                    borderRadius: "var(--radius-md)",
                    backgroundColor:
                      "color-mix(in oklch, var(--ink-0) 5%, transparent)",
                    border:
                      "1px solid color-mix(in oklch, var(--ink-0) 8%, transparent)",
                    transition: "background-color 0.2s ease, border-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.backgroundColor =
                      "color-mix(in oklch, var(--lime-400) 8%, transparent)";
                    el.style.borderColor =
                      "color-mix(in oklch, var(--lime-400) 25%, transparent)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.backgroundColor =
                      "color-mix(in oklch, var(--ink-0) 5%, transparent)";
                    el.style.borderColor =
                      "color-mix(in oklch, var(--ink-0) 8%, transparent)";
                  }}
                >
                  <div
                    style={{
                      color: "var(--lime-400)",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.9375rem",
                        fontWeight: 600,
                        color: "var(--ink-0)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {f.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color:
                          "color-mix(in oklch, var(--ink-0) 55%, transparent)",
                        lineHeight: 1.55,
                      }}
                    >
                      {f.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="/signup"
              className="btn btn-primary btn-lg"
              style={{ marginTop: "2.5rem", display: "inline-flex" }}
            >
              Open your store
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #for-sellers .container-wide > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
