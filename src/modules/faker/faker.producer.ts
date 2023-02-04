import { InjectQueue } from "@nestjs/bull";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import random from "random";
import { UserService } from "../database/user/user.service";
import { EFakerJob, TFakerQueue } from "./faker.jobs";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { serverEnvironment } from "../../config/services/server.config";
import { CRON_SCHEDULES, CRON_SCHEDULES_BY_MINS, ECronJobRegistry } from "../../registry/cronjob.r";
import { EQueueRegistry } from "../../registry/queue.r";
dayjs.extend(utc);

const RUN_EVERY_X_MINS = CRON_SCHEDULES_BY_MINS[ECronJobRegistry.PopulateFakerQueue];
const getRandomDelay = () => random.int(0, RUN_EVERY_X_MINS * 1000 * 60);

@Injectable()
export class FakerProducer {
  private readonly logger = new Logger(FakerProducer.name);

  constructor(
    @InjectQueue(EQueueRegistry.FAKER)
    private readonly queue: TFakerQueue,
    @Inject(serverEnvironment.KEY)
    private readonly serverEnv: ConfigType<typeof serverEnvironment>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly userService: UserService
  ) {}

  private readonly settings = {
    active: 10,
    create: {
      users: 5,
      getNumBettors: async () => Math.max((await this.userService.repo.count()) / (10 * 24 * 12), 100),
    },
  };

  async asyncConstructor() {
    if (this.serverEnv.isProd || this.serverEnv.isStaging) {
      await this.queue.pause();
      this.schedulerRegistry.getCronJob(ECronJobRegistry.PopulateFakerQueue).stop();
    } else {
      await this.queue.clean(0);
      this.populateFakerQueue();
    }
  }

  @Cron(CRON_SCHEDULES[ECronJobRegistry.PopulateFakerQueue], { name: ECronJobRegistry.PopulateFakerQueue })
  async populateFakerQueue() {
    this.logger.log("Populating Faker Queue");
    for (const _ of Array.from(Array(random.int(0, this.settings.create.users)).keys())) {
      this.queue.add(EFakerJob.CREATE_FAKE_USER, {}, { delay: getRandomDelay() });
    }
    const limit = random.int(0, this.settings.active);
    if (limit) {
      const randUsers = await this.userService.getRandMany(limit);
      if (randUsers.length) {
        const { create } = this.settings;
        Array.from(Array(await create.getNumBettors()).keys()).map(() =>
          this.queue.add(EFakerJob.CREATE_FAKE_REDDIT_BET, {}, { delay: getRandomDelay() })
        );
      }
    }
  }
}
