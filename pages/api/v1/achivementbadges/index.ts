// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import { firestore_db } from '~src/services/firebaseInit';
import { Badge, ProfileDetailsResponse, BadgeName, MessageType } from '~src/auth/types';
import { getProfileWithAddress } from '../auth/data/profileWithAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { getUserPostCount } from '../posts/user-total-post-counts';
import { isValidNetwork } from '~src/api-utils';
import { IDelegationStats } from '../delegations/get-delegation-stats';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { w3fDelegatesKusama, w3fDelegatesPolkadot } from '../delegations/delegates';
import { getOnChainUserPosts } from '../listing/get-on-chain-user-post';
import { ApiPromise, WsProvider } from '@polkadot/api';
import BN from 'bn.js';
import { GET_TOTAL_VOTES_FOR_PROPOSAL } from '~src/queries';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import fetchSubsquid from '~src/util/fetchSubsquid';

interface BadgeCheckContext {
	commentsCount?: number;
	delegatedTokens?: number;
	isGov1Chain?: boolean;
	proposals?: any;
	rank?: number;
	totalSupply?: any;
	votesCount?: number;
	votingPower?: number;
}

export const GET_ALL_TRACK_PROPOSALS = `query ActiveTrackProposals($track_eq:Int!) {
  proposals(where: {trackNumber_eq: $track_eq}) {
    index
  }
}`;

interface BadgeCriterion {
	check: (user: ProfileDetailsResponse, context?: BadgeCheckContext) => Promise<boolean> | boolean;
	name: BadgeName;
}

