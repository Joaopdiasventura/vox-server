interface IDatabaseConfig {
  mongo: {
    uri: string;
  };
}

export const DatabaseConfig = (): IDatabaseConfig => ({
  mongo: { uri: process.env.MONGO_URI || "mongodb://localhost:27017/vox" },
});
