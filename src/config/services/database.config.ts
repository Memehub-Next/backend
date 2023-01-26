import { registerAs } from "@nestjs/config";

export interface IDatabaseEnvironment {
  host: string;
  username: string;
  password: string;
  port: number;
  database: string;
  type: "postgres";
}

export const databaseEnvironment = registerAs(
  "databaseEnvironment",
  (): IDatabaseEnvironment => ({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
  })
);
