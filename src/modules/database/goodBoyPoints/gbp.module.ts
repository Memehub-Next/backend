import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SeasonModule } from "../season/season.module";
import { GoodBoyPointsEntity } from "./gbp.entity";
import { GoodBoyPointsGuard } from "./gbp.guard";
import { GoodBoyPointsDataloaderService } from "./gbp.loader";
import { GoodBoyPointsResolver } from "./gbp.resolver";
import { GoodBoyPointsService } from "./gbp.service";

@Module({
  imports: [TypeOrmModule.forFeature([GoodBoyPointsEntity]), SeasonModule],
  providers: [GoodBoyPointsService, GoodBoyPointsDataloaderService, GoodBoyPointsGuard, GoodBoyPointsResolver],
  exports: [GoodBoyPointsService, GoodBoyPointsDataloaderService, GoodBoyPointsGuard],
})
export class GoodBoyPointsModule {}
