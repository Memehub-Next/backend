declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // server itself
      ENV: "local" | "development" | "staging" | "production"; // is prod only when deployed to prod
      NODE_ENV: "development" | "production"; // is prod anytime app is built
      BACKEND_HOST: string;
      BACKEND_PORT: string;
      ORIGIN_WHITE_LIST: string;
      FRONTEND_URL: string;
      SECRET: string;
      ADMINS: string;

      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_HOST: string;
      POSTGRES_PORT: string;
      POSTGRES_DB: string;

      REDIS_MOD_HOST: string;
      REDIS_MOD_PORT: string;

      // API keys
      SENDGRID_KEY: string;
      MEMEHUB_WIF: string;
      MEMEHUB_ACCOUNT: string;
    }
  }
}

export {};
