import { createClient } from 'redis';

export type RedisClient = ReturnType<typeof createClient>;

export const redisClient: RedisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000)
  },
});