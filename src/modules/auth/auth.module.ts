import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { serverEnvironment } from "../../config/services/server.config";
import { UserModule } from "../database/user/user.module";
import { HiveModule } from "../hive/hive.module";
import { AuthController } from "./auth.controller";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";
import { SessionSerializer } from "./auth.session.serializer";
import { LocalStrategy } from "./auth.strategy";

@Module({
  imports: [HiveModule, UserModule, ConfigModule.forRoot({ load: [serverEnvironment] }), PassportModule.register({ session: true })],
  providers: [AuthService, LocalStrategy, SessionSerializer, AuthResolver],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
