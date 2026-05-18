export type NotificationPreferences = {
  emailReminders: boolean;
  whatsappReminders: boolean;
  marketingEmails: boolean;
  reminderHoursBefore: 2 | 6 | 12 | 24;
};

export type UserProfileSettings = {
  displayName: string;
  phone: string;
  city: string;
  preferences: NotificationPreferences;
  updatedAt: string;
};

const PROFILE_PREFIX = "pq.profile.";

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailReminders: true,
  whatsappReminders: false,
  marketingEmails: false,
  reminderHoursBefore: 12
};

export function getUserProfileSettings(userId: string, fallbackName: string) {
  if (typeof window === "undefined") {
    return {
      displayName: fallbackName,
      phone: "",
      city: "Bogota",
      preferences: DEFAULT_PREFERENCES,
      updatedAt: new Date(0).toISOString()
    } satisfies UserProfileSettings;
  }

  const raw = window.localStorage.getItem(`${PROFILE_PREFIX}${userId}`);
  if (!raw) {
    return {
      displayName: fallbackName,
      phone: "",
      city: "Bogota",
      preferences: DEFAULT_PREFERENCES,
      updatedAt: new Date(0).toISOString()
    } satisfies UserProfileSettings;
  }

  try {
    const parsed = JSON.parse(raw) as UserProfileSettings;
    return {
      ...parsed,
      displayName: parsed.displayName || fallbackName
    };
  } catch {
    return {
      displayName: fallbackName,
      phone: "",
      city: "Bogota",
      preferences: DEFAULT_PREFERENCES,
      updatedAt: new Date(0).toISOString()
    } satisfies UserProfileSettings;
  }
}

export function saveUserProfileSettings(userId: string, payload: UserProfileSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${PROFILE_PREFIX}${userId}`, JSON.stringify(payload));
}
