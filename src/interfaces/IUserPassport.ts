import { EUserRole } from "../enums/EUserRole";

export interface IUserPassport {
  username: string;
  roles: EUserRole[];
}
