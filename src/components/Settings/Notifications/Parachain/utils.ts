// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// of the Apache-2.0 license. See the LICENSE file for details.

import { chainProperties, network } from '~src/global/networkConstants';
import { AVAILABLE_NETWORK } from '~src/util/notificationsAvailableChains';

const networks: any = {
	kusama: [],
	polkadot: [],
	solo: [],
	// test: []
};

const networkLabel: { [index: string]: string } = {
	kusama: 'Kusama',
	polkadot: 'Polkadot',
	solo: 'Solo Chains',
	// test: 'Test Chains'
};

for (const key of Object.keys(network)) {
	const keyVal = network[key as keyof typeof network];
	if (!AVAILABLE_NETWORK.includes(keyVal)) continue;

	const optionObj = {
		name: keyVal,
		selected: false,
	};

	switch (chainProperties[keyVal]?.category) {
		case 'polkadot':
			networks.polkadot.push(optionObj);
			break;
		case 'kusama':
			networks.kusama.push(optionObj);
			break;
		case 'test':
			networks.test.push(optionObj);
			break;
		default:
			networks.solo.push(optionObj);
	}
}
export { networks, networkLabel };
