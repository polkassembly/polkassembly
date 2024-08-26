// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { chainProperties } from '~src/global/networkConstants';

export async function getTotalSupply(network: string): Promise<BN> {
	const wsProviderUrl = chainProperties[network]?.rpcEndpoint;

	if (!wsProviderUrl) {
		throw new Error(`WebSocket provider URL not found for network: ${network}`);
	}

	const wsProvider = new WsProvider(wsProviderUrl);
	const api = await ApiPromise.create({ provider: wsProvider });

	try {
		const totalIssuance = await api?.query?.balances?.totalIssuance();
		const inactiveIssuance = await api?.query?.balances?.inactiveIssuance();
		return new BN(totalIssuance.toString()).sub(new BN(inactiveIssuance.toString()));
	} catch (error) {
		console.error(`Failed to fetch total supply for network ${network}:`, error);
		throw error;
	} finally {
		await api.disconnect();
	}
}
