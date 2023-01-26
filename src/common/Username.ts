import { ArgsType, Field, Int } from "@nestjs/graphql";
import { IsOptional, IsUUID, Validate } from "class-validator";
import { SeasonIdConstraint } from "../modules/database/season/season.validators";

@ArgsType()
export class UsernameArg {
  @Field()
  @IsUUID()
  username: string;
}

@ArgsType()
export class UsernameSeasonIdArgs {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Validate(SeasonIdConstraint)
  seasonId?: number;

  @Field()
  @IsUUID()
  username: string;
}
