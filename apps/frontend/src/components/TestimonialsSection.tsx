"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote:
      "Since switching to Hustlr I doubled my monthly revenue. The storefront is beautiful and buyers trust it immediately.",
    name: "Adesola Adeyemi",
    role: "Fashion seller, Lagos",
    rating: 5,
    initials: "AA",
    color: "#cdf23f",
  },
  {
    quote:
      "I had my store live in 20 minutes. I'm not technical at all but Hustlr made it feel completely effortless.",
    name: "Emeka Okonkwo",
    role: "Electronics dealer, Abuja",
    rating: 5,
    initials: "EO",
    color: "#d4d2cd",
  },
  {
    quote:
      "As a buyer the AR product view is insane — I finally know exactly what I'm getting before it arrives. 10/10.",
    name: "Fatima Suleiman",
    role: "Buyer, Kano",
    rating: 5,
    initials: "FS",
    color: "#cdf23f",
  },
  {
    quote:
      "The checkout is lightning fast and my payment always comes the same day. I run three stores on Hustlr now.",
    name: "Chiamaka Nwosu",
    role: "Cosmetics seller, Port Harcourt",
    rating: 5,
    initials: "CN",
    color: "#d4d2cd",
  },
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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

      const cards = trackRef.current?.querySelectorAll(".t-card");
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: trackRef.current, start: "top 78%" },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="section"
      style={{ backgroundColor: "var(--ink-0)" }}
    >
      <div className="container-wide">
        {/* Header */}
        <div
          ref={headRef}
          style={{
            textAlign: "center",
            maxWidth: "540px",
            marginInline: "auto",
            marginBottom: "clamp(3rem, 6vw, 5rem)",
          }}
        >
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            What people say
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
            Real sellers.
            <br />
            <span style={{ color: "var(--lime-600)" }}>Real results.</span>
          </h2>
        </div>

        {/* Cards grid */}
        <div
          ref={trackRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="t-card"
              style={{
                padding: "2rem",
                borderRadius: "var(--radius-xl)",
                backgroundColor: i % 2 === 0 ? "var(--ink-900)" : "var(--ink-100)",
                color: i % 2 === 0 ? "var(--ink-0)" : "var(--ink-900)",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                transition: "transform 0.3s var(--ease-out-expo)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(-5px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(0)";
              }}
            >
              {/* Stars */}
              <div style={{ display: "flex", gap: "0.25rem" }}>
                {Array.from({ length: t.rating }).map((_, si) => (
                  <svg
                    key={si}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="var(--lime-400)"
                    aria-hidden="true"
                  >
                    <path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.5l-3.6 2 .7-4L2.2 5.7l4-.6L8 1.5z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.65,
                  color:
                    i % 2 === 0
                      ? "color-mix(in oklch, var(--ink-0) 80%, transparent)"
                      : "var(--text-secondary)",
                  flex: 1,
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div style={{ display: "flex", gap: "0.875rem", alignItems: "center" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: t.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    color: "var(--ink-900)",
                    flexShrink: 0,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: i % 2 === 0 ? "var(--ink-0)" : "var(--ink-900)",
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color:
                        i % 2 === 0
                          ? "color-mix(in oklch, var(--ink-0) 50%, transparent)"
                          : "var(--text-muted)",
                    }}
                  >
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
