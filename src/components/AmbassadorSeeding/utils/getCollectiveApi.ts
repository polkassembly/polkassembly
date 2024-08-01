// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise, WsProvider } from '@polkadot/api';
import { chainProperties } from '~src/global/networkConstants';
import { network as AllNetworks } from '~src/global/networkConstants';

const getCollectiveApi = async (): Promise<{ collectiveApi: ApiPromise | null; collectiveApiReady: boolean }> => {
	let collectiveApi: ApiPromise | null = null;
	let collectiveApiReady: boolean = false;

	const wsProvider = new WsProvider(chainProperties?.[AllNetworks.COLLECTIVES]?.rpcEndpoint);
	const apiPromise = await ApiPromise.create({ provider: wsProvider });
	collectiveApi = apiPromise;
	const timer = setTimeout(async () => {
		await apiPromise.disconnect();
	}, 60000);

	await apiPromise?.isReady
		.then(() => {
			clearTimeout(timer);

			collectiveApiReady = true;
			console.log('Collective API ready');
		})
		.catch(async (error) => {
			clearTimeout(timer);
			await apiPromise.disconnect();
			collectiveApiReady = false;
			collectiveApi = null;
			console.error(error);
		});

	return { collectiveApi, collectiveApiReady };
};

export default getCollectiveApi;
