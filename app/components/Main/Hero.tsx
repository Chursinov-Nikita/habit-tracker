import {
  ArrowRight,
  ChartNoAxesColumn,
  Heart,
  LayoutDashboard,
} from "lucide-react";
import DevicesMockup from "../Mockups/DevicesMockup";
import GradientText from "../GradientText";
import Header from "../Main/Header";
import HeroBackground from "../HeroBackground";

const perks = [
  { label: "Простой и удобный интерфейс", Icon: LayoutDashboard },
  { label: "Статистика и аналитика", Icon: ChartNoAxesColumn },
  { label: "Мотивация каждый день", Icon: Heart },
];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackground />

      <div className="flex min-h-[100svh] flex-col">
        <div>
          <Header />
        </div>

        <div className="mx-auto grid w-full max-w-[1280px] flex-1 items-center gap-12 px-6 pb-14 pt-10 sm:pt-14 lg:grid-cols-[1fr_448px] lg:gap-10 lg:pb-20 xl:grid-cols-[1fr_576px]">
          <div>
            <p className="text-[10px] font-medium uppercase leading-5 tracking-[0.2em] text-[#94A3B8] sm:text-[11px] sm:tracking-[0.25em]">
              Лучшее будущее начинается
              <br />с правильных привычек
            </p>
            <h1 className="mt-5 text-[34px] font-bold leading-[1.1] tracking-tight sm:mt-6 sm:text-5xl xl:text-[56px]">
              Избавься от
              <GradientText className="block sm:whitespace-nowrap">
                вредных привычек
              </GradientText>
            </h1>
            <p className="mt-5 max-w-[440px] text-[15px] leading-7 text-white/80 sm:mt-6 sm:text-base">
              Удобный трекер, который поможет тебе контролировать прогресс,
              оставаться мотивированным и менять свою жизнь к лучшему.
            </p>
            <a
              href="#"
              className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[linear-gradient(90deg,#8B5CF6_0%,#6D4AFF_100%)] px-8 py-4 text-sm font-semibold shadow-[0_10px_40px_-8px_rgba(139,92,246,0.7)] transition hover:brightness-110 sm:mt-9 sm:w-auto"
            >
              Начать бесплатно
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </a>
            <ul className="mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {perks.map(({ label, Icon }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6]">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </span>
                  <span className="max-w-[120px] text-[11px] leading-4 text-white/80">
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
