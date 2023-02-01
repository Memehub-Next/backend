import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import dayjs from "dayjs";
import random from "random";
import { Repository } from "typeorm";
import { ELeaderboard, Leaderboard } from "../../../enums/ELeaderboard";
import { EPositionSide } from "../../../enums/EPositionSide";
import { GoodBoyPointsService } from "../goodBoyPoints/gbp.service";
import { RedditMemeService } from "../redditMeme/redditMeme.service";
import { GoodBoyPointsEntity } from "./../goodBoyPoints/gbp.entity";
import { RedditBetEntity } from "./redditBet.entity";

export interface IUserRedditBetStats {
  bestTrade: number;
  worstTrade: number;
  profitLoss: number;
  numTrades: number;
  numGoodTrades: number;
}

export interface ILeaderboardData {
  username: string;
  profitLoss: number;
  avatar?: string;
}

export interface IProfitLossChartDataDTO {
  day: number;
  profit: number;
  loss: number;
}

export interface ISeasonSummary {
  numTrades: number;
  numGoodTrades: number;
  profitLossTotal: number;
  profitLossPerTrade: number;
  numIsYolo: number;
  targetAvg: number;
  percentileAvg: number;
  betSizeAvg: number;
  numBuys: number;
}

export class IBetData {
  betSize: number;
  ePositionSide: EPositionSide;
  target?: number;
}

export class IPlaceBet extends IBetData {
  redditMemeId: string;
  gbpEntity: GoodBoyPointsEntity;
}

interface IProfitLoss extends IBetData {
  percentile: number;
  gbp: number;
}

@Injectable()
export class RedditBetService {
  constructor(
    @InjectRepository(RedditBetEntity) readonly repo: Repository<RedditBetEntity>,
    private readonly redditMemeService: RedditMemeService,
    private readonly goodBoyPointsService: GoodBoyPointsService
  ) {}

  fakeTargets = [
    ...Array<number>(51).fill(50),
    ...Array<number>(17).fill(60),
    ...Array<number>(5).fill(70),
    ...Array<number>(3).fill(80),
    ...Array<number>(1).fill(90),
  ];
  fakeSides = [...Array<EPositionSide>(101).fill(EPositionSide.Buy), ...Array<EPositionSide>(17).fill(EPositionSide.Sell)];

  async fakeOne({ username, redditMemeId }: { username: string; redditMemeId: string }) {
    const gbpEntity = await this.goodBoyPointsService.getById({ username });
    const { amount: gbp } = gbpEntity;
    return (
      gbp &&
      this.placeBet({
        gbpEntity,
        redditMemeId,
        betSize: random.float() > 0.95 ? gbp : random.int(1, Math.round(gbp / 10)),
        ePositionSide: this.fakeSides[random.int(0, this.fakeSides.length - 1)],
        target: this.fakeTargets[random.int(0, this.fakeTargets.length - 1)],
      })
    );
  }

  private getProfitLoss({ betSize, ePositionSide, percentile, target, gbp }: IProfitLoss) {
    if (gbp < betSize) throw new Error("not enough Gbp");
    const yoloMultiplier = betSize === gbp ? 2 : 1;
    if (ePositionSide === EPositionSide.Buy) {
      if (!target) throw new Error("buy without target");
      target = target / 100; // convert to percent as decimal
      const targetMutiplier = target / (1 - target);
      const buyMultiplier = targetMutiplier * yoloMultiplier;
      return percentile >= target ? Math.round(buyMultiplier * betSize) : -betSize;
    } else if (percentile < 0.5) {
      const targetMutiplier = 1 - percentile;
      const sellProfitMultiplier = targetMutiplier * yoloMultiplier;
      return Math.round(betSize * sellProfitMultiplier);
    } else {
      const targetMutiplier = percentile / (1 - percentile);
      const sellLossMultiplier = targetMutiplier * yoloMultiplier;
      return -Math.min(gbp, Math.round(betSize * sellLossMultiplier));
    }
  }

  async placeBet({
    betSize,
    ePositionSide,
    redditMemeId,
    target,
    gbpEntity: { username, seasonId, amount },
  }: IPlaceBet): Promise<RedditBetEntity | undefined> {
    if (await this.repo.findOne({ where: { username, redditMemeId } })) throw new Error("already placed a bet on this meme");
    const { percentile } = await this.redditMemeService.repo.findOneByOrFail({ id: redditMemeId });
    const profitLoss = this.getProfitLoss({ betSize, ePositionSide, target, percentile, gbp: amount });
    const newGbp = amount + profitLoss;
    await this.goodBoyPointsService.repo.save({ username, seasonId, amount: newGbp });
    return this.repo.save(
      this.repo.create({
        seasonId,
        username,
        betSize,
        percentile: Math.round(percentile * 100),
        side: ePositionSide,
        profitLoss,
        target,
        redditMemeId,
        isYolo: betSize === amount,
      })
    );
  }

