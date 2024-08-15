// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import { Collapse } from '~src/components/Settings/Notifications/common-ui/Collapse';
import { useTheme } from 'next-themes';
import ImageIcon from '~src/ui-components/ImageIcon';
import NoVotesIcon from '~assets/icons/analytics/no-votes.svg';
import dynamic from 'next/dynamic';
import AnalyticsReferendumOutcome from './AnalyticsReferendumOutcome';
import AnalyticsReferendumCount from './AnalyticsReferendumCount';
const AnalyticTurnOutPercentage = dynamic(() => import('./AnalyticTurnOutPercentage'), { ssr: false });

const { Panel } = Collapse;

const AnalyticsTrends = () => {
	const { resolvedTheme: theme } = useTheme();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [noData, setNoData] = useState<boolean>(false);

	return (
		<Collapse
			size='large'
			theme={theme as any}
			className='bg-white dark:border-separatorDark dark:bg-section-dark-overlay'
			expandIconPosition='end'
			expandIcon={({ isActive }) => (isActive ? <ExpandIcon /> : <CollapseIcon />)}
		>
			<Panel
				header={
					<div className='flex w-full items-center space-x-4'>
						<div className='flex items-center gap-2'>
							<ImageIcon
								src='/assets/icons/voting-trends.svg'
								alt='Voting Trends icon'
							/>
							<span className='py-[3.8px] text-base font-semibold text-blue-light-high dark:text-blue-dark-high'>Overview</span>
						</div>
					</div>
				}
				key='1'
			>
				{noData ? (
					<div className='flex flex-col items-center justify-center gap-5 p-10'>
						<NoVotesIcon />
						<p className='text-sm'>Not enough data available</p>
					</div>
				) : (
					<>
						<div className='mb-4 flex flex-col gap-4 md:grid md:grid-cols-2'>
							<AnalyticsReferendumOutcome />
							<AnalyticsReferendumCount />
						</div>
						<div className='mb-4 flex flex-col gap-4 md:grid md:grid-cols-2'>
							<AnalyticTurnOutPercentage />
							<AnalyticTurnOutPercentage />
						</div>
					</>
				)}
			</Panel>
		</Collapse>
	);
};

export default AnalyticsTrends;
