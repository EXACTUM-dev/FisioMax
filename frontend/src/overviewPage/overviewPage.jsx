/**
 * @fileoverview Overview/Landing page para SOMEFIPP - Página pública
 * @author EXACTUM-dev
 * @version 0.1.0
 */

import React from "react";
import Header from "./components/header";
import HeroSection from "./components/heroSection";
import SocialProof from "./components/socialProof";
import BenefitsSection from "./components/benefitsSection";
import TestimonialsSection from "./components/testimonialsSection";
import PricingSection from "./components/pricingSection";
import AboutSection from "./components/aboutSection";
import FAQSection from "./components/FAQSection";
import Footer from "./components/footer";

export default function OverviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <HeroSection />
      <SocialProof />
      <BenefitsSection />
      <TestimonialsSection />
      <PricingSection />
      <AboutSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
