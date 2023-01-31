import { Args, ArgsType, Field, ObjectType, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { DataLoaders } from "../../../decorators/dataLoaders";
import { UserPassport } from "../../../decorators/userPassport";
import { ETradedOrder } from "../../../enums/ETradedOrder";
import { CreatePDTO, PaginatedArgs } from "../../../generics/pagination.g";
import { IUserPassport } from "../../../interfaces/IUserPassport";
import { IDataLoaders } from "../../dataloader/dataloader.service";
import { RedditBetEntity } from "../redditBet/redditBet.entity";
import { TakeArg } from "./../../../generics/pagination.g";

import { RedditMemeEntity } from "./redditMeme.entity";
import { RedditMemeService } from "./redditMeme.service";

@ArgsType()
class SeasonTradingPaginatedArgs extends PaginatedArgs {
  @Field(() => ETradedOrder, { nullable: true })
  eTradedOrder?: ETradedOrder;

  @Field()
  traded: boolean;
}

@ObjectType()
class RedditMemePDTO extends CreatePDTO(RedditMemeEntity) {}

@Resolver(() => RedditMemeEntity)
export class RedditMemeResolver {
  constructor(private readonly service: RedditMemeService) {}

  @ResolveField(() => RedditBetEntity, { nullable: true })
  redditBet(@DataLoaders() { redditBet: { byRedditMemeId } }: IDataLoaders, @Parent() { id }: RedditMemeEntity) {
    return byRedditMemeId.load(id);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @Query(() => [RedditMemeEntity])
  async randomRedditMemes(@Args() { take }: TakeArg, @UserPassport() userPassport?: IUserPassport): Promise<RedditMemeEntity[]> {
    const memesQ = this.service.repo
      .createQueryBuilder("reddit_meme")
      .where("reddit_meme.percentile IS NOT NULL")
      .orderBy("RANDOM()")
      .limit(take);
    if (userPassport?.username)
      memesQ
        .leftJoin("reddit_meme.redditBets", "reddit_bet")
        .groupBy("reddit_meme.id")
        .addGroupBy("reddit_bet.reddit_meme_id")
        .having("COUNT(reddit_bet.username = :username) != 0", { username: userPassport.username });
    return memesQ.getMany();
  }

  @Query(() => RedditMemePDTO)
  getTradedRedditMemes(
    @Args() { skip, take, traded, eTradedOrder }: SeasonTradingPaginatedArgs,
    @UserPassport() userPassport?: IUserPassport
  ): Promise<RedditMemePDTO> {
    return this.service.getTradedRedditMemes({ skip, take, username: userPassport?.username, traded, eTradedOrder });
  }
}
