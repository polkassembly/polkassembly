// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tabs } from 'antd';
import React, { FC } from 'react';

import TrackListingAllTabContent from './TrackListingAllTabContent';
import TrackListingTabContent from './TrackListingTabContent';
import FilterByTags from '~src/ui-components/FilterByTags';

interface ITrackListingCardProps {
	className?: string;
	allTrackPosts: any;
    setTrackName: React.Dispatch<React.SetStateAction<string>>;
    fellowshipReferendumPostOrigins: string[];
}

const TrackListingCard: FC<ITrackListingCardProps> = (props) => {
	const { allTrackPosts, className, setTrackName, fellowshipReferendumPostOrigins } = props;
	const items = [
		{
			children: (
				<TrackListingAllTabContent
					posts={allTrackPosts}
				/>
			),
			key: 'All',
			label: 'All'
		},
		...fellowshipReferendumPostOrigins.map((value) => {
			return {
				children: (
					<TrackListingTabContent
						trackName={value}
					/>
				),
				key: value,
				label: value.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
			};
		})
	];

	return (
		<div
			className={`${className} bg-white drop-shadow-md rounded-md p-4 md:p-8 text-sidebarBlue`}
		>
      	<div className='flex items-center justify-between mb-10'>
			<h2 className="text-lg capitalize font-medium">Fellowship Referenda</h2>
              <FilterByTags className='mr-[2px] mt-[-8px]'/>
					</div>
			<Tabs
				items={items}
				type="card"
				onChange={(v) => {
					setTrackName(v);
				}}
				className='ant-tabs-tab-bg-white text-sidebarBlue font-medium'
			/>
		</div>
	);
};

export default TrackListingCard;