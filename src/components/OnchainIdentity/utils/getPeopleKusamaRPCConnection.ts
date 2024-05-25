// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ApiPromise, WsProvider } from '@polkadot/api';
import { network as AllNetworks, chainProperties } from 'src/global/networkConstants';
import { NotificationStatus } from '~src/types';
import queueNotification from '~src/ui-components/QueueNotification';
import { typesBundle } from '@kiltprotocol/type-definitions';
import { dropdownLabel } from '~src/ui-components/RPCDropdown';

const getPeopleKusamaRPCConnection = async (network: string): Promise<{ api: ApiPromise | null; apiReady: boolean }> => {
	if (network !== AllNetworks.KUSAMA) {
		return { api: null, apiReady: false };
	}

	let api: ApiPromise | null = null;
	let apiReady: boolean = false;
	const wsProvider = new WsProvider(chainProperties?.[network]?.peopleKusamaRpcEndpoint);
	api = await ApiPromise.create({ provider: wsProvider, typesBundle });

	if (api) {
		const timer = setTimeout(async () => {
			queueNotification({
				header: 'Error!',
				message: 'RPC connection Timeout.',
				status: NotificationStatus.ERROR
			});
			if (api) {
				await api.disconnect();
			}
		}, 60000);

		api.on('error', async () => {
			clearTimeout(timer);
			queueNotification({
				header: 'Error!',
				message: `${dropdownLabel(chainProperties?.[network]?.rpcEndpoint, network || '')} is not responding. Please wait!`,
				status: NotificationStatus.ERROR
			});
			if (api) {
				await api.disconnect();
			}
		});

		await api.isReady
			.then(() => {
				apiReady = true;
				clearTimeout(timer);
			})
			.catch(async (error) => {
				clearTimeout(timer);
				queueNotification({
					header: 'Error!',
					message: 'RPC connection error.',
					status: NotificationStatus.ERROR
				});
				console.error(error, 'rpc error');
			});
	}

	return { api: api, apiReady: apiReady };
};
export default getPeopleKusamaRPCConnection;
