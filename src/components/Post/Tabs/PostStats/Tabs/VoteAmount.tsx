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
import { Divider } from 'antd';
import VoteDistribution from '../VoteDistribution';
import Nudge from './Nudge';
import { usePostDataContext } from '~src/context';

interface IVotesAmountProps {
	allVotes: IAllVotesType | undefined;
	activeIssuance: BN;
	support: BN;
	turnout: BN | null;
	elapsedPeriod: number;
}

const ZERO = new BN(0);
const VoteAmount = ({ allVotes, turnout, support, activeIssuance, elapsedPeriod }: IVotesAmountProps) => {
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
	const [votesDistribution, setVotesDistribution] = useState<{ ayes: any[]; nays: any[]; abstain: any[] }>({
		abstain: [],
		ayes: [],
		nays: []
	});

	const {
		postData: { created_at: createdAt }
	} = usePostDataContext();

	const bnToIntBalance = function (bn: BN): number {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	useEffect(() => {
		if (!allVotes?.data) return;

		const votesByConviction = allVotes?.data.reduce(
			(acc, vote) => {
				const conviction = vote.lockPeriod.toString();
				const votingBalance = new BN(vote.balance);
				if (!acc[conviction]) {
					acc[conviction] = {
						abstain: ZERO,
						no: ZERO,
						yes: ZERO
					};
				}
				acc[conviction][vote.decision] = new BN(acc[conviction][vote.decision]).add(votingBalance);
				return acc;
			},
			{} as { [key: string]: { yes: BN; no: BN; abstain: BN } }
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
			(acc: { [key: string]: { delegated: BN; solo: BN } }, vote) => {
				const conviction = vote.lockPeriod.toString();
				const voteBalance = new BN(vote.balance || '0');
				const delegation = vote.isDelegatedVote ? 'delegated' : 'solo';
				if (!acc[conviction]) {
					acc[conviction] = {
						delegated: ZERO,
						solo: ZERO
					};
				}
				acc[conviction][delegation] = new BN(acc[conviction][delegation]).add(voteBalance);
				return acc;
			},
			{} as { [key: string]: { delegated: BN; solo: BN } }
		);

		const votesByTimeSplit = allVotes?.data.reduce(
			(acc, vote) => {
				const proposalCreatedAt = new Date(createdAt);
				const voteCreatedAt = new Date(vote.createdAt);
				const voteBalance = new BN(vote.balance) || '0';
				const timeSplit = Math.floor((voteCreatedAt.getTime() - proposalCreatedAt.getTime()) / (24 * 60 * 60 * 1000));

				for (let i = 0; i <= 28; i++) {
					if (timeSplit === i) {
						acc[i] = acc[i] ? new BN(acc[i]).add(voteBalance) : ZERO;
					} else {
						acc[i] = acc[i] || ZERO;
					}
				}
				return acc;
			},
			{} as { [key: number]: BN }
		);

		const votesDistribution = allVotes?.data.reduce(
			(acc, vote) => {
				if (vote.decision === 'yes') {
					acc.ayes.push({
						balance: bnToIntBalance(new BN(vote.balance)),
						voter: vote.voter
					});
				} else if (vote.decision === 'no') {
					acc.nays.push({
						balance: bnToIntBalance(new BN(vote.balance)),
						voter: vote.voter
					});
				} else {
					acc.abstain.push({
						balance: bnToIntBalance(new BN(vote.balance)),
						voter: vote.voter
					});
				}
				return acc;
			},
			{ abstain: [], ayes: [], nays: [] } as { ayes: any[]; nays: any[]; abstain: any[] }
		);

		const delegated = allVotes?.data.filter((vote) => vote.isDelegatedVote);

		const delegatedBalance = delegated.reduce((acc, vote) => acc.add(new BN(vote.balance)), new BN(0));
		const allBalances = allVotes?.data.reduce((acc, vote) => acc.add(new BN(vote.balance)), new BN(0));

		setVotesByConviction(votesByConviction as any);
		setVotesByDelegation(votesByDelegation as any);
		setVotesByTimeSplit(votesByTimeSplit as any);
		setDelegatedBalance(delegatedBalance);
		setTallyData(tallyData);
		setSoloBalance(allBalances.sub(delegatedBalance));
		setVotesDistribution(votesDistribution);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allVotes]);

	return (
		<>
			<Nudge text='Vote amount is the number of tokens used for voting' />
			<div className='flex flex-col gap-5'>
				<div className='flex flex-col items-center gap-5 md:flex-row'>
					<TotalVotesCard
						ayeValue={bnToIntBalance(tallyData?.ayes || ZERO)}
						nayValue={bnToIntBalance(tallyData?.nays || ZERO)}
						abstainValue={bnToIntBalance(tallyData?.abstain || ZERO)}
						isCurrencyValue={true}
					/>
					<VotesDelegationCard
						delegatedValue={bnToIntBalance(delegatedBalance)}
						soloValue={bnToIntBalance(soloBalance)}
						isCurrencyValue={true}
					/>
					<VotesTurnoutCard
						activeIssuance={activeIssuance}
						support={support}
						turnout={turnout}
					/>
				</div>
				<VoteDistribution votesDistribution={votesDistribution} />
				<TimeSplit
					votesByTimeSplit={votesByTimeSplit}
					axisLabel='Voting Power'
					elapsedPeriod={elapsedPeriod}
				/>
				<Divider
					dashed
					className='my-2 border-section-light-container'
				/>
				<div className='flex flex-col items-center gap-5 md:flex-row'>
					<VoteConvictions votesByConviction={votesByConviction} />
					<VoteDelegationsByConviction votesByDelegation={votesByDelegation} />
				</div>
			</div>
		</>
	);
};

export default VoteAmount;
