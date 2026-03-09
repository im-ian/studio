import { type RefObject, useEffect } from "react";

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  callback: () => void,
  enabled = true,
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    if (enabled) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback, enabled]);
}
