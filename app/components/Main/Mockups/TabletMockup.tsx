import {
  ChartNoAxesColumn,
  Check,
  House,
  ListChecks,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import { habits } from "./data";
import Image from "next/image";

const nav = [
  { label: "Главная", Icon: House, active: true },
  { label: "Привычки", Icon: ListChecks, active: false },
  { label: "Статистика", Icon: ChartNoAxesColumn, active: false },
  { label: "Настройки", Icon: Settings, active: false },
];

export default function TabletMockup() {
  return (
    <div
      aria-hidden="true"
      className="absolute -left-23 top-9 z-0 h-113 w-135 animate-[ht-float_7s_ease-in-out_infinite] motion-reduce:animate-none"
    >
      <div className="h-full w-full rounded-[34px] bg-linear-to-b from-[#2b2445] via-[#171227] to-[#0d0a18] p-1.5 shadow-[0_30px_80px_-15px_rgba(139,92,246,0.45),0_0_70px_0_rgba(59,130,246,0.12),inset_0_1px_0_rgba(255,255,255,0.22)] [transform:perspective(1400px)_rotateY(-15deg)_rotateX(3deg)]">
        <div className="relative isolate flex h-full w-full overflow-hidden rounded-[28px] bg-linear-to-b from-[#080613] to-[#030207] text-white">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#8B5CF6]/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(115deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_30%,transparent_48%)]" />

          <div className="relative w-40 shrink-0 border-r border-white/6 bg-white/2 p-5">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="" width={22} height={22} />
              <span className="text-[13px] font-semibold leading-none">
                Трекер
              </span>
            </div>

            <ul className="mt-7 space-y-1">
              {nav.map(({ label, Icon, active }) => (
                <li
                  key={label}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-medium leading-4 transition-all duration-200 ${
                    active
                      ? "bg-[#8B5CF6]/12 text-white shadow-[inset_0_0_0_1px_rgba(139,92,246,0.35)]"
                      : "text-slate-400 hover:bg-white/3 hover:text-slate-300"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      active
                        ? "text-[#A78BFA] drop-shadow-[0_0_6px_rgba(139,92,246,0.7)]"
                        : "text-slate-500"
                    }`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  {label}
                </li>
              ))}
            </ul>

            <div className="absolute bottom-6 left-3 right-3 rounded-xl border border-white/5 bg-white/2 p-2.5">
              <svg
                className="w-full drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                viewBox="0 0 100 30"
                fill="none"
              >
                <defs>
                  <linearGradient id="tablet-wave" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
                <path
                  pathLength={1}
                  d="M0 22 C15 22 20 5 35 12 S55 28 70 14 S90 6 100 10"
                  stroke="url(#tablet-wave)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="[stroke-dasharray:1_2] animate-[ht-draw_1.6s_ease-out_0.5s_backwards] motion-reduce:animate-none"
                />
              </svg>
            </div>
          </div>

          <div className="relative flex-1 p-6">
            <div className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-white/5">
              <X className="h-3 w-3 text-slate-400" strokeWidth={2.5} />
            </div>

            <p className="bg-linear-to-b from-white to-slate-300 bg-clip-text text-[20px] font-extrabold leading-7 tracking-tight text-transparent">
              Мои привычки
            </p>
            <p className="mt-0.5 text-[12px] font-medium leading-4 text-slate-400">
              Сегодня, 30 сентября
            </p>

            <ul className="mt-4 space-y-1.5">
              {habits.map((h) => (
                <li
                  key={h.label}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-[13px] font-medium leading-5 transition ${
                    h.done
                      ? "border-white/7 bg-white/5 text-white hover:bg-white/7"
                      : "border-white/3 bg-white/2 text-slate-400 hover:bg-white/4"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      h.done
                        ? "bg-[linear-gradient(135deg,#8B5CF6_0%,#3B82F6_100%)] text-white shadow-[0_0_12px_rgba(139,92,246,0.55)]"
                        : "border border-white/20 bg-black/40"
                    }`}
                  >
                    {h.done && <Check className="h-3 w-3" strokeWidth={4} />}
                  </span>
                  {h.label}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/6 bg-linear-to-r from-[#8B5CF6]/10via-white/[0.03] to-transparent p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_20px_rgba(59,130,246,0.05)]">
              <div>
                <p className="bg-linear-to-r from-white to-slate-300 bg-clip-text text-[22px] font-extrabold leading-6 tracking-tight text-transparent">
                  7 дней
                </p>
                <p className="text-[10px] font-semibold uppercase leading-4 tracking-wide text-slate-400">
                  без вредных привычек
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#8B5CF6_0%,#3B82F6_100%)] text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                <TrendingUp className="h-6 w-6" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
