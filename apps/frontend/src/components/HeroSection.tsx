"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // ── Three.js particles ──────────────────────────────────
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 2, 0.1, 100);
    camera.position.z = 5;

    // Particle geometry
    const count = 700;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 14;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.045,
      color: 0xcdf23f,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    let animId: number;
    let w = 0,
      h = 0;

    const resize = () => {
      const el = canvas.parentElement;
      if (!el) return;
      w = el.clientWidth;
      h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    let elapsed = 0;
    let lastTime = performance.now();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      elapsed += (now - lastTime) / 1000;
      lastTime = now;
      particles.rotation.y = elapsed * 0.03;
      particles.rotation.x = elapsed * 0.01;
      renderer.render(scene, camera);
    };
    animate();

    // ── GSAP entrance ──────────────────────────────────────
    const tl = gsap.timeline({ delay: 0.15 });
    tl.fromTo(
      badgeRef.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
    )
      .fromTo(
        headlineRef.current,
        { y: 56, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" },
        "-=0.45"
      )
      .fromTo(
        subRef.current,
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, ease: "power3.out" },
        "-=0.55"
      )
      .fromTo(
        ctaRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: "power3.out" },
        "-=0.45"
      );

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      ro.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "var(--ink-900)",
      }}
    >
      {/* Three.js canvas */}
      <canvas
        ref={canvasRef}
        id="three-canvas"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Content grid */}
      <div
        className="container-wide"
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: "4rem",
          paddingTop: "clamp(7rem, 14vh, 11rem)",
          paddingBottom: "clamp(4rem, 8vh, 6rem)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left: copy */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Badge */}
          <div ref={badgeRef} style={{ opacity: 0 }}>
            <span
              id="hero-badge"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.375rem 1rem",
                borderRadius: "var(--radius-full)",
                backgroundColor: "color-mix(in oklch, var(--lime-400) 15%, transparent)",
                border: "1px solid color-mix(in oklch, var(--lime-400) 35%, transparent)",
                fontFamily: "var(--font-body)",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--lime-400)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "var(--lime-400)",
                  display: "inline-block",
                }}
              />
              The future of commerce
            </span>
          </div>

          {/* Headline */}
          <h1
            ref={headlineRef}
            id="hero-headline"
            style={{
              opacity: 0,
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.75rem, 6vw, 5rem)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              color: "var(--ink-0)",
            }}
          >
            Your store.
            <br />
            Your rules.
            <br />
            <span
              style={{
                color: "var(--lime-400)",
                display: "inline-block",
              }}
            >
              Your hustle.
            </span>
          </h1>

          {/* Sub */}
          <p
            ref={subRef}
            id="hero-sub"
            style={{
              opacity: 0,
              fontFamily: "var(--font-body)",
              fontSize: "clamp(1rem, 1.75vw, 1.2rem)",
              fontWeight: 400,
              lineHeight: 1.65,
              color: "color-mix(in oklch, var(--ink-0) 65%, transparent)",
              maxWidth: "38ch",
            }}
          >
            Hustlr gives independent sellers a modern storefront — product
            listings, AR product views, seamless checkout, and buyer reviews —
            all in one place.
          </p>

          {/* CTAs */}
          <div
            ref={ctaRef}
            id="hero-ctas"
            style={{
              opacity: 0,
              display: "flex",
              flexWrap: "wrap",
              gap: "0.875rem",
              alignItems: "center",
            }}
          >
            <a
              href="/signup"
              className="btn btn-primary btn-lg"
              id="hero-primary-cta"
            >
              Start selling free
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
            <a
              href="#how-it-works"
              className="btn btn-ghost-light btn-lg"
              id="hero-secondary-cta"
            >
              See how it works
            </a>
          </div>

          {/* Social proof numbers */}
          <div
            style={{
              display: "flex",
              gap: "2.5rem",
              paddingTop: "1rem",
              borderTop:
                "1px solid color-mix(in oklch, var(--ink-0) 12%, transparent)",
            }}
          >
            {[
              { stat: "10k+", label: "Active sellers" },
              { stat: "₦2B+", label: "GMV processed" },
              { stat: "4.9★", label: "App rating" },
            ].map(({ stat, label }) => (
              <div key={label}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "var(--ink-0)",
                  }}
                >
                  {stat}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8rem",
                    color: "color-mix(in oklch, var(--ink-0) 50%, transparent)",
                    marginTop: "0.2rem",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: video */}
        <div
          id="hero-video-wrap"
          style={{
            position: "relative",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
            aspectRatio: "9 / 16",
            maxHeight: "78vh",
            boxShadow:
              "0 40px 80px color-mix(in oklch, var(--lime-400) 12%, transparent), 0 8px 32px rgba(0,0,0,0.5)",
            border:
              "1px solid color-mix(in oklch, var(--ink-0) 10%, transparent)",
          }}
        >
          {/* Lime glow overlay */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(160deg, color-mix(in oklch, var(--lime-400) 6%, transparent), transparent 60%)",
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
          <video
            ref={videoRef}
            id="hero-video"
            src="/assets/hero-loop.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "200px",
          background:
            "linear-gradient(to top, var(--ink-900), transparent)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          opacity: 0.6,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-0)",
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: "1px",
            height: "40px",
            background:
              "linear-gradient(to bottom, var(--ink-0), transparent)",
            animation: "scrollPulse 2s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.5; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.15); }
        }

        @media (max-width: 768px) {
          #hero > .container-wide {
            grid-template-columns: 1fr !important;
          }
          #hero-video-wrap {
            aspect-ratio: 16/9 !important;
            max-height: 280px !important;
            order: -1;
          }
        }
      `}</style>
    </section>
  );
}
