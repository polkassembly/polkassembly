// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Nudge from '~src/components/Post/Tabs/PostStats/Tabs/Nudge';
import { IVoteDetailType } from '~src/types';
import dynamic from 'next/dynamic';
// import { useNetworkSelector } from '~src/redux/selectors';

const AnalyticsDelegationSplitGraph = dynamic(() => import('./TrackAnalyticsgraphs/AnalyticsDelegationSplitGraph'), { ssr: false });
const AnalyticsVoteSplitGraph = dynamic(() => import('./TrackAnalyticsgraphs/AnalyticsVoteSplitGraph'), { ssr: false });

interface IProps {
	convictionVotes: IVoteDetailType[];
}
const AnalyticsConvictionVotes = ({ convictionVotes }: IProps) => {
	// const { network } = useNetworkSelector();

	const sortedConvictionVotes = [...convictionVotes].sort((a, b) => a.delegationSplitData.index - b.delegationSplitData.index);
	const delegationSplit = sortedConvictionVotes.map((data) => data.delegationSplitData);
	const sortedVotesSplitData = [...convictionVotes].sort((a, b) => a.votesSplitData.index - b.votesSplitData.index);
	const votesSplit = sortedVotesSplitData.map((data) => data.votesSplitData);

	console.log('delegationSplit', delegationSplit);

	return (
		<>
			<Nudge text='Conviction vote is the number of tokens used for voting multiplied by conviction .' />
			<AnalyticsDelegationSplitGraph delegationSplitData={delegationSplit} />
			<AnalyticsVoteSplitGraph votesSplitData={votesSplit} />
		</>
	);
};

export default AnalyticsConvictionVotes;
