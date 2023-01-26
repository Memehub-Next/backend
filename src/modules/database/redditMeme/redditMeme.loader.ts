import { Injectable } from "@nestjs/common";
import DataLoader from "dataloader";
import { In } from "typeorm";
import { IUserPassport } from "../../../interfaces/IUserPassport";
import { RedditMemeEntity } from "./redditMeme.entity";
import { RedditMemeService } from "./redditMeme.service";

export interface IRedditMemeDataLoaders {
  byId: DataLoader<string, RedditMemeEntity>;
}

@Injectable()
export class RedditMemeDataloaderService {
  constructor(readonly redditMemeService: RedditMemeService) {}

  dataloaders(userPassport?: IUserPassport): IRedditMemeDataLoaders {
    userPassport;
    return {
      byId: new DataLoader<string, RedditMemeEntity>(async (ids) => {
        const entities = await this.redditMemeService.repo.findBy({ id: In([...ids]) });
        const idToEntity = entities.reduce<Record<string, RedditMemeEntity>>((prev, entity) => ({ [entity.id]: entity, ...prev }), {});
        return ids.map((id) => idToEntity[id]);
      }),
    };
  }
}
