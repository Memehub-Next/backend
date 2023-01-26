import { ArgsType, Field, Int } from "@nestjs/graphql";
import { IsOptional, IsUUID, Max, Min, Validate } from "class-validator";
import { UsernameArg } from "../../../common/Username";
import { ELeaderboard } from "../../../enums/ELeaderboard";
import { EPositionSide } from "../../../enums/EPositionSide";
import { ERedditBetOrder } from "../../../enums/ERedditBetOrder";
import { PaginatedArgs, TakeArg } from "../../../generics/pagination.g";
import { SeasonIdConstraint } from "../season/season.validators";

@ArgsType()
export class UserRedditBetsPaginatedArgs extends PaginatedArgs {
  @Field(() => ERedditBetOrder)
  eRedditBetOrder: ERedditBetOrder;

  @Field(() => String)
  @IsUUID()
  username: string;

  @Field(() => Boolean, { nullable: true })
  isYolo?: boolean;

  @Field(() => Boolean)
  isASC: boolean;

  @Field(() => EPositionSide, { nullable: true })
  ePositionSide?: EPositionSide;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Validate(SeasonIdConstraint)
  seasonId?: number;
}

@ArgsType()
export class UserRedditBetsArgs extends TakeArg {
  @Field(() => String)
  @IsUUID()
  username: string;

  @Field(() => EPositionSide, { nullable: true })
  ePositionSide?: EPositionSide;

  @Field(() => Boolean, { nullable: true })
  isYolo?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Validate(SeasonIdConstraint)
  seasonId?: number;
}

@ArgsType()
export class PlaceBetArgs {
  @Min(1)
  @Field(() => Int)
  betSize: number;

  @Field()
  @IsUUID()
  redditMemeId: string;

  @Field(() => EPositionSide)
  ePositionSide: EPositionSide;

  @Min(50)
  @Max(99)
  @Field(() => Int, { nullable: true })
  target?: number;
}

@ArgsType()
export class UsernameSeasonIdArgs extends UsernameArg {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  seasonId?: number;
}

@ArgsType()
export class MyRedditBetsArgs {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  seasonId?: number;

  @Field()
  @IsUUID()
  redditMemeId: string;
}

@ArgsType()
export class LeaderboardArgs {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Validate(SeasonIdConstraint)
  seasonId?: number;

  @Field(() => ELeaderboard)
  eLeaderboard: ELeaderboard;
}

@ArgsType()
export class TakeLeaderboardArgs extends LeaderboardArgs {
  @Field(() => ELeaderboard)
  eLeaderboard: ELeaderboard;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(3)
  @Max(50)
  take?: number;
}

@ArgsType()
export class UserRankArgs {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Validate(SeasonIdConstraint)
  seasonId?: number;

  @Field()
  @IsUUID()
  username: string;
}
