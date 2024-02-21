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
import NudgeIcon from '~assets/icons/analytics/nudge-icon.svg';
import { Divider } from 'antd';
import VoteDistribution from '../VoteDistribution';

interface IVotesAmountProps {
	allVotes: IAllVotesType | undefined;
	tallyData: any;
	activeIssuance: BN;
	totalIssuance: BN;
}

const ZERO = new BN(0);
const ConvictionVotes = ({ allVotes, tallyData, totalIssuance, activeIssuance }: IVotesAmountProps) => {
	const { network } = useNetworkSelector();

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

	const bnToIntBalance = function (bn: BN): number {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	useEffect(() => {
		if (!allVotes?.data) return;

		const votesByConviction = allVotes?.data.reduce(
			(acc, vote) => {
				const conviction = vote.lockPeriod.toString();
				const convictionBalance = conviction == '0.1' ? new BN(Number(vote.balance) * Number(vote.lockPeriod)) : new BN(vote.balance).mul(new BN(vote.lockPeriod));
				if (!acc[conviction]) {
					acc[conviction] = {
						abstain: ZERO,
						no: ZERO,
						yes: ZERO
					};
				}
				acc[conviction][vote.decision] = new BN(acc[conviction][vote.decision]).add(convictionBalance);
				return acc;
			},
			{} as { [key: string]: { yes: BN; no: BN; abstain: BN } }
		);

		const votesByDelegation = allVotes?.data.reduce(
			(acc: { [key: string]: { delegated: BN; solo: BN } }, vote) => {
				const conviction = vote.lockPeriod.toString();
				const convictionBalance = conviction == '0.1' ? new BN(Number(vote.balance) * Number(vote.lockPeriod)) : new BN(vote.balance).mul(new BN(vote.lockPeriod));
				const delegation = vote.isDelegatedVote ? 'delegated' : 'solo';
				if (!acc[conviction]) {
					acc[conviction] = {
						delegated: ZERO,
						solo: ZERO
					};
				}
				acc[conviction][delegation] = new BN(acc[conviction][delegation]).add(convictionBalance);
				return acc;
			},
			{} as { [key: string]: { delegated: BN; solo: BN } }
		);

		const votesByTimeSplit = allVotes?.data.reduce(
			(acc, vote) => {
				const proposalCreatedAt = new Date(vote.proposal.createdAt);
				const voteCreatedAt = new Date(vote.createdAt);
				const convictionBalance = new BN(vote.balance).mul(new BN(vote.lockPeriod));
				const timeSplit = Math.floor((voteCreatedAt.getTime() - proposalCreatedAt.getTime()) / (24 * 60 * 60 * 1000));

				if (timeSplit == 0) {
					acc[0] = acc[0] ? new BN(acc[0]).add(convictionBalance) : ZERO;
				} else if (timeSplit <= 7) {
					acc[7] = acc[7] ? new BN(acc[7]).add(convictionBalance) : ZERO;
				} else if (timeSplit <= 10) {
					acc[10] = acc[10] ? new BN(acc[10]).add(convictionBalance) : ZERO;
				} else if (timeSplit <= 14) {
					acc[14] = acc[14] ? new BN(acc[14]).add(convictionBalance) : ZERO;
				} else if (timeSplit <= 20) {
					acc[20] = acc[20] ? new BN(acc[20]).add(convictionBalance) : ZERO;
				} else if (timeSplit <= 24) {
					acc[24] = acc[24] ? new BN(acc[24]).add(convictionBalance) : ZERO;
				} else if (timeSplit <= 28) {
					acc[28] = acc[28] ? new BN(acc[28]).add(convictionBalance) : ZERO;
				} else {
					acc[timeSplit] = acc[timeSplit] ? new BN(acc[timeSplit]).add(convictionBalance) : ZERO;
				}
				return acc;
			},
			{} as { [key: number]: BN }
		);

		const delegated = allVotes?.data.filter((vote) => vote.isDelegatedVote);

		const delegatedBalance = delegated.reduce((acc, vote) => acc.add(new BN(vote.balance).mul(new BN(vote.lockPeriod))), new BN(0));
		const allBalances = allVotes?.data.reduce((acc, vote) => acc.add(new BN(vote.balance).mul(new BN(vote.lockPeriod))), new BN(0));

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

		setVotesByConviction(votesByConviction as any);
		setVotesByDelegation(votesByDelegation as any);
		setVotesByTimeSplit(votesByTimeSplit as any);
		setDelegatedBalance(delegatedBalance);
		setSoloBalance(allBalances.sub(delegatedBalance));
		setVotesDistribution(votesDistribution);
	}, [allVotes]);

	return (
		<>
			<div className='mb-10 flex  items-center gap-2 rounded-lg border bg-[#B6B0FB36] px-5 py-2 shadow-md'>
				<NudgeIcon className='m-0 h-6 w-6 text-[#243A57] dark:fill-white' />
				<span className='text-sm font-semibold dark:text-white'>Conviction vote is the amount used for voting multiplied by the conviction</span>
			</div>
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
						totalIssuance={totalIssuance}
					/>
				</div>
				<VoteDistribution votesDistribution={votesDistribution} />
				<TimeSplit
					votesByTimeSplit={votesByTimeSplit}
					axisLabel='Voting Power'
				/>
				<Divider
					dashed
					className='my-2 border-[#D2D8E0]'
				/>
				<div className='flex flex-col items-center gap-5 md:flex-row'>
					<VoteConvictions votesByConviction={votesByConviction} />
					<VoteDelegationsByConviction votesByDelegation={votesByDelegation} />
				</div>
			</div>
		</>
	);
};

export default ConvictionVotes;
