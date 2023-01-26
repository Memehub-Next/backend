import { CacheInterceptor, CacheKey, CACHE_MANAGER, Inject, Injectable, UseInterceptors } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { Repository } from "typeorm";
import { CRON_SCHEDULES, ECronJobRegistry } from "../../../registry/cronjob.r";
import { SeasonEntity } from "./season.entity";

@Injectable()
export class SeasonService {
  constructor(
    @InjectRepository(SeasonEntity)
    public readonly repo: Repository<SeasonEntity>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
  ) {}

  currentSeasonIdSubquery() {
    return this.repo.createQueryBuilder("season").select("MAX(season.id)").getSql();
  }

  @CacheKey("currentSeasonId:")
  @UseInterceptors(CacheInterceptor)
  async getCurrentSeasonId() {
    return (await this.repo.count()) || (await this.repo.save(this.repo.create({ id: 1 }))).id;
  }

  @Cron(CRON_SCHEDULES[ECronJobRegistry.IncrementSeasonId], { name: ECronJobRegistry.IncrementSeasonId })
  async incrementSeason() {
    const seasonId = await this.getCurrentSeasonId();
    const season = await this.repo.save(this.repo.create({ id: seasonId + 1 }));
    return this.cacheManager.set("currentSeasonId:", season.id);
  }
}
