"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { signOut } from "next-auth/react";
import {
  Check,
  Clock,
  Flame,
  LogOut,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  bio: string | null;
  createdAt: string;
  providers: string[];
  stats: {
    habits: number;
    bestStreak: number;
    relapses: number;
    goalsDone: number;
    sessions: number;
    minutes: number;
  };
};

const providerNames: Record<string, string> = {
  google: "Google",
  github: "GitHub",
};

const plural = (n: number) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дня";
  return "дней";
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    axios
      .get("/api/profile")
      .then(({ data }) => {
        setProfile(data);
        setName(data.name ?? "");
        setBio(data.bio ?? "");
        setLoaded(true);
      })
      .catch((e) => {
        if (e?.response?.status === 401) {
          router.replace("/");
          return;
        }
        setError(true);
        setLoaded(true);
      });
  }, [router]);

  const dirty =
    profile !== null &&
    (name.trim() !== (profile.name ?? "") ||
      bio.trim() !== (profile.bio ?? ""));

  const save = async () => {
    if (!dirty || !name.trim() || saving) return;
    setSaving(true);
    setError(false);
    try {
      const { data } = await axios.patch("/api/profile", { name, bio });
      setProfile((prev) =>
        prev ? { ...prev, name: data.name, bio: data.bio } : prev,
      );
      setName(data.name ?? "");
      setBio(data.bio ?? "");
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch {
      setError(true);
    }
    setSaving(false);
  };

  const stats = profile
    ? [
        {
          label: "Привычек в работе",
          value: String(profile.stats.habits),
          icon: Target,
        },
        {
          label: "Лучшая серия",
          value: `${profile.stats.bestStreak} ${plural(profile.stats.bestStreak)}`,
          icon: Flame,
        },
        {
          label: "Целей достигнуто",
          value: String(profile.stats.goalsDone),
          icon: Trophy,
        },
        {
          label: "Срывов",
          value: String(profile.stats.relapses),
          icon: RotateCcw,
        },
        {
          label: "Сессий медитации",
          value: String(profile.stats.sessions),
          icon: Sparkles,
        },
        {
          label: "Минут медитации",
          value: String(profile.stats.minutes),
          icon: Clock,
        },
      ]
    : [];

  return (
    <main
      className={`relative min-h-screen px-4 pb-16 pt-28 text-white transition-opacity duration-300 sm:px-6 sm:pt-36 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative mx-auto max-w-5xl">
        {profile ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="rounded-3xl border border-white/10 bg-[#111827]/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
              <div className="flex items-center gap-4">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-20 w-20 shrink-0 rounded-full border border-white/15 object-cover"
                  />
                ) : (
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#6366F1] text-3xl font-bold text-white">
                    {(profile.name ?? profile.email ?? "?")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-bold sm:text-3xl">
                    {profile.name ?? "Без имени"}
                  </h1>
                  <p className="mt-1 truncate text-sm text-slate-400">
                    {profile.email ?? "Email не указан"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {profile.providers.map((provider) => (
                      <span
                        key={provider}
                        className="rounded-md bg-[#6366F1]/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#A5B4FC]"
                      >
                        {providerNames[provider] ?? provider}
                      </span>
                    ))}
                    <span className="text-xs text-slate-500">
                      С нами с{" "}
                      {new Date(profile.createdAt).toLocaleDateString("ru-RU", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="profile-name"
                      className="text-sm font-medium text-slate-300"
                    >
                      Имя
                    </label>
                    <span className="text-xs tabular-nums text-slate-600">
                      {name.length}/40
                    </span>
                  </div>
                  <input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={40}
                    placeholder="Как к тебе обращаться"
                    className="w-full rounded-xl border border-white/10 bg-[#0B0F1A] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-[#6366F1]/60 focus:ring-4 focus:ring-[#6366F1]/10"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="profile-bio"
                      className="text-sm font-medium text-slate-300"
                    >
                      О себе
                    </label>
                    <span className="text-xs tabular-nums text-slate-600">
                      {bio.length}/160
                    </span>
                  </div>
                  <textarea
                    id="profile-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={160}
                    rows={4}
                    placeholder="Зачем ты бросаешь привычки"
                    className="w-full resize-none rounded-xl border border-white/10 bg-[#0B0F1A] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-[#6366F1]/60 focus:ring-4 focus:ring-[#6366F1]/10"
                  />
                </div>

                {error && (
                  <p className="text-sm text-rose-400">
                    Не удалось сохранить, попробуй ещё раз
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={save}
                    disabled={!dirty || !name.trim() || saving}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-slate-600 disabled:shadow-none ${
                      saved
                        ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                        : "bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/25 hover:bg-[#5558E8]"
                    }`}
                  >
                    {saved && <Check className="h-4 w-4" />}
                    {saving
                      ? "Сохраняем..."
                      : saved
                        ? "Сохранено"
                        : "Сохранить"}
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70"
                  >
                    <LogOut className="h-4 w-4" />
                    Выйти
                  </button>
                </div>
              </div>
            </section>

            <aside className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:self-start">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111827]/60 p-4 backdrop-blur"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6366F1]/15 text-[#6366F1]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xl font-semibold leading-none tabular-nums">
                        {stat.value}
                      </span>
                      <span className="mt-1.5 block text-xs text-slate-500">
                        {stat.label}
                      </span>
                    </span>
                  </div>
                );
              })}
            </aside>
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 bg-white/3 px-6 py-20 text-center">
            <p className="text-lg font-semibold">
              {error ? "Не удалось загрузить профиль" : "Загружаем профиль"}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
