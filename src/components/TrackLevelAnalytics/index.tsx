// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import TrackAnalyticsStats from './TrackAnalyticsStats';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { useNetworkSelector } from '~src/redux/selectors';
import { Spin } from 'antd';
import AnalyticsVotingTrends from './AnalyticsVotingTrends';
import AnalyticsDelegation from './AnalyticsDelegation';

const TrackLevelAnalytics = ({ className, trackName }: { className?: string; trackName: string }) => {
	const { network } = useNetworkSelector();
	const [trackId, setTrackId] = useState<number | null>(null);

	useEffect(() => {
		if (trackName === 'All Tracks' || !network) return;

		setTrackId(networkTrackInfo?.[network]?.[trackName]?.trackId);
	}, [network, trackName]);

	const isAllTracks = trackName === 'All Tracks';

	return (
		<Spin spinning={!isAllTracks && trackId == null}>
			<div className={`${className} flex flex-col gap-8`}>
				{isAllTracks ? (
					<>
						<TrackAnalyticsStats />
						<AnalyticsVotingTrends />
						<AnalyticsDelegation />
					</>
				) : (
					<>
						{trackId !== null && (
							<>
								<TrackAnalyticsStats trackId={trackId} />
								<AnalyticsVotingTrends trackId={trackId} />
								<AnalyticsDelegation trackId={trackId} />
							</>
						)}
					</>
				)}
			</div>
		</Spin>
	);
};

export default TrackLevelAnalytics;
