interface IAppConfig {
  port: number;
  salts: number;
  url: string;
  client: {
    url: string;
  };
  jwt: {
    secret: string;
  };
  mercadopago: {
    accessToken: string;
  };
  email: {
    address: string;
    password: string;
  };
  vote: {
    price: number;
  };
}

export const AppConfig = (): IAppConfig => ({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  salts: process.env.SALTS ? parseInt(process.env.SALTS) : 10,
  url: process.env.URL || "http://localhost:3000",
  client: {
    url: process.env.CLIENT_URL || "*",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "VOX",
  },
  email: {
    address: process.env.EMAIL_ADDRESS!,
    password: process.env.EMAIL_PASSWORD!,
  },
  mercadopago: {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  },
  vote: {
    price: process.env.VOTE_PRICE ? parseInt(process.env.VOTE_PRICE) : 1,
  },
});
