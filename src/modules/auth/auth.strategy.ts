import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { UserService } from "../database/user/user.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
  static key = "local";

  constructor(private readonly userService: UserService) {
    super();
  }

  async validate(_username: string, _password: string) {
    this.userService;
    return;
    // return this.userService.repo.validate({ username, password });
  }
}
