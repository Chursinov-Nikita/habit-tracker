import { ArrowRight } from "lucide-react";
import DevicesMockup from "./Mockups/DevicesMockup";
import Link from "next/link";
import { catalog, HABITS_PATH, icons } from "@/app/habits/data";

const POPULAR_IDS = ["smoking", "alcohol", "sweets", "social", "late-sleep"];
const popular = catalog.filter((h) => POPULAR_IDS.includes(h.id));

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <style>{`@keyframes ht-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}`}</style>
      <div className="flex min-h-svh flex-col">
        <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-14 px-6 pb-20 pt-28 sm:pt-32 lg:grid-cols-[1fr_448px] lg:gap-20 lg:pb-24 xl:gap-24 xl:grid-cols-[1fr_576px]">
          <div className="animate-[ht-rise_0.7s_ease-out_backwards] motion-reduce:animate-none">
            <h1 className="font-display text-[40px] font-bold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[44px] xl:text-[58px]">
              Избавься от
              <span className="block bg-[linear-gradient(90deg,#A78BFA_0%,#8B5CF6_45%,#3B82F6_100%)] bg-clip-text pb-1 text-transparent sm:whitespace-nowrap">
                вредных привычек
              </span>
            </h1>
            <p className="mt-6 max-w-136 text-[17px] leading-[1.65] text-slate-300/85 sm:mt-7 sm:text-lg">
              Отмечай каждый день без срыва и смотри, как растёт твоя серия.
              Трекер напомнит, посчитает прогресс и поддержит, когда будет
              трудно.
            </p>

            <Link
              href={HABITS_PATH}
              className="group mt-9 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#6366F1] px-7 py-4 text-base font-semibold text-white shadow-lg shadow-[#6366F1]/30 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#5558E8] hover:shadow-xl hover:shadow-[#6366F1]/40 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F1A] sm:mt-10 sm:inline-flex sm:w-auto"
            >
              Сделать первый шаг
              <ArrowRight
                aria-hidden="true"
                className="h-4.5 w-4.5 transition-transform duration-300 ease-out group-hover:translate-x-1"
                strokeWidth={2.4}
              />
            </Link>

            <div className="mt-14 max-w-136 sm:mt-16">
              <p className="text-sm font-medium text-slate-400">
                От чего хочешь отказаться?
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {popular.map(({ id, name, icon }) => {
                  const Icon = icons[icon];
                  return (
                    <li key={id}>
                      <Link
                        href={HABITS_PATH}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 py-2 pl-3 pr-4 text-sm font-medium text-slate-200 transition duration-200 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A78BFA]"
                      >
                        {Icon && (
                          <Icon
                            className="h-4 w-4 text-[#A78BFA]"
                            strokeWidth={2}
                          />
                        )}
                        {name}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <Link
                    href={HABITS_PATH}
                    className="inline-flex items-center rounded-full px-3 py-2 text-sm font-medium text-slate-400 underline decoration-white/20 underline-offset-4 transition hover:text-white hover:decoration-[#A78BFA]"
                  >
                    и ещё {catalog.length - popular.length}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <DevicesMockup />
        </div>
      </div>
    </section>
  );
}
