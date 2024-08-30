// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@polkadot/api-augment';

import { ApiPromise, ScProvider, WsProvider } from '@polkadot/api';
import React, { useEffect, useRef, useState } from 'react';
import { chainProperties, network, treasuryAssets } from 'src/global/networkConstants';
import { typesBundleGenshiro } from '../typesBundle/typeBundleGenshiro';
import { typesBundleCrust } from '../typesBundle/typesBundleCrust';
import { typesBundleEquilibrium } from '../typesBundle/typesBundleEquilibrium';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { dropdownLabel } from '~src/ui-components/RPCDropdown';
import { typesBundle } from '@kiltprotocol/type-definitions';
import fetchTokenToUSDPrice from '~src/util/fetchTokenToUSDPrice';
import { assetsCurrentPriceActions } from '~src/redux/assetsCurrentPrices';
import { useDispatch } from 'react-redux';
import isMultiassetSupportedNetwork from '~src/util/isMultiassetSupportedNetwork';

export interface ApiContextType {
	api: ApiPromise | undefined;
	apiReady: boolean;
	relayApi?: ApiPromise;
	relayApiReady?: boolean;
	isApiLoading: boolean;
	wsProvider: string;
	setWsProvider: React.Dispatch<React.SetStateAction<string>>;
}

export const ApiContext: React.Context<ApiContextType> = React.createContext({} as ApiContextType);

export interface ApiContextProviderProps {
	network?: string;
	children?: React.ReactElement;
}

export function ApiContextProvider(props: ApiContextProviderProps): React.ReactElement {
	const { children = null } = props;
	const dispatch = useDispatch();
	const [api, setApi] = useState<ApiPromise>();
	const [apiReady, setApiReady] = useState(false);
	const [relayApi, setRelayApi] = useState<ApiPromise>();
	const [relayApiReady, setRelayApiReady] = useState(false);
	const [isApiLoading, setIsApiLoading] = useState(false);
	const [wsProvider, setWsProvider] = useState<string>(props.network ? chainProperties?.[props.network]?.rpcEndpoint : '');

	const provider = useRef<ScProvider | WsProvider | null>(null);

	const getAssetUsdPrice = async () => {
		const price = await fetchTokenToUSDPrice(treasuryAssets.DED.name);

		if (price !== 'N/A') {
			dispatch(assetsCurrentPriceActions.setDEDTokenPrice(price));
		}
	};

	useEffect(() => {
		if (!props?.network) return;
		if (!isMultiassetSupportedNetwork(props?.network)) return;
		getAssetUsdPrice();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.network]);

	useEffect(() => {
		if (props.network === network.COLLECTIVES) {
			const property = chainProperties?.[props.network];
			if (property) {
				ApiPromise.create({
					provider: new WsProvider((property.relayRpcEndpoints || []).map((endpoint) => endpoint.key)),
					typesBundle
				})
					.then((api) => setRelayApi(api))
					.catch(console.error);
			}
		}
	}, [props.network]);

	useEffect(() => {
		if (props.network === network.COLLECTIVES && relayApi) {
			relayApi.on('connected', () => setRelayApiReady(true));
			relayApi.on('disconnected', () => setRelayApiReady(false));
			relayApi.on('error', () => setRelayApiReady(false));
			relayApi.isReady
				.then(() => {
					setRelayApiReady(true);
				})
				.catch(() => {
					setRelayApiReady(false);
				});
		}
	}, [props.network, relayApi]);

	useEffect(() => {
		if (!wsProvider && !props.network) return;
		provider.current = new WsProvider(wsProvider || chainProperties?.[props.network!]?.rpcEndpoint);

		setApiReady(false);
		setApi(undefined);
		let api = undefined;
		if (!provider.current) return;
		if (props.network == 'genshiro') {
			api = new ApiPromise({ provider: provider.current, typesBundle: typesBundleGenshiro });
		}
		if (props.network == 'crust') {
			api = new ApiPromise({ provider: provider.current, typesBundle: typesBundleCrust });
		}
		if (props.network == 'equilibrium') {
			api = new ApiPromise({ provider: provider.current, typesBundle: typesBundleEquilibrium });
		}
		if (props.network == 'kilt') {
			api = new ApiPromise({ provider: provider.current, typesBundle });
		} else {
			api = new ApiPromise({ provider: provider.current, typesBundle });
		}
		setApi(api);
	}, [props.network, wsProvider]);

	useEffect(() => {
		if (api) {
			setIsApiLoading(true);
			const timer = setTimeout(async () => {
				queueNotification({
					header: 'Error!',
					message: 'RPC connection Timeout.',
					status: NotificationStatus.ERROR
				});
				setIsApiLoading(false);
				await api.disconnect();
				localStorage.removeItem('tracks');
				if (props.network) {
					setWsProvider(chainProperties?.[props.network]?.rpcEndpoint);
				}
			}, 60000);
			api.on('error', async () => {
				clearTimeout(timer);
				queueNotification({
					header: 'Error!',
					message: `${dropdownLabel(wsProvider, props.network || '')} is not responding, please change RPC.`,
					status: NotificationStatus.ERROR
				});
				setIsApiLoading(false);
				await api.disconnect();
				localStorage.removeItem('tracks');
				if (props.network) {
					setWsProvider(chainProperties?.[props.network]?.rpcEndpoint);
				}
			});
			api.isReady
				.then(() => {
					clearTimeout(timer);
					setIsApiLoading(false);
					setApiReady(true);
					console.log('API ready');
					try {
						if (props.network === 'collectives') {
							const value = api.consts.fellowshipReferenda.tracks.toJSON();
							localStorage.setItem('tracks', JSON.stringify(value));
						} else if (isOpenGovSupported(props.network || '')) {
							const value = api.consts.referenda.tracks.toJSON();
							localStorage.setItem('tracks', JSON.stringify(value));
						} else {
							localStorage.removeItem('tracks');
						}
					} catch (error) {
						localStorage.removeItem('tracks');
					}
				})
				.catch(async (error) => {
					clearTimeout(timer);
					queueNotification({
						header: 'Error!',
						message: 'RPC connection error.',
						status: NotificationStatus.ERROR
					});
					setIsApiLoading(false);
					await api.disconnect();
					console.error(error);
					localStorage.removeItem('tracks');
					if (props.network) {
						setWsProvider(chainProperties?.[props.network]?.rpcEndpoint);
					}
				});
			return () => clearTimeout(timer);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api]);

	return <ApiContext.Provider value={{ api, apiReady, isApiLoading, relayApi, relayApiReady, setWsProvider, wsProvider }}>{children}</ApiContext.Provider>;
}