  leaderboardQuery({ eLeaderboard, username, seasonId }: { eLeaderboard: ELeaderboard; username?: String; seasonId?: number }) {
    const query = this.repo
      .createQueryBuilder("reddit_bet")
      .innerJoin("reddit_bet.user", "user")
      .select("user.username", "username")
      .addSelect("user.avatar", "avatar")
      .groupBy("user.username");
    switch (eLeaderboard) {
      case ELeaderboard.Season:
        if (!seasonId) throw new Error("no season id");
        query
          .addSelect("ROW_NUMBER() OVER(ORDER BY SUM(reddit_bet.profit_loss) DESC)", "rank")
          .addSelect("SUM(reddit_bet.profit_loss)", "profitLoss")
          .addGroupBy("reddit_bet.username")
          .orderBy("SUM(reddit_bet.profit_loss)", "DESC");
        break;
      case ELeaderboard.LargestYolo:
        query
          .addSelect("ROW_NUMBER() OVER(ORDER BY ABS(reddit_bet.profit_loss) DESC)", "rank")
          .addSelect("reddit_bet.profit_loss", "profitLoss")
          .addGroupBy("reddit_bet.id")
          .where("reddit_bet.is_yolo IS TRUE")
          .orderBy("ABS(reddit_bet.profit_loss)", "DESC");
        break;
      case ELeaderboard.Ever:
        query
          .addSelect("ROW_NUMBER() OVER(ORDER BY SUM(reddit_bet.profit_loss) DESC)", "rank")
          .addSelect("SUM(reddit_bet.profit_loss)", "profitLoss")
          .addGroupBy("reddit_bet.username")
          .orderBy("SUM(reddit_bet.profit_loss)", "DESC");
        break;
      case ELeaderboard.BestTrade:
        query
          .addSelect("ROW_NUMBER() OVER(ORDER BY reddit_bet.profit_loss DESC)", "rank")
          .addSelect("reddit_bet.profit_loss", "profitLoss")
          .addGroupBy("reddit_bet.id")
          .orderBy("reddit_bet.profit_loss", "DESC");
        break;
      default:
        query
          .addSelect("ROW_NUMBER() OVER(ORDER BY SUM(reddit_bet.profit_loss) DESC)", "rank")
          .addSelect("SUM(reddit_bet.profit_loss)", "profitLoss")
          .where("reddit_bet.created_at > :time", { time: dayjs().subtract(Leaderboard.toDays(eLeaderboard), "d").toDate() })
          .addGroupBy("reddit_bet.username")
          .orderBy("SUM(reddit_bet.profit_loss)", "DESC");
        break;
    }
    if (seasonId && eLeaderboard !== ELeaderboard.Ever) query.andWhere("reddit_bet.season_id = :seasonId", { seasonId });
    if (username)
      return this.repo
        .createQueryBuilder()
        .select('"user_ranks"."rank"', "rank")
        .addSelect('"user_ranks"."profitLoss"', "profitLoss")
        .addSelect('"user_ranks"."username"', "username")
        .addSelect('"user_ranks"."avatar"', "avatar")
        .from(`(${query.getQuery()})`, "user_ranks")
        .where('"user_ranks"."username" = :username', { username })
        .setParameters(query.getParameters());
    return query;
  }

  seasonSummary({ seasonId, username }: { seasonId: number; username: string }) {
    return this.repo
      .createQueryBuilder("reddit_bet")
      .select("COUNT(reddit_bet.id)", "numTrades")
      .addSelect("SUM(CASE WHEN reddit_bet.profit_loss > 0 THEN 1 ELSE 0 END)", "numGoodTrades")
      .addSelect("SUM(reddit_bet.profit_loss)", "profitLossTotal")
      .addSelect("SUM(reddit_bet.profit_loss)/COUNT(reddit_bet.id)", "profitLossPerTrade")
      .addSelect("SUM(CASE WHEN reddit_bet.is_yolo IS TRUE THEN 1 ELSE 0 END)", "numIsYolo")
      .addSelect("SUM(reddit_bet.target)/COUNT(reddit_bet.id)", "targetAvg")
      .addSelect("SUM(reddit_bet.percentile)/COUNT(reddit_bet.id)", "percentileAvg")
      .addSelect("SUM(reddit_bet.bet_size)/COUNT(reddit_bet.id)", "betSizeAvg")
      .addSelect(`SUM(CASE WHEN reddit_bet.side = '${EPositionSide.Buy}' THEN 1 ELSE 0 END)`, "numBuys")
      .where("reddit_bet.username = :username", { username })
      .andWhere("reddit_bet.season_id = :seasonId", { seasonId })
      .groupBy("reddit_bet.username")
      .getRawOne<ISeasonSummary>();
  }

  // profitLossChartData({ username, seasonId }: UserRankArgs) {
  //   const weekAgo = dayjs.utc().subtract(7, "day").set("hour", 0).set("minute", 0).set("second", 0);
  //   const query = this.createQueryBuilder("reddit_bet")
  //     .select("EXTRACT(DOY FROM reddit_bet.created_at)", "day")
  //     .addSelect("COALESCE(SUM(CASE WHEN reddit_bet.profit_loss > 0 THEN reddit_bet.profit_loss ELSE 0 END),0)", "profit")
  //     .addSelect("COALESCE(SUM(CASE WHEN reddit_bet.profit_loss < 0 THEN reddit_bet.profit_loss ELSE 0 END),0)", "loss")
  //     .where("reddit_bet.created_at >= :weekAgo", { weekAgo })
  //     .andWhere("reddit_bet.username = :username", { username })
  //     .groupBy("1")
  //     .orderBy("day", "ASC");
  //   if (seasonId) query.andWhere("reddit_bet.season_id = :seasonId", { seasonId });
  //   return query.getRawMany<IProfitLossChartDataDTO>();
  // }
}
