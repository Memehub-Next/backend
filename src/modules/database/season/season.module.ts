import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SeasonEntity } from "./season.entity";
import { SeasonResolver } from "./season.resolver";
import { SeasonService } from "./season.service";
import { SeasonIdConstraint } from "./season.validators";

@Module({
  imports: [TypeOrmModule.forFeature([SeasonEntity])],
  providers: [SeasonService, SeasonResolver, SeasonIdConstraint],
  exports: [SeasonService, SeasonIdConstraint],
})
export class SeasonModule {}
