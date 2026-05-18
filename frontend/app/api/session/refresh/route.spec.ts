import { POST } from "./route";
import { callAuthBackend, getErrorPayload, getRefreshTokenFromRequest, normalizeSessionResponse, setSessionCookies } from "@/lib/auth-server";
import { assertDoubleSubmitCsrf, setCsrfCookie } from "@/lib/csrf";

jest.mock("@/lib/auth-server", () => ({
  callAuthBackend: jest.fn(),
  getErrorPayload: jest.fn(),
  getRefreshTokenFromRequest: jest.fn(),
  normalizeSessionResponse: jest.fn(),
  setSessionCookies: jest.fn()
}));

jest.mock("@/lib/csrf", () => ({
  assertDoubleSubmitCsrf: jest.fn(),
  setCsrfCookie: jest.fn()
}));

describe("BFF /api/session/refresh CSRF", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 403 when CSRF token is missing or mismatch", async () => {
    (getRefreshTokenFromRequest as jest.Mock).mockReturnValue("refresh-token");
    (assertDoubleSubmitCsrf as jest.Mock).mockReturnValue(false);

    const response = await POST({} as any);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toContain("No se pudo validar la solicitud");
  });

  it("returns 401 when refresh token is missing", async () => {
    (getRefreshTokenFromRequest as jest.Mock).mockReturnValue(undefined);

    const response = await POST({} as any);

    expect(response.status).toBe(401);
  });

  it("returns 200 with valid CSRF token", async () => {
    (getRefreshTokenFromRequest as jest.Mock).mockReturnValue("refresh-token");
    (assertDoubleSubmitCsrf as jest.Mock).mockReturnValue(true);
    (callAuthBackend as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: "a", refreshToken: "r", role: "CLIENT" })
    });
    (normalizeSessionResponse as jest.Mock).mockReturnValue({ user: { id: "u1", email: "u@mail.com", role: "CLIENT" } });

    const response = await POST({} as any);

    expect(response.status).toBe(200);
    expect(setSessionCookies).toHaveBeenCalled();
    expect(setCsrfCookie).toHaveBeenCalled();
  });

  it("returns upstream error payload when backend fails", async () => {
    (getRefreshTokenFromRequest as jest.Mock).mockReturnValue("refresh-token");
    (assertDoubleSubmitCsrf as jest.Mock).mockReturnValue(true);
    (callAuthBackend as jest.Mock).mockResolvedValue({ ok: false, status: 401 });
    (getErrorPayload as jest.Mock).mockResolvedValue("refresh invalid");

    const response = await POST({} as any);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe("refresh invalid");
  });
});
