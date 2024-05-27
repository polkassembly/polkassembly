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

export interface PeopleKusamaApiContextType {
	peopleKusamaApi: ApiPromise | undefined;
	peopleKusamaApiReady: boolean;
}

export const PeopleKusamaApiContext: React.Context<PeopleKusamaApiContextType> = React.createContext({} as PeopleKusamaApiContextType);

export interface PeopleKusamaApiContextProviderProps {
	network?: string;
	children?: React.ReactElement;
}

export function PeopleKusamaApiContextProvider(props: PeopleKusamaApiContextProviderProps): React.ReactElement {
	const { children = null } = props;
	const [peopleKusamaApi, setPeopleKusamaApi] = useState<ApiPromise>();
	const [peopleKusamaApiReady, setPeopleKusamaApiReady] = useState(false);
	const [wsProvider, setWsProvider] = useState<string>('');

	const provider = useRef<ScProvider | WsProvider | null>(null);

	useEffect(() => {
		if ((!wsProvider && !props.network) || props.network !== 'kusama') return;
		provider.current = new WsProvider(wsProvider || chainProperties?.[props.network!]?.peopleKusamaRpcEndpoint);

		setPeopleKusamaApiReady(false);
		setPeopleKusamaApi(undefined);
		let api = undefined;
		if (!provider.current) return;

		api = new ApiPromise({ provider: provider.current, typesBundle });
		setPeopleKusamaApi(api);
	}, [props.network, wsProvider]);

	useEffect(() => {
		if (props.network !== 'kusama') return;
		if (peopleKusamaApi) {
			const timer = setTimeout(async () => {
				queueNotification({
					header: 'Error!',
					message: 'RPC connection Timeout.',
					status: NotificationStatus.ERROR
				});

				await peopleKusamaApi.disconnect();
				if (props.network) {
					setWsProvider(chainProperties?.[props.network]?.rpcEndpoint);
				}
			}, 60000);
			peopleKusamaApi.on('error', async () => {
				clearTimeout(timer);
				queueNotification({
					header: 'Error!',
					message: `${dropdownLabel(wsProvider, props.network || '')} is not responding, please change RPC.`,
					status: NotificationStatus.ERROR
				});

				await peopleKusamaApi.disconnect();
			});
			peopleKusamaApi.isReady
				.then(() => {
					clearTimeout(timer);

					setPeopleKusamaApiReady(true);
					console.log('People Kusama API ready');
				})
				.catch(async (error) => {
					clearTimeout(timer);
					queueNotification({
						header: 'Error!',
						message: 'RPC connection error.',
						status: NotificationStatus.ERROR
					});

					await peopleKusamaApi.disconnect();
					console.error(error);
				});
			return () => clearTimeout(timer);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [peopleKusamaApi]);

	return <PeopleKusamaApiContext.Provider value={{ peopleKusamaApi, peopleKusamaApiReady }}>{children}</PeopleKusamaApiContext.Provider>;
}
