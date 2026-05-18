import { POST } from "./route";
import { assertDoubleSubmitCsrf } from "@/lib/csrf";
import { fetchWithTimeout } from "@/lib/server-fetch";

jest.mock("@/lib/csrf", () => ({
  assertDoubleSubmitCsrf: jest.fn()
}));

jest.mock("@/lib/server-fetch", () => ({
  fetchWithTimeout: jest.fn()
}));

describe("BFF /api/proxy/appointments CSRF", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseRequest = {
    cookies: {
      get: () => ({ value: "access-token" })
    },
    headers: {
      get: () => null
    },
    json: async () => ({ petId: "pet-1" })
  } as any;

  it("returns 403 when CSRF token is missing or mismatch", async () => {
    (assertDoubleSubmitCsrf as jest.Mock).mockReturnValue(false);

    const response = await POST(baseRequest);

    expect(response.status).toBe(403);
    expect(fetchWithTimeout).not.toHaveBeenCalled();
  });

  it("returns 200 when CSRF token is valid", async () => {
    (assertDoubleSubmitCsrf as jest.Mock).mockReturnValue(true);
    (fetchWithTimeout as jest.Mock).mockResolvedValue({
      ok: true,
      status: 201,
      text: async () => JSON.stringify({ id: "a1" }),
      headers: new Headers({ "Content-Type": "application/json" })
    });

    const response = await POST(baseRequest);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.id).toBe("a1");
  });
});
