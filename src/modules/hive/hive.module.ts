import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { hiveEnvironment } from "../../config/keys/hive.config";
import { HiveService } from "./hive.service";

@Module({
  imports: [ConfigModule.forRoot({ load: [hiveEnvironment] })],
  providers: [HiveService],
  exports: [HiveService],
})
export class HiveModule {}
