// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as functions from 'firebase-functions';
import { networkTrackInfo } from './utils/trackInfo';
import { ApiPromise, WsProvider } from '@polkadot/api';
import BN from 'bn.js';
import formatBnBalance from '../utils/formateBnBalance';
import { GET_ALL_TRACK_PROPOSALS, GET_TOTAL_VOTES_FOR_PROPOSAL } from '../queries';
import { firestoreDB } from '..';
import fetchSubsquid from '../utils/fetchSubsquid';

const ZERO_BN = new BN(0);

enum EVoteType {
ACCOUNTS='accounts',
CONVICTIONVOTES = 'convictionVotes',
VOTEAMOUNT = 'voteAmount',
}

interface IVoteType {
	lockPeriod: number;
	balance: string;
	decision: 'aye'| 'nay'|'abstain';
	delegatedVotingPower: string;
	selfVotingPower: string;
	isDelegatedVote: boolean;
	network: string;
}

interface IDataType {
	index: number;
	votes: IVoteType[]
}
interface IResponse{
	network : string,
	trackNumber: number,
	referendaIndex: number,
	votes: {
		convictionVotes: {
			delegationSplitData: { delegated: string | number, index: number, solo: string| number },
			supportData:{ percentage: string, index: number },
			votesSplitData: { abstain: string | number, aye: string | number, nay: string | number, index: number }
		},
		voteAmount: {
			delegationSplitData: { delegated: string | number, index: number, solo: string | number },
			supportData:{ percentage: string, index: number },
			votesSplitData: { abstain: string| number, aye: string| number, nay: string| number, index: number }
		},
		accounts: {
			delegationSplitData: { delegated: number | string, index: number, solo: number | string },
			supportData:{ percentage: string, index: number },
			votesSplitData: { abstain: number | string, aye: number | string, nay: number | string, index: number }
		},
		referendaIndex: number,
		created_at : Date;
	}
}

const logger = functions.logger;

const getWSProvider = (network: string) => {
	switch (network) {
	case 'kusama':
		return 'wss://kusama-rpc.polkadot.io';
	case 'polkadot':
		return 'wss://rpc.polkadot.io';
	case 'vara':
		return 'wss://rpc.vara.network';
	case 'rococo':
		return 'wss://rococo-rpc.polkadot.io';
	case 'moonbeam':
		return 'wss://wss.api.moonbeam.network';
	case 'moonriver':
		return 'wss://wss.moonriver.moonbeam.network';
	case 'moonbase':
		return 'wss://wss.api.moonbase.moonbeam.network';
	case 'picasso':
		return 'wss://picasso-rpc.composable.finance';
	case 'westend':
		return 'wss://westend-rpc.dwellir.com';
	default:
		return null;
	}
};

const AllNetworks = ['kusama', 'moonbase', 'moonriver', 'moonbeam', 'vara', 'polkadot', 'picasso', 'rococo', 'westend'];

const getDelegationSplit = (data: IDataType, type: EVoteType) => {
	let convictionData = { delegated: ZERO_BN, index: data?.index, solo: ZERO_BN };
	let voteAmountData = { delegated: ZERO_BN, index: data?.index, solo: ZERO_BN };
	let accountsData = { delegated: 0, index: data?.index, solo: 0 };

	if (type === EVoteType.ACCOUNTS) {
		const delegatedVotes = data?.votes.filter((vote: IVoteType) => !!vote.isDelegatedVote)?.length;
		const soloVotes = (data?.votes.length - delegatedVotes);
		accountsData = { ...accountsData, delegated: accountsData?.delegated + delegatedVotes, solo: accountsData.solo + soloVotes };
	} else if (type === EVoteType.CONVICTIONVOTES) {
		data?.votes?.map((vote: IVoteType) => {
			const balance = vote.lockPeriod == 0.1 ? new BN(vote.balance).div(new BN('10')) : new BN(vote.balance).mul(new BN(vote?.lockPeriod));

			if (vote?.isDelegatedVote) {
				convictionData = { ...convictionData, delegated: balance.add(convictionData.delegated) };
			} else {
				convictionData = { ...convictionData, solo: balance.add(convictionData?.solo) };
			}
		});
	} else {
		data?.votes?.map((vote: IVoteType) => {
			const balance = new BN(vote.balance);

			if (vote?.isDelegatedVote) {
				voteAmountData = { ...voteAmountData, delegated: balance.add(voteAmountData.delegated) };
			} else {
				voteAmountData = { ...voteAmountData, solo: balance.add(voteAmountData?.solo) };
			}
		});
	}
	switch (type) {
	case EVoteType.ACCOUNTS:
		return accountsData;
	case EVoteType.CONVICTIONVOTES:
		return { ...convictionData, delegated: convictionData?.delegated?.toString(), solo: convictionData?.solo?.toString() };
	case EVoteType.VOTEAMOUNT:
		return { ...voteAmountData, delegated: voteAmountData?.delegated?.toString(), solo: voteAmountData?.solo?.toString() };
	}
};

