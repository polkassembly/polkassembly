// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { spaceGrotesk } from 'pages/_app';
import React, { useEffect } from 'react';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

function BountiesCuratorInfo() {
	const currentUser = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const fetchCuratorBounties = async () => {
		if (currentUser?.id !== undefined && currentUser?.id !== null) {
			const { data } = await nextApiClientFetch<any>('/api/v1/bounty/curator/getAllCuratedBountiesAndChildBounties', {
				network,
				page: 1,
				userAddress: currentUser?.addresses ? currentUser?.addresses[0] : ''
			});
			if (data) console.log('bio', data);
		}
	};
	useEffect(() => {
		fetchCuratorBounties();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<div className='rounded-lg border-[0.7px] border-solid border-[#D2D8E0] bg-white p-5'>
			<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-[24px] font-bold text-blue-light-high`}>Bounties Curated (2)</p>
			<div></div>
		</div>
	);
}

export default BountiesCuratorInfo;
