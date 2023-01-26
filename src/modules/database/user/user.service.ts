import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EUserRole } from "../../../enums/EUserRole";
import { SeasonService } from "../season/season.service";
import { UserEntity } from "./user.entity";

export interface IUserLevelQ {
  hasYoloed: boolean;
  net: number;
  isHive: boolean;
}

@Injectable()
export class UserService {
  // private readonly logger = new Logger(UserService.name);

  constructor(@InjectRepository(UserEntity) public readonly repo: Repository<UserEntity>, private readonly seasonService: SeasonService) {}

  fakeOne() {
    return this.repo.save(
      this.repo.create({
        avatar: faker.image.avatar(),
        username: faker.internet.userName(),
      })
    );
  }

  fakeMany(num: number) {
    return this.repo.save(
      Array.from(Array(num).keys()).map(() =>
        this.repo.create({
          avatar: faker.image.avatar(),
          username: faker.internet.userName(),
        })
      )
    );
  }

  getRandMany(limit: number) {
    return this.repo.createQueryBuilder().orderBy("RANDOM()").limit(limit).getMany();
  }

  async getManyByMinGbp({ minGbp = 0, limit }: { minGbp?: number; limit: number }) {
    const seasonId = await this.seasonService.getCurrentSeasonId();
    return this.repo
      .createQueryBuilder("user")
      .where("NOT (:eUserRole = ANY(user.roles))", { eUserRole: EUserRole.Admin })
      .leftJoin("user.gbps", "gbps")
      .andWhere("(gbps.season_id = :seasonId OR gbps.season_id IS NULL)", { seasonId })
      .andWhere("(gbps.amount >= :minGbp OR gbps.amount IS NULL)", { minGbp })
      .orderBy("RANDOM()")
      .limit(limit)
      .getMany();
  }

  async getOneByMinGbp(minGbp: number = 0) {
    const seasonId = await this.seasonService.getCurrentSeasonId();
    return this.repo
      .createQueryBuilder("user")
      .where("NOT (:eUserRole = ANY(user.roles))", { eUserRole: EUserRole.Admin })
      .leftJoin("user.gbps", "gbps")
      .andWhere("(gbps.season_id = :seasonId OR gbps.season_id IS NULL)", { seasonId })
      .andWhere("(gbps.amount >= :minGbp OR gbps.amount IS NULL)", { minGbp })
      .orderBy("RANDOM()")
      .getOne();
  }
}
