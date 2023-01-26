import { ExecutionContext, Injectable, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Observable } from "rxjs";
import { EUserRole } from "../../enums/EUserRole";
import { IGraphQLContext } from "../../interfaces/IGraphQLContext";
import { MetaDataGuard } from "./MetaDataGuard";

export enum EMetaDataKey {
  SomeRole = "SomeRole",
  EveryRole = "EveryRole",
}

interface IMetaData {
  [EMetaDataKey.SomeRole]?: EUserRole[];
  [EMetaDataKey.EveryRole]?: EUserRole[];
}

export const SomeRole = (roles: EUserRole[]) => SetMetadata(EMetaDataKey.SomeRole, roles);
export const EveryRole = (roles: EUserRole[]) => SetMetadata(EMetaDataKey.EveryRole, roles);

@Injectable()
export class RoleGuard extends MetaDataGuard {
  constructor(readonly reflector: Reflector) {
    super(reflector);
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.metaDataCanActivate(context)) return false;
    const { req } = GqlExecutionContext.create(context).getContext<IGraphQLContext>();
    const usersRoles = req.session.passport.user.roles;
    const { [EMetaDataKey.SomeRole]: someRole, [EMetaDataKey.EveryRole]: everyRole } = this.getMetaData<IMetaData>(context, EMetaDataKey);
    if (someRole && someRole.some((role) => usersRoles.includes(role))) return false;
    if (everyRole && !everyRole.every((role) => usersRoles.includes(role))) return false;
    return true;
  }
}
