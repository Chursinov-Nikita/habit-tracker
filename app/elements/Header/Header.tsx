"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, User, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { asset } from "@/app/lib/asset";

const navLinks = [
  { label: "Привычки", href: "/habits", match: ["/habits", "/progress"] },
  { label: "Медитация", href: "/meditation", match: ["/meditation"] },
  { label: "Календарь", href: "/calendar", match: ["/calendar"] },
  { label: "О нас", href: "/#about", match: [] },
];

const ABOUT_HREF = "/#about";
const SCROLL_KEY = "habittrack:scroll-to";

export default function Header() {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== "/") return;
    let pending: string | null = null;
    try {
      pending = sessionStorage.getItem(SCROLL_KEY);
    } catch {}
    if (pending !== "about") return;
    const timer = window.setTimeout(() => {
      try {
        sessionStorage.removeItem(SCROLL_KEY);
      } catch {}
      document
        .getElementById("about")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  function isActive(href: string) {
    const link = navLinks.find((l) => l.href === href);
    return Boolean(link?.match.some((path) => pathname.startsWith(path)));
  }

  function handleNavClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
    setOpenMobileMenu(false);
    if (href !== ABOUT_HREF) return;
    e.preventDefault();
    if (pathname === "/") {
      document
        .getElementById("about")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    let stored = false;
    try {
      sessionStorage.setItem(SCROLL_KEY, "about");
      stored = true;
    } catch {}
    router.push(stored ? "/" : ABOUT_HREF);
  }

  return (
    <header className="absolute inset-x-0 top-0 z-20 mx-auto max-w-7xl px-6 pt-5 sm:pt-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2 transition-opacity hover:opacity-90"
          aria-label="HabitTrack"
        >
          <Image src={asset("/logo.svg")} alt="" width={32} height={32} />
          <span className="text-xl font-bold transition-colors group-hover:text-[#A78BFA]">
            Трекер
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Основная навигация"
        >
          {navLinks.map((l, i) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`group flex items-baseline gap-2 text-sm font-semibold transition-colors duration-200 hover:text-white ${
                isActive(l.href) ? "text-white" : "text-white/70"
              }`}
            >
              <span className="font-mono text-[10px] text-[#8B5CF6] transition-transform duration-200 group-hover:-translate-y-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            aria-label="Профиль"
            aria-current={pathname.startsWith("/profile") ? "page" : undefined}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 hover:border-[#8B5CF6]/60 hover:bg-[#8B5CF6]/15 hover:text-[#A78BFA] active:scale-95 ${
              pathname.startsWith("/profile")
                ? "border-[#8B5CF6]/60 bg-[#8B5CF6]/20 text-[#C4B5FD]"
                : "border-white/15 bg-white/5"
            }`}
          >
            <User className="h-5 w-5" />
          </Link>
          <button
            type="button"
            onClick={() => setOpenMobileMenu(!openMobileMenu)}
            aria-expanded={openMobileMenu}
            aria-controls="mobile-menu"
            aria-label={openMobileMenu ? "Закрыть меню" : "Открыть меню"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-all duration-300 hover:border-[#8B5CF6]/60 hover:bg-[#8B5CF6]/15 hover:text-[#A78BFA] active:scale-95 md:hidden"
          >
            <span className="relative flex h-5 w-5 items-center justify-center">
              <Menu
                className={`absolute h-5 w-5 transition-all duration-300 ${
                  openMobileMenu
                    ? "rotate-90 scale-0 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                }`}
              />
              <X
                className={`absolute h-5 w-5 transition-all duration-300 ${
                  openMobileMenu
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {openMobileMenu && (
        <nav
          id="mobile-menu"
          aria-label="Мобильная навигация"
          className="absolute inset-x-6 top-full mt-3 origin-top animate-[fadeIn_0.2s_ease-out] overflow-hidden rounded-xl border border-[#8B5CF6]/30 bg-[#0B0F1A] md:hidden"
        >
          {navLinks.map((l, i) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`group flex items-center justify-between border-b border-white/10 px-5 py-4 text-base font-semibold transition-colors last:border-b-0 hover:bg-[#8B5CF6] hover:text-white ${
                isActive(l.href) ? "bg-[#8B5CF6]/15 text-white" : "text-white/90"
              }`}
            >
              <span className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-[#8B5CF6] transition-colors group-hover:text-white/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {l.label}
              </span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
