// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const defaultNetwork = (() => {
	// Check if we're in a browser environment and the subdomain is polkadot-old
	if (typeof window !== 'undefined') {
		const hostname = window.location.hostname;
		if (hostname.startsWith('polkadot-old.')) {
			return 'polkadot';
		}
		if (hostname.startsWith('kusama-old.')) {
			return 'kusama';
		}
	}

	const defaultNetwork = process.env.NEXT_PUBLIC_DEFAULT_NETWORK;
	if (!defaultNetwork) {
		throw Error('Please set "NEXT_PUBLIC_DEFAULT_NETWORK" environment variable');
	}
	return defaultNetwork;
})();
