// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import isPeopleChainSupportedNetwork from '~src/components/OnchainIdentity/utils/getPeopleChainSupportedNetwork';

interface Args {
	network: string;
	peopleChainApi: ApiPromise | null;
	peopleChainApiReady: boolean;
	defaultApi: ApiPromise | null;
	defaultApiReady: boolean;
	usedInIdentityFlow?: boolean;
}
export const getRespectiveApiConnect = ({ defaultApi, defaultApiReady, network, peopleChainApi, peopleChainApiReady, usedInIdentityFlow = false }: Args) => {
	if (isPeopleChainSupportedNetwork(network) && peopleChainApi && peopleChainApiReady && usedInIdentityFlow) {
		return { api: peopleChainApi, apiReady: peopleChainApiReady };
	}
	return { api: defaultApi, apiReady: defaultApiReady };
};
