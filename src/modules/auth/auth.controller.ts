import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiProperty, ApiTags } from "@nestjs/swagger";
import { UserService } from "../database/user/user.service";

class AvailableDTO {
  @ApiProperty()
  available: boolean;
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(public readonly userService: UserService) {}

  @ApiOkResponse({ type: AvailableDTO })
  @Get("/is-username-available/:username")
  async isUsernameAvailable(@Param("username") username: string): Promise<AvailableDTO> {
    return { available: !(await this.userService.repo.findOneBy({ username })) };
  }
}
