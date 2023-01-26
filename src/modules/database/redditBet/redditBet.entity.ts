import { Field, GraphQLISODateTime, ID, Int, ObjectType } from "@nestjs/graphql";
import { Column, CreateDateColumn, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { v4 } from "uuid";
import { EPositionSide } from "../../../enums/EPositionSide";
import { RedditMemeEntity } from "../redditMeme/redditMeme.entity";
import { SeasonEntity } from "../season/season.entity";
import { UserEntity } from "../user/user.entity";

@ObjectType()
@Entity("reddit_bets")
export class RedditBetEntity {
  @Field(() => ID)
  @PrimaryColumn("uuid")
  @Generated("uuid")
  id: string = v4();

  @Field(() => EPositionSide)
  @Column({ type: "enum", enum: EPositionSide })
  side: EPositionSide;

  @Field(() => Int)
  @Column("int", { name: "bet_size" })
  betSize: number;

  @Field(() => Int, { nullable: true })
  @Column("int", { nullable: true })
  target: number;

  @Field(() => Int)
  @Column("int")
  percentile: number;

  @Field(() => Int)
  @Column("int", { name: "profit_loss" })
  profitLoss: number;

  @Field(() => Boolean)
  @Column("boolean", { name: "is_yolo" })
  isYolo: boolean;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn({ name: "created_at", type: "timestamp with time zone", nullable: false })
  createdAt: Date;

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @Field()
  @Column("uuid", { name: "reddit_meme_id" })
  redditMemeId: string;

  @ManyToOne(() => RedditMemeEntity, (redditMeme) => redditMeme.redditBets, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "reddit_meme_id" })
  redditMeme: RedditMemeEntity;

  @Field()
  @Column("uuid", { name: "username" })
  username: string;

  @ManyToOne(() => UserEntity, (user) => user.redditBets, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "username" })
  user: UserEntity;

  @Field(() => Int)
  @Column("integer", { name: "season_id" })
  seasonId: number;

  @ManyToOne(() => SeasonEntity, (season) => season.redditBets, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "season_id" })
  season: SeasonEntity;
}
