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
      className="absolute left-0 top-[60px] isolate flex h-[345px] w-[440px] overflow-hidden rounded-[22px] border border-white/15 bg-[#0B0F1A]/85 shadow-[0_30px_80px_-20px_rgba(139,92,246,0.55)] backdrop-blur-md [transform:perspective(1400px)_rotateY(-14deg)_rotateX(3deg)]"
    >
      <div className="relative w-[116px] shrink-0 border-r border-white/10 p-4">
        <div className="flex items-center gap-1.5">
          <Logo className="h-4 w-4" />
          <span className="text-[10px] font-semibold">HabitTrack</span>
        </div>
        <ul className="mt-5 space-y-1">
          {nav.map(({ label, Icon, active }) => (
            <li
              key={label}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[9px] ${
                active ? "bg-[#8B5CF6]/20 text-[#8B5CF6]" : "text-white/60"
              }`}
            >
              <Icon className="h-3 w-3" strokeWidth={2} />
              {label}
            </li>
          ))}
        </ul>
        <svg
          className="absolute bottom-6 left-3 w-[92px]"
          viewBox="0 0 100 30"
          fill="none"
        >
          <path
            d="M0 22 C15 22 20 5 35 12 S55 28 70 14 S90 6 100 10"
            stroke="#8B5CF6"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="relative flex-1 p-5">
        <X
          className="absolute right-4 top-3 h-3 w-3 text-white/50"
          strokeWidth={2}
        />
        <p className="text-[15px] font-semibold">Мои привычки</p>
        <p className="mt-1 text-[9px] text-white/50">Сегодня, 30 сентября</p>
        <ul className="mt-3">
          {habits.map((h) => (
            <li
              key={h.label}
              className="flex items-center gap-3 border-b border-white/5 px-1 py-1.5 text-[11px]"
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  h.done
                    ? "bg-[#22D3EE] text-[#0B0F1A]"
                    : "border border-white/40"
                }`}
              >
                {h.done && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
              </span>
              {h.label}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-[#1F2937]/60 px-4 py-3">
          <div>
            <p className="text-[15px] font-semibold">7 дней</p>
            <p className="text-[8px] text-white/50">без вредных привычек</p>
          </div>
          <TrendingUp className="h-8 w-8 text-[#22D3EE]" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
