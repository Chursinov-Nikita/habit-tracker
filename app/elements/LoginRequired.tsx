"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Lock } from "lucide-react";
import LoginModal from "./Header/LoginModal";

export default function LoginRequired({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<"google" | "github" | null>(null);

  async function handleLogin(provider: "google" | "github") {
    setLoading(provider);
    await signIn(provider);
    setLoading(null);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 pb-16 pt-28 text-white sm:px-6">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#111827]/70 px-6 py-12 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#8B5CF6]/25 blur-3xl" />
        <span className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6366F1]/15 text-[#A5B4FC] ring-1 ring-[#6366F1]/30">
          <Lock className="h-6 w-6" />
        </span>
        <h1 className="relative text-2xl font-bold">Нужно войти</h1>
        <p className="relative mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
          {text}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#6366F1] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6366F1]/25 transition hover:bg-[#5558E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70 active:scale-[0.98]"
        >
          Войти
        </button>
      </div>

      {open && (
        <LoginModal
          open={open}
          onClose={() => setOpen(false)}
          onGoogle={() => handleLogin("google")}
          onGithub={() => handleLogin("github")}
          loading={loading}
        />
      )}
    </main>
  );
}
