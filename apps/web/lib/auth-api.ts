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

type RawAuthResponse = {
  user: {
    id: string;
    email: string;
    role: "CLIENT" | "VETERINARY" | "ADMIN";
  };
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
