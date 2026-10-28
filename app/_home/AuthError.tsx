"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";

const authErrors: Record<string, string> = {
  AccessDenied:
    "Не удалось войти: email в аккаунте не подтверждён. Подтверди его в Google или GitHub и попробуй снова.",
  OAuthCallback:
    "Не удалось связаться с Google или GitHub: сервер не дождался ответа. Проверь подключение или VPN и попробуй ещё раз.",
  Callback:
    "Не удалось связаться с Google или GitHub. Проверь подключение или VPN и попробуй ещё раз.",
  OAuthAccountNotLinked:
    "Этот email уже привязан к другому способу входа. Войди тем способом, которым пользовался раньше.",
};

export default function AuthError() {
  const error = useSearchParams().get("error");
  if (!error) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-4 top-24 z-30 mx-auto flex max-w-lg items-start gap-3 rounded-2xl border border-rose-500/30 bg-[#1a1020]/90 px-4 py-3 text-sm text-rose-200 shadow-2xl shadow-black/40 backdrop-blur-xl"
    >
      <p className="flex-1 leading-relaxed">
        {authErrors[error] ?? "Не удалось войти. Попробуй ещё раз."}
      </p>
      <Link
        href="/"
        aria-label="Закрыть"
        className="rounded-lg p-1 text-rose-300/70 transition hover:bg-white/10 hover:text-rose-100"
      >
        <X className="h-4 w-4" />
      </Link>
    </div>
  );
}
