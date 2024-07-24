// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ApiPromise, WsProvider } from '@polkadot/api';

function getEndPoints(): string[] {
	const wsEndpoint = process.env.NEXT_PUBLIC_ASSET_HUB_ENDPOINTS;
	if (!wsEndpoint) {
		throw new Error('NEXT_PUBLIC_ASSET_HUB_ENDPOINTS not set');
	}

	if (wsEndpoint.includes(';')) {
		return wsEndpoint.split(';');
	} else {
		return [wsEndpoint];
	}
}

export async function getAssetHubApi(): Promise<ApiPromise> {
	let api: ApiPromise | null = null;
	let provider: WsProvider | null = null;
	if (api) {
		return api;
	}

	const endpoints = getEndPoints();
	provider = new WsProvider(endpoints, 1000);
	api = await ApiPromise.create({ provider });

	return api;
}
