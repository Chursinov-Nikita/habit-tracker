import {
  ChartNoAxesColumn,
  Check,
  ChevronRight,
  House,
  Menu,
  User,
} from "lucide-react";
import Logo from "../Logo";
import { habits } from "./data";

const tabs = [
  { label: "Главная", Icon: House, active: true },
  { label: "Статистика", Icon: ChartNoAxesColumn, active: false },
  { label: "Профиль", Icon: User, active: false },
];

export default function PhoneMockup() {
  return (
    <div
      aria-hidden="true"
      className="absolute -right-5 top-[100px] isolate h-[420px] w-[210px] overflow-hidden rounded-[36px] border-[5px] border-[#161224] bg-gradient-to-b from-[#070510] to-[#030207] p-4 text-white shadow-[0_25px_60px_-20px_rgba(139,92,246,0.4),_0_0_50px_0px_rgba(59,130,246,0.1),_inset_0_0_2px_1px_rgba(255,255,255,0.08)] [transform:perspective(1400px)_rotateY(-14deg)_rotateX(3deg)]"
    >
      <div className="mx-auto h-3.5 w-14 rounded-full bg-black/90 ring-1 ring-white/5" />

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Logo className="h-4 w-4" />
          <span className="text-[10px] font-semibold">Трекер</span>
        </div>
        <button className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 transition hover:bg-white/10 active:scale-95">
          <Menu className="h-3 w-3 text-slate-300/70" strokeWidth={2.5} />
        </button>
      </div>

      <p className="mt-4 text-[9px] font-medium text-slate-400/40">
        Сегодня, 30 сентября
      </p>

      <div className="relative mx-auto mt-4 h-[96px] w-[96px] drop-shadow-[0_0_15px_rgba(139,92,246,0.4)]">
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
          <circle cx="50" cy="50" r="42" stroke="#120E1E" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="url(#ht-ring)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="263.9"
            strokeDashoffset="158.3"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[19px] font-extrabold leading-none tracking-tight bg-gradient-to-b from-white to-slate-200 bg-clip-text text-transparent">
            2/5
          </span>
          <span className="mt-1 text-[7px] font-semibold tracking-wide text-slate-400/40 uppercase">
            привычек
          </span>
        </div>
      </div>

      <ul className="mt-5 space-y-1">
        {habits.map((h) => (
          <li
            key={h.label}
            className="flex items-center gap-2.5 rounded-xl border border-white/[0.01] bg-white/[0.02] px-2.5 py-2 text-[9px] font-medium text-slate-200/70 transition hover:bg-white/[0.04]"
          >
            <span
              className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                h.done
                  ? "bg-[linear-gradient(135deg,#8B5CF6_0%,#3B82F6_100%)] text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                  : "border border-white/15 bg-black/40"
              }`}
            >
              {h.done && <Check className="h-2 w-2" strokeWidth={4.5} />}
            </span>
            <span
              className={h.done ? "text-slate-100/90" : "text-slate-400/50"}
            >
              {h.label}
            </span>
            <ChevronRight
              className="ml-auto h-2.5 w-2.5 text-slate-500/20"
              strokeWidth={3}
            />
          </li>
        ))}
      </ul>

      <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-white/[0.04] bg-[#070510]/92 px-3 pb-3 pt-2 backdrop-blur-md">
        {tabs.map(({ label, Icon, active }) => (
          <button
            key={label}
            className={`flex flex-col items-center gap-1 text-[7px] font-medium transition-colors ${
              active
                ? "text-[#8B5CF6] drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                : "text-slate-500 hover:text-slate-400"
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={active ? 2.5 : 2} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
