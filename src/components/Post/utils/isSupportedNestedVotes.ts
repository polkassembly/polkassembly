// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { network as AllNetworks } from '~src/global/networkConstants';
export const isSupportedNestedVoteNetwork = (network: string) => {
	const votesHistoryUnavailableNetworks = [AllNetworks.POLYMESH, AllNetworks.COLLECTIVES, AllNetworks.WESTENDCOLLECTIVES];
	return !votesHistoryUnavailableNetworks.includes(network);
};
