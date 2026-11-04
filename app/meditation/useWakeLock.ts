"use client";

import { useEffect } from "react";

export default function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let stopped = false;

    const acquire = () =>
      navigator.wakeLock
        .request("screen")
        .then((sentinel) => {
          if (stopped) sentinel.release().catch(() => {});
          else lock = sentinel;
        })
        .catch(() => {});

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") acquire();
    };

    acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      lock?.release().catch(() => {});
    };
  }, [active]);
}
