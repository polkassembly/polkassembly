// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IReferendumV2PostsByStatus } from 'pages/root';
import React from 'react';
import TrackListingCardAll from './TrackListingCardAll';

interface IProps {
	className?: string;
	posts: IReferendumV2PostsByStatus;
}

const TrackListingMain = ({ className, posts }: IProps) => {
	return (
		<div className={`${className}`}>
			<TrackListingCardAll
				className='mt-8'
				posts={posts}
				trackName='All Tracks'
			/>
		</div>
	);
};

export default TrackListingMain;
