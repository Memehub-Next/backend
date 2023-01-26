import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { IUserPassport } from "../../interfaces/IUserPassport";
import { UserEntity } from "../database/user/user.entity";

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser({ username, roles }: UserEntity, done: Function) {
    const passport: IUserPassport = { username: username, roles };
    done(null, passport);
  }

  deserializeUser(payload: IUserPassport, done: Function) {
    done(null, payload);
  }
}
