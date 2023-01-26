import { RedisClientOptions } from "@liaoliaots/nestjs-redis";
import { IHiveEnvironment } from "./keys/hive.config";
import { ISendgridEnvironment } from "./keys/sendgrid.config";
import { IDatabaseEnvironment } from "./services/database.config";
import { IServerEnvironment } from "./services/server.config";

export interface IEnvironments {
  databaseEnvironment: IDatabaseEnvironment;
  serverEnvironment: IServerEnvironment;
  hiveEnvironment: IHiveEnvironment;
  redisEnvironment: RedisClientOptions;
  sendgridEnvironment: ISendgridEnvironment;
}
