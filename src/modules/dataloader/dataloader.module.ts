import { Module } from "@nestjs/common";
import { GoodBoyPointsModule } from "../database/goodBoyPoints/gbp.module";
import { RedditBetModule } from "../database/redditBet/redditBet.module";
import { RedditMemeModule } from "../database/redditMeme/redditMeme.module";

import { UserModule } from "../database/user/user.module";
import { DataloaderService } from "./dataloader.service";

@Module({
  imports: [UserModule, RedditBetModule, RedditMemeModule, GoodBoyPointsModule],
  providers: [DataloaderService],
  exports: [DataloaderService],
})
export class DataloaderModule {}
