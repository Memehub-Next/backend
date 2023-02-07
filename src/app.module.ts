import { RedisModule, RedisService } from "@liaoliaots/nestjs-redis";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { BullModule } from "@nestjs/bull";
import { CacheModule, Logger, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { Enhancer, GraphQLModule } from "@nestjs/graphql";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { OgmaInterceptor, OgmaModule } from "@ogma/nestjs-module";
import { ExpressParser } from "@ogma/platform-express";
import { GraphQLParser } from "@ogma/platform-graphql";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import * as store from "cache-manager-ioredis";
import connectRedis from "connect-redis";
import cookie from "cookie";
import { signedCookies } from "cookie-parser";
import expressSession from "express-session";
import { RedisOptions } from "ioredis";
import passport from "passport";
import { join } from "path";
import { IEnvironments } from "./config/environment.interface";
import { databaseEnvironment } from "./config/services/database.config";
import { redisEnvironment } from "./config/services/redis.config";
import { serverEnvironment } from "./config/services/server.config";
import { AuthModule } from "./modules/auth/auth.module";
import { CryptoCompareModule } from "./modules/cryptocompare/cryptocompare.module";
import { GoodBoyPointsModule } from "./modules/database/goodBoyPoints/gbp.module";
import { RedditBetModule } from "./modules/database/redditBet/redditBet.module";
import { RedditMemeModule } from "./modules/database/redditMeme/redditMeme.module";
import { SeasonModule } from "./modules/database/season/season.module";
import { UserModule } from "./modules/database/user/user.module";
import { DataloaderModule } from "./modules/dataloader/dataloader.module";
import { DataloaderService } from "./modules/dataloader/dataloader.service";
import { FakerModule } from "./modules/faker/faker.module";
import { HiveModule } from "./modules/hive/hive.module";

const ExpresSessionStore = connectRedis(expressSession);

@Module({
  imports: [
    PrometheusModule.register(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ load: [serverEnvironment] }),
    CacheModule.registerAsync<RedisOptions>({
      isGlobal: true,
      imports: [ConfigModule.forRoot({ load: [redisEnvironment] })],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IEnvironments, true>) => ({
        ttl: 60,
        store,
        ...configService.get("redisEnvironment", { infer: true }),
      }),
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule.forRoot({ load: [redisEnvironment] })],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IEnvironments>) => ({
        isGlobal: true,
        config: [
          { ...configService.get("redisEnvironment", { infer: true }) },
          { namespace: "pub", ...configService.get("redisEnvironment", { infer: true }) },
          { namespace: "sub", ...configService.get("redisEnvironment", { infer: true }) },
        ],
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule.forRoot({ load: [redisEnvironment] })],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IEnvironments, true>) => ({
        redis: configService.get("redisEnvironment", { infer: true }),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot({ load: [serverEnvironment, databaseEnvironment] })],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IEnvironments, true>): TypeOrmModuleOptions => ({
        ...configService.get("databaseEnvironment", { infer: true }),
        autoLoadEntities: true,
        synchronize: configService.get("serverEnvironment.isLocal", { infer: true }),
        keepConnectionAlive: !configService.get("serverEnvironment.isProd", { infer: true }),
      }),
    }),
    HiveModule,
    GoodBoyPointsModule,
    RedditMemeModule,
    RedditBetModule,
    SeasonModule,
    UserModule,
    AuthModule,
    FakerModule,
    DataloaderModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [DataloaderModule, ConfigModule.forRoot({ load: [serverEnvironment] })],
      inject: [ConfigService, DataloaderService, RedisService],
      useFactory: (
        configService: ConfigService<IEnvironments, true>,
        dataloaderService: DataloaderService,
        redisService: RedisService
      ) => ({
        playground: false,
        cors: configService.get("serverEnvironment.corsOptions", { infer: true }),
        subscriptions: {
          "graphql-ws": {
            onConnect: async (context: any) => {
              // instead of using passportjs for ws subscription auth
              // we directly parse cookies and get session data from redis
              // finally we add session data to `extra` property of the context
              // to expose the session data throughout the ws lifecycle
              // particularly, this enables auth guards to function properly and subscription filtering
              const headerCookie = context.extra.request.headers.cookie;
              if (headerCookie) {
                const { speedCowOwen } = signedCookies(
                  cookie.parse(headerCookie),
                  configService.get("serverEnvironment.secret", { infer: true })
                );
                if (speedCowOwen) {
                  const session = await redisService.getClient().get(`sess:${speedCowOwen}`);
                  if (session) {
                    context.extra.user = JSON.parse(session).passport.user;
                  }
                }
              }
              return true;
            },
            onDisconnect: () => console.log("WS DISCONNECTED"),
            onSubscribe: () => console.log("WS SUBSCRIBED"),
            onClose: () => console.log("WS CLOSED"),
            path: "/graphql",
          },
        },
        context: (ctx: any) => ({ ...ctx, loaders: dataloaderService.dataloaders(ctx.req?.user) }),
        autoSchemaFile: join(process.cwd(), "schema.gql"),
        sortSchema: true,
        // cache: new KeyvAdapter(new Keyv({ store: new KeyvRedis("redis://localhost:6379") })),
        // plugins: [
        //   responseCachePlugin({
        //     sessionId: async (requestContext: GraphQLRequestContext<IGraphQLContext>) => requestContext.context.req?.user?.username,
        //   }),
        // ],
        fieldResolverEnhancers: ["filters", "guards"] as Enhancer[],
        // resolvers: { JSON: GraphQLJSON },
      }),
    }),
    CryptoCompareModule,
    OgmaModule.forRoot({
      service: {
        color: true,
        json: false,
        application: "NestJS",
      },
      interceptor: {
        http: ExpressParser,
        ws: false,
        gql: GraphQLParser,
        rpc: false,
      },
    }),
  ],
  providers: [
    Logger,
    {
      provide: APP_INTERCEPTOR,
      useClass: OgmaInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService<IEnvironments, true>, private readonly redisService: RedisService) {}
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(AppLoggerMiddleware).forRoutes("*");
    consumer
      .apply(
        expressSession({
          store: new ExpresSessionStore({ client: this.redisService.getClient(), disableTouch: true, disableTTL: true }),
          ...this.configService.get("serverEnvironment.sessionOptions", { infer: true }),
        }),
        passport.initialize(),
        passport.session()
      )
      .forRoutes("*");
  }
}
