import { ArgsType, Field, Int } from "@nestjs/graphql";
import { IsOptional, Validate } from "class-validator";
import { SeasonIdConstraint } from "../modules/database/season/season.validators";

@ArgsType()
export class UsernameArg {
  @Field()
  username: string;
}

@ArgsType()
export class UsernameSeasonIdArgs {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Validate(SeasonIdConstraint)
  seasonId?: number;

  @Field()
  username: string;
}
