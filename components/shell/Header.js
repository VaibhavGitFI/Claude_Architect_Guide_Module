"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, RotateCcw } from "lucide-react";
import { useUser } from "@/lib/useUser";
import { useHasMounted } from "@/lib/useHasMounted";
import { resetAllProgress } from "@/lib/progress";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const mounted = useHasMounted();
  const { user, setUser, ready } = useUser();

  const handleReset = () => {
    if (!confirm(`Reset all progress for "${user}"? This cannot be undone.`)) return;
    resetAllProgress(user);
    window.location.reload();
  };

  // Uncontrolled input keyed by the resolved user: when `user` changes
  // externally (e.g. another tab), React remounts the input with the new
  // defaultValue instead of needing a state-sync effect.
  const displayValue = ready && user !== "default" ? user : "";

  return (
    <header className="flex items-center justify-between h-14 px-5 shrink-0 bg-shell-bg border-b border-shell-border text-shell-text">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs">CA</span>
        </div>
        <div className="leading-tight">
          <div className="font-bold text-sm tracking-tight">Claude Certified Architect</div>
          <div className="text-[10.5px] text-shell-text-muted">Exam Preparation Module</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="w-8 h-8 rounded-full bg-shell-hover border border-shell-border flex items-center justify-center text-shell-text-muted hover:text-shell-text hover:border-accent transition-colors"
        >
          {mounted && theme === "dark" ? (
            <Sun size={15} strokeWidth={2} />
          ) : (
            <Moon size={15} strokeWidth={2} />
          )}
        </button>

        <label className="text-[11.5px] text-shell-text-muted hidden sm:inline">User</label>
        <input
          key={displayValue}
          defaultValue={displayValue}
          onBlur={(e) => setUser(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setUser(e.target.value)}
          placeholder="Enter your name"
          className="bg-shell-hover border border-shell-border text-shell-text placeholder:text-shell-text-muted rounded-md px-3 py-1.5 text-sm w-32 sm:w-40 focus:border-accent focus:bg-shell-active outline-none transition-colors"
        />
        <button
          onClick={handleReset}
          title="Clear this user's progress"
          className="flex items-center gap-1.5 bg-shell-hover border border-shell-border text-shell-text-muted hover:text-shell-text hover:border-accent rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-colors"
        >
          <RotateCcw size={12} strokeWidth={2} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  );
}
