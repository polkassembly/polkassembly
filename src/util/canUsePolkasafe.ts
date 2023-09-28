// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { network } from '~src/global/networkConstants';

const SUPPORTED_POLKASAFE_NETWORK = [network.KUSAMA, network.POLKADOT, network.WESTEND, network.ASTAR];
export const canUsePolkasafe = (network: string) => {
	return SUPPORTED_POLKASAFE_NETWORK.includes(network);
};
