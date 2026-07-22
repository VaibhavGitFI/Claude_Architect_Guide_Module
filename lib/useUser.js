"use client";

/*
 * Replaces v1/app.js's currentUser() DOM lookup. No auth — just a plain
 * name used to namespace localStorage, same as before.
 *
 * Uses useSyncExternalStore (not useEffect+setState) so the SSR snapshot
 * (DEFAULT_USER) and the post-hydration client snapshot (localStorage) are
 * both correct without a synchronous setState-in-effect render cascade.
 */
import { useSyncExternalStore, useCallback } from "react";
import { STORAGE_PREFIX } from "./constants";

const DEFAULT_USER = "default";
const LAST_USER_KEY = `${STORAGE_PREFIX}_lastUser`;

function subscribe(callback) {
  window.addEventListener("cca-user-change", callback);
  return () => window.removeEventListener("cca-user-change", callback);
}
function getSnapshot() {
  try {
    return localStorage.getItem(LAST_USER_KEY) || DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}
function getServerSnapshot() {
  return DEFAULT_USER;
}
const readySubscribe = () => () => {};

export function useUser() {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(readySubscribe, () => true, () => false);

  const setUser = useCallback((name) => {
    const trimmed = (name || "").trim() || DEFAULT_USER;
    try {
      localStorage.setItem(LAST_USER_KEY, trimmed);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("cca-user-change"));
  }, []);

  return { user, setUser, ready };
}
