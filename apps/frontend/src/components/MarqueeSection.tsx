"use client";

const marqueeItems = [
  "10,000+ Sellers",
  "₦2 Billion GMV",
  "AR Product Views",
  "Same-Day Payouts",
  "Instant Storefronts",
  "Verified Sellers",
  "PWA-First",
  "Buyer Protection",
];

export default function MarqueeSection() {
  return (
    <div
      id="marquee"
      style={{
        backgroundColor: "var(--lime-400)",
        padding: "1.125rem 0",
        overflow: "hidden",
        position: "relative",
      }}
      aria-hidden="true"
    >
      <div
        className="marquee-track"
        style={{
          display: "flex",
          gap: "3rem",
          whiteSpace: "nowrap",
          animation: "marquee 28s linear infinite",
          width: "max-content",
        }}
      >
        {/* Duplicate for seamless loop */}
        {[...marqueeItems, ...marqueeItems, ...marqueeItems].map(
          (item, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "1rem",
                fontFamily: "var(--font-display)",
                fontSize: "0.875rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--ink-900)",
              }}
            >
              {item}
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "var(--lime-700)",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
            </span>
          )
        )}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
