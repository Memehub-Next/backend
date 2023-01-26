import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
dotenv.config();

export default new DataSource({
  name: "default",
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [__dirname + "/src/**/*.entity.{ts,js}"],
  migrations: [__dirname + "/migrations/**/*.{ts,js}"],
});
