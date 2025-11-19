import { useEffect } from "react";

export function useEscapeKey(callback: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") callback();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callback, enabled]);
}
