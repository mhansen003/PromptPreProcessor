import { redis } from './redis-client';
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
    const configIds = await redis.smembers(KEYS.userConfigs(userId));

    if (!configIds || configIds.length === 0) {
      return [];
    }

    const configs: PromptConfig[] = [];
    for (const id of configIds) {
      const hashData = await redis.hgetall(KEYS.config(id as string));
      if (hashData && hashData.data) {
        try {
          const config = JSON.parse(hashData.data as string);
          configs.push(config);
        } catch (parseError) {
          console.error('Error parsing config JSON:', parseError);
        }
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
    // Store config as JSON string in a single hash field
    await redis.hset(KEYS.config(config.id), { data: JSON.stringify(config) });
    await redis.sadd(KEYS.userConfigs(userId), config.id);
    return true;
  } catch (error) {
    console.error('Error saving config to Redis:', error);
    return false;
  }
}

export async function deleteConfig(configId: string, userId: string = DEFAULT_USER_ID): Promise<boolean> {
  try {
    await redis.del(KEYS.config(configId));
    await redis.srem(KEYS.userConfigs(userId), configId);
    return true;
  } catch (error) {
    console.error('Error deleting config from Redis:', error);
    return false;
  }
}

export async function getGeneratedPrompts(userId: string = DEFAULT_USER_ID, limit: number = 50): Promise<any[]> {
  try {
    const promptIds = await redis.lrange(KEYS.userGenerated(userId), 0, limit - 1);

    if (!promptIds || promptIds.length === 0) {
      return [];
    }

    const prompts: any[] = [];
    for (const id of promptIds) {
      const hashData = await redis.hgetall(KEYS.generated(id as string));
      if (hashData && hashData.data) {
        try {
          const prompt = JSON.parse(hashData.data as string);
          prompts.push(prompt);
        } catch (parseError) {
          console.error('Error parsing generated prompt JSON:', parseError);
        }
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
    const promptId = promptData.id || `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store prompt as JSON string in a single hash field
    await redis.hset(KEYS.generated(promptId), { data: JSON.stringify(promptData) });
    await redis.lpush(KEYS.userGenerated(userId), promptId);
    await redis.ltrim(KEYS.userGenerated(userId), 0, 9); // Keep only last 10

    return true;
  } catch (error) {
    console.error('Error saving generated prompt to Redis:', error);
    return false;
  }
}

export async function deleteGeneratedPrompt(promptId: string, userId: string = DEFAULT_USER_ID): Promise<boolean> {
  try {
    // Delete the prompt data
    await redis.del(KEYS.generated(promptId));
    // Remove from user's list
    await redis.lrem(KEYS.userGenerated(userId), 0, promptId);
    return true;
  } catch (error) {
    console.error('Error deleting generated prompt from Redis:', error);
    return false;
  }
}
