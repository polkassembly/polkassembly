// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { createContext, useState } from 'react';

export interface NetworkContextProviderProps {
	initialNetwork: string;
	children?: React.ReactElement;
}

export interface NetworkContextType {
	network: string;
	setNetwork: React.Dispatch<React.SetStateAction<string>>;
}

export const NetworkContext: React.Context<NetworkContextType> = createContext(
	{} as NetworkContextType
);

export function NetworkContextProvider({
	initialNetwork,
	children
}: NetworkContextProviderProps): React.ReactElement {
	const [network, setNetwork] = useState(initialNetwork || '');

	return (
		<NetworkContext.Provider value={{ network, setNetwork }}>
			{children}
		</NetworkContext.Provider>
	);
}
