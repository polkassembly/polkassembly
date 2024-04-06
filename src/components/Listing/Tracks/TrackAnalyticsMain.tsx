// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import TrackAnalyticsTotalData from './TrackAnalyticsTotalData';
import DelegationAnalyticsMain from './AnalyticsDelegation/DelegationAnalyticsMain';
import { useNetworkSelector } from '~src/redux/selectors';
import { getDefaultTrackMetaData, getTrackData } from './AboutTrackCard';
import { Spin } from 'antd';
import AnalyticsVotingTrends from './AnalyticsVotingTrends';

interface IProps {
	className?: string;
	trackName: string;
}

const TrackAnalyticsMain = ({ className, trackName }: IProps) => {
	const { network } = useNetworkSelector();
	const [trackMetaData, setTrackMetaData] = useState(getDefaultTrackMetaData());
	useEffect(() => {
		setTrackMetaData(getTrackData(network, trackName));
	}, [network, trackName]);
	const track_number = trackMetaData?.trackId;
	const [isLoading, setIsLoading] = useState(false);
	return (
		<Spin spinning={isLoading}>
			<main className={`${className} flex flex-col gap-8`}>
				<TrackAnalyticsTotalData
					trackNumber={track_number}
					setIsLoading={setIsLoading}
				/>
				<AnalyticsVotingTrends trackNumber={track_number} />
				<DelegationAnalyticsMain trackNumber={track_number} />
			</main>
		</Spin>
	);
};

export default TrackAnalyticsMain;
