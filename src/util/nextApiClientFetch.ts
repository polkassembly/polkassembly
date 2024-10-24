// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getLocalStorageToken } from '~src/services/auth.service';
import getNetwork from './getNetwork';

import messages from './messages';
import reAuthClient from './reAuthClient';

async function nextApiClientFetch<T>(url: string, data?: { [key: string]: unknown } | FormData | any, method?: 'GET' | 'POST'): Promise<{ data?: T; error?: string }> {
	const network = getNetwork();

	const currentURL = new URL(window.location.href);
	const token = currentURL.searchParams.get('token') || (await reAuthClient()) || getLocalStorageToken();

	const headers: Record<string, string> = {
		Authorization: `Bearer ${token}`,
		'x-api-key': process.env.NEXT_PUBLIC_POLKASSEMBLY_API_KEY || '',
		'x-network': network
	};

	if (!(data instanceof FormData)) {
		headers['Content-Type'] = 'application/json';
	}

	const origin = typeof window !== 'undefined' ? window?.location?.origin : process.env.NEXT_PUBLIC_API_URL;
	if (!origin) {
		throw new Error('Unable to determine API origin');
	}

	const response = await fetch(`${origin}/${url}`, {
		body: data instanceof FormData ? data : JSON.stringify(data),
		credentials: 'include',
		headers,
		method: method || 'POST'
	});

	const resJSON = await response.json();

	if (response.status === 200) {
		return {
			data: resJSON as T
		};
	}

	return {
		error: resJSON.message || messages.API_FETCH_ERROR
	};
}

export default nextApiClientFetch;
