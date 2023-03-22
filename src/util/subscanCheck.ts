// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export function isSubscanSupport(network: string) {
	return !['xx', 'pendulum', 'amplitude', 'myriad'].includes(network);
}

export function isExplorerSupport(network: string) {
	return ['xx', 'myriad'].includes(network);
}

export function isPolkaholicSupport(network: string) {
	return ['pendulum', 'amplitude'].includes(network);
}