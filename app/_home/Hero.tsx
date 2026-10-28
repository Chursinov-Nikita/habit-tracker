import { ArrowRight, Footprints } from "lucide-react";
import DevicesMockup from "./Mockups/DevicesMockup";
import Link from "next/link";
import { catalog, HABITS_PATH, icons } from "@/app/habits/data";

const buttonStyles = `
.ht-glass {
  background: radial-gradient(120% 160% at 50% 0%, rgba(167,139,250,.22), rgba(30,22,60,.35) 60%);
  backdrop-filter: blur(18px) saturate(170%);
  -webkit-backdrop-filter: blur(18px) saturate(170%);
  box-shadow:
    inset 0 1px 1px rgba(255,255,255,.35),
    inset 0 -8px 18px -10px rgba(196,181,253,.45),
    inset 0 0 22px rgba(139,92,246,.18),
    0 10px 30px -12px rgba(139,92,246,.6);
}
.ht-glass:hover {
  box-shadow:
    inset 0 1px 1px rgba(255,255,255,.45),
    inset 0 -8px 18px -10px rgba(196,181,253,.55),
    inset 0 0 22px rgba(139,92,246,.25),
    0 18px 44px -12px rgba(124,92,246,.9);
}
.ht-ring {
  padding: 1.5px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(196,181,253,.18) 45%, rgba(167,139,250,.45));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
}
.ht-beam {
  background: conic-gradient(from 0deg, transparent 0 68%, #A78BFA 84%, #fff 92%, transparent 100%);
  animation: ht-lap 5s cubic-bezier(.45,0,.25,1) 1.2s infinite;
  opacity: 0;
}
@keyframes ht-lap {
  0% { transform: translate(-50%,-50%) rotate(0deg); opacity: 0; }
  6%, 38% { opacity: 1; }
  44%, 100% { transform: translate(-50%,-50%) rotate(360deg); opacity: 0; }
}
@keyframes ht-step { 0%,100% { transform: none } 30% { transform: translateX(3px) rotate(-10deg) } 60% { transform: translateX(1px) rotate(6deg) } }
@keyframes ht-walk { 0%,6%,26%,100% { transform: none } 12% { transform: translateX(3px) rotate(-10deg) } 19% { transform: translateX(1px) rotate(6deg) } }
`;

const POPULAR_IDS = ["smoking", "alcohol", "sweets", "social", "late-sleep"];
const popular = catalog.filter((h) => POPULAR_IDS.includes(h.id));

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <style>{`@keyframes ht-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}${buttonStyles}`}</style>
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
              className="ht-glass group relative isolate mt-9 flex w-full items-center justify-center overflow-hidden rounded-full px-8 py-4 text-base font-semibold text-slate-100 transition duration-300 ease-out hover:-translate-y-0.5 hover:text-white active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A78BFA] sm:mt-10 sm:inline-flex sm:w-auto"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 origin-left scale-x-0 rounded-full bg-[linear-gradient(100deg,rgba(139,92,246,0.85)_0%,rgba(99,102,241,0.85)_100%)] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100"
              />
              <span
                aria-hidden="true"
                className="absolute inset-x-5 top-px -z-10 h-1/2 rounded-full bg-linear-to-b from-white/25 to-transparent"
              />
              <span aria-hidden="true" className="ht-ring absolute inset-0 -z-10 rounded-full">
                <span className="ht-beam absolute left-1/2 top-1/2 aspect-square w-[160%] motion-reduce:hidden" />
              </span>
              <Footprints
                aria-hidden="true"
                className="h-4.5 w-4.5 animate-[ht-walk_5s_ease-in-out_1.2s_infinite] text-[#C4B5FD] transition-colors duration-300 group-hover:animate-[ht-step_0.6s_ease-out] group-hover:text-white motion-reduce:animate-none motion-reduce:group-hover:animate-none"
                strokeWidth={2.2}
              />
              <span className="ml-2.5">Сделать первый шаг</span>
              <ArrowRight
                aria-hidden="true"
                className="ml-0 h-4.5 w-0 -translate-x-2 opacity-0 transition-all duration-300 ease-out group-hover:ml-2.5 group-hover:w-4.5 group-hover:translate-x-0 group-hover:opacity-100"
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
