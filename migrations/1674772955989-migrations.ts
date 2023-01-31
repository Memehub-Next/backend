import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1674772955989 implements MigrationInterface {
    name = 'migrations1674772955989'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reddit_memes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reddit_id" character varying NOT NULL, "subreddit" character varying NOT NULL, "title" character varying NOT NULL, "author" character varying NOT NULL, "url" character varying NOT NULL, "upvote_ratio" double precision NOT NULL, "upvotes" integer NOT NULL, "downvotes" integer NOT NULL, "num_comments" integer NOT NULL, "percentile" double precision, CONSTRAINT "UQ_80fc13a6facb2e40853bc5ce717" UNIQUE ("url"), CONSTRAINT "PK_1ae085193dc492081d372e0299c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_roles_enum" AS ENUM('Admin', 'Hive')`);
        await queryRunner.query(`CREATE TABLE "users" ("username" character varying NOT NULL, "roles" "public"."users_roles_enum" array NOT NULL DEFAULT '{}', "avatar" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_fe0bb3f6520ee0469504521e710" PRIMARY KEY ("username"))`);
        await queryRunner.query(`CREATE TYPE "public"."reddit_bets_side_enum" AS ENUM('Buy', 'Sell')`);
        await queryRunner.query(`CREATE TABLE "reddit_bets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "side" "public"."reddit_bets_side_enum" NOT NULL, "bet_size" integer NOT NULL, "target" integer, "percentile" integer NOT NULL, "profit_loss" integer NOT NULL, "is_yolo" boolean NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "reddit_meme_id" uuid NOT NULL, "username" character varying NOT NULL, "season_id" integer NOT NULL, CONSTRAINT "PK_18a00df96371cfa8c88d0e1fff0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "seasons" ("id" SERIAL NOT NULL, CONSTRAINT "PK_cb8ed53b5fe109dcd4a4449ec9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "good_boy_points" ("season_id" integer NOT NULL, "username" character varying NOT NULL, "amount" integer NOT NULL DEFAULT '100', CONSTRAINT "PK_727d2d1455af54007f406b20467" PRIMARY KEY ("season_id", "username"))`);
        await queryRunner.query(`ALTER TABLE "reddit_bets" ADD CONSTRAINT "FK_26a6a9ec8b2c14a1c39d472d995" FOREIGN KEY ("reddit_meme_id") REFERENCES "reddit_memes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reddit_bets" ADD CONSTRAINT "FK_0fc3f9ada3ee455ea49eab5bb4e" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reddit_bets" ADD CONSTRAINT "FK_729ff002c468787d968de7261c1" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "good_boy_points" ADD CONSTRAINT "FK_0f5e81e95ee95195c8fb180a7c7" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "good_boy_points" ADD CONSTRAINT "FK_fcc3a5334d4a984ed82fd457852" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "good_boy_points" DROP CONSTRAINT "FK_fcc3a5334d4a984ed82fd457852"`);
        await queryRunner.query(`ALTER TABLE "good_boy_points" DROP CONSTRAINT "FK_0f5e81e95ee95195c8fb180a7c7"`);
        await queryRunner.query(`ALTER TABLE "reddit_bets" DROP CONSTRAINT "FK_729ff002c468787d968de7261c1"`);
        await queryRunner.query(`ALTER TABLE "reddit_bets" DROP CONSTRAINT "FK_0fc3f9ada3ee455ea49eab5bb4e"`);
        await queryRunner.query(`ALTER TABLE "reddit_bets" DROP CONSTRAINT "FK_26a6a9ec8b2c14a1c39d472d995"`);
        await queryRunner.query(`DROP TABLE "good_boy_points"`);
        await queryRunner.query(`DROP TABLE "seasons"`);
        await queryRunner.query(`DROP TABLE "reddit_bets"`);
        await queryRunner.query(`DROP TYPE "public"."reddit_bets_side_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_roles_enum"`);
        await queryRunner.query(`DROP TABLE "reddit_memes"`);
    }

}
