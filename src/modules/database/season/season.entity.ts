import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { GoodBoyPointsEntity } from "../goodBoyPoints/gbp.entity";
import { RedditBetEntity } from "../redditBet/redditBet.entity";

@ObjectType()
@Entity("seasons")
export class SeasonEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => RedditBetEntity, (redditBet) => redditBet.season)
  redditBets: RedditBetEntity[];

  @OneToMany(() => GoodBoyPointsEntity, (gbp) => gbp.season)
  gbps: GoodBoyPointsEntity[];
}
