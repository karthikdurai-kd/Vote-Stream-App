import { Redis } from "@upstash/redis";

require("dotenv").config();

const redisURL = process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL;
const resisToken = process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN;
export const redis = new Redis({
  url: redisURL,
  token: resisToken,
});
