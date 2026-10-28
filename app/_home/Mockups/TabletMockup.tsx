import Image from "next/image";
import { Check } from "lucide-react";
import { asset } from "@/app/lib/asset";
import { icons } from "@/app/habits/data";
import { calendar, tracked, weekDays, type DayState } from "./data";

const cellStyles: Record<DayState, string> = {
  empty: "",
  clean: "mk-cell bg-emerald-400/12 text-emerald-200/90 ring-1 ring-inset ring-emerald-400/20",
  relapse: "mk-cell bg-rose-500/18 text-rose-200 ring-1 ring-inset ring-rose-400/30",
  today:
    "mk-cell mk-today bg-[linear-gradient(135deg,#6366F1_0%,#A78BFA_100%)] font-bold text-white",
  future: "text-slate-600",
};

export default function TabletMockup() {
  return (
    <div className="h-[350px] w-[460px] rounded-[30px] bg-[linear-gradient(160deg,#2a2342_0%,#141022_55%,#0c0916_100%)] p-[6px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9),0_30px_70px_-25px_rgba(139,92,246,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] [transform:perspective(1600px)_rotateY(-11deg)_rotateX(5deg)]">
      <div className="relative isolate flex h-full w-full flex-col overflow-hidden rounded-[24px] bg-[#0B0F1A] text-white">
        <div className="pointer-events-none absolute -left-16 -top-24 -z-10 h-64 w-64 rounded-full bg-[#8B5CF6]/22 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(118deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.015)_32%,transparent_50%)]" />

        <div className="flex items-center justify-between border-b border-white/6 px-5 py-3">
          <div className="flex items-center gap-1.5">
            <Image src={asset("/logo.svg")} alt="" width={16} height={16} />
            <span className="text-[11px] font-semibold">Трекер</span>
          </div>
          <div className="flex items-center gap-3.5 text-[9.5px] font-semibold text-white/45">
            <span>Привычки</span>
            <span>Медитация</span>
            <span className="text-white">Календарь</span>
          </div>
          <span className="h-5 w-5 rounded-full bg-[linear-gradient(135deg,#6366F1,#A78BFA)] ring-1 ring-white/20" />
        </div>

        <div className="flex min-h-0 flex-1 gap-3 p-4">
          <div className="w-[262px] shrink-0">
            <p className="font-display text-[17px] font-bold leading-none tracking-tight">
              Твои дни
            </p>
            <p className="mt-1.5 text-[9.5px] text-slate-400">
              Зелёные — без срывов
            </p>

            <div className="mt-3 grid grid-cols-7 gap-[5px] text-center text-[8px] font-medium text-slate-500">
              {weekDays.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="mt-1.5 grid grid-cols-7 gap-[5px]">
              {calendar.map((cell, i) => (
                <span
                  key={i}
                  style={{ animationDelay: `${0.55 + i * 0.028}s` }}
                  className={`flex h-[31px] items-start rounded-[8px] px-1.5 pt-1 text-[9px] font-semibold tabular-nums ${cellStyles[cell.state]}`}
                >
                  {cell.day}
                </span>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-white/8 bg-white/[0.035] p-3">
            <p className="text-[11px] font-semibold">Сегодня</p>
            <ul className="mt-2.5 flex flex-col gap-2">
              {tracked.map((h, i) => {
                const Icon = icons[h.icon];
                const done = h.days >= h.goal;
                return (
                  <li
                    key={h.name}
                    className="rounded-xl border border-white/6 bg-[#111827]/80 p-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                          done
                            ? "bg-emerald-400/15 text-emerald-300"
                            : "bg-[#6366F1]/18 text-[#A5B4FC]"
                        }`}
                      >
                        <Icon className="h-3 w-3" strokeWidth={2.4} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[10px] font-semibold">
                        {h.name}
                      </span>
                      {done ? (
                        <Check
                          className="h-3 w-3 text-emerald-300"
                          strokeWidth={3}
                        />
                      ) : (
                        <span className="text-[9px] font-semibold tabular-nums text-slate-400">
                          {h.days}/{h.goal}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/8">
                      <div
                        style={{
                          width: `${(h.days / h.goal) * 100}%`,
                          animationDelay: `${1.3 + i * 0.12}s`,
                        }}
                        className={`mk-bar h-full rounded-full ${
                          done
                            ? "bg-emerald-400"
                            : "bg-[linear-gradient(90deg,#6366F1,#A78BFA)]"
                        }`}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-auto pt-2 text-[9px] leading-snug text-slate-400">
              Рекорд <span className="font-semibold text-white">21 день</span>
              <br />
              Срывов за месяц <span className="font-semibold text-white">1</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
