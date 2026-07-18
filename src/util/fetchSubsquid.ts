// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { chainProperties } from '~src/global/networkConstants';

import apiErrorWithStatusCode from './apiErrorWithStatusCode';
import messages from './messages';

interface Args {
	query: string;
	variables?: Object;
	network: string;
}

const FETCH_TIMEOUT_MS = 10_000;

export default async function fetchSubsquid({ query, variables, network }: Args) {
	const body = variables ? { query, variables } : { query };
	const subsquidUrl = chainProperties[network]?.subsquidUrl;

	// Fail fast for networks whose subsquid has been decommissioned
	if (!subsquidUrl) {
		throw apiErrorWithStatusCode(messages.SUBSQUID_FETCH_ERROR, 500);
	}

	return fetch(`${subsquidUrl}`, {
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'POST',
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
	})
		.then((res) => {
			if (!res.ok) {
				throw new Error(`subsquid responded with HTTP ${res.status} for network ${network}`);
			}
			return res.json();
		})
		.then((result) => result)
		.catch((e) => {
			console.error('error in fetchSubsquid : ', e);
			throw apiErrorWithStatusCode(messages.SUBSQUID_FETCH_ERROR, 500);
		});
}
