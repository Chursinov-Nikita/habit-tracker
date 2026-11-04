"use client";

import { useEffect, useState } from "react";

export default function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => {
      const height = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      setKeyboardHeight(height);
      if (height > 0) {
        requestAnimationFrame(() =>
          document.activeElement?.scrollIntoView({ block: "nearest" }),
        );
      }
    };
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return keyboardHeight;
}
