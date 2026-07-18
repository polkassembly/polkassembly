// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import firebaseAdmin, { firestore_db } from '~src/services/firebaseInit';

/**
 * Redis replacement.
 *
 * Auth tokens/challenges (login sign messages, 2FA tokens, email verification,
 * password reset, create/edit post challenges) are written by one serverless
 * invocation and read by another, so they need shared storage — they live in
 * a Firestore collection with an expiry field. Volume is low (auth events
 * only), so cost is negligible.
 *
 * Everything else is response caching (post details, listings, subscan data),
 * which is served from a per-instance in-memory cache. With Fluid compute a
 * warm instance serves many requests, so hit rates stay useful. TTLs are
 * capped because cross-instance invalidation is not possible: a short cap
 * bounds staleness after edits made on other instances.
 */

const AUTH_KEY_PREFIXES = ['PRT-', 'ALN-', 'ASU-', 'SCR-', 'EVT-', 'MLA-', 'CPT-', 'EPT-', 'TFA-'];
const AUTH_TOKENS_COLLECTION = 'auth_tokens';

const DEFAULT_CACHE_TTL_SECONDS = 300;
const MAX_CACHE_TTL_SECONDS = 300;
const MAX_CACHE_ENTRIES = 500;

interface CacheEntry {
	value: string;
	expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();

const isAuthKey = (key: string): boolean => AUTH_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));

const authDocRef = (key: string) => firestore_db.collection(AUTH_TOKENS_COLLECTION).doc(encodeURIComponent(key));

function memoryCacheSet(key: string, value: string, ttlSeconds: number) {
	const ttl = Math.min(ttlSeconds, MAX_CACHE_TTL_SECONDS);
	if (memoryCache.size >= MAX_CACHE_ENTRIES && !memoryCache.has(key)) {
		// Evict the oldest entry (Map preserves insertion order)
		const oldestKey = memoryCache.keys().next().value;
		if (oldestKey !== undefined) memoryCache.delete(oldestKey);
	}
	memoryCache.set(key, { expiresAt: Date.now() + ttl * 1000, value });
}

function memoryCacheGet(key: string): string | null {
	const entry = memoryCache.get(key);
	if (!entry) return null;
	if (entry.expiresAt < Date.now()) {
		memoryCache.delete(key);
		return null;
	}
	return entry.value;
}

/**
 * get value for key
 *
 * @param key string
 *
 * @returns value string or null
 */
export const redisGet = async (key: string): Promise<string | null> => {
	if (isAuthKey(key)) {
		const doc = await authDocRef(key).get();
		if (!doc.exists) return null;
		const data = doc.data();
		const expiresAt = data?.expires_at as firebaseAdmin.firestore.Timestamp | undefined;
		if (!expiresAt || expiresAt.toMillis() < Date.now()) {
			authDocRef(key)
				.delete()
				.catch(() => {});
			return null;
		}
		return (data?.value as string) ?? null;
	}
	return memoryCacheGet(key);
};

/**
 * set key-value (with a default cache TTL)
 *
 * @param key string
 * @param value string
 */
export const redisSet = async (key: string, value: string): Promise<string | null> => {
	return redisSetex(key, DEFAULT_CACHE_TTL_SECONDS, value);
};

/**
 * set key-value with ttl (expiry in seconds)
 *
 * @param key string
 * @param ttl number in seconds
 * @param value string
 */
export const redisSetex = async (key: string, ttl: number, value: string): Promise<string> => {
	if (isAuthKey(key)) {
		await authDocRef(key).set({
			created_at: firebaseAdmin.firestore.Timestamp.now(),
			expires_at: firebaseAdmin.firestore.Timestamp.fromMillis(Date.now() + ttl * 1000),
			value
		});
		return 'OK';
	}
	memoryCacheSet(key, value, ttl);
	return 'OK';
};

/**
 * delete key
 *
 * @param key string
 */
export const redisDel = async (key: string): Promise<number> => {
	if (isAuthKey(key)) {
		await authDocRef(key).delete();
		return 1;
	}
	return memoryCache.delete(key) ? 1 : 0;
};

const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * delete all cache keys matching a glob pattern (e.g. "polkadot_*")
 *
 * @param pattern string
 */
export async function deleteKeys(pattern: string) {
	const regex = new RegExp(`^${pattern.split('*').map(escapeRegExp).join('.*')}$`);
	for (const key of Array.from(memoryCache.keys())) {
		if (regex.test(key)) {
			memoryCache.delete(key);
		}
	}
}
