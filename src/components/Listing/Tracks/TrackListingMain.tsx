// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IReferendumV2PostsByStatus } from 'pages/root';
import React from 'react';
import TrackListingCardAll from './TrackListingCardAll';
import { Tabs } from '~src/ui-components/Tabs';
import { useTheme } from 'next-themes';
import { TabsProps } from 'antd';

interface IProps {
	className?: string;
	posts: IReferendumV2PostsByStatus;
	trackName: string;
}

const TrackListingMain = ({ className, posts, trackName }: IProps) => {
	const { resolvedTheme: theme } = useTheme();

	const tabItems: TabsProps['items'] = [
		{
			children: (
				<>
					<TrackListingCardAll
						posts={posts}
						trackName={trackName}
					/>
				</>
			),
			key: '1',
			label: <span className='px-1.5'>Referenda</span>
		},
		{
			children: (
				<>
					<h2>HELLO world</h2>
				</>
			),
			key: '2',
			label: <span className='px-1.5'>Analytics</span>
		}
	];
	return (
		<div className={`${className} mt-[36px] rounded-xxl bg-white px-4 drop-shadow-md dark:bg-section-dark-overlay xs:py-4 sm:py-8`}>
			<Tabs
				defaultActiveKey='1'
				theme={theme}
				type='card'
				className=''
				items={tabItems}
			/>
		</div>
	);
};

export default TrackListingMain;
