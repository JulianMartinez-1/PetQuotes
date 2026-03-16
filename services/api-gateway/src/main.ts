import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { observabilityMiddleware } from "./observability.middleware";
import { HttpExceptionFilter } from "./shared/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(helmet());
  app.use(observabilityMiddleware("api-gateway"));
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed by CORS"), false);
    },
    credentials: true
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = Number(process.env.GATEWAY_PORT ?? 3001);
  await app.listen(port);
  console.log(
    JSON.stringify({
      level: "info",
      service: "api-gateway",
      event: "startup",
      message: `API Gateway running on http://localhost:${port}/api`,
      timestamp: new Date().toISOString()
    })
  );
}

bootstrap();
