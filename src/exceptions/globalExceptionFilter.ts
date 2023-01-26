import { ArgumentsHost, Catch, Logger } from "@nestjs/common";
import { GqlArgumentsHost, GqlContextType, GqlExceptionFilter } from "@nestjs/graphql";

@Catch()
export class GlobalExceptionFilter implements GqlExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: any, host: ArgumentsHost) {
    switch (host.getType<GqlContextType>()) {
      case "http":
        const ctx = host.switchToHttp();
        // const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        // const status = exception.getStatus();
        this.logger.error(`url ${request.url}`);
        this.logger.error("http exception", exception.stack);
        break;
      case "rpc":
        this.logger.error("rpc exception", exception.stack);
        break;
      case "ws":
        this.logger.error("ws exception", exception.stack);
        break;
      case "graphql":
        const gqlHost = GqlArgumentsHost.create(host);
        const {
          path,
          variableValues,
          fieldName,
          operation: {
            operation,
            name: { value },
          },
        } = gqlHost.getInfo();
        this.logger.error({ msg: exception.message, path, variableValues, fieldName, operation, operationName: value }, exception.stack);
        break;
      default:
        break;
    }
    return exception;
  }
}
