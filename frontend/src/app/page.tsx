// import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Features from "@/components/Features";
import Ecosystem from "@/components/Ecosystem";
import WhoWeAre from "@/components/WhoWeAre";
import WhatWeDo from "@/components/WhatWeDo";
import StoreTemplates from "@/components/StoreTemplates";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-soft text-text">
      {/* <Navbar /> */}
      <Hero />
      <Marquee />
      <Features />
      <Ecosystem />
      <WhoWeAre />
      <WhatWeDo />
      <StoreTemplates />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
