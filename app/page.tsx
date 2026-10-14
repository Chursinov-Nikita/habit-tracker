import Features from "@/app/components/Features";
import Hero from "@/app/components/Hero";
import HowItWorks from "@/app/components/HowItWorks";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0F1A] text-white">
      <Hero />
      <Features />
      <HowItWorks />
    </main>
  );
}
