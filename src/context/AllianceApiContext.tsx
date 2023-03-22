// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// eslint-disable-next-line
import '@polkadot/api-augment';
import { ApiPromise, WsProvider } from '@polkadot/api';
import React, { useEffect, useState } from 'react';

export interface AllianceApiContextType {
	api: ApiPromise | undefined;
	apiReady: boolean;
}

export const AllianceApiContext: React.Context<AllianceApiContextType> = React.createContext(
	{} as AllianceApiContextType
);

export interface AllianceApiContextProviderProps {
	children?: React.ReactElement;
}

export function AllianceApiContextProvider(
	props: AllianceApiContextProviderProps
): React.ReactElement {
	const { children = null } = props;
	const [api, setApi] = useState<ApiPromise>();
	const [apiReady, setApiReady] = useState(false);
	const wsProvider = 'wss://polkadot-collectives-rpc.polkadot.io';

	useEffect(() => {
		const provider = new WsProvider(wsProvider);
		setApiReady(false);
		setApi(new ApiPromise({ provider }));
	},[wsProvider]);

	useEffect(() => {
		if (api){
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
		<AllianceApiContext.Provider value={{ api, apiReady }}>
			{children}
		</AllianceApiContext.Provider>
	);
}
