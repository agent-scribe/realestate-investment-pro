import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { ImageValuation } from "@/components/sections/ImageValuation";
import { PropertyAnalyzer } from "@/components/sections/PropertyAnalyzer";
import { HowItWorks } from "@/components/sections/HowItWorks";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <ImageValuation />
      <PropertyAnalyzer />
      <HowItWorks />
    </>
  );
}
