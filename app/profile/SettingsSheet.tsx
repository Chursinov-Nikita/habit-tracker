"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
} from "react";
import { ChevronRight, Download, Upload, Volume2, VolumeX, X } from "lucide-react";
import { exportData, importData } from "@/app/lib/local";
import { isSoundOn, setSoundOn, sound, subscribeSound } from "@/app/lib/sound";

const row =
  "flex min-h-14 w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/70";
const rowIcon =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-soft";

export default function SettingsSheet({ onClose }: { onClose: () => void }) {
  const [importError, setImportError] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const soundOn = useSyncExternalStore(subscribeSound, isSoundOn, () => true);
  const SoundIcon = soundOn ? Volume2 : VolumeX;

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

  const toggleSound = () => {
    setSoundOn(!soundOn);
    if (!soundOn) sound.select();
  };

  const downloadBackup = () => {
    sound.tap();
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreBackup = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      importData(await file.text());
      window.location.reload();
    } catch {
      setImportError(true);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="max-h-full w-full max-w-md overflow-y-auto overscroll-contain rounded-t-3xl border border-white/10 bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl shadow-black/50 sm:rounded-3xl sm:pb-5"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="settings-title" className="text-lg font-bold">
            Настройки
          </h2>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/3">
          <button
            type="button"
            role="switch"
            aria-checked={soundOn}
            onClick={toggleSound}
            className={row}
          >
            <span className={rowIcon}>
              <SoundIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1 text-sm font-medium">
              Звук и вибрация
            </span>
            <span
              className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                soundOn ? "bg-primary" : "bg-white/15"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white transition-transform motion-reduce:transition-none ${
                  soundOn ? "translate-x-5" : ""
                }`}
              />
            </span>
          </button>

          <button type="button" onClick={downloadBackup} className={row}>
            <span className={rowIcon}>
              <Download className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Сохранить копию</span>
              <span className="block text-xs text-slate-500">
                Файл со всеми данными
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
          </button>

          <button
            type="button"
            onClick={() => {
              setImportError(false);
              fileInput.current?.click();
            }}
            className={row}
          >
            <span className={rowIcon}>
              <Upload className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">
                Восстановить из копии
              </span>
              <span className="block text-xs text-slate-500">
                Заменит текущие данные
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
          </button>
        </div>

        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          onChange={restoreBackup}
          className="hidden"
        />

        {importError && (
          <p role="alert" className="mt-3 text-sm text-rose-400">
            Этот файл не похож на копию трекера
          </p>
        )}
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Данные хранятся только на этом устройстве. Сохраняй копию, чтобы не
          потерять их при смене телефона.
        </p>
      </div>
    </div>
  );
}
