import "reflect-metadata";

import { CACHE_MANAGER, Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Cache } from "cache-manager";
import { useContainer } from "class-validator";
import { AppModule } from "./app.module";
import { IEnvironments } from "./config/environment.interface";
import { GlobalExceptionFilter } from "./exceptions/globalExceptionFilter";
import { AuthService } from "./modules/auth/auth.service";
import { FakerProducer } from "./modules/faker/faker.producer";

declare const module: any;

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { abortOnError: false });
  const logger = app.get(Logger);
  logger.log(`🚀 NESTJS APP BUILT`);

  const { port, corsOptions, host, protocol } = app
    .get<ConfigService<IEnvironments, true>>(ConfigService)
    .get("serverEnvironment", { infer: true });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  app.set("trust proxy", 1);
  app.enableCors(corsOptions);
  logger.log(`🚀 NESTJS APP SETTINGS APPLIED`);

  await app.get<Cache>(CACHE_MANAGER).reset();
  logger.log(`🚀 NESTJS CACHE CLEARED`);

  await app.get(FakerProducer).asyncConstructor();
  logger.log(`🚀 NESTJS FAKER INIT`);

  await app.get(AuthService).setAdmins();
  logger.log(`🚀 NESTJS SET ADMINS`);

  const config = new DocumentBuilder().setTitle("Memehub Rest API").setVersion("1.0").addTag("test").build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);
  logger.log(`🚀 NESTJS SWAGGER STARTED`);

  await app.listen(port);
  logger.log(`🚀 Server ready at ${protocol}://${host}:${port}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
})();
