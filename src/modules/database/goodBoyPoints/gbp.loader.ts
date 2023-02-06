import { Injectable } from "@nestjs/common";
import DataLoader from "dataloader";
import { In } from "typeorm";
import { IUserPassport } from "../../../interfaces/IUserPassport";
import { SeasonService } from "../season/season.service";
import { GoodBoyPointsService } from "./gbp.service";

export interface IGoodBoyPointsDataLoaders {
  byUsername: DataLoader<string, number>;
  wojakLevelByUsername: DataLoader<string, number>;
}

@Injectable()
export class GoodBoyPointsDataloaderService {
  constructor(private readonly seasonService: SeasonService, private readonly gbpService: GoodBoyPointsService) {}

  dataloaders(_userPassport?: IUserPassport): IGoodBoyPointsDataLoaders {
    return {
      byUsername: new DataLoader<string, number>(async (usernames) => {
        const seasonId = await this.seasonService.getCurrentSeasonId();
        const gbpEntities = await this.gbpService.repo.findBy({ username: In(usernames), seasonId });
        const usernameToGbp = gbpEntities.reduce<Record<string, number | undefined>>(
          (prev, gbpEntity) => ({ [gbpEntity.username]: gbpEntity.amount, ...prev }),
          {}
        );
        return usernames.map((username) => usernameToGbp[username] ?? 1000);
      }),
      wojakLevelByUsername: new DataLoader<string, number>(async (usernames) => {
        const wojakLevels = await this.gbpService.wojakLevels(usernames as string[]);
        return usernames.map((username) => wojakLevels[username] ?? 1);
      }),
    };
  }
}
