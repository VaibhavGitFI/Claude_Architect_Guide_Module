"use client";

import { useEffect, useState } from "react";

// Animated width-fill bar (progress/accuracy/coverage indicators throughout
// the app). Width animates in on mount/update rather than snapping instantly.
export default function Bar({ value = 0, color, h = 8, trackClassName = "" }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 80);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div
      className={`rounded-full overflow-hidden bg-border-soft ${trackClassName}`}
      style={{ height: h }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-[900ms] ease-out"
        style={{ width: `${w}%`, background: color || "var(--accent)" }}
      />
    </div>
  );
}
