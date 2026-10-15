import Features from "@/app/components/Main/Features";
import Hero from "@/app/components/Main/Hero";
import HowItWorks from "@/app/components/Main/HowItWorks";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0F1A] text-white">
      <Hero />
      <Features />
      <HowItWorks />
    </main>
  );
}
