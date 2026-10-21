export default function Background() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0B0F1A]"
    >
      <div className="absolute inset-0 bg-linear-to-b from-[#10163A] via-[#0B0F1A] to-[#080B14]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_75%)]" />
      <div className="absolute -top-40 left-1/2 h-120 w-225 -translate-x-1/2 rounded-full bg-[#6366F1]/20 blur-[140px]" />
      <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-[#8B5CF6]/10 blur-[120px]" />
      <div className="absolute -left-40 bottom-1/4 h-96 w-96 rounded-full bg-cyan-500/5 blur-[120px]" />
      <svg
        className="absolute inset-x-0 bottom-0 h-80 w-full text-[#6366F1]/10"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,320 L0,180 L140,110 L240,170 L400,40 L520,150 L660,70 L800,190 L960,60 L1100,160 L1240,90 L1440,180 L1440,320 Z"
        />
      </svg>
      <svg
        className="absolute inset-x-0 bottom-0 h-56 w-full text-[#6366F1]/6"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,320 L0,220 L180,120 L260,180 L420,60 L560,200 L700,110 L860,230 L1020,90 L1180,190 L1300,140 L1440,210 L1440,320 Z"
        />
      </svg>
    </div>
  );
}
