import { AuthRole } from "@/lib/auth-jwt";

export type RoutePolicyRule = {
  prefix: string;
  roles: AuthRole[];
};

export const ROUTE_ROLE_POLICY: RoutePolicyRule[] = [
  { prefix: "/bookings", roles: ["CLIENT", "VETERINARY", "ADMIN"] },
  { prefix: "/profile", roles: ["CLIENT", "VETERINARY", "ADMIN"] },
  { prefix: "/admin", roles: ["ADMIN"] }
];
