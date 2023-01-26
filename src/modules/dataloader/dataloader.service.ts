import { Injectable } from "@nestjs/common";
import { IUserPassport } from "../../interfaces/IUserPassport";
import { GoodBoyPointsDataloaderService, IGoodBoyPointsDataLoaders } from "../database/goodBoyPoints/gbp.loader";
import { IRedditBetDataLoaders, RedditBetDataloaderService } from "../database/redditBet/redditBet.loader";
import { IRedditMemeDataLoaders, RedditMemeDataloaderService } from "../database/redditMeme/redditMeme.loader";

export interface IDataLoaders {
  redditBet: IRedditBetDataLoaders;
  redditMeme: IRedditMemeDataLoaders;
  gbp: IGoodBoyPointsDataLoaders;
}

@Injectable()
export class DataloaderService {
  constructor(
    private readonly redditBetDLService: RedditBetDataloaderService,
    private readonly redditMemeDLService: RedditMemeDataloaderService,
    private readonly gbpDLService: GoodBoyPointsDataloaderService
  ) {}

  dataloaders(userPassport?: IUserPassport): IDataLoaders {
    return {
      redditBet: this.redditBetDLService.dataloaders(userPassport),
      redditMeme: this.redditMemeDLService.dataloaders(userPassport),
      gbp: this.gbpDLService.dataloaders(userPassport),
    };
  }
}
