// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { redisDel, redisGet, redisSet } from '~src/auth/redis';

const EXPIRY_IN_SECONDS = 1800;

export async function getCache(key: string) {
	const redisData = await redisGet(key);
	if (redisData) {
		const props = JSON.parse(redisData);
		if (!props.error) {
			if (new Date().getTime() > props.expiry.getTime()) {
				redisDel(key);
				return undefined;
			}
			return props;
		}
	}
	return undefined;
}

export function setCache(key: string, value: any) {
	const t = new Date();
	t.setSeconds(t.getSeconds() + EXPIRY_IN_SECONDS);
	redisSet(
		key,
		JSON.stringify({
			data: value,
			expiry: t
		})
	);
}

export function deleteCache(key: string) {
	redisDel(key);
}
