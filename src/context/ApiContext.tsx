// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-tabs */
import '@polkadot/api-augment';

import { ApiPromise, WsProvider } from '@polkadot/api';
import React, { useEffect, useState } from 'react';
import { chainProperties } from 'src/global/networkConstants';

import { typesBundleGenshiro } from '../typesBundle/typeBundleGenshiro';
import { typesBundleCrust } from '../typesBundle/typesBundleCrust';
import { typesBundleEquilibrium } from '../typesBundle/typesBundleEquilibrium';

export interface ApiContextType {
	api: ApiPromise | undefined;
	apiReady: boolean;
	wsProvider: string;
	setWsProvider: React.Dispatch<React.SetStateAction<string>>;
}

export const ApiContext: React.Context<ApiContextType> = React.createContext(
	{} as ApiContextType
);

export interface ApiContextProviderProps {
	network?: string;
	children?: React.ReactElement;
}

export function ApiContextProvider(
	props: ApiContextProviderProps
): React.ReactElement {
	const { children = null } = props;
	const [api, setApi] = useState<ApiPromise>();
	const [apiReady, setApiReady] = useState(false);
	const [wsProvider, setWsProvider] = useState<string>(props.network ? chainProperties?.[props.network]?.rpcEndpoint : '');

	useEffect(() => {
		if(!wsProvider && !props.network) return;
		const provider = new WsProvider(wsProvider || chainProperties?.[props.network!]?.rpcEndpoint);

		setApiReady(false);
		setApi(undefined);
		if (props.network == 'genshiro'){
			setApi(new ApiPromise({ provider, typesBundle: typesBundleGenshiro }));
		}
		if (props.network == 'crust'){
			setApi(new ApiPromise({ provider, typesBundle: typesBundleCrust }));

		}
		if (props.network == 'equilibrium'){
			setApi(new ApiPromise({ provider, typesBundle: typesBundleEquilibrium }));

		}
		else{
			setApi(new ApiPromise({ provider }));
		}
	},[props.network, wsProvider]);

	useEffect(() => {
		if(api){
			api.isReady.then(() => {
				setApiReady(true);
				console.log('API ready');
			})
				.catch((error) => {
					console.error(error);
				});
		}
	}, [api]);

	return (
		<ApiContext.Provider value={{ api, apiReady, setWsProvider, wsProvider }}>
			{children}
		</ApiContext.Provider>
	);
}
