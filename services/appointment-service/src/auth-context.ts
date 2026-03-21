export type UserRole = "CLIENT" | "VETERINARY" | "ADMIN";

export type AuthUser = {
  sub: string;
  email: string;
  role: UserRole;
};

export type AuthenticatedRequest = {
  headers: {
    authorization?: string;
    "x-idempotency-key"?: string;
    "x-request-id"?: string;
  };
  requestId?: string;
  user: AuthUser;
};
