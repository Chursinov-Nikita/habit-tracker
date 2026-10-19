import Hero from "@/app/components/main/Hero";
import About from "@/app/components/main/About";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0F1A] text-white">
      <Hero />
      <About />
    </main>
  );
}
