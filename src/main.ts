import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { LoggerFactory } from "./logging/logger.factory";
import { HttpExceptionFilter } from "./config/http.exception.filter";
import { ValidationPipe } from "@nestjs/common";
import { BigIntSerializationInterceptor } from "./interceptors/bigint-serialization-interceptor";
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: LoggerFactory("BHB Customer Backend app"),
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new BigIntSerializationInterceptor());
  await app.listen(3000);
}
bootstrap();
