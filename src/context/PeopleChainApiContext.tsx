// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@polkadot/api-augment';

import { ApiPromise, ScProvider, WsProvider } from '@polkadot/api';
import React, { useEffect, useRef, useState } from 'react';
import { chainProperties } from 'src/global/networkConstants';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import { dropdownLabel } from '~src/ui-components/RPCDropdown';
import { typesBundle } from '@kiltprotocol/type-definitions';
import isPeopleChainSupportedNetwork from '~src/components/OnchainIdentity/utils/getPeopleChainSupportedNetwork';

export interface PeopleChainApiContextType {
	peopleChainApi: ApiPromise | undefined;
	peopleChainApiReady: boolean;
}

export const PeopleChainApiContext: React.Context<PeopleChainApiContextType> = React.createContext({} as PeopleChainApiContextType);

export interface PeopleChainApiContextProviderProps {
	network?: string;
	children?: React.ReactElement;
}

export function PeopleChainApiContextProvider(props: PeopleChainApiContextProviderProps): React.ReactElement {
	const { children = null } = props;
	const [peopleChainApi, setPeopleChainApi] = useState<ApiPromise>();
	const [peopleChainApiReady, setPeopleChainApiReady] = useState(false);
	const [wsProvider, setWsProvider] = useState<string>('');

	const provider = useRef<ScProvider | WsProvider | null>(null);

	useEffect(() => {
		if ((!wsProvider && !props.network) || !isPeopleChainSupportedNetwork(props?.network as any)) return;
		provider.current = new WsProvider(wsProvider || chainProperties?.[props.network!]?.peopleChainRpcEndpoint);

		setPeopleChainApiReady(false);
		setPeopleChainApi(undefined);
		let api = undefined;
		if (!provider.current) return;

		api = new ApiPromise({ provider: provider.current, typesBundle });
		setPeopleChainApi(api);
	}, [props.network, wsProvider]);

	useEffect(() => {
		if (!isPeopleChainSupportedNetwork(props?.network as any)) return;
		if (peopleChainApi) {
			const timer = setTimeout(async () => {
				queueNotification({
					header: 'Error!',
					message: 'RPC connection Timeout.',
					status: NotificationStatus.ERROR
				});

				await peopleChainApi.disconnect();
				if (props.network) {
					setWsProvider(chainProperties?.[props.network]?.rpcEndpoint);
				}
			}, 60000);
			peopleChainApi.on('error', async () => {
				clearTimeout(timer);
				queueNotification({
					header: 'Error!',
					message: `${dropdownLabel(wsProvider, props.network || '')} is not responding, please change RPC.`,
					status: NotificationStatus.ERROR
				});

				await peopleChainApi.disconnect();
			});
			peopleChainApi.isReady
				.then(() => {
					clearTimeout(timer);

					setPeopleChainApiReady(true);
					console.log(`${props.network} People chain API ready`);
				})
				.catch(async (error) => {
					clearTimeout(timer);
					queueNotification({
						header: 'Error!',
						message: 'RPC connection error.',
						status: NotificationStatus.ERROR
					});

					await peopleChainApi.disconnect();
					console.error(error);
				});
			return () => clearTimeout(timer);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [peopleChainApi]);

	return <PeopleChainApiContext.Provider value={{ peopleChainApi, peopleChainApiReady }}>{children}</PeopleChainApiContext.Provider>;
}
