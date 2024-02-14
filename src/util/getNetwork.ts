// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import queryString from 'query-string';

import { defaultNetwork } from '~src/global/defaultNetwork';

import { network as networkConstants } from '../global/networkConstants';
import { Network } from '../types';
/**
 * Return the current network
 *
 */

export default function getNetwork(): Network {
	if (!global?.window) return defaultNetwork;
	let network: string;

	const url = global.window.location.href;
	const qs = queryString.parse(global.window.location.search);

	if (qs.network) {
		network = qs.network.toString();
	} else {
		try {
			network = url.split('//')[1].split('.')[0];
		} catch (error) {
			network = defaultNetwork;
			console.error(error);
		}
	}

	const possibleNetworks = Object.values(networkConstants);

	if (network == 'test') {
		network = 'kusama';
	} else if (network == 'test-polkadot') {
		network = 'polkadot';
	} else if (network == 'moonriver-test') {
		network = 'moonriver';
	} else if (network == 'moonbase-test') {
		network = 'moonbase';
	}

	if (!possibleNetworks.includes(network)) {
		network = defaultNetwork;
	}

	return network;
}
