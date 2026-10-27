import { Check, RotateCcw, Sparkles } from "lucide-react";
import { icons } from "@/app/habits/data";
import { streak, weekDays } from "./data";

export const PHONE_RING = 2 * Math.PI * 52;

export default function PhoneMockup() {
  const Icon = icons[streak.icon];
  const left = streak.goal - streak.days;

  return (
    <div className="h-[432px] w-[214px] rounded-[40px] bg-[linear-gradient(160deg,#2c2546_0%,#151124_55%,#0c0916_100%)] p-[6px] shadow-[0_40px_70px_-25px_rgba(0,0,0,0.95),0_30px_60px_-20px_rgba(139,92,246,0.55),inset_0_1px_0_rgba(255,255,255,0.2)] [transform:perspective(1600px)_rotateY(-11deg)_rotateX(5deg)]">
      <div className="relative isolate flex h-full w-full flex-col overflow-hidden rounded-[34px] bg-[#0B0F1A] px-4 pb-4 pt-2.5 text-white">
        <div className="pointer-events-none absolute -right-20 -top-16 -z-10 h-56 w-56 rounded-full bg-[#8B5CF6]/25 blur-3xl" />
        <div className="mk-shine pointer-events-none absolute inset-0 z-20" />

        <div className="mx-auto h-[18px] w-[70px] rounded-full bg-black ring-1 ring-white/6" />

        <div className="mt-3.5 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6366F1]/18 text-[#A5B4FC]">
            <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
          </span>
          <div className="leading-none">
            <p className="text-[12px] font-semibold">{streak.name}</p>
            <p className="mt-1 text-[9px] text-slate-400">
              Цель {streak.goal} дней
            </p>
          </div>
        </div>

        <div className="relative mx-auto mt-3.5 h-[124px] w-[124px]">
          <svg viewBox="0 0 124 124" className="h-full w-full -rotate-90">
            <defs>
              <linearGradient id="mk-phone-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#C4B5FD" />
              </linearGradient>
            </defs>
            <circle
              cx="62"
              cy="62"
              r="52"
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="9"
            />
            <circle
              cx="62"
              cy="62"
              r="52"
              fill="none"
              stroke="url(#mk-phone-ring)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={PHONE_RING}
              strokeDashoffset={PHONE_RING * (1 - streak.days / streak.goal)}
              className="mk-ring drop-shadow-[0_0_10px_rgba(139,92,246,0.6)]"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="mk-count font-display text-[34px] font-bold leading-none tracking-tight tabular-nums" />
            <span className="mt-1 text-[9px] font-medium text-slate-400">
              из {streak.goal} дней
            </span>
          </div>
        </div>

        <p className="mt-2.5 text-center text-[10px] text-slate-300">
          До цели осталось{" "}
          <span className="font-semibold text-white">{left} дней</span>
        </p>

        <div className="mt-3 grid grid-cols-7 gap-1">
          {weekDays.map((d, i) => {
            const today = i === weekDays.length - 1;
            return (
              <div key={d} className="flex flex-col items-center gap-1">
                <span
                  style={{ animationDelay: `${1.5 + i * 0.07}s` }}
                  className={`mk-pop flex h-5 w-5 items-center justify-center rounded-full ${
                    today
                      ? "bg-[linear-gradient(135deg,#6366F1,#A78BFA)] text-white shadow-[0_0_12px_rgba(139,92,246,0.7)]"
                      : "bg-emerald-400/15 text-emerald-300"
                  }`}
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={4} />
                </span>
                <span
                  className={`text-[7.5px] font-medium ${today ? "text-white" : "text-slate-500"}`}
                >
                  {d}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 rounded-2xl border border-[#8B5CF6]/25 bg-[linear-gradient(135deg,rgba(99,102,241,0.16),rgba(139,92,246,0.06))] p-2.5">
          <p className="flex items-center gap-1 text-[9px] font-semibold text-[#C4B5FD]">
            <Sparkles className="h-3 w-3" strokeWidth={2.4} />
            Совет на сегодня
          </p>
          <p className="mt-1 text-[9.5px] leading-snug text-slate-300">
            Тянет после кофе? Смени ритуал: пять минут прогулки вместо
            перекура.
          </p>
        </div>

        <div className="mt-auto flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-[10px] font-medium text-slate-300">
          <RotateCcw className="h-3 w-3" strokeWidth={2.4} />
          Сорвался
        </div>
      </div>
    </div>
  );
}
