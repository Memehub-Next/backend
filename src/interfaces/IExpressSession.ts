import { Session } from "express-session";
import { IUserPassport } from "./IUserPassport";

export interface IExpressSession extends Session {
  passport: { user: IUserPassport };
}
