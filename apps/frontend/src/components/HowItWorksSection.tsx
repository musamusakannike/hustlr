"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: "01",
    title: "Create your store",
    body: "Sign up in seconds and customise your storefront — name, branding, and product categories. No code required.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="4" y="7" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M10 7V5a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M14 13v4M12 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: "02",
    title: "List your products",
    body: "Upload photos, add sizes, set prices, and go live. Buyers get 360° AR product views right in their browser.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="15" y="4" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="4" y="15" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="15" y="15" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    num: "03",
    title: "Accept orders & get paid",
    body: "Orders come in, you fulfil them. Payments land in your account. Track everything from a clean dashboard.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="3" y="9" width="22" height="15" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M3 14h22" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M8 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M7 5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading reveal
      gsap.fromTo(
        headRef.current,
        { y: 48, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headRef.current,
            start: "top 82%",
          },
        }
      );

      // Cards stagger
      const cards = cardsRef.current?.querySelectorAll(".how-card");
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 56, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.15,
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 78%",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="section"
      style={{ backgroundColor: "var(--ink-0)" }}
    >
      <div className="container-wide">
        {/* Header */}
        <div
          ref={headRef}
          style={{
            textAlign: "center",
            maxWidth: "600px",
            marginInline: "auto",
            marginBottom: "clamp(3rem, 6vw, 5rem)",
          }}
        >
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            How it works
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
            Selling online
            <br />
            <span style={{ color: "var(--lime-600)" }}>was never this easy.</span>
          </h2>
          <p
            style={{
              marginTop: "1.25rem",
              fontSize: "1.0625rem",
              color: "var(--text-secondary)",
              lineHeight: 1.65,
            }}
          >
            Three steps from sign-up to your first sale. No technical knowledge
            needed.
          </p>
        </div>

        {/* Cards */}
        <div
          ref={cardsRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="how-card"
              style={{
                position: "relative",
                padding: "2.25rem",
                borderRadius: "var(--radius-xl)",
                backgroundColor: i === 1 ? "var(--ink-900)" : "var(--ink-100)",
                color: i === 1 ? "var(--ink-0)" : "var(--ink-900)",
                overflow: "hidden",
                transition: "transform 0.3s var(--ease-out-expo), box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(-6px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  i === 1
                    ? "0 24px 60px rgba(0,0,0,0.35)"
                    : "0 24px 48px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              {/* Large step number in bg */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: "-1rem",
                  right: "1.5rem",
                  fontFamily: "var(--font-display)",
                  fontSize: "7rem",
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                  color:
                    i === 1
                      ? "color-mix(in oklch, var(--ink-0) 6%, transparent)"
                      : "color-mix(in oklch, var(--ink-900) 5%, transparent)",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {step.num}
              </div>

              {/* Icon */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "52px",
                  height: "52px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor:
                    i === 1
                      ? "color-mix(in oklch, var(--lime-400) 15%, transparent)"
                      : "var(--ink-0)",
                  color: i === 1 ? "var(--lime-400)" : "var(--ink-900)",
                  marginBottom: "1.5rem",
                }}
              >
                {step.icon}
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                  marginBottom: "0.75rem",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9375rem",
                  lineHeight: 1.65,
                  color:
                    i === 1
                      ? "color-mix(in oklch, var(--ink-0) 65%, transparent)"
                      : "var(--text-secondary)",
                }}
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
