import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Req } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import axios from "axios";
import { verify } from "jsonwebtoken";
import { firstValueFrom } from "rxjs";
import { API_ROUTE_ROLE_POLICY, AuthRole } from "./auth/route-policy";

type AccessTokenPayload = {
  sub?: string;
  email?: string;
  role?: AuthRole;
  exp?: number;
};

@Controller()
export class ProxyController {
  constructor(private readonly http: HttpService) {}

  @Post("auth/register")
  async register(@Body() body: unknown) {
    return this.forward("AUTH_SERVICE_URL", "/auth/register", body);
  }

  @Post("auth/login")
  async login(@Body() body: unknown) {
    return this.forward("AUTH_SERVICE_URL", "/auth/login", body);
  }

  @Post("auth/refresh")
  async refresh(@Body() body: unknown) {
    return this.forward("AUTH_SERVICE_URL", "/auth/refresh", body);
  }

  @Post("auth/logout")
  async logout(@Body() body: unknown) {
    return this.forward("AUTH_SERVICE_URL", "/auth/logout", body);
  }

  @Post("auth/forgot-password")
  async forgotPassword(@Body() body: unknown) {
    return this.forward("AUTH_SERVICE_URL", "/auth/forgot-password", body);
  }

  @Post("appointments")
  async createAppointment(
    @Body() body: unknown,
    @Req() request: { headers: { authorization?: string; "x-idempotency-key"?: string; "x-request-id"?: string } }
  ) {
    this.assertAuthorized(request.headers.authorization, API_ROUTE_ROLE_POLICY.createAppointment);
    return this.forward("APPOINTMENT_SERVICE_URL", "/appointments", body, request.headers.authorization, "POST", {
      "x-idempotency-key": request.headers["x-idempotency-key"],
      "x-request-id": request.headers["x-request-id"]
    });
  }

  @Get("appointments/pet/:petId")
  async listByPet(
    @Param("petId") petId: string,
    @Req() request: { headers: { authorization?: string; "x-request-id"?: string } }
  ) {
    this.assertAuthorized(request.headers.authorization, API_ROUTE_ROLE_POLICY.listAppointmentsByPet);
    return this.forward("APPOINTMENT_SERVICE_URL", `/appointments/pet/${petId}`, undefined, request.headers.authorization, "GET", {
      "x-request-id": request.headers["x-request-id"]
    });
  }

  @Patch("appointments/:id/status")
  async updateAppointmentStatus(
    @Param("id") id: string,
    @Body() body: unknown,
    @Req() request: { headers: { authorization?: string; "x-request-id"?: string } }
  ) {
    this.assertAuthorized(request.headers.authorization, API_ROUTE_ROLE_POLICY.updateAppointmentStatus);
    return this.forward(
      "APPOINTMENT_SERVICE_URL",
      `/appointments/${id}/status`,
      body,
      request.headers.authorization,
      "PATCH",
      { "x-request-id": request.headers["x-request-id"] }
    );
  }

  @Patch("appointments/:id/reschedule")
  async rescheduleAppointment(
    @Param("id") id: string,
    @Body() body: unknown,
    @Req() request: { headers: { authorization?: string; "x-request-id"?: string } }
  ) {
    this.assertAuthorized(request.headers.authorization, API_ROUTE_ROLE_POLICY.rescheduleAppointment);
    return this.forward(
      "APPOINTMENT_SERVICE_URL",
      `/appointments/${id}/reschedule`,
      body,
      request.headers.authorization,
      "PATCH",
      { "x-request-id": request.headers["x-request-id"] }
    );
  }

  private async forward(
    serviceEnvVar: string,
    path: string,
    body?: unknown,
    authorization?: string,
    method: "POST" | "GET" | "PATCH" = "POST",
    extraHeaders?: Record<string, string | undefined>
  ) {
    const baseUrl = process.env[serviceEnvVar];
    if (!baseUrl) {
      throw new Error(`Missing environment variable: ${serviceEnvVar}`);
    }

    try {
      const response = await firstValueFrom(
        this.http.request({
          method,
          url: `${baseUrl}${path}`,
          data: body,
          headers: {
            ...(authorization ? { Authorization: authorization } : {}),
            ...(extraHeaders ?? {})
          },
          timeout: 8000
        })
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const upstreamStatus = error.response?.status ?? HttpStatus.BAD_GATEWAY;
        const upstreamBody = error.response?.data;

        throw new HttpException(
          {
            code: "UPSTREAM_ERROR",
            message: "Error comunicando con servicio interno",
            upstreamStatus,
            upstreamBody,
            requestId: extraHeaders?.["x-request-id"]
          },
          upstreamStatus
        );
      }

      throw new HttpException(
        {
          code: "UPSTREAM_ERROR",
          message: "Error interno del API Gateway",
          requestId: extraHeaders?.["x-request-id"]
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private assertAuthorized(authorization: string | undefined, allowedRoles: AuthRole[]) {
    if (!authorization?.startsWith("Bearer ")) {
      throw new HttpException({ code: "UNAUTHORIZED", message: "Missing bearer token" }, HttpStatus.UNAUTHORIZED);
    }

    const token = authorization.slice("Bearer ".length).trim();
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessSecret) {
      throw new HttpException({ code: "UNAUTHORIZED", message: "Missing JWT_ACCESS_SECRET" }, HttpStatus.UNAUTHORIZED);
    }

    let payload: AccessTokenPayload;

    try {
      payload = verify(token, accessSecret) as AccessTokenPayload;
    } catch {
      throw new HttpException({ code: "UNAUTHORIZED", message: "Invalid access token" }, HttpStatus.UNAUTHORIZED);
    }

    if (!payload.role || !allowedRoles.includes(payload.role)) {
      throw new HttpException({ code: "FORBIDDEN", message: "Role not allowed" }, HttpStatus.FORBIDDEN);
    }
  }
}
