import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { LoggerFactory } from "./logging/logger.factory";
import { HttpExceptionFilter } from "./config/http.exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: LoggerFactory("BHB Customer Backend app"),
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
