import { requestJson } from "@/lib/api-client";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type OAuthProviderId = "google" | "facebook" | "github" | "microsoft";

export type OAuthProvider = {
  id: OAuthProviderId;
  name: string;
  enabled: boolean;
};

type RawAuthResponse = {
  user: {
    id: string;
    email: string;
    role: "CLIENT" | "VETERINARY" | "ADMIN";
    fullName: string;
  };
};

export type OAuthProfileCompletionResponse = {
  requiresProfileCompletion: true;
  provider: OAuthProviderId;
  email: string;
  name: string;
  completionToken: string;
};

export type AuthResponse = RawAuthResponse;

export async function loginRequest(payload: LoginPayload) {
  return requestJson<AuthResponse>("/api/session/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function registerRequest(payload: RegisterPayload) {
  return requestJson<AuthResponse>("/api/session/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function refreshRequest() {
  return requestJson<AuthResponse>("/api/session/refresh", {
    method: "POST",
    retryOn401: false
  });
}

export async function forgotPasswordRequest(payload: ForgotPasswordPayload) {
  return requestJson<{ success: boolean; message: string }>("/api/session/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function logoutRequest() {
  return requestJson<{ success: boolean }>("/api/session/logout", {
    method: "POST",
    retryOn401: false
  });
}

export async function getOAuthProviders() {
  return requestJson<{ providers: OAuthProvider[] }>("/api/session/oauth/providers", {
    method: "GET",
    retryOn401: false
  });
}

export async function exchangeOAuthCode(payload: {
  provider: OAuthProviderId;
  code: string;
  state: string;
  redirectUri: string;
}) {
  return requestJson<AuthResponse | OAuthProfileCompletionResponse>("/api/session/oauth/exchange", {
    method: "POST",
    body: JSON.stringify(payload),
    retryOn401: false
  });
}

export async function completeOAuthProfile(payload: {
  provider: OAuthProviderId;
  completionToken: string;
  fullName: string;
}) {
  return requestJson<AuthResponse>("/api/session/oauth/complete", {
    method: "POST",
    body: JSON.stringify(payload),
    retryOn401: false
  });
}
