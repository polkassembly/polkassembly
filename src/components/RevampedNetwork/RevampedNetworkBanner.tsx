// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { REVAMPED_NETWORKS } from 'src/global/revampedNetworks';
import { DISCONTINUED_SERVICES } from '~src/global/discontinuedServices';

function RevampedNetworkBanner({ network }: { network: string }) {
	const isRevampedNetwork = REVAMPED_NETWORKS.includes(network) && !DISCONTINUED_SERVICES.includes(network);

	return isRevampedNetwork ? (
		<div className='bg-service-discontinued-banner-gradient px-5 py-2 text-center text-sm font-medium text-white'>
			This network has been archived on Polkassembly. New on-chain activities will not appear here. Important: On-chain actions (like voting and delegation) will still affect the
			network.
		</div>
	) : null;
}

export default RevampedNetworkBanner;
