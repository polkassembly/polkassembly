// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState, useEffect } from 'react';
import TotalVotesCard from '../TotalVotesCard';
import VotesDelegationCard from '../VotesDelegationCard';
import VotesTurnoutCard from '../VotesTurnoutCard';
import TimeSplit from '../TimeSplit';
import VoteConvictions from '../VoteConvictions';
import VoteDelegationsByConviction from '../VoteDelegationsByConviction';
import BN from 'bn.js';
import { IAllVotesType } from 'pages/api/v1/votes/total';
import { Divider } from 'antd';
import Nudge from './Nudge';
import { usePostDataContext } from '~src/context';
import { useTranslation } from 'next-i18next';

interface IVotesAccountProps {
	allVotes: IAllVotesType | undefined;
	totalVotesCount: any;
	activeIssuance: BN;
	support: BN;
	turnout: BN | null;
	elapsedPeriod: number;
}
const Accounts = ({ allVotes, turnout, support, totalVotesCount, activeIssuance, elapsedPeriod }: IVotesAccountProps) => {
	const [delegatedVotesCount, setDelegatedVotesCount] = useState<number>(0);
	const [soloVotesCount, setSoloVotesCount] = useState<number>(0);
	const { t } = useTranslation('common');
	const [votesByConviction, setVotesByConviction] = useState<any[]>([]);
	const [votesByDelegation, setVotesByDelegation] = useState<any[]>([]);
	const [votesByTimeSplit, setVotesByTimeSplit] = useState<any[]>([]);

	const {
		postData: { created_at: createdAt }
	} = usePostDataContext();

	useEffect(() => {
		if (!allVotes?.data) return;

		const votesByConviction = allVotes?.data.reduce(
			(acc, vote) => {
				const conviction = vote.lockPeriod.toString();
				if (!acc[conviction]) {
					acc[conviction] = {
						abstain: 0,
						no: 0,
						yes: 0
					};
				}
				acc[conviction][vote.decision]++;
				return acc;
			},
			{} as { [key: string]: { yes: number; no: number; abstain: number } }
		);

		const votesByDelegation = allVotes?.data.reduce(
			(acc, vote) => {
				const conviction = vote.lockPeriod.toString();
				const delegation = vote.isDelegatedVote ? 'delegated' : 'solo';
				if (!acc[conviction]) {
					acc[conviction] = {
						delegated: 0,
						solo: 0
					};
				}
				acc[conviction][delegation]++;
				return acc;
			},
			{} as { [key: string]: { delegated: number; solo: number } }
		);

		const votesByTimeSplit = allVotes?.data.reduce(
			(acc, vote) => {
				const proposalCreatedAt = new Date(createdAt);
				const voteCreatedAt = new Date(vote.createdAt);
				const timeSplit = Math.floor((voteCreatedAt.getTime() - proposalCreatedAt.getTime()) / (24 * 60 * 60 * 1000));

				for (let i = 0; i <= 28; i++) {
					if (timeSplit === i) {
						acc[timeSplit] = acc[timeSplit] ? acc[timeSplit] + 1 : 1;
					} else {
						acc[timeSplit] = acc[timeSplit] || 0;
					}
				}
				return acc;
			},
			{} as { [key: number]: number }
		);

		const delegated = allVotes?.data.filter((vote) => vote.isDelegatedVote);

		setVotesByConviction(votesByConviction as any);
		setVotesByDelegation(votesByDelegation as any);
		setDelegatedVotesCount(delegated.length);
		setSoloVotesCount(allVotes?.data.length - delegated.length);
		setVotesByTimeSplit(votesByTimeSplit as any);
	}, [allVotes, createdAt]);

	return (
		<>
			<Nudge text={t('accounts_are_the_number_of_unique_addresses_casting_a_vote')} />
			<div className='flex flex-col gap-5'>
				<div className='flex flex-col items-center gap-5 md:flex-row'>
					<TotalVotesCard
						ayeValue={totalVotesCount.ayes}
						nayValue={totalVotesCount.nays}
						abstainValue={totalVotesCount.abstain}
						isUsedInAccounts={true}
					/>
					<VotesDelegationCard
						delegatedValue={delegatedVotesCount}
						soloValue={soloVotesCount}
						isUsedInAccounts={true}
					/>
					<VotesTurnoutCard
						activeIssuance={activeIssuance}
						support={support}
						turnout={turnout}
					/>
				</div>
				<TimeSplit
					votesByTimeSplit={votesByTimeSplit}
					isUsedInAccounts={true}
					elapsedPeriod={elapsedPeriod}
				/>
				<Divider
					dashed
					className='my-2 border-section-light-container'
				/>
				<div className='flex flex-col items-center gap-5 md:flex-row'>
					<VoteConvictions
						votesByConviction={votesByConviction}
						isUsedInAccounts={true}
					/>
					<VoteDelegationsByConviction
						votesByDelegation={votesByDelegation}
						isUsedInAccounts={true}
					/>
				</div>
			</div>
		</>
	);
};

export default Accounts;
