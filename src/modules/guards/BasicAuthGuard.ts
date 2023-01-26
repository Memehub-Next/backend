import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Observable } from "rxjs";
import { IGraphQLContext, ISubscriptionContext } from "../../interfaces/IGraphQLContext";

@Injectable()
export class BasicAuthGuard implements CanActivate {
  basicAuthCanActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context).getContext<any>();
    if (!ctx.req) return Boolean((ctx as ISubscriptionContext).extra?.user);
    return (ctx as IGraphQLContext).req.isAuthenticated();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return this.basicAuthCanActivate(context);
  }
}
