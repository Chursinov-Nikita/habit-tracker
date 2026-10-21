import {
  ArrowRight,
  ChartNoAxesColumn,
  Heart,
  LayoutDashboard,
} from "lucide-react";
import DevicesMockup from "./Mockups/DevicesMockup";
import Link from "next/link";

const perks = [
  { label: "Простой и удобный интерфейс", Icon: LayoutDashboard },
  { label: "Статистика и аналитика", Icon: ChartNoAxesColumn },
  { label: "Мотивация каждый день", Icon: Heart },
];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="flex min-h-svh flex-col">
        <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-6 pb-20 pt-10 sm:pt-14 lg:grid-cols-[1fr_448px] lg:gap-10 lg:pb-35 xl:grid-cols-[1fr_576px]">
          <div>
            <p className="text-xs font-light uppercase leading-5 tracking-[0.2em] text-[#94A3B8] sm:text-[10px] sm:tracking-[0.25em]">
              Лучшее будущее начинается
              <br />с правильных привычек
            </p>
            <h1 className="mt-5 text-[34px] font-bold leading-[1.1] tracking-tight sm:mt-6 sm:text-5xl xl:text-[56px]">
              Избавься от
              <span className="bg-[linear-gradient(90deg,#8B5CF6_0%,#3B82F6_100%)] bg-clip-text text-transparent block sm:whitespace-nowrap">
                вредных привычек
              </span>
            </h1>
            <p className="mt-5 max-w-110 text-[15px] leading-7 text-white/80 sm:mt-6 sm:text-base">
              Удобный трекер, который поможет тебе контролировать прогресс,
              оставаться мотивированным и менять свою жизнь к лучшему.
            </p>
            <Link
              href="/components/habits/first"
              className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[linear-gradient(90deg,#8B5CF6_0%,#6D4AFF_100%)] px-8 py-4 text-sm font-semibold shadow-[0_10px_40px_-8px_rgba(139,92,246,0.7)] transition hover:brightness-110 sm:mt-9 sm:w-auto hover:scale-101 duration-300"
            >
              Начать бесплатно
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <ul className="mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {perks.map(({ label, Icon }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6]">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <span className="max-w-30 text-[11px] leading-4 text-white/80">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <DevicesMockup />
        </div>
      </div>
    </section>
  );
}
