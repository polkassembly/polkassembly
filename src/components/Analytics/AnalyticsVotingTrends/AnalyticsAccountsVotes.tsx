// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import dynamic from 'next/dynamic';
import React from 'react';
import Nudge from '~src/components/Post/Tabs/PostStats/Tabs/Nudge';
import { IVoteDetailType } from '../types';

const AnalyticsDelegationSplitGraph = dynamic(() => import('./TrackAnalyticsgraphs/AnalyticsDelegationSplitGraph'), { ssr: false });
const AnalyticsVoteSplitGraph = dynamic(() => import('./TrackAnalyticsgraphs/AnalyticsVoteSplitGraph'), { ssr: false });
const AnalyticsTurnoutPercentageGraph = dynamic(() => import('./TrackAnalyticsgraphs/AnalyticsTurnoutPercentageGraph'), { ssr: false });

interface IProps {
	accounts: IVoteDetailType[];
}

const AnalyticsAccountsVotes = ({ accounts }: IProps) => {
	const supportGraph = accounts.sort((a, b) => a.supportData.index - b.supportData.index).map((item) => item.supportData);
	const delegationSplit = accounts.sort((a, b) => a.delegationSplitData.index - b.delegationSplitData.index).map((item) => item.delegationSplitData);
	const votesSplit = accounts.sort((a, b) => a.votesSplitData.index - b.votesSplitData.index).map((item) => item.votesSplitData);
	return (
		<>
			<Nudge text='Accounts are the number of unique addresses casting a vote .' />
			<div className='mb-4 flex flex-col gap-4 md:grid md:grid-cols-2'>
				<AnalyticsTurnoutPercentageGraph supportData={supportGraph} />
				<AnalyticsDelegationSplitGraph
					delegationSplitData={delegationSplit}
					isUsedInAccounts={true}
				/>
			</div>
			<AnalyticsVoteSplitGraph
				votesSplitData={votesSplit}
				isUsedInAccounts={true}
			/>
		</>
	);
};

export default AnalyticsAccountsVotes;
