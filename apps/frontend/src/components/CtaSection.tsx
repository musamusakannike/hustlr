"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        innerRef.current?.children ?? [],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: innerRef.current, start: "top 78%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="section section--lime"
      style={{ textAlign: "center", position: "relative", overflow: "hidden" }}
    >
      {/* Large decorative text */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(6rem, 20vw, 18rem)",
          fontWeight: 800,
          letterSpacing: "-0.05em",
          color: "color-mix(in oklch, var(--lime-500) 60%, transparent)",
          pointerEvents: "none",
          userSelect: "none",
          lineHeight: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        Hustlr
      </div>

      <div
        ref={innerRef}
        className="container-wide"
        style={{ position: "relative", zIndex: 1 }}
      >
        <span className="eyebrow" style={{ color: "var(--lime-700)" }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "var(--ink-900)",
              display: "inline-block",
            }}
          />
          Ready to hustle?
        </span>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            fontWeight: 800,
            letterSpacing: "-0.045em",
            color: "var(--ink-900)",
            lineHeight: 1.05,
            marginTop: "1.25rem",
            maxWidth: "16ch",
            marginInline: "auto",
          }}
        >
          Your first sale is closer than you think.
        </h2>

        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "1.125rem",
            color: "var(--ink-800)",
            lineHeight: 1.6,
            maxWidth: "48ch",
            marginInline: "auto",
          }}
        >
          Join 10,000+ sellers who chose Hustlr to power their business. Free
          to start, scales as you grow.
        </p>

        <div
          style={{
            marginTop: "2.5rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          <a
            href="/signup"
            className="btn btn-secondary btn-lg"
            id="cta-primary"
          >
            Open your store — it&apos;s free
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a href="/demo" className="btn btn-ghost btn-lg" id="cta-secondary">
            Watch a demo
          </a>
        </div>

        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "0.8125rem",
            color: "var(--ink-700)",
          }}
        >
          No credit card required &bull; Set up in under 5 minutes
        </p>
      </div>
    </section>
  );
}
