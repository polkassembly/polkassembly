// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import { IFellowshipReferendumPostsByTrackName } from 'pages/member-referenda';
import React, { FC, useState } from 'react';
import TrackListingCard from 'src/components/Listing/FellowshipReferendum/TrackListingCard';

const AboutTrackCard = dynamic(() => import('~src/components/Listing/FellowshipReferendum/AboutTrackCard'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

interface ITrackListingProps {
	posts: IFellowshipReferendumPostsByTrackName|undefined;
    fellowshipReferendumPostOrigins: string[];
}

const TrackListing: FC<ITrackListingProps> = (props) => {
	const { posts, fellowshipReferendumPostOrigins } = props;
	const [trackName, setTrackName] = useState('');
	return (
		<>
			<AboutTrackCard
				trackName={trackName}
				fellowshipReferendumPostOrigins={fellowshipReferendumPostOrigins}
			/>
			<TrackListingCard
				className='mt-6'
				posts={posts}
				setTrackName={setTrackName}
				fellowshipReferendumPostOrigins={fellowshipReferendumPostOrigins}
			/>
		</>
	);
};

export default TrackListing;