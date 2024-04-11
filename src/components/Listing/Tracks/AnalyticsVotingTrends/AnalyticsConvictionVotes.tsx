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
const AnalyticsTurnoutPercentageGraph = dynamic(() => import('./TrackAnalyticsgraphs/AnalyticsTurnoutPercentageGraph'), { ssr: false });

interface IProps {
	convictionVotes: IVoteDetailType[];
}
const AnalyticsConvictionVotes = ({ convictionVotes }: IProps) => {
	const supportGraph = convictionVotes.sort((a, b) => a.supportData.index - b.supportData.index).map((item) => item.supportData);
	const delegationSplit = convictionVotes.sort((a, b) => a.delegationSplitData.index - b.delegationSplitData.index).map((item) => item.delegationSplitData);
	const votesSplit = convictionVotes.sort((a, b) => a.votesSplitData.index - b.votesSplitData.index).map((item) => item.votesSplitData);

	return (
		<>
			<Nudge text='Conviction vote is the number of tokens used for voting multiplied by conviction.' />
			<div className='mb-4 flex flex-col gap-4 md:grid md:grid-cols-2'>
				<AnalyticsTurnoutPercentageGraph supportData={supportGraph} />
				<AnalyticsDelegationSplitGraph delegationSplitData={delegationSplit} />
			</div>
			<AnalyticsVoteSplitGraph votesSplitData={votesSplit} />
		</>
	);
};

export default AnalyticsConvictionVotes;
