// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useContext, useEffect, useCallback, useState } from 'react';
import BN from 'bn.js';
import { ProposalType, getSubsquidLikeProposalType } from '~src/global/proposalType';
import { ApiContext } from 'src/context/ApiContext';
import { usePostDataContext } from '~src/context';
import { useNetworkSelector } from '~src/redux/selectors';
import { IVotesCount, LoadingStatusType } from 'src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ApiPromise } from '@polkadot/api';
import TotalVotesCard from './TotalVotesCard';
import { getVotingTypeFromProposalType } from '~src/global/proposalType';
import VotesTurnoutCard from './VotesTurnoutCard';
import VotesDelegationCard from './VotesDelegationCard';
import { IAllVotesType } from 'pages/api/v1/votes/total';
import VoteConvictions from './VoteConvictions';
import VoteDelegationsByConviction from './VoteDelegationsByConviction';
import TimeSplit from './TimeSplit';

interface IPostStatsProps {
	postId: string;
	postType: ProposalType;
	tally?: any;
	statusHistory?: any;
}

const ZERO = new BN(0);

const PostStats: FC<IPostStatsProps> = ({ postId, postType, statusHistory, tally }: IPostStatsProps) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useContext(ApiContext);

	const isReferendum2 = postType === ProposalType.REFERENDUM_V2;
	const {
		postData: { postIndex }
	} = usePostDataContext();
	const [tallyData, setTallyData] = useState({
		abstain: ZERO,
		ayes: ZERO,
		nays: ZERO
	});

	const [totalVotesCount, setTotalVotesCount] = useState<IVotesCount>({ abstain: 0, ayes: 0, nays: 0 });

	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: true, message: 'Loading votes' });
	const [activeIssuance, setActiveIssuance] = useState<any>(0);
	const [totalIssuance, setTotalIssuance] = useState<any>(0);
	const voteType = getVotingTypeFromProposalType(postType);
	const [delegatedVotesCount, setDelegatedVotesCount] = useState<number>(0);
	const [allVotes, setAllVotes] = useState<IAllVotesType>();
	const [delegatedBalance, setDelegatedBalance] = useState<BN>(new BN(0));
	const [totalVotesBalance, setTotalVotesBalance] = useState<BN>(new BN(0));
	const [votesByConviction, setVotesByConviction] = useState<any[]>([]);
	const [votesByDelegation, setVotesByDelegation] = useState<any[]>([]);
	const [votesByTimeSplit, setVotesByTimeSplit] = useState<any[]>([]);
	const [votesDistribution, setVotesDistribution] = useState<{ ayes: any[]; nays: any[]; abstain: any[] }>({ abstain: [], ayes: [], nays: [] });

	const handleAyeNayCount = async () => {
		setLoadingStatus({ ...loadingStatus, isLoading: true });
		const { data, error } = await nextApiClientFetch<{ aye: { totalCount: number }; nay: { totalCount: number }; abstain: { totalCount: number } }>(
			'/api/v1/votes/ayeNayTotalCount',
			{
				postId: postId,
				proposalType: getSubsquidLikeProposalType(postType)
			}
		);
		if (data) {
			setTotalVotesCount({ abstain: data.abstain.totalCount, ayes: data.aye.totalCount, nays: data.nay.totalCount });
			setLoadingStatus({ ...loadingStatus, isLoading: false });
		} else {
			console.log(error);
			setLoadingStatus({ ...loadingStatus, isLoading: false });
		}
	};

	const getReferendumV2VoteInfo = useCallback(async () => {
		if (!api || !apiReady || !network) return;
		let newAPI: ApiPromise = api;
		const status = (statusHistory || [])?.find((v: any) => ['Rejected', 'TimedOut', 'Confirmed'].includes(v?.status || ''));

		if (status) {
			const blockNumber = status.block;
			if (blockNumber) {
				const hash = await api.rpc.chain.getBlockHash(blockNumber - 1);
				newAPI = (await api.at(hash)) as ApiPromise;
			}
		}

		(async () => {
			if (network === 'picasso') {
				const totalIssuance = await api.query.openGovBalances.totalIssuance();
				const inactiveIssuance = await api.query.openGovBalances.inactiveIssuance();
				setActiveIssuance((totalIssuance as any).sub(inactiveIssuance));
			} else {
				const totalIssuance = await api.query.balances.totalIssuance();
				const inactiveIssuance = await api.query.balances.inactiveIssuance();
				setActiveIssuance(totalIssuance.sub(inactiveIssuance));
				setTotalIssuance(totalIssuance);
			}
		})();

		if (isReferendum2) {
			const referendumInfoOf = await newAPI.query.referenda.referendumInfoFor(postId);
			const parsedReferendumInfo: any = referendumInfoOf.toJSON();
			if (parsedReferendumInfo?.ongoing?.tally) {
				setTallyData({
					abstain:
						typeof parsedReferendumInfo.ongoing.tally.abstain === 'string'
							? new BN(parsedReferendumInfo.ongoing.tally.abstain.slice(2), 'hex')
							: new BN(parsedReferendumInfo.ongoing.tally.abstain),
					ayes:
						typeof parsedReferendumInfo.ongoing.tally.ayes === 'string'
							? new BN(parsedReferendumInfo.ongoing.tally.ayes.slice(2), 'hex')
							: new BN(parsedReferendumInfo.ongoing.tally.ayes),
					nays:
						typeof parsedReferendumInfo.ongoing.tally.nays === 'string'
							? new BN(parsedReferendumInfo.ongoing.tally.nays.slice(2), 'hex')
							: new BN(parsedReferendumInfo.ongoing.tally.nays)
				});
			}
		} else {
			setTallyData({
				abstain: new BN(tally?.abstain || 0, 'hex'),
				ayes: new BN(tally?.ayes || 0, 'hex'),
				nays: new BN(tally?.nays || 0, 'hex')
			});
		}
	}, [api, apiReady, isReferendum2, network, postId, statusHistory, tally?.abstain, tally?.ayes, tally?.nays]);

	useEffect(() => {
		setLoadingStatus({
			isLoading: true,
			message: 'Loading votes'
		});

		(async () => {
			await nextApiClientFetch<IAllVotesType>(`api/v1/votes/total?postId=${postId}&voteType=${voteType}`)
				.then((res) => {
					if (res.error) {
						console.log(res.error);
						setLoadingStatus({
							isLoading: false,
							message: ''
						});
					} else {
						const votesRes = res.data;
						setAllVotes(votesRes);

						setLoadingStatus({
							isLoading: false,
							message: ''
						});
					}
				})
				.catch((err) => {
					console.log(err);
					setLoadingStatus({
						isLoading: false,
						message: ''
					});
				});
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [getReferendumV2VoteInfo, postId, voteType]);

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

		const votesDistribution = allVotes?.data.reduce(
			(acc, vote) => {
				if (vote.decision === 'yes') {
					acc.ayes.push({
						balance: Number(vote.balance),
						voter: vote.voter
					});
				} else if (vote.decision === 'no') {
					acc.nays.push({
						balance: Number(vote.balance),
						voter: vote.voter
					});
				} else {
					acc.abstain.push({
						balance: Number(vote.balance),
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

		setTotalVotesBalance(allBalances);
		setVotesByConviction(votesByConviction as any);
		setVotesByDelegation(votesByDelegation as any);
		setDelegatedVotesCount(delegated.length);
		setVotesDistribution(votesDistribution);
		setVotesByTimeSplit(votesByTimeSplit as any);
		setDelegatedBalance(delegatedBalance);
	}, [allVotes]);

	useEffect(() => {
		handleAyeNayCount();
		(async () => {
			await getReferendumV2VoteInfo();
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postIndex]);

	return (
		<div className='flex flex-col gap-5'>
			<div className='flex flex-col items-center gap-5 md:flex-row'>
				<TotalVotesCard
					ayeVotes={tallyData.ayes}
					nayVotes={tallyData.nays}
					abstainVotes={tallyData.abstain}
					ayesCount={totalVotesCount.ayes}
					naysCount={totalVotesCount.nays}
					abstainCount={totalVotesCount.abstain}
				/>
				<VotesDelegationCard
					delegatedVotesCount={delegatedVotesCount}
					combinedVotesCount={allVotes?.totalCount || 0}
					delegatedVotesBalance={delegatedBalance}
					totalVotesBalance={totalVotesBalance}
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

export default PostStats;
