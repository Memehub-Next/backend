import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SeasonService } from "../season/season.service";
import { GoodBoyPointsEntity } from "./gbp.entity";

@Injectable()
export class GoodBoyPointsService {
  constructor(
    @InjectRepository(GoodBoyPointsEntity) public readonly repo: Repository<GoodBoyPointsEntity>,
    public readonly seasonService: SeasonService
  ) {}

  async getById({ username, seasonId }: { username: string; seasonId?: number }) {
    seasonId = seasonId || (await this.seasonService.getCurrentSeasonId());
    return (await this.repo.findOneBy({ seasonId, username })) || (await this.repo.save(this.repo.create({ seasonId, username })));
  }

  private readonly levelUpExp = [
    1_000, 3_000, 6_000, 10_000, 15_000, 21_000, 28_000, 36_000, 45_000, 55_000, 66_000, 78_000, 91_000, 105_000, 120_000, 136_000, 153_000,
    171_000, 190_000, 210_000, 231_000, 253_000, 276_000,
  ];

  gbpToWojakLevel(gbp?: number) {
    if (!gbp) return 1;
    for (let i = 0; i < this.levelUpExp.length; i++) {
      if (gbp <= this.levelUpExp[i]) return i + 1;
    }
    return this.levelUpExp.length + 1;
  }

  async wojakLevel({ username }: { username: string }) {
    const result = await this.sumByUsername({ username });
    return this.gbpToWojakLevel(result?.gbp);
  }

  async wojakLevels(usernames: string[]) {
    const results = await this.sumByUsernames(usernames);
    return results.reduce<Record<string, number>>((prev, { gbp, username }) => ({ ...prev, [username]: this.gbpToWojakLevel(gbp) }), {});
  }

  sumByUsername({ username }: { username: string }) {
    return this.repo
      .createQueryBuilder("gbp_entity")
      .select("SUM(gbp_entity.amount)", "gbp")
      .where("gbp_entity.username = :username", { username })
      .groupBy("gbp_entity.username")
      .getRawOne<{ gbp: number }>();
  }

  sumByUsernames(usernames: string[]) {
    return this.repo
      .createQueryBuilder("gbp_entity")
      .select("SUM(gbp_entity.amount)", "gbp")
      .addSelect("gbp_entity.username", "username")
      .where("gbp_entity.username IN (:...usernames)", { usernames })
      .groupBy("gbp_entity.username")
      .getRawMany<{ gbp: number; username: string }>();
  }
}
