import { createClient } from 'redis';

// Create Redis client using REDIS_URL
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

let isConnected = false;

// Connect to Redis
export async function getRedisClient() {
  if (!isConnected) {
    await redisClient.connect();
    isConnected = true;
    console.log('Redis connected successfully');
  }
  return redisClient;
}

// Wrapper functions to match @vercel/kv API
export const redis = {
  async get<T = string>(key: string): Promise<T | null> {
    const client = await getRedisClient();
    const value = await client.get(key);
    if (!value) return null;
    // Return raw value - let the application decide how to parse
    // If it's a JSON string that was stored, it will be returned as-is
    return value as T;
  },

  async set(key: string, value: any, options?: { ex?: number }): Promise<string> {
    const client = await getRedisClient();
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    if (options?.ex) {
      const result = await client.setEx(key, options.ex, stringValue);
      return result || 'OK';
    }
    const result = await client.set(key, stringValue);
    return result || 'OK';
  },

  async del(key: string): Promise<number> {
    const client = await getRedisClient();
    return await client.del(key);
  },

  async smembers(key: string): Promise<string[]> {
    const client = await getRedisClient();
    return await client.sMembers(key);
  },

  async sadd(key: string, ...members: string[]): Promise<number> {
    const client = await getRedisClient();
    return await client.sAdd(key, members);
  },

  async srem(key: string, ...members: string[]): Promise<number> {
    const client = await getRedisClient();
    return await client.sRem(key, members);
  },

  async hgetall(key: string): Promise<Record<string, string> | null> {
    const client = await getRedisClient();
    const result = await client.hGetAll(key);
    return Object.keys(result).length === 0 ? null : result;
  },

  async hset(key: string, value: Record<string, any>): Promise<number> {
    const client = await getRedisClient();
    return await client.hSet(key, value);
  },

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    const client = await getRedisClient();
    return await client.lRange(key, start, stop);
  },

  async lpush(key: string, ...values: string[]): Promise<number> {
    const client = await getRedisClient();
    return await client.lPush(key, values);
  },

  async ltrim(key: string, start: number, stop: number): Promise<string> {
    const client = await getRedisClient();
    return await client.lTrim(key, start, stop);
  },

  async lrem(key: string, count: number, value: string): Promise<number> {
    const client = await getRedisClient();
    return await client.lRem(key, count, value);
  },
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (isConnected) {
    await redisClient.quit();
    isConnected = false;
    console.log('Redis disconnected');
  }
  process.exit(0);
});
