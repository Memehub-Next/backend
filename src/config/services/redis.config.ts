import { RedisClientOptions } from "@liaoliaots/nestjs-redis";
import { registerAs } from "@nestjs/config";

export const redisEnvironment = registerAs(
  "redisEnvironment",
  (): RedisClientOptions => ({
    host: process.env.REDIS_MOD_HOST,
    port: parseInt(process.env.REDIS_MOD_PORT),
  })
);
