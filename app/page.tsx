import Hero from "@/app/components/main/Hero";
import dynamic from "next/dynamic";

const About = dynamic(() => import("@/app/components/main/About"), {
  loading: () => <p>Загрузка...</p>,
});

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
    </main>
  );
}
