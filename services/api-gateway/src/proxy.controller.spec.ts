import { HttpException } from "@nestjs/common";
import { of, throwError } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { ProxyController } from "./proxy.controller";

jest.mock("jsonwebtoken", () => ({ verify: jest.fn(() => ({ role: "CLIENT" })) }));

describe("ProxyController", () => {
  const http = {
    request: jest.fn()
  } as unknown as HttpService;

  let controller: ProxyController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ProxyController(http);
    process.env.JWT_ACCESS_SECRET = "secret";
    process.env.APPOINTMENT_SERVICE_URL = "http://appointment";
    process.env.AUTH_SERVICE_URL = "http://auth";
  });

  it("creates appointment when token role is allowed", async () => {
    (http.request as jest.Mock).mockReturnValue(of({ data: { id: "a1" } }));

    const result = await controller.createAppointment(
      { petId: "pet1" },
      { headers: { authorization: "Bearer token", "x-idempotency-key": "idem-1", "x-request-id": "req-1" } }
    );

    expect(result).toEqual({ id: "a1" });
    expect(http.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "http://appointment/appointments"
      })
    );
  });

  it("throws unauthorized when bearer token is missing", async () => {
    await expect(controller.listByPet("pet1", { headers: {} })).rejects.toBeInstanceOf(HttpException);
  });

  it("maps upstream axios errors to sanitized gateway message", async () => {
    const axiosLikeError = {
      isAxiosError: true,
      response: {
        status: 503,
        data: { detail: "internal" }
      }
    };

    (http.request as jest.Mock).mockReturnValue(
      throwError(() => axiosLikeError)
    );

    await expect(
      controller.createAppointment({ petId: "pet1" }, { headers: { authorization: "Bearer token" } })
    ).rejects.toMatchObject({
      status: 503,
      response: expect.objectContaining({
        message: "No se pudo completar la solicitud en este momento"
      })
    });

    expect(http.request).toHaveBeenCalledTimes(3);
  });

  it("retries transient upstream failures and succeeds", async () => {
    const transientError = {
      isAxiosError: true,
      response: {
        status: 503
      }
    };

    (http.request as jest.Mock)
      .mockReturnValueOnce(throwError(() => transientError))
      .mockReturnValueOnce(of({ data: { ok: true } }));

    const result = await controller.listByPet("pet1", { headers: { authorization: "Bearer token" } });

    expect(result).toEqual({ ok: true });
    expect(http.request).toHaveBeenCalledTimes(2);
  });
});
