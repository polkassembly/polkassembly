// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { network as AllNetworks } from '~src/global/networkConstants';
const AnalyticsUnsupportedNetworks = [AllNetworks.POLYMESH, AllNetworks.POLYMESHTEST, AllNetworks.COLLECTIVES, AllNetworks.WESTENDCOLLECTIVES];

const isAnalyticsSupportedNetwork = (network: string) => {
	return !AnalyticsUnsupportedNetworks.includes(network);
};

export const delegationSupportedNetworks = [AllNetworks.KUSAMA, AllNetworks.POLKADOT];

export default isAnalyticsSupportedNetwork;
