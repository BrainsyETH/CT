import { validateEvent } from "@/lib/validation";
import type { Event } from "@/lib/types";

const LOCAL_EVENTS_STORAGE_KEY = "chain-of-events:local-events";

const safeJsonParse = (value: string | null) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
};

export const getLocalEvents = (): Event[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = safeJsonParse(window.localStorage.getItem(LOCAL_EVENTS_STORAGE_KEY));
  if (!Array.isArray(stored)) {
    return [];
  }

  return stored
    .map((event) => validateEvent(event).event)
    .filter((event): event is Event => Boolean(event));
};

export const saveLocalEvent = (event: Event): Event[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const current = getLocalEvents();
  const next = [event, ...current];
  window.localStorage.setItem(LOCAL_EVENTS_STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const removeLocalEvent = (eventId: string): Event[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const current = getLocalEvents();
  const next = current.filter((event) => event.id !== eventId);
  window.localStorage.setItem(LOCAL_EVENTS_STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const clearLocalEvents = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LOCAL_EVENTS_STORAGE_KEY);
};

export const LOCAL_EVENTS_KEY = LOCAL_EVENTS_STORAGE_KEY;
