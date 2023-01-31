import { Field, Int, ObjectType } from "@nestjs/graphql";
import { CreatePDTO } from "../../../generics/pagination.g";
import { RedditBetEntity } from "./redditBet.entity";
import { ILeaderboardData, IProfitLossChartDataDTO, ISeasonSummary } from "./redditBet.service";

@ObjectType()
export class ProfitLossChartDataDTO implements IProfitLossChartDataDTO {
  @Field(() => Int)
  day: number;

  @Field(() => Int)
  profit: number;

  @Field(() => Int)
  loss: number;
}

@ObjectType()
export class SeasonSummaryDTO implements ISeasonSummary {
  @Field(() => Int)
  numTrades: number;

  @Field(() => Int)
  numGoodTrades: number;

  @Field(() => Int)
  profitLossTotal: number;

  @Field(() => Int)
  profitLossPerTrade: number;

  @Field(() => Int)
  numIsYolo: number;

  @Field(() => Int)
  targetAvg: number;

  @Field(() => Int)
  percentileAvg: number;

  @Field(() => Int)
  betSizeAvg: number;

  @Field(() => Int)
  numBuys: number;
}

@ObjectType()
export class LeaderboardDTO implements ILeaderboardData {
  @Field()
  username: string;

  @Field(() => Int)
  rank: number;

  @Field(() => Int)
  profitLoss: number;

  @Field({ nullable: true })
  avatar?: string;
}

@ObjectType()
export class LeaderboardPDTO extends CreatePDTO(LeaderboardDTO) {}

@ObjectType()
export class RedditBetPDTO extends CreatePDTO(RedditBetEntity) {}
