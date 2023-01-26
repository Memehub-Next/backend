import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import random from "random";
import { EQueueRegistry } from "../../registry/queue.r";
import { RedditBetService } from "../database/redditBet/redditBet.service";
import { RedditMemeService } from "../database/redditMeme/redditMeme.service";
import { UserService } from "../database/user/user.service";
import { EFakerJob, ICreateFakeBet, ICreateFakeUser, TFakerJob } from "./faker.jobs";

@Processor(EQueueRegistry.FAKER)
export class FakerConsumer {
  private readonly logger = new Logger(FakerConsumer.name);

  constructor(
    private readonly userService: UserService,
    private readonly redditBetService: RedditBetService,
    private readonly redditMemeService: RedditMemeService
  ) {}

  @Process(EFakerJob.CREATE_FAKE_USER)
  async createFakeUsers({ name }: TFakerJob<ICreateFakeUser>) {
    try {
      await this.userService.fakeOne();
    } catch (error) {
      this.logger.error(name, error.stack);
    }
  }

  @Process(EFakerJob.CREATE_FAKE_REDDIT_BET)
  async createFakeBet({ name }: TFakerJob<ICreateFakeBet>) {
    try {
      const user = await this.userService.getOneByMinGbp(1);
      if (user) {
        const redditMeme = await this.redditMemeService.getBetableRedditMeme({
          username: user.username,
          minPercentile: random.float() > 0.5 ? 0.5 : 0,
        });
        if (redditMeme) {
          await this.redditBetService.fakeOne({ username: user.username, redditMemeId: redditMeme.id });
        }
      }
    } catch (error) {
      this.logger.error(name, error.stack);
    }
  }
}
