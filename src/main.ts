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
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new BigIntSerializationInterceptor());
  app.enableCors({
    origin: "http://localhost:5173",
    credentials: true,
  });
  console.log(`Application running in ${process.env.NODE_ENV || 'production'} mode on port ${process.env.PORT}`);
  await app.listen(process.env.PORT);
}
bootstrap();
