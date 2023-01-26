import { ArgumentsHost, Catch, Logger, UnauthorizedException } from "@nestjs/common";
import { GqlContextType, GqlExceptionFilter } from "@nestjs/graphql";
import { Response } from "express";

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(UnauthorizedExceptionFilter.name);

  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    switch (host.getType<GqlContextType>()) {
      case "http":
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        response.status(301).redirect("/auth/login");
        break;
      case "rpc":
        this.logger.error("rpc exception", exception.stack);
        break;
      case "ws":
        this.logger.error("ws exception", exception.stack);
        break;
      case "graphql":
        // const gqlHost = GqlArgumentsHost.create(host);
        // const gqlCtx = gqlHost.getContext();

        // redirect here

        break;
      default:
        break;
    }
    return exception;
  }
}
