import { registerEnumType } from "@nestjs/graphql";

export enum ECronJobRegistry {
  PopulateFakerQueue = "fakerService.populateFakerQueue",
  IncrementSeasonId = "SeasonService.incrementSeason",
}
registerEnumType(ECronJobRegistry, { name: "ECronJobRegistry" });

export const CRON_SCHEDULES_BY_MINS = {
  [ECronJobRegistry.PopulateFakerQueue]: 5,
};

export const CRON_SCHEDULES = {
  [ECronJobRegistry.PopulateFakerQueue]: "*/5 * * * *",
  [ECronJobRegistry.IncrementSeasonId]: process.env.ENV === "production" ? "0 0 * * 0" : "0 0 * * *",
};
