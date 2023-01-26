import { registerEnumType } from "@nestjs/graphql";

export enum ETradedOrder {
  Latest = "Latest",
  Best = "Best",
  Worst = "Worst",
}
registerEnumType(ETradedOrder, { name: "ETradedOrder" });
