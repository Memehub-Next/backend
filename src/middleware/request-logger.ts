import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  use(request: Request, response: Response, next: NextFunction): void {
    const { body } = request;
    this.logger.log(JSON.stringify(body));
    response.on("close", () => {
      this.logger.log(`query: ${JSON.stringify(body.query)} vars: ${JSON.stringify(body.variables)}`);
    });
    next();
  }
}
