// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IAllVotesType } from 'pages/api/v1/votes/total';
import React, { useEffect, useState } from 'react';
import VoteConvictions from '~src/components/Post/Tabs/PostStats/VoteConvictions';
import VoteDelegationsByConviction from '~src/components/Post/Tabs/PostStats/VoteDelegationsByConviction';
import BN from 'bn.js';

interface IProps {
	allVotes: IAllVotesType | undefined;
}
const ZERO = new BN(0);

const AnalyticsConvictionVotes = ({ allVotes }: IProps) => {
	const [votesByConviction, setVotesByConviction] = useState<any[]>([]);
	const [votesByDelegation, setVotesByDelegation] = useState<any[]>([]);

	useEffect(() => {
		if (!allVotes?.data) return;

		const votesByConviction = allVotes?.data.reduce(
			(acc, vote) => {
				const conviction = vote.lockPeriod.toString();
				const convictionBalance = conviction == '0.1' ? new BN(vote?.balance || '0') : new BN(vote?.balance || '0').mul(new BN(vote?.lockPeriod || '1'));
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
				const convictionBalance = conviction == '0.1' ? new BN(vote?.balance || '0') : new BN(vote?.balance || '0').mul(new BN(vote?.lockPeriod || '1'));
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

		setVotesByConviction(votesByConviction as any);
		setVotesByDelegation(votesByDelegation as any);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allVotes]);
	return (
		<div className='flex flex-col items-center gap-5 md:flex-row'>
			<VoteConvictions votesByConviction={votesByConviction} />
			<VoteDelegationsByConviction votesByDelegation={votesByDelegation} />
		</div>
	);
};

export default AnalyticsConvictionVotes;
