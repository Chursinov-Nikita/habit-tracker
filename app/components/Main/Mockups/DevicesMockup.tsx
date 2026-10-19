import { Bell, Trophy } from "lucide-react";
import PhoneMockup from "@/app/components/main/Mockups/PhoneMockup";
import TabletMockup from "@/app/components/main/Mockups/TabletMockup";

const glass =
  "rounded-2xl border border-white/15 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_0_20px_rgba(255,255,255,0.04),0_18px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl backdrop-saturate-150";

export default function DevicesMockup() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto h-[270px] w-[333px] max-[359px]:h-[218px] max-[359px]:w-[269px] min-[480px]:max-[639px]:h-[338px] min-[480px]:max-[639px]:w-[416px] sm:h-[416px] sm:w-[512px] lg:mx-0 lg:ml-auto lg:h-[364px] lg:w-[448px] xl:h-[468px] xl:w-[576px]"
    >
      <style>{`@keyframes ht-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@keyframes ht-ring-fill{from{stroke-dashoffset:263.9}}@keyframes ht-draw{from{stroke-dashoffset:1}}`}</style>

      <div className="absolute left-0 top-0 h-[520px] w-[640px] origin-top-left scale-[0.52] max-[359px]:scale-[0.42] min-[480px]:max-[639px]:scale-[0.65] sm:scale-[0.8] lg:scale-[0.7] xl:scale-90">
        <div className="pointer-events-none absolute left-[40px] top-[80px] h-[360px] w-[360px] rounded-full bg-[#8B5CF6]/25 blur-[100px]" />
        <div className="pointer-events-none absolute left-[340px] top-[170px] h-[300px] w-[300px] rounded-full bg-[#3B82F6]/20 blur-[100px]" />

        <TabletMockup />
        <PhoneMockup />

        <div
          className={`${glass} absolute -top-3.5 left-[380px] z-20 flex animate-[ht-float_6s_ease-in-out_-2s_infinite] items-center gap-3 px-3.5 py-3 motion-reduce:animate-none max-[479px]:hidden`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#8B5CF6_0%,#3B82F6_100%)] text-white shadow-[0_0_18px_rgba(139,92,246,0.55)]">
            <Trophy className="h-[18px] w-[18px]" strokeWidth={2.4} />
          </div>
          <div className="whitespace-nowrap">
            <p className="text-[13px] font-semibold leading-4 text-white">
              Неделя без курения
            </p>
            <p className="text-[11px] leading-4 text-slate-300/70">
              Достижение разблокировано
            </p>
          </div>
        </div>

        <div
          className={`${glass} absolute -left-9 top-[462px] z-20 flex animate-[ht-float_7s_ease-in-out_-4s_infinite] items-center gap-3 px-3.5 py-3 motion-reduce:animate-none max-[479px]:hidden`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-[#A78BFA]">
            <Bell className="h-[18px] w-[18px]" strokeWidth={2.4} />
          </div>
          <div className="whitespace-nowrap">
            <p className="text-[13px] font-semibold leading-4 text-white">
              Напоминание
            </p>
            <p className="text-[11px] leading-4 text-slate-300/70">
              Отметь привычки за сегодня
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
