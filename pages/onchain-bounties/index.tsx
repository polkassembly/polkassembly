// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import OnchainBounties from '~src/components/OnchainBounties';
import SEOHead from '~src/global/SEOHead';
import { useNetworkSelector } from '~src/redux/selectors';

function Index() {
	const { network } = useNetworkSelector();

	return (
		<div>
			{' '}
			<SEOHead
				title='On-chain bounties'
				desc='Discover and participate in treasury-funded bounties on Polkassembly, where members can propose and work on projects to improve the governance and growth of our community.'
				network={network}
			/>
			<OnchainBounties />
		</div>
	);
}

export default Index;
