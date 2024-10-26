// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { network as AllNetworks } from 'src/global/networkConstants';
const isMultiassetSupportedNetwork = (network: string) => {
	const supportedNetwork = [AllNetworks.POLKADOT, AllNetworks.KUSAMA, AllNetworks.ROCOCO];

	return supportedNetwork.includes(network);
};

export default isMultiassetSupportedNetwork;