const getVotesSplit = (data: IDataType, type: EVoteType) => {
	const convictionData = { abstain: ZERO_BN, aye: ZERO_BN, nay: ZERO_BN, index: data?.index };
	const voteAmountData = { abstain: ZERO_BN, aye: ZERO_BN, nay: ZERO_BN, index: data?.index };
	let accountsData = { abstain: 0, aye: 0, nay: 0, index: data?.index };

	if (type === EVoteType.ACCOUNTS) {
		const ayeVotes = data?.votes.filter((vote: IVoteType) => vote.decision === 'aye')?.length;
		const nayVotes = data?.votes.filter((vote: IVoteType) => vote.decision === 'nay')?.length;

		const abstainVotes = data?.votes.length - (ayeVotes+ nayVotes);
		accountsData = { ...accountsData, abstain: abstainVotes, aye: ayeVotes, nay: nayVotes };
	} else if (type === EVoteType.CONVICTIONVOTES) {
		data?.votes?.map((vote: IVoteType) => {
			const bnBalance = vote.lockPeriod == 0.1 ? new BN(vote.balance).div(new BN('10')) : new BN(vote.balance).mul(new BN(vote?.lockPeriod));
			convictionData[vote?.decision] = new BN(convictionData[vote?.decision] || '0').add(bnBalance);
		});
	} else {
		data?.votes?.map((vote: IVoteType) => {
			const balance = new BN(vote.balance);
			voteAmountData[vote?.decision] = new BN(voteAmountData[vote?.decision] || '0').add(balance);
		});
	}
	switch (type) {
	case EVoteType.ACCOUNTS:
		return accountsData;
	case EVoteType.CONVICTIONVOTES:
		return { ...convictionData, abstain: convictionData?.abstain?.toString(), aye: convictionData?.aye?.toString(), nay: convictionData?.nay?.toString() };
	case EVoteType.VOTEAMOUNT:
		return { ...voteAmountData, abstain: voteAmountData?.abstain?.toString(), aye: voteAmountData?.aye?.toString(), nay: voteAmountData?.nay?.toString() };
	}
};

const bnToIntBalance = function(bn: BN, network:string): number {
	return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
};

const getTotalIssuance = async (api: any, network: string) => {
	if (network === 'picasso') {
		const totalIssuance = await api?.query?.openGovBalances?.totalIssuance();
		const inactiveIssuance = await api?.query?.openGovBalances?.inactiveIssuance();
		return (totalIssuance as any).sub(inactiveIssuance);
	} else {
		const totalIssuance = await api?.query?.balances?.totalIssuance();
		const inactiveIssuance = await api?.query?.balances?.inactiveIssuance();
		return (totalIssuance as any).sub(inactiveIssuance);
	}
};

const getSupportData = async (data: IDataType, network: string, api: any) => {
	await api.isReady;

	const activeIssuance = await getTotalIssuance(api, network);

	const support = data?.votes?.reduce((acc: any, vote: IVoteType) => {
		if (!acc) acc = ZERO_BN;

		if (vote.decision === 'aye' || vote.decision !== 'nay') {
			acc = acc.add(new BN(vote.balance));
		}
		return acc;
	}, new BN(0));

	const turnoutPercentage = bnToIntBalance(activeIssuance, network) ? (bnToIntBalance(support, network) / bnToIntBalance(activeIssuance, network)) * 100 : 100;

	return { percentage: turnoutPercentage.toString(), index: data?.index };
};

