import { Request, Response } from "express";
import { Context, WebSocket } from "graphql-ws";
import { IncomingMessage } from "http";
import { IDataLoaders } from "../modules/dataloader/dataloader.service";
import { GoodBoyPointsEntity } from "./../modules/database/goodBoyPoints/gbp.entity";
import { IExpressSession } from "./IExpressSession";
import { IUserPassport } from "./IUserPassport";

export interface IGraphQLContext {
  req: Request & { session: IExpressSession; user: IUserPassport; gbpEntity: GoodBoyPointsEntity };
  res: Response;
  loaders: IDataLoaders;
}

export interface ISubscriptionContext extends Context<{ socket: WebSocket; request: IncomingMessage; user?: IUserPassport }> {
  loaders: IDataLoaders;
}
