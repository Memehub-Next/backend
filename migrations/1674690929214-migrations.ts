import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1674690929214 implements MigrationInterface {
    name = 'migrations1674690929214'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reddit_memes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "reddit_id" character varying NOT NULL, "subreddit" character varying NOT NULL, "title" character varying NOT NULL, "author" character varying NOT NULL, "url" character varying NOT NULL, "upvote_ratio" double precision NOT NULL, "upvotes" integer NOT NULL, "downvotes" integer NOT NULL, "num_comments" integer NOT NULL, "percentile" double precision, CONSTRAINT "UQ_80fc13a6facb2e40853bc5ce717" UNIQUE ("url"), CONSTRAINT "PK_1ae085193dc492081d372e0299c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_roles_enum" AS ENUM('Admin', 'Hive')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "username" character varying NOT NULL, "roles" "public"."users_roles_enum" array NOT NULL DEFAULT '{}', "avatar" character varying, CONSTRAINT "PK_16f6cb1674a934b41b915a46ae0" PRIMARY KEY ("id", "username"))`);
        await queryRunner.query(`CREATE TABLE "good_boy_points" ("amount" integer NOT NULL DEFAULT '100', "season_id" integer NOT NULL, "user_id" character varying NOT NULL, CONSTRAINT "PK_8cf5a90a6f26bb98214c4a4839a" PRIMARY KEY ("season_id", "user_id"))`);
        await queryRunner.query(`CREATE TABLE "seasons" ("id" SERIAL NOT NULL, CONSTRAINT "PK_cb8ed53b5fe109dcd4a4449ec9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reddit_bets_side_enum" AS ENUM('Buy', 'Sell')`);
        await queryRunner.query(`CREATE TABLE "reddit_bets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "side" "public"."reddit_bets_side_enum" NOT NULL, "bet_size" integer NOT NULL, "target" integer, "percentile" integer NOT NULL, "profit_loss" integer NOT NULL, "is_yolo" boolean NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "reddit_meme_id" uuid NOT NULL, "user_id" character varying NOT NULL, "season_id" integer NOT NULL, CONSTRAINT "PK_18a00df96371cfa8c88d0e1fff0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "good_boy_points" ADD CONSTRAINT "FK_0f5e81e95ee95195c8fb180a7c7" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "good_boy_points" ADD CONSTRAINT "FK_e6def985228884dcec8d2c3ef9c" FOREIGN KEY ("user_id", "user_id") REFERENCES "users"("id","username") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reddit_bets" ADD CONSTRAINT "FK_26a6a9ec8b2c14a1c39d472d995" FOREIGN KEY ("reddit_meme_id") REFERENCES "reddit_memes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reddit_bets" ADD CONSTRAINT "FK_7b4bea1f1afbde4ed05821d7410" FOREIGN KEY ("user_id", "user_id") REFERENCES "users"("id","username") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reddit_bets" ADD CONSTRAINT "FK_729ff002c468787d968de7261c1" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reddit_bets" DROP CONSTRAINT "FK_729ff002c468787d968de7261c1"`);
        await queryRunner.query(`ALTER TABLE "reddit_bets" DROP CONSTRAINT "FK_7b4bea1f1afbde4ed05821d7410"`);
        await queryRunner.query(`ALTER TABLE "reddit_bets" DROP CONSTRAINT "FK_26a6a9ec8b2c14a1c39d472d995"`);
        await queryRunner.query(`ALTER TABLE "good_boy_points" DROP CONSTRAINT "FK_e6def985228884dcec8d2c3ef9c"`);
        await queryRunner.query(`ALTER TABLE "good_boy_points" DROP CONSTRAINT "FK_0f5e81e95ee95195c8fb180a7c7"`);
        await queryRunner.query(`DROP TABLE "reddit_bets"`);
        await queryRunner.query(`DROP TYPE "public"."reddit_bets_side_enum"`);
        await queryRunner.query(`DROP TABLE "seasons"`);
        await queryRunner.query(`DROP TABLE "good_boy_points"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_roles_enum"`);
        await queryRunner.query(`DROP TABLE "reddit_memes"`);
    }

}
