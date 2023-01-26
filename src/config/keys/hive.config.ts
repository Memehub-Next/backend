import { registerAs } from "@nestjs/config";

export interface IHiveEnvironment {
  memehubAcct: string;
  memehubWIF: string;
  communityUrl: string;
  json_metadata: string;
}

export const hiveEnvironment = registerAs("hiveEnvironment", (): IHiveEnvironment => {
  const community = process.env.ENV === "production" ? "hive-189111" : "hive-119015";
  const communityUrl = `https://peakd.com/c/${community}/created`;
  const json_metadata = JSON.stringify({
    tags: ["memehub", community],
    app: "memehub:beta",
    format: "markdown+html",
    community: "memehub",
  });
  return {
    memehubAcct: process.env.MEMEHUB_ACCOUNT,
    memehubWIF: process.env.MEMEHUB_WIF,
    communityUrl,
    json_metadata,
  };
});
