import { kv } from '@vercel/kv';
import type { PromptConfig } from './store';

// Redis key patterns
const KEYS = {
  userConfigs: (userId: string) => `user:${userId}:configs`,
  config: (configId: string) => `config:${configId}`,
  userGenerated: (userId: string) => `user:${userId}:generated`,
  generated: (promptId: string) => `generated:${promptId}`,
};

// For now, use a default user ID until auth is implemented
const DEFAULT_USER_ID = 'default-user';

export async function getUserConfigs(userId: string = DEFAULT_USER_ID): Promise<PromptConfig[]> {
  try {
    const configIds = await kv.smembers(KEYS.userConfigs(userId));

    if (!configIds || configIds.length === 0) {
      return [];
    }

    const configs: PromptConfig[] = [];
    for (const id of configIds) {
      const config = await kv.hgetall(KEYS.config(id as string));
      if (config) {
        configs.push(config as unknown as PromptConfig);
      }
    }

    return configs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching configs from Redis:', error);
    return [];
  }
}

export async function saveConfig(config: PromptConfig, userId: string = DEFAULT_USER_ID): Promise<boolean> {
  try {
    await kv.hset(KEYS.config(config.id), config as any);
    await kv.sadd(KEYS.userConfigs(userId), config.id);
    return true;
  } catch (error) {
    console.error('Error saving config to Redis:', error);
    return false;
  }
}

export async function deleteConfig(configId: string, userId: string = DEFAULT_USER_ID): Promise<boolean> {
  try {
    await kv.del(KEYS.config(configId));
    await kv.srem(KEYS.userConfigs(userId), configId);
    return true;
  } catch (error) {
    console.error('Error deleting config from Redis:', error);
    return false;
  }
}

export async function getGeneratedPrompts(userId: string = DEFAULT_USER_ID, limit: number = 50): Promise<any[]> {
  try {
    const promptIds = await kv.lrange(KEYS.userGenerated(userId), 0, limit - 1);

    if (!promptIds || promptIds.length === 0) {
      return [];
    }

    const prompts: any[] = [];
    for (const id of promptIds) {
      const prompt = await kv.hgetall(KEYS.generated(id as string));
      if (prompt) {
        prompts.push(prompt);
      }
    }

    return prompts;
  } catch (error) {
    console.error('Error fetching generated prompts from Redis:', error);
    return [];
  }
}

export async function saveGeneratedPrompt(promptData: any, userId: string = DEFAULT_USER_ID): Promise<boolean> {
  try {
    const promptId = `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await kv.hset(KEYS.generated(promptId), promptData);
    await kv.lpush(KEYS.userGenerated(userId), promptId);
    await kv.ltrim(KEYS.userGenerated(userId), 0, 49); // Keep only last 50

    return true;
  } catch (error) {
    console.error('Error saving generated prompt to Redis:', error);
    return false;
  }
}
