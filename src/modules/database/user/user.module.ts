import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SeasonModule } from "../season/season.module";
import { UserEntity } from "./user.entity";
import { UserResolver } from "./user.resolver";
import { UserService } from "./user.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), SeasonModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
  controllers: [],
})
export class UserModule {}
