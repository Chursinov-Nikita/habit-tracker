"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, ListChecks, User, Wind } from "lucide-react";

const tabs = [
  { href: "/progress", label: "Прогресс", Icon: Flame },
  { href: "/habits", label: "Привычки", Icon: ListChecks },
  { href: "/meditation", label: "Медитация", Icon: Wind },
  { href: "/profile", label: "Профиль", Icon: User },
];

export default function TabBar() {
  const pathname = usePathname();
  const [pending, setPending] = useState<string | null>(null);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setPending(null);
  }

  if (pathname === "/") return null;

  const current = tabs.findIndex((tab) => pathname.startsWith(tab.href));
  const pendingIndex = tabs.findIndex((tab) => tab.href === pending);
  const activeIndex = pendingIndex >= 0 ? pendingIndex : current;

  return (
    <>
      <div aria-hidden="true" className="h-20 md:hidden" />
      <nav
        aria-label="Разделы приложения"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <ul className="relative mx-auto flex h-16 max-w-lg items-stretch">
          {activeIndex >= 0 && (
            <li
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 flex w-1/4 justify-center pt-2 transition-transform duration-300 ease-[cubic-bezier(.32,.72,0,1)] motion-reduce:transition-none"
              style={{ transform: `translateX(${activeIndex * 100}%)` }}
            >
              <span className="h-7 w-12 rounded-full bg-primary/20" />
            </li>
          )}
          {tabs.map(({ href, label, Icon }, index) => {
            const active = index === activeIndex;
            return (
              <li key={href} className="relative flex-1">
                <Link
                  href={href}
                  onClick={() => {
                    if (index !== current) setPending(href);
                  }}
                  aria-current={index === current ? "page" : undefined}
                  className="flex h-full flex-col items-center justify-start gap-1 pt-2 text-[11px] font-medium [-webkit-tap-highlight-color:transparent]"
                >
                  <span className="flex h-7 w-12 items-center justify-center">
                    <Icon
                      className={`h-5 w-5 transition-colors duration-200 ${
                        active ? "text-primary-soft" : "text-slate-500"
                      }`}
                      strokeWidth={active ? 2.4 : 2}
                    />
                  </span>
                  <span
                    className={`transition-colors duration-200 ${
                      active ? "text-white" : "text-slate-500"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
