import { Field, Float, GraphQLISODateTime, ID, Int, ObjectType } from "@nestjs/graphql";
import { Column, CreateDateColumn, Entity, Generated, OneToMany, PrimaryColumn } from "typeorm";
import { v4 } from "uuid";
import { RedditBetEntity } from "../redditBet/redditBet.entity";

@ObjectType()
@Entity("reddit_memes")
export class RedditMemeEntity {
  @Field(() => ID)
  @PrimaryColumn("uuid")
  @Generated("uuid")
  id: string = v4();

  @Field()
  @Column({ name: "reddit_id" })
  redditId: string;

  @Field()
  @Column()
  subreddit: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  author: string;

  @Field()
  @Column({ unique: true })
  url: string;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn({ name: "created_at", type: "timestamp with time zone", nullable: false })
  createdAt: Date;

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @Field(() => Float)
  @Column("float", { name: "upvote_ratio" })
  upvoteRatio: number;

  @Field(() => Int)
  @Column("integer")
  upvotes: number;

  @Field(() => Int)
  @Column("integer")
  downvotes: number;

  @Field(() => Int)
  @Column("integer", { name: "num_comments" })
  numComments: number;

  @Field(() => Float, { nullable: true })
  @Column("float", { nullable: true })
  percentile: number;

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @OneToMany(() => RedditBetEntity, (redditBet) => redditBet.redditMeme)
  redditBets: RedditBetEntity[];
}