const trackLevelAnalytics = async () => {
	const analyticsData: any = [];
	const trackDetails: { network: string; trackNumber:number, count: number}[] = [];

	const analyticsDataPromise = AllNetworks.map(async (network) => {
		const wsProvider = new WsProvider(getWSProvider(network) as string);
		const api = await ApiPromise.create({ provider: wsProvider });
		const trackNumbers = Object.entries(networkTrackInfo[network]).map(([, value]) => {
			return value.trackId;
		});

		const trackNumbersPromise = trackNumbers.map(async (trackNumber) => {
			const subsquidRes = await fetchSubsquid({
				network,
				query: GET_ALL_TRACK_PROPOSALS,
				variables: {
					track_eq: trackNumber
				}
			});

			const proposals = subsquidRes?.['data']?.proposals || [];
			trackDetails.push({ network, trackNumber, count: proposals?.length || 0 });

			const proposalsPromise = proposals.map(async (proposal: any) => {
				const query = GET_TOTAL_VOTES_FOR_PROPOSAL;

				const variables: any = {
					index_eq: proposal.index
				};
				const subsquidVotesRes: any = await fetchSubsquid({
					network,
					query,
					variables
				});

				const votes = subsquidVotesRes['data']?.flattenedConvictionVotes?.map((vote: any) => {
					return {
						...proposal,
						balance: vote?.balance?.value || vote?.balance?.abstain || '0',
						createdAt: vote?.createdAt,
						decision: vote?.decision == 'no' ? 'nay' : vote.decision == 'yes' ? 'aye' : 'abstain' || null,
						delegatedVotingPower: vote?.isDelegated ? vote.parentVote?.delegatedVotingPower : '0',
						extrinsicIndex: vote?.parentVote?.extrinsicIndex,
						isDelegatedVote: vote?.isDelegated,
						lockPeriod: Number(vote?.lockPeriod) || 0.1,
						network: network,
						selfVotingPower: vote?.parentVote?.selfVotingPower || '0'
					};
				});

				const referenda = {
					...proposal,
					votes: votes
				};

				const supportData = await getSupportData(referenda, network, api);

				const payload: IResponse = {
					network,
					trackNumber,
					referendaIndex: proposal.index,
					votes: {
						created_at: new Date(),
						convictionVotes: {
							delegationSplitData: getDelegationSplit(referenda, EVoteType.CONVICTIONVOTES),
							supportData: supportData,
							votesSplitData: getVotesSplit(referenda, EVoteType.CONVICTIONVOTES)
						},
						voteAmount: {
							delegationSplitData: getDelegationSplit(referenda, EVoteType.VOTEAMOUNT),
							supportData: supportData,
							votesSplitData: getVotesSplit(referenda, EVoteType.VOTEAMOUNT)
						},
						accounts: {
							delegationSplitData: getDelegationSplit(referenda, EVoteType.ACCOUNTS),
							supportData: supportData,
							votesSplitData: getVotesSplit(referenda, EVoteType.ACCOUNTS)
						},
						referendaIndex: proposal.index
					}
				};
				analyticsData.push(payload);
			});
			await Promise.allSettled(proposalsPromise);
		});

		await Promise.allSettled(trackNumbersPromise);
	});

	await Promise.allSettled(analyticsDataPromise);

	if (trackDetails.length) {
		const batch = firestoreDB.batch();
		trackDetails.map((item) => {
			const snapshot = firestoreDB.collection('networks').doc(item?.network).collection('track_level_analytics').doc(String(item.trackNumber));
			batch.set(snapshot, { totalProposalsCount: item?.count || 0 });
		});

		await batch.commit();
	}

	logger.log(trackDetails, 'analyticsData', analyticsData);
	function chunkArray(array: IResponse[], chunkSize: number) {
		const chunks = [];
		for (let i = 0; i < array.length; i += chunkSize) {
			const chunk = array.slice(i, i + chunkSize);
			chunks.push(chunk);
		}
		return chunks;
	}
	const chunkSize = 500;
	const chunkedArray = chunkArray(analyticsData, chunkSize);
	for (const chunk of chunkedArray) {
		const batch = firestoreDB.batch();
		for (const item of chunk) {
			if (item?.network && typeof item?.trackNumber=='number' && typeof item?.referendaIndex === 'number' && item?.votes) {
				const activityRef = firestoreDB.collection('networks').doc(item?.network).collection('track_level_analytics').doc(String(item.trackNumber)).collection('votes').doc(String(item?.referendaIndex));
				batch.set(activityRef, item?.votes, { merge: true });
			}
		}
		try {
			await batch.commit();
		} catch (err) {
			console.log(err);
		}
	}

	logger.info('vote indexed successfully', analyticsData.length);
};

export default trackLevelAnalytics;
