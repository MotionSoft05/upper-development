import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ServicesGrid from "@/components/landing/ServicesGrid";
import HardwareSection from "@/components/landing/HardwareSection";
import ContactSection from "@/components/landing/ContactSection";
import TrustSection from "@/components/landing/TrustSection";
import Footer from "@/components/landing/Footer";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import BackgroundDecor from "@/components/landing/BackgroundDecor";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* Global Background Decor - Fixed to Viewport */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <BackgroundDecor position="top-right" variant="default" opacity={0.6} />
        <BackgroundDecor position="bottom-left" variant="cool" opacity={0.5} />
      </div>

      <div className="relative z-10">
        <Navbar />
        <Hero />
        <ServicesGrid />
        <HardwareSection />
        <TrustSection />
        <PricingSection />
        <FAQSection />
        <ContactSection />
        <Footer />
      </div>
    </main>
  );
}
