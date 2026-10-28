"use client";

import { useEffect, useRef, type ComponentType } from "react";
import { sound } from "@/app/lib/sound";

const COLORS = ["#8B5CF6", "#6366F1", "#A78BFA", "#C4B5FD", "#34D399", "#FBBF24", "#F472B6", "#FFFFFF"];

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  sway: number;
  color: string;
  round: boolean;
};

const burst = (x: number, y: number, direction: number, count: number, power: number): Piece[] =>
  Array.from({ length: count }, () => {
    const angle = (-90 + direction * 22 + (Math.random() - 0.5) * 50) * (Math.PI / 180);
    const speed = power * (0.7 + Math.random() * 0.5);
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 6 + Math.random() * 6,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      sway: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      round: Math.random() < 0.3,
    };
  });

export default function Celebration({
  icon: Icon,
  eyebrow,
  title,
  text,
  onClose,
}: {
  icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  text: string;
  onClose: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    sound.celebrate();
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ratio = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    el.width = width * ratio;
    el.height = height * ratio;
    ctx.scale(ratio, ratio);

    const gravity = 0.25;
    const power = Math.sqrt(2 * gravity * height * 0.75) * 1.15;
    const fall = 3.2;
    let pieces = [
      ...burst(width * 0.1, height, 1, 70, power),
      ...burst(width * 0.9, height, -1, 70, power),
    ];
    const started = performance.now();
    let frame = 0;
    let second = false;

    const tick = (time: number) => {
      const elapsed = time - started;
      if (!second && elapsed > 500) {
        second = true;
        pieces = pieces.concat(burst(width / 2, height, 0, 60, power * 0.95));
      }
      ctx.clearRect(0, 0, width, height);
      const fade = elapsed > 3300 ? Math.max(0, 1 - (elapsed - 3300) / 900) : 1;
      pieces.forEach((p) => {
        p.vy = Math.min(p.vy + gravity, fall);
        p.vx *= p.vy > 0 ? 0.96 : 0.995;
        p.sway += 0.08;
        p.x += p.vx + (p.vy > 0 ? Math.sin(p.sway) * 0.9 : 0);
        p.y += p.vy;
        p.rotation += p.spin;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      });
      if (fade > 0) frame = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, width, height);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.classList.add("overflow-hidden");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-[cl-fade_0.25s_ease-out] motion-reduce:animate-none"
    >
      <style>{`
        @keyframes cl-fade{from{opacity:0}}
        @keyframes cl-pop{from{opacity:0;transform:translateY(24px) scale(.9)}}
        @keyframes cl-badge{0%{transform:scale(.4) rotate(-12deg);opacity:0}60%{transform:scale(1.12) rotate(4deg);opacity:1}100%{transform:none}}
        @keyframes cl-glow{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}
      `}</style>
      <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 h-full w-full" />
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-[#8B5CF6]/40 bg-[#111827] px-6 pb-6 pt-8 text-center shadow-[0_0_80px_-20px_rgba(139,92,246,0.9)] animate-[cl-pop_0.5s_cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none"
      >
        <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#8B5CF6]/35 blur-3xl animate-[cl-glow_2.4s_ease-in-out_infinite] motion-reduce:animate-none" />
        <span className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FBBF24_0%,#F59E0B_45%,#8B5CF6_100%)] text-white shadow-[0_0_40px_-4px_rgba(251,191,36,0.7)] animate-[cl-badge_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.15s_both] motion-reduce:animate-none">
          <Icon className="h-10 w-10" />
        </span>
        <p className="relative mt-5 text-xs font-semibold text-[#C4B5FD]">{eyebrow}</p>
        <h2 id="celebration-title" className="relative mt-1 font-display text-2xl font-bold text-white">
          {title}
        </h2>
        <p className="relative mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-300">{text}</p>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="relative mt-6 w-full rounded-xl bg-[#6366F1] py-3 text-sm font-semibold text-white shadow-lg shadow-[#6366F1]/30 transition hover:bg-[#5558E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]/70 active:scale-[0.98]"
        >
          Продолжить
        </button>
      </div>
    </div>
  );
}
