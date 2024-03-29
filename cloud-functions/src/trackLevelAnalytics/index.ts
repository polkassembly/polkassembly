// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetchSubsquid from '../utils/fetchSubsquid';
import { networkTrackInfo } from '../trackInfo';
import { ApiPromise, WsProvider } from '@polkadot/api';
import BN from 'bn.js';
import formatBnBalance from '../utils/formateBnBalance';

const ZERO_BN = new BN(0);

export const GET_TOTAL_VOTES_FOR_PROPOSAL = `
query AllVotesForProposalIndex($type_eq: VoteType = ReferendumV2, $index_eq: Int  ) {
  flattenedConvictionVotes(where: {type_eq: $type_eq, proposalIndex_eq: $index_eq, removedAtBlock_isNull: true}, orderBy: voter_DESC) {
    type
    voter
    lockPeriod
    decision
    balance {
      ... on StandardVoteBalance {
        value
      }
      ... on SplitVoteBalance {
        aye
        nay
        abstain
      }
    }
    createdAt
    createdAtBlock
    proposalIndex
    delegatedTo
    isDelegated
    parentVote {
      extrinsicIndex
      selfVotingPower
      type
      voter
      lockPeriod
      delegatedVotingPower
      delegatedVotes(where: {removedAtBlock_isNull: true}) {
        voter
        balance {
          ... on StandardVoteBalance {
            value
          }
          ... on SplitVoteBalance {
            aye
            nay
            abstain
          }
        }
        lockPeriod
        votingPower
      }
    }
  }
  flattenedConvictionVotesConnection(orderBy: id_ASC, where: {type_eq: $type_eq, proposalIndex_eq: $index_eq, removedAtBlock_isNull: true}) {
    totalCount
  }
}`;
const GetAllProposalOftrack = `query ActiveTrackProposals($track_eq:Int!) {
  proposals(where: {trackNumber_eq: $track_eq}) {
    index
  }
}

`;
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
	default:
		return null;
	}
};

const AllNetworks = ['kusama', 'moonbase', 'moonriver', 'moonbeam', 'vara', 'polkadot', 'picasso', 'rococo'];

admin.initializeApp();
const firestoreDB = admin.firestore();

const getDelegationSplit = (data: any) => {
	let res = { delegated: ZERO_BN, index: data?.index, solo: ZERO_BN };

	data?.votes?.map((vote: any) => {
		if (vote?.isDelegatedVote) {
			const delegatedBalance = new BN(vote?.delegatedVotingPower || '0');
			res = { ...res, delegated: delegatedBalance.add(res.delegated) };
		} else {
			const balance = new BN(vote?.selfVotingPower || '0');
			res = { ...res, solo: balance.add(res?.solo) };
		}
	});

	return { ...res, delegated: res.delegated.toString(), solo: res?.solo.toString() };
};

const getVotesSplit = (data: any) => {
	const res: any = { abstain: ZERO_BN, aye: ZERO_BN, nay: ZERO_BN, index: data?.index };

	data?.votes?.map((vote: any) => {
		const bnBalance = new BN(vote?.balance);
		res[vote?.decision === 'yes' ? 'aye' : vote?.decision === 'no' ? 'nay' : 'abstain'] = bnBalance;
	});

	return { ...res, abstain: res.abstain.toString(), aye: res.aye.toString(), nay: res.nay.toString() };
};

const getSupportData = async (data: any, network: string) => {
	if (network === 'picasso') {
		fetch('https://api.polkassembly.io/api/v1/getTotalVotesForOtherNetworks/',
			{
				method: 'post',
				body: JSON.stringify({
					postId: data?.index
				}),
				headers: {
					'Authorization': `Bearer ${process.env.AUTH_TOKEN}`,
					'Content-Type': 'application/json'
				}
			});
	}

	const wsProvider = new WsProvider(getWSProvider(network) as string);
	const api = await ApiPromise.create({ provider: wsProvider });
	await api.isReady;

	let activeIssuance = ZERO_BN;

	(async () => {
		if (network === 'picasso') {
			const totalIssuance = await api.query.openGovBalances.totalIssuance();
			const inactiveIssuance = await api.query.openGovBalances.inactiveIssuance();
			activeIssuance = (totalIssuance as any).sub(inactiveIssuance);
		} else {
			const totalIssuance = await api.query.balances.totalIssuance();
			const inactiveIssuance = await api.query.balances.inactiveIssuance();
			activeIssuance = (totalIssuance as any).sub(inactiveIssuance);
		}
	})();

	const bnToIntBalance = function(bn: BN): number {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const support = data?.votes.reduce((acc: any, vote: any) => {
		if (!acc) acc = ZERO_BN;

		if (vote.decision === 'yes' || vote.decision !== 'no') {
			acc = acc.add(new BN(vote.balance));
		}
		return acc;
	}, new BN(0));

	const turnoutPercentage = bnToIntBalance(activeIssuance) ? (bnToIntBalance(support) / bnToIntBalance(activeIssuance)) * 100 : 100;

	return { percentage: turnoutPercentage.toString(), index: data?.index };
};

const trackLevelAnalytics = async () => {
	const analyticsData = [];
	for (const network of AllNetworks) {
		const trackNumbers = Object.entries(networkTrackInfo[network]).map(([, value]) => {
			return value.trackId;
		});

		for (const trackNumber of trackNumbers) {
			const subsquidRes = await fetchSubsquid({
				network,
				query: GetAllProposalOftrack,
				variables: {
					track_eq: trackNumber
				}
			});
			const proposals = subsquidRes?.['data']?.proposals;

			for (const proposal of proposals) {
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
						decision: vote?.decision || null,
						delegatedTo: vote?.delegatedTo || '',
						delegatedVotingPower: vote?.isDelegated ? vote.parentVote?.delegatedVotingPower : '0',
						extrinsicIndex: vote?.parentVote?.extrinsicIndex,
						isDelegatedVote: vote?.isDelegated,
						lockPeriod: Number(vote?.lockPeriod) || 0.1,
						network: network,
						selfVotingPower: vote?.parentVote?.selfVotingPower || '0',
						voter: vote?.voter
					};
				});

				const referenda = {
					...proposal,
					votes: votes.length
				};
				const payload = {
					network,
					trackNumber,
					referendaIndex: proposal.index,
					votes: {
						delegationSplitData: getDelegationSplit(referenda),
						referendaIndex: proposal.index,
						supportData: getSupportData(referenda, network),
						votedSplitData: getVotesSplit(referenda)
					}
				};
				analyticsData.push(payload);
			}
		}
	}

	function chunkArray(array: any[], chunkSize: number) {
		const chunks = [];
		for (let i = 0; i < array.length; i += chunkSize) {
			const chunk = array.slice(i, i + chunkSize);
			chunks.push(chunk);
		}
		return chunks;
	}
	const chunkSize = 400;
	const chunkedArray = chunkArray(analyticsData, chunkSize);
	console.log(chunkedArray);
	for (const chunk of chunkedArray) {
		const batch = firestoreDB.batch();
		for (const item of chunk) {
			const activityRef = firestoreDB.collection('network').doc(item?.network).collection('track_level_analytics').doc(String(item.trackNumber)).collection('referendum_v2').doc(String(item?.referendaIndex));
			batch.set(activityRef, item?.votes, { merge: true });
		}
		try {
			console.log(chunk, chunk.length);
			await batch.commit();
		} catch (err) {
			console.log(err);
		}
	}

	logger.info('vote indexed successfully');
};

export default trackLevelAnalytics;
