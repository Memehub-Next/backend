import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  use(request: Request, response: Response, next: NextFunction): void {
    const { url, body, params, path } = request;
    response.on("close", () => {
      this.logger.log(`path: ${path} url: ${url} body: ${JSON.stringify(body)} params: ${JSON.stringify(params)}`);
    });
    next();
  }
}
