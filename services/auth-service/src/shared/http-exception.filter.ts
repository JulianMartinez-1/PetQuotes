import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : "Internal server error";

    const details = typeof exceptionResponse === "object" ? exceptionResponse : { message: String(exceptionResponse) };
    const rawMessage =
      typeof details === "object" && details !== null && "message" in details
        ? (details as { message?: string | string[] }).message
        : "Unexpected error";
    const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const error = exception as { message?: string; stack?: string };
      console.error(
        JSON.stringify({
          level: "error",
          service: "auth-service",
          event: "unhandled_exception",
          statusCode: status,
          message: error?.message ?? "Internal server error",
          path: request.url,
          requestId: request.requestId,
          stack: error?.stack,
          timestamp: new Date().toISOString()
        })
      );
    }

    response.status(status).json({
      success: false,
      error: {
        code: `HTTP_${status}`,
        message,
        details
      },
      requestId: request.requestId,
      timestamp: new Date().toISOString(),
      path: request.url
    });
  }
}