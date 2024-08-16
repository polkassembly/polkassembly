// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import AnalyticsStats from './AnalyticsStats';
import AnalyticsTrends from './AnalyticTrends';
import AnalyticsDelegationTrends from './AnalyticsDelegationTrends';

const GovAnalytics = () => {
	return (
		<section className='flex h-full w-full items-center rounded-xl border-none bg-white px-6 py-4 dark:bg-black'>
			<div className='flex w-full flex-col gap-y-4'>
				<AnalyticsStats />
				<AnalyticsTrends />
				<AnalyticsDelegationTrends />
			</div>
		</section>
	);
};

export default GovAnalytics;
