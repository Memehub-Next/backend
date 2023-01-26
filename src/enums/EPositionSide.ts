import { registerEnumType } from "@nestjs/graphql";

export enum EPositionSide {
  Buy = "Buy",
  Sell = "Sell",
}
registerEnumType(EPositionSide, { name: "EPositionSide" });
