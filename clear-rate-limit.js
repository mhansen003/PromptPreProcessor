const { createClient } = require('redis');

async function clearRateLimit() {
  const client = createClient({
    url: process.env.REDIS_URL,
  });

  await client.connect();
  console.log('Connected to Redis');

  // Clear all rate limit keys
  const keys = await client.keys('ratelimit:*');
  console.log(`Found ${keys.length} rate limit keys`);

  for (const key of keys) {
    await client.del(key);
    console.log(`Deleted: ${key}`);
  }

  await client.quit();
  console.log('Done!');
}

clearRateLimit().catch(console.error);
