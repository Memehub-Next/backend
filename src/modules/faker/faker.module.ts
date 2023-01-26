import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { serverEnvironment } from "../../config/services/server.config";
import { EQueueRegistry } from "../../registry/queue.r";
import { RedditBetModule } from "../database/redditBet/redditBet.module";
import { RedditMemeModule } from "../database/redditMeme/redditMeme.module";
import { UserModule } from "../database/user/user.module";
import { FakerConsumer } from "./faker.consumer";
import { FakerProducer } from "./faker.producer";

@Module({
  imports: [
    RedditMemeModule,
    UserModule,
    RedditBetModule,
    ConfigModule.forRoot({ load: [serverEnvironment] }),
    BullModule.registerQueue({ name: EQueueRegistry.FAKER }),
  ],
  providers: [FakerProducer, FakerConsumer],
})
export class FakerModule {}
