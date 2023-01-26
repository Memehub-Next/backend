import { Field, GraphQLISODateTime, ObjectType } from "@nestjs/graphql";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { EUserRole } from "../../../enums/EUserRole";
import { GoodBoyPointsEntity } from "../goodBoyPoints/gbp.entity";
import { RedditBetEntity } from "../redditBet/redditBet.entity";

@ObjectType()
@Entity("users")
export class UserEntity {
  @Field()
  @PrimaryColumn()
  username: string;

  @Field(() => [EUserRole])
  @Column({ type: "enum", array: true, enum: EUserRole, default: [] })
  roles: EUserRole[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar?: string;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn({ name: "created_at", type: "timestamp with time zone", nullable: false })
  createdAt: Date;

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @OneToMany(() => GoodBoyPointsEntity, (gbp) => gbp.user)
  gbps: GoodBoyPointsEntity[];

  @OneToMany(() => RedditBetEntity, (redditBet) => redditBet.user)
  redditBets: RedditBetEntity[];
}
