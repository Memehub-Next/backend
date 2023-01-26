import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RedditMemeEntity } from "./redditMeme.entity";
import { RedditMemeDataloaderService } from "./redditMeme.loader";
import { RedditMemeResolver } from "./redditMeme.resolver";
import { RedditMemeService } from "./redditMeme.service";

@Module({
  imports: [TypeOrmModule.forFeature([RedditMemeEntity])],
  providers: [RedditMemeService, RedditMemeDataloaderService, RedditMemeResolver],
  exports: [RedditMemeService, RedditMemeDataloaderService],
})
export class RedditMemeModule {}
