import { registerEnumType } from "@nestjs/graphql";

export enum ERedditBetOrder {
  createdAt = "createdAt",
  betSize = "betSize",
  percentile = "percentile",
  target = "target",
  profitLoss = "profitLoss",
}
registerEnumType(ERedditBetOrder, { name: "ERedditBetOrder" });
