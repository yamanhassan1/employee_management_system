/**
 * Redis Integration
 * -----------------
 * Central Redis client factory.
 *
 * Responsibilities:
 *  - Provide a single, shared Redis client for caching, online-user
 *    tracking, OTP storage, rate limiting, and BullMQ.
 *  - Gracefully degrade when Redis is unavailable (so auth still works
 *    in local dev without Redis).
 *
 * Usage:
 *   const { getRedis, closeRedis } = require('../integrations/redis');
 *   const redis = await getRedis();
 *   await redis.set('key', 'value', 'EX', 60);
 *
 * NOTE: This file is a thin wrapper. The actual `redis` package is
 * installed in a later TODO (Redis phase). Until then, the module
 * exports a no-op stub so importing it never crashes the app.
 */
let client = null;

/**
 * Lazy-initialize and return the Redis client.
 * @returns {Promise<object|null>}
 */
const getRedis = async () => {
  if (client) return client;
  try {
    // Dynamically require so the app boots even if `redis` is not installed.
    const { createClient } = require("redis");
    const { REDIS_URL } = require("../config/env");
    client = createClient({ url: REDIS_URL });
    client.on("error", (err) => console.warn("[redis] connection error:", err.message));
    await client.connect();
    console.log("[redis] connected");
    return client;
  } catch (err) {
    console.warn("[redis] unavailable, running without cache:", err.message);
    return null;
  }
};

/**
 * Cache getter with graceful fallback.
 * @param {string} key
 * @returns {Promise<string|null>}
 */
const get = async (key) => {
  const r = await getRedis();
  if (!r) return null;
  try {
    return await r.get(key);
  } catch {
    return null;
  }
};

/**
 * Cache setter with TTL (seconds).
 * @param {string} key
 * @param {string} value
 * @param {number} ttlSeconds
 */
const set = async (key, value, ttlSeconds = 60) => {
  const r = await getRedis();
  if (!r) return;
  try {
    await r.set(key, value, { EX: ttlSeconds });
  } catch {
    /* ignore cache write failures */
  }
};

/**
 * Cache invalidator.
 * @param {string} key
 */
const del = async (key) => {
  const r = await getRedis();
  if (!r) return;
  try {
    await r.del(key);
  } catch {
    /* ignore */
  }
};

/**
 * Close the Redis connection (graceful shutdown).
 */
const closeRedis = async () => {
  if (client) {
    await client.quit();
    client = null;
  }
};

module.exports = { getRedis, closeRedis, get, set, del };
