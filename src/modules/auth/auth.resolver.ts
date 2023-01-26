import { PrivateKey } from "@hiveio/dhive";
import { UseGuards } from "@nestjs/common";
import { Args, ArgsType, Context, Field, Mutation, Query, Resolver } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, IsUUID, Matches, MaxLength, MinLength } from "class-validator";
import { UserPassport } from "../../decorators/userPassport";
import { IGraphQLContext } from "../../interfaces/IGraphQLContext";
import { IUserPassport } from "../../interfaces/IUserPassport";
import { MatchFields } from "../../validators/matchField";

import { UserEntity } from "../database/user/user.entity";
import { UserService } from "../database/user/user.service";
import { HiveService } from "../hive/hive.service";
import { DashboardPassport } from "./auth.passport";
import { AuthService } from "./auth.service";

@ArgsType()
export class NewPasswordArg {
  @Field()
  @MinLength(8)
  @MaxLength(40)
  @Matches(/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/, {
    message: "Password must contain at least 8 characters, one uppercase, one number and one special case character",
  })
  password: string;
}

@ArgsType()
export class HiveRegistrationArgs extends NewPasswordArg {
  @Field()
  @MinLength(6)
  @MaxLength(20)
  username: string;
}

@ArgsType()
export class UserRegistrationArgs extends HiveRegistrationArgs {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MatchFields(["password"])
  passwordConfirm: string;
}

@ArgsType()
class HiveLoginArgs {
  @Field()
  @IsNotEmpty()
  username: string;

  @Field()
  @IsNotEmpty()
  message: string;

  @Field()
  @IsNotEmpty()
  signedMessage: string;
}

@ArgsType()
class LoginArgs {
  @Field()
  @IsNotEmpty()
  username: string;

  @Field()
  @IsNotEmpty()
  password: string;
}

@ArgsType()
export class TokenArg {
  @Field()
  @IsUUID()
  token: string;
}

@ArgsType()
export class TokenPasswordArg extends NewPasswordArg {
  @Field()
  @IsUUID()
  token: string;
}

@Resolver(() => UserEntity)
export class AuthResolver {
  constructor(
    private readonly service: AuthService,
    private readonly hiveService: HiveService,
    private readonly userService: UserService
  ) {}

  @Query(() => UserEntity, { nullable: true })
  me(@UserPassport() passport?: IUserPassport) {
    if (!passport) return;
    return this.userService.repo.findOneBy({ username: passport.username });
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @Mutation(() => UserEntity)
  async hiveLogin(@Context() context: IGraphQLContext, @Args() { username, message, signedMessage }: HiveLoginArgs): Promise<UserEntity> {
    const user = await this.service.validateHiveUser({ username, signedMessage, message });
    context.req.login(user, (err) => {
      if (err) throw err;
      context.req.session.passport.user = { username: user.username, roles: user.roles };
    });
    return user;
  }

  @Mutation(() => UserEntity)
  @UseGuards(DashboardPassport)
  login(@UserPassport() passport: IUserPassport, @Args() _loginArgs: LoginArgs): Promise<UserEntity> {
    return passport as any;
  }

  @Mutation(() => Boolean)
  logout(@Context() { req }: IGraphQLContext) {
    req.logout(() => {});
    return true;
  }

  @Mutation(() => Boolean)
  async createHiveAcct(@Args() { username, password }: HiveRegistrationArgs): Promise<boolean> {
    const op = this.hiveService.createClaimedAccountOperation(username, password);
    try {
      const { expired } = await this.hiveService.dhive.broadcast.sendOperations([op], PrivateKey.from(process.env.MEMEHUB_WIF));
      return expired;
    } catch (error) {
      return false;
    }
  }
}
