import { POST } from "./route";
import { callAuthBackend, clearSessionCookies, getRefreshTokenFromRequest } from "@/lib/auth-server";
import { assertDoubleSubmitCsrf, clearCsrfCookie } from "@/lib/csrf";

jest.mock("@/lib/auth-server", () => ({
  callAuthBackend: jest.fn(),
  clearSessionCookies: jest.fn(),
  getRefreshTokenFromRequest: jest.fn()
}));

jest.mock("@/lib/csrf", () => ({
  assertDoubleSubmitCsrf: jest.fn(),
  clearCsrfCookie: jest.fn()
}));

describe("BFF /api/session/logout CSRF", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 403 when CSRF token is missing or mismatch", async () => {
    (assertDoubleSubmitCsrf as jest.Mock).mockReturnValue(false);

    const response = await POST({} as any);

    expect(response.status).toBe(403);
  });

  it("returns 200 and clears cookies with valid CSRF", async () => {
    (assertDoubleSubmitCsrf as jest.Mock).mockReturnValue(true);
    (getRefreshTokenFromRequest as jest.Mock).mockReturnValue("refresh-token");
    (callAuthBackend as jest.Mock).mockResolvedValue({ ok: true });

    const response = await POST({} as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(clearSessionCookies).toHaveBeenCalled();
    expect(clearCsrfCookie).toHaveBeenCalled();
  });
});
