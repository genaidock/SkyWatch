import Redis from 'ioredis';

let _client = null;

export function getRedis() {
  if (_client) return _client;
  if (!process.env.REDIS_URL) return null;
  _client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 5) return null;
      return Math.min(times * 300, 2000);
    },
    enableReadyCheck: true,
  });
  _client.on('error', (err) => {
    console.error('Redis error:', err.message);
  });
  return _client;
}

const SETTINGS_KEY = 'skywatch_settings';

export async function getSettings() {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('getSettings error:', e.message);
    return null;
  }
}

export async function saveSettings(settings) {
  const redis = getRedis();
  if (!redis) throw new Error('REDIS_URL is not configured on the server.');
  await redis.set(SETTINGS_KEY, JSON.stringify(settings));
  return settings;
}

const _keyCache = { data: null, ts: 0 };
const KEY_TTL = 30 * 1000;

export async function getApiKeys() {
  const now = Date.now();
  if (_keyCache.data && now - _keyCache.ts < KEY_TTL) return _keyCache.data;

  const settings = await getSettings();
  const keys = (settings && settings.apiKeys) || {};
  const data = {
    airLabs: keys.airLabs || '',
  };
  _keyCache.data = data;
  _keyCache.ts = now;
  return data;
}

export function invalidateKeyCache() {
  _keyCache.data = null;
  _keyCache.ts = 0;
}

export async function rateLimit(key, limit, windowSec) {
  const redis = getRedis();
  if (!redis) return { allowed: true, count: 0 };
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSec);
    return { allowed: count <= limit, count };
  } catch (e) {
    console.error('rateLimit error:', e.message);
    return { allowed: true, count: 0 };
  }
}
