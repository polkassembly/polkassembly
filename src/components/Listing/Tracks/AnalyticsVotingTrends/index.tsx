// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import { Collapse } from '~src/components/Settings/Notifications/common-ui/Collapse';
import { useTheme } from 'next-themes';
import { IAnalyticsVoteTrends } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ImageIcon from '~src/ui-components/ImageIcon';
import { StatTabs } from '~src/components/Post/Tabs/PostStats/Tabs/StatTabs';
// import AnalyticsConvictionVotes from './AnalyticsConvictionVotes';

const { Panel } = Collapse;

interface IProps {
	trackNumber: number;
}

const AnalyticsVotingTrends = ({ trackNumber }: IProps) => {
	const { resolvedTheme: theme } = useTheme();
	const [activeTab, setActiveTab] = useState<string>('conviction-votes');

	const getVoteData = async () => {
		const { data, error } = await nextApiClientFetch<{ votes: IAnalyticsVoteTrends[] }>('/api/v1/track_level_anaytics/votes-analytics', {
			trackNumber
		});

		if (data && data?.votes) {
			console.log('DATAAA', data?.votes);
		}
		if (error) console.log(error);
	};

	useEffect(() => {
		if (isNaN(trackNumber)) return;
		getVoteData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackNumber]);

	const tabItems: any[] = [
		{
			children: <h1>hello</h1>,
			// children: <AnalyticsConvictionVotes  />,
			key: 'conviction-votes',
			label: 'Conviction Votes'
		}
	];

	return (
		<Collapse
			size='large'
			theme={theme as any}
			className='bg-white dark:border-separatorDark dark:bg-section-dark-overlay'
			expandIconPosition='end'
			expandIcon={({ isActive }) => {
				return isActive ? <ExpandIcon /> : <CollapseIcon />;
			}}
		>
			<Panel
				header={
					<div className='flex items-center gap-2'>
						<ImageIcon
							src='/assets/icons/voting-trends.svg'
							alt='Delegate icon'
						/>
						<span className='text-base font-semibold dark:text-blue-dark-high'>Voting Trends</span>
					</div>
				}
				key='2'
			>
				<div>
					<StatTabs
						items={tabItems}
						setActiveTab={setActiveTab}
						activeTab={activeTab}
					/>
					{tabItems.map((item) => {
						if (item.key === activeTab) {
							return item.children;
						}
					})}
				</div>
			</Panel>
		</Collapse>
	);
};

export default AnalyticsVotingTrends;
