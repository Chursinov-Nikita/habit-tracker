import {
  ChartNoAxesColumn,
  Check,
  ChevronRight,
  House,
  Menu,
  User,
} from "lucide-react";
import { habits } from "./data";
import Image from "next/image";

const tabs = [
  { label: "Главная", Icon: House, active: true },
  { label: "Статистика", Icon: ChartNoAxesColumn, active: false },
  { label: "Профиль", Icon: User, active: false },
];

const RING = 263.9;

export default function PhoneMockup() {
  const done = habits.filter((h) => h.done).length;
  const progress = done / (habits.length || 1);

  return (
    <div
      aria-hidden="true"
      className="absolute -right-5 top-21 z-10 h-109 w-55 animate-[ht-float_8s_ease-in-out_-3s_infinite] motion-reduce:animate-none"
    >
      <div className="h-full w-full rounded-[42px] bg-linear-to-b from-[#2b2445] via-[#171227] to-[#0d0a18] p-1.5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.75),0_25px_60px_-20px_rgba(139,92,246,0.5),0_0_50px_0_rgba(59,130,246,0.12),inset_0_1px_0_rgba(255,255,255,0.22)] [transform:perspective(1400px)_rotateY(-15deg)_rotateX(3deg)]">
        <div className="relative isolate h-full w-full overflow-hidden rounded-[37px] bg-linear-to-b from-[#080613] to-[#030207] p-4 text-white">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#8B5CF6]/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(115deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_30%,transparent_48%)]" />

          <div className="mx-auto h-4 w-16 rounded-full bg-black ring-1 ring-white/5" />

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Image src="/logo.svg" alt="" width={18} height={18} />
              <span className="text-[12px] font-semibold leading-none">
                Трекер
              </span>
            </div>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5">
              <Menu
                className="h-3.5 w-3.5 text-slate-300/70"
                strokeWidth={2.5}
              />
            </div>
          </div>

          <p className="mt-3 text-[11px] font-medium leading-4 text-slate-400">
            Сегодня, 30 сентября
          </p>

          <div className="relative mx-auto mt-3 h-24 w-24 drop-shadow-[0_0_16px_rgba(139,92,246,0.45)]">
            <svg
              className="h-full w-full -rotate-90"
              viewBox="0 0 100 100"
              fill="none"
            >
              <defs>
                <linearGradient id="ht-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#ht-ring)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={RING}
                strokeDashoffset={RING * (1 - progress)}
                className="animate-[ht-ring-fill_1.4s_ease-out_0.4s_backwards] motion-reduce:animate-none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="bg-linear-to-b from-white to-slate-300 bg-clip-text text-[22px] font-extrabold leading-none tracking-tight text-transparent">
                {done}/{habits.length}
              </span>
              <span className="mt-1 text-[8px] font-semibold uppercase leading-none tracking-wide text-slate-400">
                привычек
              </span>
            </div>
          </div>

          <ul className="mt-3.5 space-y-1.5">
            {habits.slice(0, 4).map((h) => (
              <li
                key={h.label}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium leading-4 transition ${
                  h.done
                    ? "bg-white/6 text-white hover:bg-white/8"
                    : "bg-white/2.5 text-slate-400 hover:bg-white/4"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    h.done
                      ? "bg-[linear-gradient(135deg,#8B5CF6_0%,#3B82F6_100%)] text-white shadow-[0_0_10px_rgba(139,92,246,0.55)]"
                      : "border border-white/20 bg-black/40"
                  }`}
                >
                  {h.done && (
                    <Check className="h-2.5 w-2.5" strokeWidth={4.5} />
                  )}
                </span>
                {h.label}
                <ChevronRight
                  className="ml-auto h-3 w-3 text-slate-500/50"
                  strokeWidth={3}
                />
              </li>
            ))}
          </ul>

          <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-white/6 bg-[#070510]/80 px-3 pb-3 pt-2.5 backdrop-blur-xl">
            {tabs.map(({ label, Icon, active }) => (
              <div
                key={label}
                className={`flex flex-col items-center gap-1 text-[9px] font-medium leading-3 ${
                  active
                    ? "text-[#A78BFA] drop-shadow-[0_0_8px_rgba(139,92,246,0.7)]"
                    : "text-slate-500"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={active ? 2.5 : 2} />
                {label}
              </div>
            ))}
          </div>

          <div className="absolute bottom-1.5 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-white/25" />
        </div>
      </div>
    </div>
  );
}
