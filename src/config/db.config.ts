export interface IDatabaseConfig {
  mongo: { uri: string };
  redis: { uri: string };
}

export const DatabaseConfig = (): IDatabaseConfig => ({
  mongo: { uri: process.env.MONGO_URI || 'mongodb://localhost:27017/vox' },
  redis: { uri: process.env.REDIS_URI || 'redis://127.0.0.1:6379/0' },
});
