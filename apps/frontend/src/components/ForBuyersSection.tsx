"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const buyerPerks = [
  {
    title: "AR product views",
    body: "See exactly how products look before you buy with 360° rotation and AR preview — in your browser.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Verified sellers only",
    body: "Every store on Hustlr is verified. Shop with confidence — your purchase is always protected.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2l3 4h5l-3 4 2 5-4-2-4 2 2-5-3-4h5l3-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Size guides & variants",
    body: "Colour, size, material — every variant is clearly listed. No guessing, no surprises on delivery.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="8" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M6 8V6M10 8V5M14 8V6M18 8V5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Instant tracking",
    body: "Real-time order tracking from dispatch to your door. Know exactly where your package is, always.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 12h18M12 3c-5 4-5 14 0 18M12 3c5 4 5 14 0 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
    ),
  },
];

export default function ForBuyersSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRef.current,
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: textRef.current, start: "top 78%" },
        }
      );
      gsap.fromTo(
        imagesRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: imagesRef.current, start: "top 78%" },
        }
      );

      const perks = sectionRef.current?.querySelectorAll(".perk-card");
      if (perks) {
        gsap.fromTo(
          perks,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: perks[0], start: "top 82%" },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="for-buyers"
      className="section section--offwhite"
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
          {/* Left: copy */}
          <div ref={textRef}>
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              For buyers
            </span>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4vw, 3.125rem)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "var(--ink-900)",
                marginTop: "1rem",
                marginBottom: "1.25rem",
                lineHeight: 1.1,
              }}
            >
              Shop local sellers.
              <br />
              <span style={{ color: "var(--lime-600)" }}>
                Delivered to you.
              </span>
            </h2>
            <p
              style={{
                fontSize: "1.0625rem",
                color: "var(--text-secondary)",
                lineHeight: 1.65,
                marginBottom: "2.5rem",
                maxWidth: "42ch",
              }}
            >
              Discover independent stores across fashion, cosmetics,
              electronics, and more. Real products from real people — with
              buyer protection on every order.
            </p>

            {/* Perks grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              {buyerPerks.map((p) => (
                <div
                  key={p.title}
                  className="perk-card"
                  style={{
                    padding: "1.375rem",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--ink-0)",
                    border: "1px solid var(--ink-200)",
                    transition: "transform 0.25s var(--ease-out-expo), box-shadow 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform =
                      "translateY(-4px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow =
                      "0 12px 32px rgba(0,0,0,0.07)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform =
                      "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      color: "var(--lime-600)",
                      marginBottom: "0.875rem",
                    }}
                  >
                    {p.icon}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "var(--ink-900)",
                      marginBottom: "0.375rem",
                    }}
                  >
                    {p.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.55,
                    }}
                  >
                    {p.body}
                  </div>
                </div>
              ))}
            </div>

            <a
              href="/shop"
              className="btn btn-secondary btn-lg"
              style={{ marginTop: "2.25rem", display: "inline-flex" }}
            >
              Explore stores
            </a>
          </div>

          {/* Right: image collage */}
          <div
            ref={imagesRef}
            style={{ position: "relative", display: "grid", gap: "1rem" }}
          >
            {/* Top image */}
            <div
              style={{
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                aspectRatio: "4/3",
                position: "relative",
              }}
            >
              <Image
                src="/assets/cart-shopper.jpg"
                alt="A buyer browsing products in a cart"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Bottom image */}
            <div
              style={{
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                aspectRatio: "16/7",
                position: "relative",
              }}
            >
              <Image
                src="/assets/merchant-meeting.jpg"
                alt="Merchants in a business meeting"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Lime gradient overlay */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(45deg, color-mix(in oklch, var(--lime-400) 20%, transparent), transparent 60%)",
                }}
              />
            </div>

            {/* Floating badge */}
            <div
              style={{
                position: "absolute",
                top: "1.5rem",
                left: "-1.25rem",
                backgroundColor: "var(--ink-900)",
                borderRadius: "var(--radius-lg)",
                padding: "0.875rem 1.25rem",
                boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: "var(--lime-400)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 8l4 4 8-8" stroke="#171613" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink-0)" }}>
                  Order protected
                </div>
                <div style={{ fontSize: "0.7rem", color: "color-mix(in oklch, var(--ink-0) 55%, transparent)" }}>
                  Buyer guarantee active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #for-buyers .container-wide > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
