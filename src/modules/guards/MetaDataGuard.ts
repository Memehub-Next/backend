import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { BasicAuthGuard } from "./BasicAuthGuard";

@Injectable()
export abstract class MetaDataGuard extends BasicAuthGuard {
  constructor(readonly reflector: Reflector) {
    super();
  }

  metaDataCanActivate(context: ExecutionContext) {
    return this.basicAuthCanActivate(context);
  }

  getMetaData<TMetaData = any>(context: ExecutionContext, EMetaDataKey: any): TMetaData {
    return Object.values(EMetaDataKey).reduce<any>(
      (prev, eMetaDataKey: any) => ({
        ...prev,
        [eMetaDataKey]: this.reflector.getAllAndOverride(eMetaDataKey, [context.getHandler(), context.getClass()]),
      }),
      {}
    );
  }
}
