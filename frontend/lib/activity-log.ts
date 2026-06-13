export type ActivityEventType =
  | "booking-created"
  | "booking-updated"
  | "profile-updated"
  | "profile-photo-updated"
  | "preferences-updated"
  | "auth-login"
  | "auth-logout";

export type ActivityEvent = {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  createdAt: string;
  source: "local" | "backend";
};

const ACTIVITY_STORAGE_KEY = "pq.activity.events";

function generateId() {
  return `evt_${Math.random().toString(36).slice(2, 10)}`;
}

export function getActivityEvents() {
  if (typeof window === "undefined") return [] as ActivityEvent[];

  const raw = window.localStorage.getItem(ACTIVITY_STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as ActivityEvent[];
  } catch {
    return [];
  }
}

export function addActivityEvent(payload: Omit<ActivityEvent, "id" | "createdAt" | "source">) {
  if (typeof window === "undefined") return;

  const current = getActivityEvents();
  const next: ActivityEvent = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    source: "local",
    ...payload
  };

  window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify([next, ...current].slice(0, 100)));
}
