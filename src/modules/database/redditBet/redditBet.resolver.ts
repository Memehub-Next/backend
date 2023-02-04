import { UseGuards } from "@nestjs/common";
import { Args, Info, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { CacheScope } from "apollo-server-types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { GraphQLResolveInfo } from "graphql";
import { FindOptionsWhere } from "typeorm";
import { DataLoaders } from "../../../decorators/dataLoaders";
import { UserPassport } from "../../../decorators/userPassport";
import { EPositionSide } from "../../../enums/EPositionSide";
import { IUserPassport } from "../../../interfaces/IUserPassport";
import { IDataLoaders } from "../../dataloader/dataloader.service";
import { BasicAuthGuard } from "../../guards/BasicAuthGuard";
import { RedditMemeEntity } from "../redditMeme/redditMeme.entity";
import { SeasonService } from "../season/season.service";
import { ELeaderboard } from "./../../../enums/ELeaderboard";
import { TakeArg } from "./../../../generics/pagination.g";
import { GoodBoyPointsService } from "./../goodBoyPoints/gbp.service";
import { RedditBetEntity } from "./redditBet.entity";
import {
  LeaderboardArgs,
  LeaderboardPaginatedArgs,
  MyRedditBetsArgs,
  PlaceBetArgs,
  UsernameSeasonIdArgs,
  UserRedditBetsArgs,
  UserRedditBetsPaginatedArgs,
} from "./redditBet.resolver.args";
import {
  AllLeaderboardsDTO,
  LeaderboardPDTO,
  LeaderDTO,
  MyLeaderboardsDTO,
  RedditBetPDTO,
  SeasonSummaryDTO,
} from "./redditBet.resolver.dtos";
import { RedditBetService } from "./redditBet.service";
dayjs.extend(utc);

@Resolver(() => RedditBetEntity)
export class RedditBetResolver {
  constructor(
    private readonly service: RedditBetService,
    private readonly seasonService: SeasonService,
    private readonly gbpService: GoodBoyPointsService
  ) {}

  @ResolveField(() => RedditMemeEntity)
  meme(@DataLoaders() { redditMeme: { byId } }: IDataLoaders, @Parent() { redditMemeId }: RedditBetEntity): Promise<RedditMemeEntity> {
    return byId.load(redditMemeId);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @Query(() => RedditBetPDTO)
  async userRedditBetsPaginated(
    @Args() { eRedditBetOrder, username, ePositionSide, seasonId, isYolo, isASC, take, skip }: UserRedditBetsPaginatedArgs
  ) {
    const query = this.service.repo
      .createQueryBuilder("reddit_bet")
      .where("reddit_bet.username = :username", { username })
      .andWhere("reddit_bet.season_id = :seasonId", { seasonId: seasonId || (await this.seasonService.getCurrentSeasonId()) });
    if (ePositionSide)
      query.orderBy(
        `CASE reddit_bet.side
          WHEN '${EPositionSide.Sell}' THEN 0
          WHEN '${EPositionSide.Buy}' THEN 1
        END`,
        ePositionSide === EPositionSide.Buy ? "DESC" : "ASC"
      );
    if (typeof isYolo === "boolean") query.orderBy("reddit_bet.is_yolo", isYolo ? "DESC" : "ASC");
    if (ePositionSide || typeof isYolo === "boolean")
      query.addOrderBy(`reddit_bet.${eRedditBetOrder.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)}`, isASC ? "ASC" : "DESC");
    else query.orderBy(`reddit_bet.${eRedditBetOrder.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)}`, isASC ? "ASC" : "DESC");
    const bets = await query.skip(skip).take(take).getMany();
    return { items: bets, hasMore: take === bets.length };
  }

  @Query(() => [RedditBetEntity])
  async userRedditBets(@Args() { username, ePositionSide, isYolo, seasonId, take }: UserRedditBetsArgs) {
    const where: FindOptionsWhere<RedditBetEntity> = { username, seasonId: seasonId || (await this.seasonService.getCurrentSeasonId()) };
    if (ePositionSide) where.side = ePositionSide;
    if (typeof isYolo === "boolean") where.isYolo = isYolo;
    return this.service.repo.find({ where, order: { createdAt: "DESC" }, take });
  }

  @Query(() => RedditBetEntity, { nullable: true })
  @UseGuards(BasicAuthGuard)
  async myRedditBet(@Args() { redditMemeId, seasonId }: MyRedditBetsArgs, @UserPassport() { username }: IUserPassport) {
    seasonId = seasonId || (await this.seasonService.getCurrentSeasonId());
    return this.service.repo.findOneBy({ username, redditMemeId, seasonId });
  }

  @Query(() => SeasonSummaryDTO, { nullable: true })
  async seasonSummary(@Args() { username, seasonId }: UsernameSeasonIdArgs) {
    return this.service.seasonSummary({ username, seasonId: seasonId || (await this.seasonService.getCurrentSeasonId()) });
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @Query(() => LeaderboardPDTO)
  async leaderboard(
    @Info() info: GraphQLResolveInfo,
    @Args() { eLeaderboard, seasonId, take, skip }: LeaderboardPaginatedArgs
  ): Promise<LeaderboardPDTO> {
    info.cacheControl.setCacheHint({ maxAge: 60, scope: CacheScope.Public });
    seasonId = seasonId || (await this.seasonService.getCurrentSeasonId());
    const leaderBoard = await this.service.leaderboardQuery({ eLeaderboard, seasonId }).limit(take).offset(skip).getRawMany<LeaderDTO>();
    return { items: leaderBoard, hasMore: take === leaderBoard.length };
  }

  @Query(() => AllLeaderboardsDTO)
  async allLeaderboards(@Info() info: GraphQLResolveInfo, @Args() { take }: TakeArg): Promise<AllLeaderboardsDTO> {
    info.cacheControl.setCacheHint({ maxAge: 60, scope: CacheScope.Public });
    const seasonId = await this.seasonService.getCurrentSeasonId();
    return {
      bestTrade: await this.service
        .leaderboardQuery({ eLeaderboard: ELeaderboard.BestTrade, seasonId })
        .limit(take)
        .getRawMany<LeaderDTO>(),
      daily: await this.service.leaderboardQuery({ eLeaderboard: ELeaderboard.BestTrade, seasonId }).limit(take).getRawMany<LeaderDTO>(),
      ever: await this.service.leaderboardQuery({ eLeaderboard: ELeaderboard.BestTrade, seasonId }).limit(take).getRawMany<LeaderDTO>(),
      largestYolo: await this.service
        .leaderboardQuery({ eLeaderboard: ELeaderboard.BestTrade, seasonId })
        .limit(take)
        .getRawMany<LeaderDTO>(),
      season: await this.service.leaderboardQuery({ eLeaderboard: ELeaderboard.BestTrade, seasonId }).limit(take).getRawMany<LeaderDTO>(),
      weekly: await this.service.leaderboardQuery({ eLeaderboard: ELeaderboard.BestTrade, seasonId }).limit(take).getRawMany<LeaderDTO>(),
    };
  }

  @Query(() => LeaderDTO, { nullable: true })
  async myLeaderboard(
    @Info() info: GraphQLResolveInfo,
    @Args() { eLeaderboard, seasonId }: LeaderboardArgs,
    @UserPassport() passport?: IUserPassport
  ) {
    info.cacheControl.setCacheHint({ maxAge: 60, scope: CacheScope.Private });
    if (!passport) return;
    seasonId = seasonId || (await this.seasonService.getCurrentSeasonId());
    return this.service.leaderboardQuery({ eLeaderboard, seasonId, username: passport.username }).getRawOne<LeaderDTO>();
  }

  @Query(() => MyLeaderboardsDTO, { nullable: true })
  async myLeaderboards(@Info() info: GraphQLResolveInfo, @UserPassport() passport?: IUserPassport): Promise<MyLeaderboardsDTO | undefined> {
    if (!passport) return;
    info.cacheControl.setCacheHint({ maxAge: 60, scope: CacheScope.Private });
    const seasonId = await this.seasonService.getCurrentSeasonId();
    return {
      bestTrade: await this.service
        .leaderboardQuery({ eLeaderboard: ELeaderboard.BestTrade, seasonId, username: passport.username })
        .getRawOne<LeaderDTO>(),
      daily: await this.service
        .leaderboardQuery({ eLeaderboard: ELeaderboard.Daily, seasonId, username: passport.username })
        .getRawOne<LeaderDTO>(),
      ever: await this.service
        .leaderboardQuery({ eLeaderboard: ELeaderboard.Ever, seasonId, username: passport.username })
        .getRawOne<LeaderDTO>(),
      largestYolo: await this.service
        .leaderboardQuery({ eLeaderboard: ELeaderboard.LargestYolo, seasonId, username: passport.username })
        .getRawOne<LeaderDTO>(),
      season: await this.service
        .leaderboardQuery({ eLeaderboard: ELeaderboard.Season, seasonId, username: passport.username })
        .getRawOne<LeaderDTO>(),
      weekly: await this.service
        .leaderboardQuery({ eLeaderboard: ELeaderboard.Weekly, seasonId, username: passport.username })
        .getRawOne<LeaderDTO>(),
    };
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @Mutation(() => RedditBetEntity)
  @UseGuards(BasicAuthGuard)
  async placeBet(@Args() placeBetArgs: PlaceBetArgs, @UserPassport() { username }: IUserPassport): Promise<RedditBetEntity | undefined> {
    const gbpEntity = await this.gbpService.getById({ username });
    return this.service.placeBet({ gbpEntity, ...placeBetArgs });
  }
}
