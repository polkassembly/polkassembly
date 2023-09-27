// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { isValidNetwork } from '~src/api-utils';

interface IRedirectProps {
	props: {};
	redirect: {
		destination: string;
	};
}

/**
 * Checks if the network is valid and returns an object that redirects to 500 page if not
 *
 * @export
 * @param {string} [network]
 * @return {*}  {(IRedirectProps | null)}
 */
export default function checkRouteNetworkWithRedirect(network?: string): IRedirectProps | null {
	if (!network || !isValidNetwork(network)) {
		const encodedReason = encodeURIComponent('Missing or Invalid network in request headers');
		return {
			props: {},
			redirect: {
				destination: `/500?reason=${encodedReason}`
			}
		};
	}

	return null;
}
