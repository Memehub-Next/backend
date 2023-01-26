import { Injectable } from "@nestjs/common";
import DataLoader from "dataloader";
import { In } from "typeorm";
import { IUserPassport } from "../../../interfaces/IUserPassport";

import { RedditBetEntity } from "./redditBet.entity";
import { RedditBetService } from "./redditBet.service";

export interface IRedditBetDataLoaders {
  byRedditMemeId: DataLoader<string, RedditBetEntity>;
}

@Injectable()
export class RedditBetDataloaderService {
  constructor(readonly redditBetService: RedditBetService) {}

  dataloaders(userPassport?: IUserPassport): IRedditBetDataLoaders {
    const username = userPassport?.username;
    return {
      byRedditMemeId: new DataLoader<string, RedditBetEntity>(async (ids) => {
        if (!username) return Array(ids.length).fill(undefined);
        const redditBets = await this.redditBetService.repo.find({ where: { username, redditMemeId: In([...ids]) } });
        const redditMemeIdToRedditBet = redditBets.reduce<Record<string, RedditBetEntity>>(
          (prev, redditBet) => ({ [redditBet.redditMemeId]: redditBet, ...prev }),
          {}
        );
        return ids.map((redditMemeId) => redditMemeIdToRedditBet[redditMemeId]);
      }),
    };
  }
}
