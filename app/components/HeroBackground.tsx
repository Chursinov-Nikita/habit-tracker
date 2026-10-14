import HeroImage from "@/app/components/HeroImage";

export default function HeroBackground() {
  return (
    <>
      <svg
        className="absolute inset-x-0 bottom-0 -z-30 h-full max-h-[900px] w-full"
        viewBox="0 0 1440 780"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ht-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0B0F1A" />
            <stop offset="0.38" stopColor="#25175C" />
            <stop offset="0.68" stopColor="#6B2A8C" />
            <stop offset="1" stopColor="#B83C80" />
          </linearGradient>
          <radialGradient id="ht-glow" cx="0.64" cy="0.52" r="0.42">
            <stop offset="0" stopColor="#F59E6B" stopOpacity="0.5" />
            <stop offset="1" stopColor="#EC4899" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ht-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5B3BB0" />
            <stop offset="1" stopColor="#2A1D6B" />
          </linearGradient>
        </defs>
        <rect width="1440" height="780" fill="url(#ht-sky)" />
        <rect width="1440" height="780" fill="url(#ht-glow)" />
        <path
          d="M0 430 L120 370 L230 410 L340 320 L440 385 L550 270 L650 350 L770 215 L870 300 L970 160 L1090 290 L1190 250 L1310 335 L1440 290 L1440 780 L0 780Z"
          fill="url(#ht-far)"
          stroke="#EC4899"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        <path
          d="M0 530 L140 450 L260 505 L390 410 L530 495 L660 395 L790 485 L910 330 L1020 470 L1160 405 L1290 485 L1440 430 L1440 780 L0 780Z"
          fill="#241866"
          stroke="#8B5CF6"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        <path
          d="M0 625 L180 560 L320 610 L470 540 L620 605 L780 550 L940 610 L1100 560 L1260 610 L1440 570 L1440 780 L0 780Z"
          fill="#131540"
        />
      </svg>

      <HeroImage />

      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(11,15,26,0.6)_0%,rgba(11,15,26,0.15)_45%,rgba(11,15,26,0)_70%)] lg:bg-[linear-gradient(90deg,rgba(11,15,26,0.7)_0%,rgba(11,15,26,0)_60%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-[linear-gradient(to_bottom,rgba(11,15,26,0),#0B0F1A)]" />
    </>
  );
}
