import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { IGraphQLContext } from "../interfaces/IGraphQLContext";

export const UserPassport = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => GqlExecutionContext.create(ctx).getContext<IGraphQLContext>().req.user
);
