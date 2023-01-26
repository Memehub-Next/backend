import { registerEnumType } from "@nestjs/graphql";

export enum EQueueRegistry {
  FAKER = "FAKER",
}
registerEnumType(EQueueRegistry, { name: "EQueueRegistry" });
