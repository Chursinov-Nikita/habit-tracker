import { Check, Trophy } from "lucide-react";
import Parallax from "./Parallax";
import PhoneMockup, { PHONE_RING } from "./PhoneMockup";
import TabletMockup from "./TabletMockup";
import { streak } from "./data";

const glass =
  "rounded-2xl border border-white/12 bg-[#151129]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_20px_40px_-14px_rgba(0,0,0,0.8)] backdrop-blur-xl";

const styles = `
@property --mk-days { syntax: "<integer>"; inherits: false; initial-value: 0; }
@keyframes mk-tablet-in { from { opacity: 0; transform: translate3d(-36px, 28px, 0) scale(.94); filter: blur(8px); } }
@keyframes mk-phone-in { from { opacity: 0; transform: translate3d(28px, 70px, 0) rotate(3deg); filter: blur(8px); } }
@keyframes mk-chip-in { from { opacity: 0; transform: translateY(12px) scale(.9); } }
@keyframes mk-cell-on { from { background: rgba(255,255,255,.035); box-shadow: none; color: rgb(100 116 139); } }
@keyframes mk-today { 0%, 100% { box-shadow: 0 0 0 0 rgba(167,139,250,.55); } 50% { box-shadow: 0 0 0 5px rgba(167,139,250,0); } }
@keyframes mk-ring { from { stroke-dashoffset: ${PHONE_RING}; } }
@keyframes mk-count { from { --mk-days: 0; } }
@keyframes mk-bar { from { transform: scaleX(0); } }
@keyframes mk-pop { from { opacity: 0; transform: scale(.4); } }
@keyframes mk-shine { from { transform: translateX(-120%); } to { transform: translateX(120%); } }
@keyframes mk-drift { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }

.mk-layer { transform: translate3d(calc(var(--mx, 0) * var(--depth)), calc(var(--my, 0) * var(--depth)), 0); transition: transform .9s cubic-bezier(.16,1,.3,1); will-change: transform; }
.mk-drift { animation: mk-drift var(--drift, 9s) ease-in-out 2.6s infinite; }
.mk-tablet-in { animation: mk-tablet-in 1.1s cubic-bezier(.16,1,.3,1) .1s backwards; }
.mk-phone-in { animation: mk-phone-in 1.1s cubic-bezier(.16,1,.3,1) .5s backwards; }
.mk-chip-in { animation: mk-chip-in .7s cubic-bezier(.34,1.56,.64,1) backwards; }
.mk-cell { animation: mk-cell-on .5s ease-out backwards; }
.mk-today { animation: mk-cell-on .5s ease-out backwards, mk-today 2.4s ease-in-out 2.4s infinite; }
.mk-ring { animation: mk-ring 1.6s cubic-bezier(.65,0,.35,1) 1s backwards; }
.mk-count { --mk-days: ${streak.days}; counter-reset: mk-days var(--mk-days); animation: mk-count 1.6s cubic-bezier(.65,0,.35,1) 1s backwards; }
.mk-count::after { content: counter(mk-days); }
.mk-bar { transform-origin: left; animation: mk-bar 1s cubic-bezier(.65,0,.35,1) backwards; }
.mk-pop { animation: mk-pop .45s cubic-bezier(.34,1.56,.64,1) backwards; }
.mk-shine::before { content: ""; position: absolute; inset: 0; background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,.09) 50%, transparent 65%); transform: translateX(120%); animation: mk-shine 1.4s ease-in-out 2.2s backwards; }

@media (prefers-reduced-motion: reduce) {
  .mk-scene, .mk-scene *, .mk-scene *::before { animation: none !important; transition: none !important; }
}
`;

export default function DevicesMockup() {
  return (
    <Parallax className="mk-scene relative mx-auto h-[270px] w-[333px] max-[359px]:h-[218px] max-[359px]:w-[269px] min-[480px]:max-[639px]:h-[338px] min-[480px]:max-[639px]:w-[416px] sm:h-[416px] sm:w-[512px] lg:mx-0 lg:ml-auto lg:h-[364px] lg:w-[448px] xl:h-[468px] xl:w-[576px]">
      <style>{styles}</style>

      <div className="absolute left-0 top-0 h-[520px] w-[640px] origin-top-left scale-[0.52] max-[359px]:scale-[0.42] min-[480px]:max-[639px]:scale-[0.65] sm:scale-[0.8] lg:scale-[0.7] xl:scale-90">
        <div className="pointer-events-none absolute left-[60px] top-[90px] h-[340px] w-[340px] rounded-full bg-[#8B5CF6]/25 blur-[100px]" />
        <div className="pointer-events-none absolute left-[380px] top-[200px] h-[260px] w-[260px] rounded-full bg-[#6366F1]/22 blur-[100px]" />

        <div
          className="mk-layer absolute left-0 top-[40px]"
          style={{ "--depth": "-8px" } as React.CSSProperties}
        >
          <div className="mk-drift" style={{ "--drift": "11s" } as React.CSSProperties}>
            <div className="mk-tablet-in">
              <TabletMockup />
            </div>
          </div>
        </div>

        <div
          className="mk-layer absolute left-[404px] top-[64px] z-10"
          style={{ "--depth": "14px" } as React.CSSProperties}
        >
          <div className="mk-drift" style={{ "--drift": "9s" } as React.CSSProperties}>
            <div className="mk-phone-in">
              <PhoneMockup />
            </div>
          </div>
        </div>

        <div
          className="mk-layer absolute left-[262px] top-0 z-20 max-[479px]:hidden"
          style={{ "--depth": "22px" } as React.CSSProperties}
        >
          <div
            className={`${glass} mk-chip-in flex items-center gap-3 px-3.5 py-3`}
            style={{ animationDelay: "2.5s" }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#6366F1_0%,#A78BFA_100%)] text-white shadow-[0_0_18px_rgba(139,92,246,0.6)]">
              <Trophy className="h-[18px] w-[18px]" strokeWidth={2.4} />
            </span>
            <span className="whitespace-nowrap">
              <span className="block text-[13px] font-semibold leading-4 text-white">
                Новый рекорд
              </span>
              <span className="block text-[11px] leading-4 text-slate-300/75">
                {streak.days} день без курения
              </span>
            </span>
          </div>
        </div>

        <div
          className="mk-layer absolute left-[28px] top-[418px] z-20 max-[479px]:hidden"
          style={{ "--depth": "18px" } as React.CSSProperties}
        >
          <div
            className={`${glass} mk-chip-in flex items-center gap-3 px-3.5 py-3`}
            style={{ animationDelay: "2.75s" }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30">
              <Check className="h-[18px] w-[18px]" strokeWidth={3} />
            </span>
            <span className="whitespace-nowrap">
              <span className="block text-[13px] font-semibold leading-4 text-white">
                Цель взята
              </span>
              <span className="block text-[11px] leading-4 text-slate-300/75">
                14 дней без сладкого
              </span>
            </span>
          </div>
        </div>
      </div>
    </Parallax>
  );
}
