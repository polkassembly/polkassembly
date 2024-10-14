// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import CuratorProfileCard from './CuratorProfileCard';
import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';

const CuratorOverviewCard = dynamic(() => import('./CuratorOverviewCard'), {
	loading: () => <Skeleton active />,
	ssr: false
});

function CuratorProfile() {
	return (
		<div>
			<CuratorProfileCard />
			<CuratorOverviewCard />
		</div>
	);
}

export default CuratorProfile;
