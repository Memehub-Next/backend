import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GoodBoyPointsModule } from "../goodBoyPoints/gbp.module";
import { RedditMemeModule } from "../redditMeme/redditMeme.module";
import { SeasonModule } from "../season/season.module";
import { UserModule } from "../user/user.module";
import { RedditBetEntity } from "./redditBet.entity";
import { RedditBetDataloaderService } from "./redditBet.loader";
import { RedditBetResolver } from "./redditBet.resolver";
import { RedditBetService } from "./redditBet.service";

@Module({
  imports: [TypeOrmModule.forFeature([RedditBetEntity]), GoodBoyPointsModule, SeasonModule, RedditMemeModule, UserModule],
  providers: [RedditBetService, RedditBetDataloaderService, RedditBetResolver],
  exports: [RedditBetService, RedditBetDataloaderService],
})
export class RedditBetModule {}
