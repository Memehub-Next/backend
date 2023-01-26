import { Args, Int, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { UsernameArg } from "../../../common/Username";
import { DataLoaders } from "../../../decorators/dataLoaders";

import { IDataLoaders } from "../../dataloader/dataloader.service";
import { UserEntity } from "./user.entity";
import { UserService } from "./user.service";

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(private readonly service: UserService) {}

  @ResolveField(() => Int)
  wojakLevel(@Parent() user: UserEntity, @DataLoaders() { gbp: { wojakLevelByUsername } }: IDataLoaders) {
    return wojakLevelByUsername.load(user.username);
  }

  @ResolveField(() => Int)
  gbp(@DataLoaders() { gbp }: IDataLoaders, @Parent() { username }: UserEntity) {
    return gbp.byUsername.load(username);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @Query(() => UserEntity, { nullable: true })
  user(@Args() { username }: UsernameArg) {
    return this.service.repo.findOneByOrFail({ username: username });
  }
}
