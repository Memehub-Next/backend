import { ExecutionContext, Injectable } from "@nestjs/common";
import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";
import { LocalStrategy } from "./auth.strategy";

@Injectable()
export class DashboardPassport extends AuthGuard(LocalStrategy.key) {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    await super.logIn(this.getRequest(context));
    return result;
  }

  getRequest(context: ExecutionContext) {
    switch (context.getType<GqlContextType>()) {
      case "graphql":
        const gqlCtx = GqlExecutionContext.create(context);
        const ctx = gqlCtx.getContext();
        ctx.req.body = gqlCtx.getArgs();
        return ctx.req;
      case "http":
        return context.switchToHttp().getRequest();
    }
    return false;
  }
}
