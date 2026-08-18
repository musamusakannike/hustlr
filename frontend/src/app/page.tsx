// import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Features from "@/components/Features";
import WhoWeAre from "@/components/WhoWeAre";
import WhatWeDo from "@/components/WhatWeDo";
import StoreTemplates from "@/components/StoreTemplates";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#EFEFEF] text-[#0A0E11]">
      {/* <Navbar /> */}
      <Hero />
      <Marquee />
      <Features />
      <WhoWeAre />
      <WhatWeDo />
      <StoreTemplates />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
