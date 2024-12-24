import redisCacheLib from 'express-redis-cache';
import { redisClient } from '../config/queue.js';

// Create an Upstash Redis client

// Use express-redis-cache and patch it to use the ioredis client
const redisCache = redisCacheLib({
  client: redisClient,
  prefix: 'learnRedis',
  expire: 60 * 60, // Cache expiration in seconds
});

export default redisCache;
