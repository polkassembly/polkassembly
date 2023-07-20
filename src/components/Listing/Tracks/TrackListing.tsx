// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import { IReferendumV2PostsByStatus } from 'pages/root';
import React, { FC } from 'react';
import TrackListingCard from 'src/components/Listing/Tracks/TrackListingCard';

const AboutTrackCard = dynamic(
	() => import('~src/components/Listing/Tracks/AboutTrackCard'),
	{
		loading: () => <Skeleton active />,
		ssr: false
	}
);

interface ITrackListingProps {
	posts: IReferendumV2PostsByStatus;
	trackName: string;
}

const TrackListing: FC<ITrackListingProps> = (props) => {
	const { posts, trackName } = props;
	return (
		<>
			<AboutTrackCard trackName={trackName} />
			<TrackListingCard
				className="mt-12"
				posts={posts}
				trackName={trackName}
			/>
		</>
	);
};

export default TrackListing;
