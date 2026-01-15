import { useSyncExternalStore } from "react";
import { isMobile } from "@/lib/utils";

let isScrollIdle = true;
let scrollTimeoutId: number | null = null;
let listenersAttached = false;
const listeners = new Set<() => void>();
let mobileCache: boolean | null = null;

const getIsMobile = () => {
  if (mobileCache === null && typeof window !== "undefined") {
    mobileCache = isMobile();
  }
  return mobileCache ?? false;
};

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

const setScrollIdle = (nextIdle: boolean) => {
  if (isScrollIdle === nextIdle) return;
  isScrollIdle = nextIdle;
  notifyListeners();
};

const handleScroll = () => {
  setScrollIdle(false);
  if (scrollTimeoutId) {
    window.clearTimeout(scrollTimeoutId);
  }
  const scrollIdleTimeout = getIsMobile() ? 50 : 150;
  scrollTimeoutId = window.setTimeout(() => {
    setScrollIdle(true);
  }, scrollIdleTimeout);
};

const attachListeners = () => {
  if (listenersAttached || typeof window === "undefined") return;
  listenersAttached = true;
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("touchmove", handleScroll, { passive: true });
};

const detachListeners = () => {
  if (!listenersAttached || typeof window === "undefined") return;
  listenersAttached = false;
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("touchmove", handleScroll);
  if (scrollTimeoutId) {
    window.clearTimeout(scrollTimeoutId);
    scrollTimeoutId = null;
  }
  setScrollIdle(true);
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  attachListeners();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      detachListeners();
    }
  };
};

const getSnapshot = () => isScrollIdle;

const getServerSnapshot = () => true;

export const useScrollIdle = () => {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
