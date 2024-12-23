// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { network as AllNetworks } from '~src/global/networkConstants';

const isActivityFeedNetwork = [AllNetworks.POLKADOT];

export const isActivityFeedSupportedNetwork = (network: string) => isActivityFeedNetwork.includes(network);
