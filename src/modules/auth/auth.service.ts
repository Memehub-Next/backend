import { cryptoUtils, Signature } from "@hiveio/dhive";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { serverEnvironment } from "../../config/services/server.config";
import { EUserRole } from "../../enums/EUserRole";

import { UserService } from "../database/user/user.service";
import { HiveService } from "../hive/hive.service";

@Injectable()
export class AuthService {
  // private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(serverEnvironment.KEY)
    private readonly serverEnv: ConfigType<typeof serverEnvironment>,
    public readonly userService: UserService,
    private readonly hiveService: HiveService
  ) {}

  async validateHiveUser({ username, signedMessage, message }: { username: string; signedMessage: string; message: string }) {
    const [account] = await this.hiveService.dhive.database.getAccounts([username]);
    const pubPostingKey = account.posting.key_auths[0][0];
    const recoveredPubKey = Signature.fromString(signedMessage).recover(cryptoUtils.sha256(message)).toString();
    if (pubPostingKey !== recoveredPubKey) throw new UnauthorizedException();
    const user = await this.userService.repo.findOne({ where: { username } });
    if (user) return this.userService.repo.save(user);
    const avatar: string =
      // @ts-ignore
      JSON.parse(account.posting_json_metadata).profile.profile_image || JSON.parse(account.json_metadata).profile.profile_image;
    return this.userService.repo.save(this.userService.repo.create({ username, avatar, roles: [EUserRole.Hive] }));
  }

  async setAdmins() {
    const roles = Object.values(EUserRole);
    for (const [username] of Object.entries(this.serverEnv.admins)) {
      const admin = await this.userService.repo.findOne({ where: { username } });
      if (!admin) {
        await this.userService.repo.save(this.userService.repo.create({ username, roles }));
      } else if (admin.roles !== roles) {
        admin.roles = roles;
        this.userService.repo.save(admin);
      }
    }
  }
}
