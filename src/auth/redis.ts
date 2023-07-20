// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Redis from 'ioredis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not set');
}

export const client = new Redis(process.env.REDIS_URL);

/**
 * get from redis
 *
 * @param key string
 *
 * @returns values string
 */

export const redisGet = (key: string): Promise<string | null> =>
  new Promise((resolve, reject) => {
    client
      .get(key)
      .then((value) => {
        resolve(value);
      })
      .catch((err) => reject(err));
  });

/**
 * set key-value in redis
 *
 * @param key string
 * @param value string
 */
export const redisSet = (key: string, value: string): Promise<string | null> =>
  new Promise((resolve, reject) => {
    client
      .set(key, value)
      .then((reply) => {
        resolve(reply);
      })
      .catch((err) => reject(err));
  });

/**
 * set key-value in redis with ttl(expiry in seconds)
 *
 * @param key string
 * @param ttl number in seconds
 * @param value string
 */
export const redisSetex = (
  key: string,
  ttl: number,
  value: string,
): Promise<string> =>
  new Promise((resolve, reject) => {
    client
      .set(key, value, 'EX', ttl)
      .then((reply) => {
        resolve(reply);
      })
      .catch((err) => reject(err));
  });

/**
 * delete key from redis
 *
 * @param key string
 */
export const redisDel = (key: string): Promise<number> =>
  new Promise((resolve, reject) => {
    client
      .del(key)
      .then((reply) => {
        resolve(reply);
      })
      .catch((err) => reject(err));
  });
