"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Flame, ListChecks, User, Wind } from "lucide-react";

const tabs = [
  { href: "/progress", label: "Прогресс", Icon: Flame },
  { href: "/habits", label: "Привычки", Icon: ListChecks },
  { href: "/calendar", label: "Календарь", Icon: CalendarDays },
  { href: "/meditation", label: "Медитация", Icon: Wind },
  { href: "/profile", label: "Профиль", Icon: User },
];

export default function TabBar() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <>
      <div aria-hidden="true" className="h-20 md:hidden" />
      <nav
        aria-label="Разделы приложения"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <ul className="mx-auto flex h-16 max-w-lg items-stretch">
          {tabs.map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:scale-95 ${
                    active ? "text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <span
                    className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                      active ? "bg-primary/20 text-primary-soft" : ""
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
