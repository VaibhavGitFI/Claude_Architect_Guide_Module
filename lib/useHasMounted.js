"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

// Standard hasMounted/isClient idiom via useSyncExternalStore (matches how
// next-themes solves the same problem internally) — avoids the
// setState-in-effect pattern for something that's really just "which
// snapshot am I in, server or client".
export function useHasMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
