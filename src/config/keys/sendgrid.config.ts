import { registerAs } from "@nestjs/config";

export interface ISendgridEnvironment {
  sendgridKey: string;
}

export const sendgridEnvironment = registerAs(
  "sendgridEnvironment",
  (): ISendgridEnvironment => ({
    sendgridKey: process.env.SENDGRID_KEY,
  })
);
