import { registerEnumType } from "@nestjs/graphql";
import { Job, Queue } from "bull";

export interface ICreateFakeUser {}

export interface ICreateFakeBet {}

export enum EFakerJob {
  CREATE_FAKE_USER = "CREATE_FAKE_USER",
  CREATE_FAKE_REDDIT_BET = "CREATE_FAKE_REDDIT_BET",
}
registerEnumType(EFakerJob, { name: "EFakerJob" });

export type TFakerJobs = ICreateFakeUser | ICreateFakeBet;

export type TFakerQueue = Queue<TFakerJobs>;

export type TFakerJob<T extends TFakerJobs> = Omit<Job<T>, "name"> & { name: EFakerJob };
