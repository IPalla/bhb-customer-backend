import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { LoggerFactory } from "./logging/logger.factory";
import { HttpExceptionFilter } from "./config/http.exception.filter";
import { ValidationPipe } from "@nestjs/common";
import { BigIntSerializationInterceptor } from "./interceptors/bigint-serialization-interceptor";
import { SquareServiceErrorFilter } from "./errors/square-service.error.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: LoggerFactory("BHB Customer Backend app"),
  });
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new SquareServiceErrorFilter()
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new BigIntSerializationInterceptor());
  app.enableCors({
    origin: "*",
  });
  console.log(
    `Application running in ${process.env.NODE_ENV || "production"} mode on port ${process.env.PORT}`,
  );
  await app.listen(process.env.PORT);
}
bootstrap();
