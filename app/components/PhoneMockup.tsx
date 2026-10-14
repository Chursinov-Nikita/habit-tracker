import {
  ChartNoAxesColumn,
  Check,
  ChevronRight,
  House,
  Menu,
  User,
} from "lucide-react";
import Logo from "./Logo";
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
      className="absolute right-2 top-[100px] isolate h-[350px] w-[176px] overflow-hidden rounded-[30px] border-[3px] border-[#3B4A8C]/70 bg-[#0B0F1A] p-3 shadow-[0_30px_80px_-20px_rgba(59,130,246,0.6)] [transform:perspective(1400px)_rotateY(-8deg)_rotateZ(2deg)]"
    >
      <div className="mx-auto h-1 w-12 rounded-full bg-white/10" />
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Logo className="h-3 w-3" />
          <span className="text-[8px] font-semibold">HabitTrack</span>
        </div>
        <Menu className="h-3 w-3 text-white/60" strokeWidth={2} />
      </div>
      <p className="mt-3 text-[8px] text-white/60">Сегодня, 30 сентября</p>

      <div className="relative mx-auto mt-3 h-[84px] w-[84px]">
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 100 100"
          fill="none"
        >
          <defs>
            <linearGradient id="ht-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8B5CF6" />
              <stop offset="1" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="42" stroke="#1F2937" strokeWidth="7" />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="url(#ht-ring)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="263.9"
            strokeDashoffset="158.3"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[17px] font-semibold leading-none">2/5</span>
          <span className="mt-1 text-[6px] text-white/50">привычек</span>
        </div>
      </div>

      <ul className="mt-3">
        {habits.map((h) => (
          <li
            key={h.label}
            className="flex items-center gap-2 border-b border-white/5 py-1.5 text-[8px]"
          >
            <span
              className={`flex h-3 w-3 items-center justify-center rounded-full ${
                h.done
                  ? "bg-[#22D3EE] text-[#0B0F1A]"
                  : "border border-white/40"
              }`}
            >
              {h.done && <Check className="h-2 w-2" strokeWidth={4} />}
            </span>
            {h.label}
            <ChevronRight
              className="ml-auto h-2.5 w-2.5 text-white/40"
              strokeWidth={2.5}
            />
          </li>
        ))}
      </ul>

      <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-white/10 bg-[#0B0F1A] px-3 py-2">
        {tabs.map(({ label, Icon, active }) => (
          <span
            key={label}
            className={`flex flex-col items-center gap-0.5 text-[6px] ${active ? "text-[#8B5CF6]" : "text-white/50"}`}
          >
            <Icon className="h-3 w-3" strokeWidth={2} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
