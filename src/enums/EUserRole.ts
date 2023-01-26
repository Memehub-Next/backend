import { registerEnumType } from "@nestjs/graphql";

export enum EUserRole {
  Admin = "Admin",
  Hive = "Hive",
}
registerEnumType(EUserRole, { name: "EUserRole" });
