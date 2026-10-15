import {
  ChartNoAxesColumn,
  Check,
  House,
  ListChecks,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import Logo from "../Logo";
import { habits } from "./data";

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
      className="absolute -left-22 top-[40px] isolate flex h-[410px] w-[530px] overflow-hidden rounded-[30px] border-[6px] border-[#161224] bg-gradient-to-b from-[#070510] to-[#030207] text-white shadow-[0_30px_70px_-15px_rgba(139,92,246,0.4),_0_0_60px_0px_rgba(59,130,246,0.1),_inset_0_0_3px_1px_rgba(255,255,255,0.08)] [transform:perspective(1400px)_rotateY(-14deg)_rotateX(3deg)]"
    >
      <div className="relative w-[140px] shrink-0 border-r border-white/[0.04] bg-[#070510]/40 p-[18px]">
        <div className="flex items-center gap-1.5">
          <Logo className="h-5 w-5" />
          <span className="text-[11px] font-semibold">Трекер</span>
        </div>

        <ul className="mt-7 space-y-1">
          {nav.map(({ label, Icon, active }) => (
            <li
              key={label}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[10px] font-medium transition-all duration-200 ${
                active
                  ? "bg-white/[0.03] text-white shadow-[inset_0_0_0_1px_rgba(139,92,246,0.2)]"
                  : "text-slate-500 hover:text-slate-400 hover:bg-white/[0.01]"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${active ? "text-[#8B5CF6] drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]" : "text-slate-500"}`}
                strokeWidth={active ? 2.5 : 2}
              />
              {label}
            </li>
          ))}
        </ul>

        <div className="absolute bottom-6 left-3 right-3 rounded-lg border border-white/[0.02] bg-white/[0.01] p-2">
          <svg
            className="w-full drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]"
            viewBox="0 0 100 30"
            fill="none"
          >
            <path
              d="M0 22 C15 22 20 5 35 12 S55 28 70 14 S90 6 100 10"
              stroke="url(#tablet-wave)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="tablet-wave" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="relative flex-1 p-6 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button className="absolute right-5 top-5 flex h-5 w-5 items-center justify-center rounded-full bg-white/5 transition hover:bg-white/10 active:scale-95">
          <X className="h-2.5 w-2.5 text-slate-400" strokeWidth={2.5} />
        </button>

        <p className="text-[18px] font-extrabold tracking-tight bg-gradient-to-b from-white to-slate-200 bg-clip-text text-transparent">
          Мои привычки
        </p>
        <p className="mt-0.5 text-[10px] font-medium text-slate-500">
          Сегодня, 30 сентября
        </p>

        <ul className="mt-[18px] space-y-1.5">
          {habits.map((h) => (
            <li
              key={h.label}
              className="flex items-center gap-3 rounded-xl border border-white/[0.01] bg-white/[0.02] px-3 py-2.5 text-[11px] font-medium text-slate-200/70 transition hover:bg-white/[0.04]"
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  h.done
                    ? "bg-[linear-gradient(135deg,#8B5CF6_0%,#3B82F6_100%)] text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                    : "border border-white/15 bg-black/40"
                }`}
              >
                {h.done && <Check className="h-2.5 w-2.5" strokeWidth={4.5} />}
              </span>
              <span
                className={h.done ? "text-slate-100/90" : "text-slate-400/50"}
              >
                {h.label}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-[18px] flex items-center justify-between rounded-xl border border-white/[0.03] bg-gradient-to-r from-white/[0.02] to-transparent p-4 shadow-[inset_0_0_12px_rgba(59,130,246,0.03)]">
          <div>
            <p className="text-[17px] font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              7 дней
            </p>
            <p className="text-[9px] font-semibold tracking-wide text-slate-500 uppercase">
              без вредных привычек
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#8B5CF6_0%,#3B82F6_100%)] text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]">
            <TrendingUp className="h-5.5 w-5.5" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
}
