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
import formatBnBalance from 'src/util/formatBnBalance';
import { useNetworkSelector } from '~src/redux/selectors';
import { IAllVotesType } from 'pages/api/v1/votes/total';

interface IVotesAmountProps {
	allVotes: IAllVotesType | undefined;
	activeIssuance: BN;
	totalIssuance: BN;
}

const ZERO = new BN(0);
const VoteAmount = ({ allVotes, totalIssuance, activeIssuance }: IVotesAmountProps) => {
	const { network } = useNetworkSelector();

	const [tallyData, setTallyData] = useState({
		abstain: ZERO,
		ayes: ZERO,
		nays: ZERO
	});
	const [delegatedBalance, setDelegatedBalance] = useState<BN>(new BN(0));
	const [soloBalance, setSoloBalance] = useState<BN>(new BN(0));
	const [votesByConviction, setVotesByConviction] = useState<any[]>([]);
	const [votesByDelegation, setVotesByDelegation] = useState<any[]>([]);
	const [votesByTimeSplit, setVotesByTimeSplit] = useState<any[]>([]);

	const bnToIntBalance = function (bn: BN): number {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	useEffect(() => {
		if (!allVotes?.data) return;

		console.log('allVotes', allVotes);

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

		const tallyData = allVotes?.data.reduce(
			(acc, vote) => {
				const decision = vote.decision === 'yes' ? 'ayes' : vote.decision === 'no' ? 'nays' : 'abstain';
				acc[decision] = acc[decision] ? acc[decision].add(new BN(vote.balance)) : new BN(vote.balance);
				return acc;
			},
			{} as { abstain: BN; ayes: BN; nays: BN }
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
				const proposalCreatedAt = new Date(vote.proposal.createdAt);
				const voteCreatedAt = new Date(vote.createdAt);
				const timeSplit = Math.floor((voteCreatedAt.getTime() - proposalCreatedAt.getTime()) / (24 * 60 * 60 * 1000));

				if (timeSplit == 0) {
					acc[0] = acc[0] ? acc[0] + 1 : 1;
				} else if (timeSplit <= 7) {
					acc[7] = acc[7] ? acc[7] + 1 : 1;
				} else if (timeSplit <= 10) {
					acc[10] = acc[10] ? acc[10] + 1 : 1;
				} else if (timeSplit <= 14) {
					acc[14] = acc[14] ? acc[14] + 1 : 1;
				} else if (timeSplit <= 20) {
					acc[20] = acc[20] ? acc[20] + 1 : 1;
				} else if (timeSplit <= 24) {
					acc[24] = acc[24] ? acc[24] + 1 : 1;
				} else if (timeSplit <= 28) {
					acc[28] = acc[28] ? acc[28] + 1 : 1;
				} else {
					acc[timeSplit] = acc[timeSplit] ? acc[timeSplit] + 1 : 1;
				}
				return acc;
			},
			{} as { [key: number]: number }
		);

		const delegated = allVotes?.data.filter((vote) => vote.isDelegatedVote);

		const delegatedBalance = delegated.reduce((acc, vote) => acc.add(new BN(vote.balance)), new BN(0));
		const allBalances = allVotes?.data.reduce((acc, vote) => acc.add(new BN(vote.balance)), new BN(0));

		console.log(tallyData);

		setVotesByConviction(votesByConviction as any);
		setVotesByDelegation(votesByDelegation as any);
		setVotesByTimeSplit(votesByTimeSplit as any);
		setDelegatedBalance(delegatedBalance);
		setTallyData(tallyData);
		setSoloBalance(allBalances.sub(delegatedBalance));
	}, [allVotes]);

	return (
		<div className='flex flex-col gap-5'>
			<div className='flex flex-col items-center gap-5 md:flex-row'>
				<TotalVotesCard
					ayeValue={bnToIntBalance(tallyData.ayes)}
					nayValue={bnToIntBalance(tallyData.nays)}
					abstainValue={bnToIntBalance(tallyData.abstain)}
					isCurrencyValue={true}
				/>
				<VotesDelegationCard
					delegatedValue={bnToIntBalance(delegatedBalance)}
					soloValue={bnToIntBalance(soloBalance)}
					isCurrencyValue={true}
				/>
				<VotesTurnoutCard
					activeIssuance={activeIssuance}
					totalIssuance={totalIssuance}
				/>
			</div>
			<TimeSplit votesByTimeSplit={votesByTimeSplit} />
			<div className='flex flex-col items-center gap-5 md:flex-row'>
				<VoteConvictions votesByConviction={votesByConviction} />
				<VoteDelegationsByConviction votesByDelegation={votesByDelegation} />
			</div>
		</div>
	);
};

export default VoteAmount;
