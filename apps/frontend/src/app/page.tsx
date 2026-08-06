import LenisProvider from "@/components/LenisProvider";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarqueeSection from "@/components/MarqueeSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ForSellersSection from "@/components/ForSellersSection";
import ForBuyersSection from "@/components/ForBuyersSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <LenisProvider>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <MarqueeSection />
        <HowItWorksSection />
        <ForSellersSection />
        <ForBuyersSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </LenisProvider>
  );
}