export const getWSProvider = (network: string) => {
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

const badgeCriteria: BadgeCriterion[] = [
	{
		check: async (user: ProfileDetailsResponse) => {
			return w3fDelegatesPolkadot.some((delegate) => delegate.address === user.addresses[0]);
		},
		name: BadgeName.DecentralisedVoice_polkodot
	},
	{
		check: async (user: ProfileDetailsResponse) => {
			return w3fDelegatesKusama.some((delegate) => delegate.address === user.addresses[0]);
		},
		name: BadgeName.DecentralisedVoice_kusama
	},
	{
		check: async (user: ProfileDetailsResponse) => {
			const rank = await calculateRank(user);
			return rank >= 1;
		},
		name: BadgeName.Fellow
	},
	{
		check: (user: ProfileDetailsResponse, context?: BadgeCheckContext) => context?.isGov1Chain ?? false,
		name: BadgeName.Council
	},
	{
		check: (user: ProfileDetailsResponse, context?: BadgeCheckContext) => {
			if (!context?.proposals) return false;
			const userVotes = context.proposals.filter((proposal: any) => proposal.voters.includes(user.addresses[0]));
			return userVotes.length / context.proposals.length >= 0.15 && context.proposals.length >= 5;
		},
		name: BadgeName.ActiveVoter
	},
	{
		check: (user: ProfileDetailsResponse, context?: BadgeCheckContext) =>
			context?.votingPower !== undefined && context?.totalSupply !== undefined && context.votingPower >= context.totalSupply * 0.0005,
		name: BadgeName.Whale
	},
	{
		check: (user: ProfileDetailsResponse, context?: BadgeCheckContext) => context?.commentsCount !== undefined && context.commentsCount > 50,
		name: BadgeName.SteadfastCommentor
	},
	{
		check: (user: ProfileDetailsResponse, context?: BadgeCheckContext) => context?.votesCount !== undefined && context.votesCount > 50,
		name: BadgeName.GMVoter
	},
	{
		check: (user: ProfileDetailsResponse, context?: BadgeCheckContext) =>
			context?.delegatedTokens !== undefined && context?.totalSupply !== undefined && context.delegatedTokens >= context.totalSupply * 0.0001,
		name: BadgeName.PopularDelegate
	}
];

async function calculateRank(user: ProfileDetailsResponse): Promise<number> {
	const querySnapshot = await firestore_db.collection('users').where('profile_score', '>', Number(user.profile_score)).count().get();
	return querySnapshot.data().count + 1;
}

async function evaluateBadges(user: ProfileDetailsResponse, network: string): Promise<Badge[]> {
	const rank = await calculateRank(user);

	const { data: postCountData } = await getUserPostCount({
		network,
		userId: user.user_id
	});

	const { data: delegationStats } = await getDelegationStats(network);

	const { data: onChainUserPosts } = await getOnChainUserPosts({
		addresses: user.addresses,
		network
	});

	const isGov1Chain = (onChainUserPosts?.gov1_total ?? 0) > 0;

	const commentsSnapshot = await firestore_db
		.collection('useractivities')
		.where('comment_author_id', '==', user.user_id)
		.where('type', '==', 'COMMENTED')
		.where('is_deleted', '==', false)
		.get();

	const commentsCount = commentsSnapshot.size;

	const wsProvider = new WsProvider(getWSProvider(network) as string);
	await ApiPromise.create({ provider: wsProvider });
	const trackNumbers = Object.entries(networkTrackInfo[network]).map(([, value]) => value.trackId);

	let totalSupply = new BN(0);
	let activeProposals: any[] = [];

	for (const trackNumber of trackNumbers) {
		const subsquidRes = await fetchSubsquid({
			network,
			query: GET_ALL_TRACK_PROPOSALS,
			variables: {
				track_eq: trackNumber
			}
		});

		const proposals = subsquidRes?.['data']?.proposals || [];

		for (const proposal of proposals) {
			const subsquidVotesRes: any = await fetchSubsquid({
				network,
				query: GET_TOTAL_VOTES_FOR_PROPOSAL,
				variables: {
					index_eq: proposal.index
				}
			});

			const votes = subsquidVotesRes['data']?.flattenedConvictionVotes?.map((vote: any) => ({
				...proposal,
				balance: new BN(vote?.balance?.value || vote?.balance?.abstain || '0'),
				createdAt: new Date(vote?.createdAt),
				decision: vote?.decision == 'no' ? 'nay' : vote.decision == 'yes' ? 'aye' : 'abstain',
				delegatedVotingPower: new BN(vote?.isDelegated ? vote.parentVote?.delegatedVotingPower : '0'),
				isDelegatedVote: vote?.isDelegated,
				lockPeriod: new BN(vote?.lockPeriod || '0.1'),
				selfVotingPower: new BN(vote?.parentVote?.selfVotingPower || '0')
			}));

			totalSupply = totalSupply.add(votes.reduce((acc: BN, vote: any) => acc.add(vote.balance), new BN(0)));

			activeProposals = [...activeProposals, ...votes];
		}
	}

	const context: BadgeCheckContext = {
		commentsCount,
		delegatedTokens: Number(delegationStats.totalDelegatedBalance),
		isGov1Chain,
		proposals: activeProposals,
		rank,
		totalSupply: totalSupply.toString(),
		votesCount: postCountData.votes,
		votingPower: Number(delegationStats.totalDelegatedBalance)
	};

	const badgeChecks = badgeCriteria.map(async (badge) => {
		const checkResult = await badge.check(user, context);
		return checkResult
			? {
					check: true,
					name: badge.name
			  }
			: null;
	});

	const badges = await Promise.all(badgeChecks);
	return badges.filter((badge) => badge !== null) as Badge[];
}

async function getDelegationStats(network: string): Promise<{ data: IDelegationStats }> {
	const { data, error } = await nextApiClientFetch<IDelegationStats | MessageType>(`/api/v1/delegations/get-delegation-stats?network=${network}`);
	if (error) {
		throw new Error(error);
	}
	return { data: data as IDelegationStats };
}

async function updateUserAchievementBadges(userId: string, newBadges: Badge[]) {
	const userDocRef = firestore_db.collection('users').doc(userId);
	const userDoc = await userDocRef.get();
	const existingBadges = userDoc.data()?.achievement_badges || [];

	const mergedBadges = [...new Set([...existingBadges, ...newBadges.map((badge) => badge.name)])];

	await userDocRef.update({
		achievement_badges: mergedBadges
	});
}

const handler: NextApiHandler = async (req, res) => {
	if (req.method === 'POST') {
		const { userAddress } = req.body;
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

		const { data: user, error } = await getProfileWithAddress({ address: userAddress });
		if (error || !user) {
			return res.status(404).json({ message: 'User not found.', success: false });
		}

		const newBadges: Badge[] = await evaluateBadges(user as unknown as ProfileDetailsResponse, network);

		if (user.user_id) {
			await updateUserAchievementBadges(user.user_id.toString(), newBadges);
		}

		res.status(200).json({ achievement_badges: newBadges, success: true });
	} else {
		res.status(405).json({ message: 'Method not allowed.', success: false });
	}
};

export default withErrorHandling(handler);
