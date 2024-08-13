// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getLocalStorageToken } from '~src/services/auth.service';
import getNetwork from './getNetwork';

import messages from './messages';
import reAuthClient from './reAuthClient';

async function nextApiClientFetch<T>(url: string, data?: { [key: string]: any }, method?: 'GET' | 'POST'): Promise<{ data?: T; error?: string }> {
	const network = getNetwork();
	let token = '';

	// Check if we are in a client (browser) environment
	if (typeof window !== 'undefined') {
		const currentURL = new URL(window.location.href);
		token = currentURL.searchParams.get('token') ?? (await reAuthClient()) ?? getLocalStorageToken() ?? '';
	} else {
		// Handle token retrieval for server-side (e.g., from cookies, headers, etc.)
		token = ''; // Adjust this based on how you manage tokens server-side
	}

	const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

	const response = await fetch(`${baseUrl}/${url}`, {
		body: JSON.stringify(data),
		credentials: 'include',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			'x-api-key': process.env.NEXT_PUBLIC_POLKASSEMBLY_API_KEY || '',
			'x-network': network
		},
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
