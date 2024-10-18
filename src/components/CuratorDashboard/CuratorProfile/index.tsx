// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import CuratorProfileCard from './CuratorProfileCard';
import dynamic from 'next/dynamic';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import Skeleton from '~src/basic-components/Skeleton';
import { useUserDetailsSelector } from '~src/redux/selectors';

const CuratorOverviewCard = dynamic(() => import('./CuratorOverviewCard'), {
	loading: () => <Skeleton active />,
	ssr: false
});

function CuratorProfile() {
	const currentUser = useUserDetailsSelector();
	const address = currentUser?.loginAddress;
	const [bountiesdata, setBountiesData] = React.useState<any>();
	const [loading, setLoading] = useState<boolean>(false);
	const fetchCuratorBountiesData = async () => {
		setLoading(true);
		if (address) {
			const substrateAddress = getSubstrateAddress(address);
			const { data } = await nextApiClientFetch<any>('api/v1/bounty/curator/getCuratorGeneralInfo', {
				userAddress: substrateAddress
			});
			if (data) {
				setBountiesData(data);
			}
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchCuratorBountiesData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	return (
		<div>
			{loading ? (
				<div className='rounded-lg border-[0.7px] border-solid border-[#D2D8E0] bg-white p-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]'>
					<Skeleton active />
				</div>
			) : (
				<>
					<CuratorProfileCard curatorData={bountiesdata} />
					<CuratorOverviewCard curatorData={bountiesdata} />
				</>
			)}
		</div>
	);
}

export default CuratorProfile;
