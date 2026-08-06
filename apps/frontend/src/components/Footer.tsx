"use client";

const footerLinks = {
  Product: ["For Sellers", "For Buyers", "Pricing", "Features", "Changelog"],
  Company: ["About", "Blog", "Careers", "Press"],
  Support: ["Help Center", "Contact", "Privacy Policy", "Terms of Service"],
};

export default function Footer() {
  return (
    <footer
      id="footer"
      style={{
        backgroundColor: "var(--ink-900)",
        color: "var(--ink-0)",
        paddingTop: "clamp(4rem, 8vw, 6rem)",
        paddingBottom: "clamp(2rem, 4vw, 3rem)",
      }}
    >
      <div className="container-wide">
        {/* Top row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "3rem",
            paddingBottom: "3rem",
            borderBottom:
              "1px solid color-mix(in oklch, var(--ink-0) 10%, transparent)",
          }}
        >
          {/* Brand col */}
          <div>
            <a
              href="/"
              id="footer-logo"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                display: "inline-block",
                marginBottom: "1rem",
              }}
            >
              Hustlr
              <span style={{ color: "var(--lime-400)" }}>.</span>
            </a>
            <p
              style={{
                fontSize: "0.9rem",
                color: "color-mix(in oklch, var(--ink-0) 55%, transparent)",
                lineHeight: 1.65,
                maxWidth: "32ch",
              }}
            >
              The commerce platform built for independent sellers. Launch your
              store, grow your hustle.
            </p>

            {/* App store badges placeholder */}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.75rem" }}>
              {["App Store", "Google Play"].map((store) => (
                <a
                  key={store}
                  href="#"
                  aria-label={`Download on ${store}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "var(--radius-sm)",
                    border:
                      "1px solid color-mix(in oklch, var(--ink-0) 18%, transparent)",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "color-mix(in oklch, var(--ink-0) 75%, transparent)",
                    transition: "border-color 0.2s ease, color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor =
                      "color-mix(in oklch, var(--ink-0) 40%, transparent)";
                    el.style.color = "var(--ink-0)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor =
                      "color-mix(in oklch, var(--ink-0) 18%, transparent)";
                    el.style.color =
                      "color-mix(in oklch, var(--ink-0) 75%, transparent)";
                  }}
                >
                  {store}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "color-mix(in oklch, var(--ink-0) 40%, transparent)",
                  marginBottom: "1.25rem",
                }}
              >
                {heading}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      style={{
                        fontSize: "0.9rem",
                        color: "color-mix(in oklch, var(--ink-0) 65%, transparent)",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLAnchorElement).style.color =
                          "var(--ink-0)";
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLAnchorElement).style.color =
                          "color-mix(in oklch, var(--ink-0) 65%, transparent)";
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            paddingTop: "1.75rem",
          }}
        >
          <p
            style={{
              fontSize: "0.8125rem",
              color: "color-mix(in oklch, var(--ink-0) 38%, transparent)",
            }}
          >
            © {new Date().getFullYear()} Hustlr Technologies Ltd. All rights
            reserved.
          </p>

          {/* Social links */}
          <div style={{ display: "flex", gap: "1.25rem" }}>
            {["Twitter", "Instagram", "LinkedIn"].map((social) => (
              <a
                key={social}
                href="#"
                aria-label={`Hustlr on ${social}`}
                style={{
                  fontSize: "0.8125rem",
                  color: "color-mix(in oklch, var(--ink-0) 45%, transparent)",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLAnchorElement).style.color = "var(--lime-400)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLAnchorElement).style.color =
                    "color-mix(in oklch, var(--ink-0) 45%, transparent)";
                }}
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #footer .container-wide > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 500px) {
          #footer .container-wide > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
