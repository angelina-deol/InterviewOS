import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { FeatureCards } from "@/components/landing/FeatureCards";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CTASection, Footer } from "@/components/landing/CTASection";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <FeatureCards />
      <HowItWorks />
      <CTASection />
      <Footer />
    </main>
  );
}
