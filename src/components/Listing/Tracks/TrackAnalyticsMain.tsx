// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import TrackAnalyticsTotalData from './TrackAnalyticsTotalData';

interface IProps {
	className?: string;
	trackName: string;
}

const TrackAnalyticsMain = ({ className, trackName }: IProps) => {
	return (
		<main className={`${className}`}>
			<TrackAnalyticsTotalData trackName={trackName} />
		</main>
	);
};

export default TrackAnalyticsMain;
