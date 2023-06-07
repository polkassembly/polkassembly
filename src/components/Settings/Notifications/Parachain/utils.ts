// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// of the Apache-2.0 license. See the LICENSE file for details.

import { chainProperties, network } from '~src/global/networkConstants';

const networks: any = {
	kusamaChains: [],
	polkadotChains: [],
	soloChains: [],
	testChains: []
};

const networkLabel: {[index: string]: string} = {
	kusamaChains: 'Kusama',
	polkadotChains: 'Polkadot',
	soloChains: 'Solo Chains',
	testChains: 'Test Chains'
};

for (const key of Object.keys(network)) {
	const keyVal = network[key as keyof typeof network];
	if (key === 'TANGANIKA') continue;

	const optionObj = {
		name: keyVal,
		selected: false
	};

	switch (chainProperties[keyVal]?.category) {
	case 'polkadot':
		networks.polkadotChains.push(optionObj);
		break;
	case 'kusama':
		networks.kusamaChains.push(optionObj);
		break;
	case 'test':
		networks.testChains.push(optionObj);
		break;
	default:
		networks.soloChains.push(optionObj);
	}
}
export { networks, networkLabel };