"use client";

import HeroSection from "./components/home/hero-section";
import CoachSection from "./components/home/coach-section";
import ProblemSection from "./components/home/problem-section";
import FeatureReviewSection from "./components/home/feature-review";
import PricingSection from "./components/home/pricing-section";
import ColaboSection from "./components/home/colabo-section";
import FooterCTASection from "./components/home/footer-cta-setction";
import FaqSection from "./components/home/faq-section";
import SocialProofSection from "./components/home/social-proof-section";
import FloatingCTA from "./components/home/floating-cta";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <CoachSection />
      <FeatureReviewSection />
      <PricingSection />
      <ColaboSection />
      <SocialProofSection />
      <FaqSection />
      <FooterCTASection />

      <FloatingCTA />
    </>
  );
}
