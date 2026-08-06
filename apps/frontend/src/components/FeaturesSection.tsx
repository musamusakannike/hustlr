"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    id: "f1",
    tag: "Storefront",
    title: "A storefront that sells for you — even while you sleep.",
    body: "Your PWA store loads instantly on any device, accepts orders 24/7, and gives buyers a premium shopping experience they'll come back for.",
    accent: "var(--lime-400)",
    bg: "var(--ink-900)",
    textColor: "var(--ink-0)",
  },
  {
    id: "f2",
    tag: "Products",
    title: "List, manage, and showcase your products beautifully.",
    body: "360° product rotation, variant selectors, sale tags, and size guides — everything buyers need to make a confident purchase, right on your store.",
    accent: "var(--ink-900)",
    bg: "var(--lime-400)",
    textColor: "var(--ink-900)",
  },
  {
    id: "f3",
    tag: "Payments",
    title: "Get paid fast. No delays, no drama.",
    body: "Integrated local payment rails mean buyers can check out in seconds and you get paid same-day. Track every naira in your seller dashboard.",
    accent: "var(--lime-400)",
    bg: "var(--ink-900)",
    textColor: "var(--ink-0)",
  },
  {
    id: "f4",
    tag: "Analytics",
    title: "Know your numbers. Grow with confidence.",
    body: "Real-time revenue charts, bestseller rankings, traffic sources, and conversion data — built into every seller account at no extra cost.",
    accent: "var(--ink-900)",
    bg: "var(--lime-200)",
    textColor: "var(--ink-900)",
  },
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: headRef.current, start: "top 82%" },
        }
      );

      const cards = cardsRef.current?.querySelectorAll(".feat-card");
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.14,
            ease: "power3.out",
            scrollTrigger: { trigger: cardsRef.current, start: "top 76%" },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="section section--offwhite"
    >
      <div className="container-wide">
        {/* Header */}
        <div
          ref={headRef}
          style={{
            maxWidth: "600px",
            marginBottom: "clamp(3rem, 6vw, 5rem)",
          }}
        >
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Features
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--ink-900)",
              marginTop: "1rem",
              lineHeight: 1.1,
            }}
          >
            Built for the way
            <br />
            <span style={{ color: "var(--lime-700)" }}>
              modern sellers work.
            </span>
          </h2>
        </div>

        {/* Bento grid */}
        <div
          ref={cardsRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gridTemplateRows: "auto auto",
            gap: "1.25rem",
          }}
        >
          {features.map((f, i) => (
            <div
              key={f.id}
              id={f.id}
              className="feat-card"
              style={{
                backgroundColor: f.bg,
                color: f.textColor,
                borderRadius: "var(--radius-xl)",
                padding: "clamp(2rem, 4vw, 3rem)",
                position: "relative",
                overflow: "hidden",
                transition:
                  "transform 0.35s var(--ease-out-expo), box-shadow 0.35s ease",
                gridColumn: i === 0 ? "1 / 2" : i === 1 ? "2 / 3" : "auto",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(-6px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 28px 56px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              {/* Decorative number */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: "-1.5rem",
                  right: "1.5rem",
                  fontFamily: "var(--font-display)",
                  fontSize: "8rem",
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                  color:
                    f.bg === "var(--ink-900)"
                      ? "color-mix(in oklch, var(--ink-0) 5%, transparent)"
                      : "color-mix(in oklch, var(--ink-900) 6%, transparent)",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                0{i + 1}
              </div>

              <span
                style={{
                  display: "inline-block",
                  padding: "0.3rem 0.875rem",
                  borderRadius: "var(--radius-full)",
                  backgroundColor:
                    f.bg === "var(--ink-900)"
                      ? "color-mix(in oklch, var(--lime-400) 18%, transparent)"
                      : "color-mix(in oklch, var(--ink-900) 10%, transparent)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color:
                    f.bg === "var(--ink-900)"
                      ? "var(--lime-400)"
                      : "var(--ink-800)",
                  marginBottom: "1.5rem",
                }}
              >
                {f.tag}
              </span>

              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.25rem, 2.5vw, 1.625rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.2,
                  marginBottom: "1rem",
                  maxWidth: "28ch",
                }}
              >
                {f.title}
              </h3>

              <p
                style={{
                  fontSize: "0.9375rem",
                  lineHeight: 1.65,
                  color:
                    f.bg === "var(--ink-900)"
                      ? "color-mix(in oklch, var(--ink-0) 62%, transparent)"
                      : "var(--ink-800)",
                  maxWidth: "44ch",
                }}
              >
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          #features .container-wide > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
