interface IAppConfig {
  port: number;
  hash: number;
  url: string;
  client: {
    url: string;
  };
  jwt: {
    secret: string;
  };
}

export const AppConfig = (): IAppConfig => ({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  hash: process.env.HASH ? parseInt(process.env.HASH) : 10,
  url: process.env.URL || "http://localhost:3000",
  client: {
    url: process.env.CLIENT_URL || "http://localhost:4200",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "VOX",
  },
});
