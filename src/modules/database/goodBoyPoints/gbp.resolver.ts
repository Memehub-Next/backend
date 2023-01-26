import { Args, Int, Query, Resolver } from "@nestjs/graphql";
import { UsernameArg, UsernameSeasonIdArgs } from "../../../common/Username";
import { GoodBoyPointsEntity } from "../goodBoyPoints/gbp.entity";
import { GoodBoyPointsService } from "./gbp.service";

@Resolver(() => GoodBoyPointsEntity)
export class GoodBoyPointsResolver {
  constructor(private readonly service: GoodBoyPointsService) {}

  @Query(() => Int)
  async totalGbp(@Args() { username }: UsernameArg) {
    const result = await this.service.sumByUsername({ username });
    return result?.gbp ?? 0;
  }

  @Query(() => Int)
  async gbpBySeason(@Args() { username, seasonId }: UsernameSeasonIdArgs) {
    const result = await this.service.repo.findOneBy({ username, seasonId });
    return result?.amount ?? 100;
  }

  @Query(() => Int)
  wojakLevel(@Args() { username }: UsernameArg) {
    return this.service.wojakLevel({ username });
  }
}
