interface IAppConfig {
  url: string;
  env: string;
  port: number;
  salts: number;
  randomPasswordSize: number;
  client: { url: string };
  jwt: { secret: string };
  abacatepay: { token: string };
  vote: { price: number };
  email: {
    address: string;
    password: string;
  };
}

export const AppConfig = (): IAppConfig => ({
  url: process.env.APP_URL ?? 'http://localhost:3000',
  env: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  salts: process.env.SALTS ? parseInt(process.env.SALTS) : 5,
  randomPasswordSize: process.env.CHUNK_SIZE_SECONDS
    ? parseInt(process.env.CHUNK_SIZE_SECONDS)
    : 8,
  client: { url: process.env.CLIENT_URL ?? 'http://localhost:4200' },
  jwt: { secret: process.env.JWT_SECRET ?? 'vox' },
  abacatepay: { token: process.env.ABACATEPAY_TOKEN! },
  vote: {
    price: process.env.VOTES_PRICE ? parseInt(process.env.VOTES_PRICE) : 1,
  },
  email: {
    address: process.env.EMAIL_ADDRESS!,
    password: process.env.EMAIL_PASSWORD!,
  },
});
