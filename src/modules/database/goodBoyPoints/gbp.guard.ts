import { ExecutionContext, Injectable, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { IGraphQLContext } from "../../../interfaces/IGraphQLContext";
import { MetaDataGuard } from "../../guards/MetaDataGuard";
import { GoodBoyPointsService } from "./gbp.service";

enum EMetaDataKey {
  MinGbp = "MinGbp",
  MaxGbp = "MaxGbp",
  MinGbpByArg = "MinGbpByArg",
  MaxGbpByArg = "MaxGbpByArg",
}

interface IMetaData {
  [EMetaDataKey.MinGbp]: number;
  [EMetaDataKey.MaxGbp]: number;
  [EMetaDataKey.MinGbpByArg]: string;
  [EMetaDataKey.MaxGbpByArg]: string;
}

export const MinGbp = (gbp: number) => SetMetadata(EMetaDataKey.MinGbp, gbp);
export const MaxGbp = (gbp: number) => SetMetadata(EMetaDataKey.MaxGbp, gbp);
export const MinGbpByArg = (argName: string) => SetMetadata(EMetaDataKey.MinGbpByArg, argName);
export const MaxGbpByArg = (argName: string) => SetMetadata(EMetaDataKey.MaxGbpByArg, argName);

@Injectable()
export class GoodBoyPointsGuard extends MetaDataGuard {
  constructor(readonly reflector: Reflector, private readonly gbpService: GoodBoyPointsService) {
    super(reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.basicAuthCanActivate(context)) return false;
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext<IGraphQLContext>();
    const gbpEntity = await this.gbpService.getById({ username: req.session.passport.user.username });
    req.gbpEntity = gbpEntity;
    const {
      [EMetaDataKey.MinGbp]: minGbp,
      [EMetaDataKey.MaxGbp]: maxGbp,
      [EMetaDataKey.MinGbpByArg]: minGbpByArg,
      [EMetaDataKey.MaxGbpByArg]: maxGbpByArg,
    } = this.getMetaData<IMetaData>(context, EMetaDataKey);
    if (minGbp && !(minGbp <= gbpEntity.amount)) return false;
    if (maxGbp && !(maxGbp >= gbpEntity.amount)) return false;
    const args = gqlContext.getArgs<Record<string, any>>();
    if (minGbpByArg && args[minGbpByArg] > gbpEntity.amount) return false;
    if (maxGbpByArg && args[maxGbpByArg] < gbpEntity.amount) return false;
    return true;
  }
}
