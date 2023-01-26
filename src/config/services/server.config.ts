import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { registerAs } from "@nestjs/config";
import { SessionOptions } from "express-session";
import Url from "url-parse";

export enum EDatabase {
  Dev = "Dev",
  Prod = "Prod",
}

export interface IServerEnvironment {
  protocol: string;
  host: string;
  port: number;
  admins: Record<string, string>;
  isLocal: boolean;
  isDev: boolean;
  isStaging: boolean;
  isProd: boolean;
  secret: string;
  frontendUrl: string;
  corsOptions: CorsOptions;
  sessionOptions: SessionOptions;
}

export const serverEnvironment = registerAs("serverEnvironment", (): IServerEnvironment => {
  const isLocal = process.env.ENV === "local";
  const isDev = process.env.ENV === "production";
  const isStaging = process.env.ENV === "production";
  const isProd = process.env.ENV === "production";
  const protocol = isLocal ? "http" : "https";
  const host = process.env.BACKEND_HOST;
  const originWhitelist = JSON.parse(process.env.ORIGIN_WHITE_LIST);
  const secret = process.env.SECRET;
  const admins = JSON.parse(process.env.ADMINS) as Record<string, string>;
  const port = Number(process.env.BACKEND_PORT) || 5000;
  const corsOptions: CorsOptions = {
    origin: (origin: string, callback: Function) => {
      if (typeof origin === "undefined") return callback(null, true);
      const url = new Url(origin);
      if (originWhitelist.includes(url.hostname)) return callback(null, true);
      return callback(
        new Error(
          `who do you think you are? origin: ${origin}, url: ${url}, originWhitelist: ${originWhitelist}, url.hostname:${url.hostname}`
        )
      );
    },
    credentials: true,
  };
  const sessionOptions: SessionOptions = {
    name: "speedCowOwen",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      domain: isProd ? ".memehub.lol" : undefined,
    },
    secret,
    resave: false,
    saveUninitialized: false,
  };
  return {
    protocol,
    host,
    port,
    admins,
    isLocal,
    isDev,
    isStaging,
    isProd,
    secret,
    frontendUrl: process.env.FRONTEND_URL,
    corsOptions,
    sessionOptions,
  };
});
