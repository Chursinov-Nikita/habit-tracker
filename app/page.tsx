import { Suspense } from "react";
import Hero from "@/app/_home/Hero";
import About from "@/app/_home/About";
import AuthError from "@/app/_home/AuthError";

export default function Home() {
  return (
    <main>
      <Suspense>
        <AuthError />
      </Suspense>
      <Hero />
      <About />
    </main>
  );
}
