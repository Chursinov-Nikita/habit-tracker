import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 pt-24 text-center text-white">
      <p className="bg-linear-to-b from-primary-pale to-accent bg-clip-text font-display text-7xl font-bold text-transparent">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold">Такой страницы нет</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
        Возможно, адрес устарел. Календарь, например, теперь находится на
        странице прогресса.
      </p>
      <Link
        href="/progress"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 active:scale-[0.98]"
      >
        Перейти к прогрессу
        <ArrowRight className="h-4 w-4" />
      </Link>
    </main>
  );
}
