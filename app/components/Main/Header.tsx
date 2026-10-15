"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "@/app/components/Logo";
import { useSession, signIn, signOut } from "next-auth/react";

const navLinks = [
  { label: "Привычки", href: "#" },
  { label: "Медитация", href: "#" },
  { label: "Календарь", href: "#" },
  { label: "О нас", href: "#how" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  const { data: session, status } = useSession();

  return (
    <header className="relative z-20 mx-auto max-w-7xl px-6 pt-5 sm:pt-8">
      <div className="flex items-center justify-between gap-4">
        <a
          href="#"
          className="group flex items-center gap-2 transition-opacity hover:opacity-90"
          aria-label="HabitTrack"
        >
          <Logo gradient />
          <span className="text-lg font-bold transition-colors group-hover:text-[#A78BFA]">
            Трекер
          </span>
        </a>

        <nav
          className="hidden items-center gap-9 md:flex"
          aria-label="Основная навигация"
        >
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="group relative text-sm font-semibold text-white/80 transition-colors duration-300 hover:text-white"
            >
              {l.label}
              <span className="pointer-events-none absolute -bottom-2 left-1/2 h-px w-0 -translate-x-1/2 bg-linear-to-r from-transparent via-[#8B5CF6] to-transparent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (session ? signOut() : signIn("github"))}
            disabled={status === "loading"}
            className="group relative overflow-hidden rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-5 py-2 text-sm font-semibold transition-all duration-300 hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/25 hover:shadow-[0_0_25px_-5px_rgba(139,92,246,0.7)] disabled:opacity-60 sm:px-8 sm:py-2.5"
          >
            <span className="relative z-10">
              {session ? "Выйти" : "Авторизоваться"}
            </span>
            <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-all duration-300 hover:border-[#8B5CF6]/60 hover:bg-[#8B5CF6]/15 hover:text-[#A78BFA] active:scale-95 md:hidden"
          >
            <span className="relative flex h-5 w-5 items-center justify-center">
              <Menu
                className={`absolute h-5 w-5 transition-all duration-300 ${
                  open
                    ? "rotate-90 scale-0 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                }`}
              />
              <X
                className={`absolute h-5 w-5 transition-all duration-300 ${
                  open
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Мобильная навигация"
          className="absolute inset-x-6 top-full mt-3 origin-top animate-[fadeIn_0.2s_ease-out] rounded-2xl border border-white/10 bg-[#0B0F1A]/95 p-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl md:hidden"
        >
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="group relative block overflow-hidden rounded-xl px-4 py-3 text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              <span className="absolute inset-0 -translate-x-full bg-[#8B5CF6]/10 transition-transform duration-300 group-hover:translate-x-0" />
              <span className="relative">{l.label}</span>
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
