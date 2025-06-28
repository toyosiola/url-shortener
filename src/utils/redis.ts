import "server-only";

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import server_env from "./env.server";

export const redisClient = new Redis({
  url: server_env.REDIS_URL,
  token: server_env.REDIS_TOKEN,
});

export const redisRatelimit = {
  free: new Ratelimit({
    redis: redisClient,
    analytics: false, // set to true to enable analytics tracking
    prefix: "ratelimit:url_shortener:free", // Optional prefix for the keys used in redis
    limiter: Ratelimit.fixedWindow(20, "86400s"), // 24hrs in seconds. 20 operations in 24hrs
  }),
  pro: new Ratelimit({
    redis: redisClient,
    analytics: false,
    prefix: "ratelimit:url_shortener:pro",
    limiter: Ratelimit.fixedWindow(100, "86400s"), // 100 operations in 24hrs
  }),
};
