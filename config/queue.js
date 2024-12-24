import Redis from 'ioredis';

export const redisClient = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const defaultQueueConfig = {
  //   delay: 10000,
  removeOnComplete: {
    count: 100,
    // 10 seconds
    age: 10000,
  },
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
};
