import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { SeasonEntity } from "../season/season.entity";
import { UserEntity } from "../user/user.entity";

export interface GoodBoyPointsKey {
  seasonId: number;
  username: string;
}

@ObjectType()
@Entity("good_boy_points")
export class GoodBoyPointsEntity {
  @Field(() => ID)
  @PrimaryColumn("integer", { name: "season_id" })
  seasonId: number;

  @ManyToOne(() => SeasonEntity, (season) => season.gbps, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "season_id" })
  season: SeasonEntity;

  @Field(() => ID)
  @PrimaryColumn("uuid", { name: "username" })
  username: string;

  @ManyToOne(() => UserEntity, (user) => user.gbps, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "username" })
  user: UserEntity;

  @Field(() => Int)
  @Column("integer", { default: 1000 })
  amount: number;
}
