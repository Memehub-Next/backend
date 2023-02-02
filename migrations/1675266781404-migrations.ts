import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1675266781404 implements MigrationInterface {
    name = 'migrations1675266781404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reddit_memes" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reddit_memes" DROP COLUMN "created_at"`);
    }

}
