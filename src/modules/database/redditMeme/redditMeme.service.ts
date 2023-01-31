import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ETradedOrder } from "../../../enums/ETradedOrder";
import { RedditMemeEntity } from "./redditMeme.entity";

interface IRandomRedditMemes {
  skip: number;
  take: number;
  username?: string;
  traded: boolean;
  eTradedOrder?: ETradedOrder;
}

@Injectable()
export class RedditMemeService {
  constructor(@InjectRepository(RedditMemeEntity) public readonly repo: Repository<RedditMemeEntity>) {}

  getBetableRedditMeme({ username, minPercentile, maxPercentile }: { username: string; minPercentile?: number; maxPercentile?: number }) {
    const query = this.repo
      .createQueryBuilder("reddit_meme")
      .where("reddit_meme.percentile IS NOT NULL")
      .leftJoin("reddit_meme.redditBets", "reddit_bet")
      .groupBy("reddit_meme.id")
      .addGroupBy("reddit_bet.reddit_meme_id")
      .having("SUM(CASE reddit_bet.username WHEN :username THEN 1 ELSE 0 END) = 0", { username })
      .orderBy("RANDOM()");
    if (minPercentile) query.andWhere("reddit_meme.percentile >= :minPercentile", { minPercentile });
    if (maxPercentile) query.andWhere("reddit_meme.percentile <= :maxPercentile", { maxPercentile });
    return query.getOne();
  }

  getBetableRedditMemes({ username, limit }: { username: string; limit: number }) {
    return this.repo
      .createQueryBuilder("reddit_meme")
      .where("reddit_meme.percentile IS NOT NULL")
      .leftJoin("reddit_meme.redditBets", "reddit_bet")
      .groupBy("reddit_meme.id")
      .addGroupBy("reddit_bet.reddit_meme_id")
      .having("COUNT(reddit_bet.username = :username) = 0", { username })
      .orderBy("RANDOM()")
      .limit(limit)
      .getMany();
  }

  async getTradedRedditMemes({ skip, take, username, eTradedOrder }: IRandomRedditMemes) {
    if (!username) throw new UnauthorizedException();
    const memesQ = this.repo
      .createQueryBuilder("reddit_meme")
      .where("reddit_meme.percentile IS NOT NULL")
      .innerJoinAndSelect("reddit_meme.redditBets", "reddit_bet")
      .where("reddit_bet.username = :username", { username });
    switch (eTradedOrder) {
      case ETradedOrder.Latest:
        memesQ.orderBy("reddit_bet.createdAt", "DESC");
        break;
      case ETradedOrder.Worst:
        memesQ.orderBy("reddit_bet.profitLoss", "ASC");
        break;
      case ETradedOrder.Best:
        memesQ.orderBy("reddit_bet.profitLoss", "DESC");
        break;
    }
    const memes = await memesQ.skip(skip).take(take).getMany();
    return { hasMore: take === memes.length, items: memes };
  }
}
