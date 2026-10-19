"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  onGoogle?: () => void;
  onGithub?: () => void;
  loading?: "google" | "github" | null;
};

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="transition-transform duration-300 group-hover:scale-110"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="transition-transform duration-300 group-hover:scale-110"
    >
      <path
        fill="currentColor"
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"
      />
    </svg>
  );
}

export default function LoginModal({
  open,
  onClose,
  onGoogle,
  onGithub,
  loading = null,
}: LoginModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#8B5CF6]/30 bg-[#0B0F1A] p-6 shadow-[0_0_60px_-15px_rgba(139,92,246,0.6)] sm:p-8">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#8B5CF6]/30 blur-3xl" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="group absolute right-3 top-3 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-all duration-300 hover:border-[#8B5CF6]/60 hover:bg-[#8B5CF6]/15 hover:text-[#A78BFA] active:scale-95"
        >
          <X className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
        </button>

        <div className="relative text-center">
          <h2 id="login-modal-title" className="text-2xl font-bold text-white">
            Добро пожаловать
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Войдите, чтобы отслеживать свои привычки
          </p>
        </div>

        <div className="relative mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onGoogle}
            disabled={loading !== null}
            className="group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/25 hover:shadow-[0_8px_30px_-8px_rgba(139,92,246,0.8)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <span className="relative z-10 flex items-center gap-3">
              <GoogleIcon />
              {loading === "google" ? "Подключаемся..." : "Продолжить с Google"}
            </span>
            <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          </button>

          <button
            type="button"
            onClick={onGithub}
            disabled={loading !== null}
            className="group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/25 hover:shadow-[0_8px_30px_-8px_rgba(139,92,246,0.8)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <span className="relative z-10 flex items-center gap-3">
              <GithubIcon />
              {loading === "github" ? "Подключаемся..." : "Продолжить с GitHub"}
            </span>
            <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          </button>
        </div>

        <p className="relative mt-6 text-center text-xs text-white/40">
          Продолжая, вы соглашаетесь с условиями использования*
        </p>
      </div>
    </div>,
    document.body,
  );
}
