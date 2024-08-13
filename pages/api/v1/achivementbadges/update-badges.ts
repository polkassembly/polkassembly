import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { firestore_db } from '~src/services/firebaseInit';
import { Badge, ProfileDetailsResponse, BadgeCriterion, BadgeCheckContext, MessageType, BadgeName } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import BN from 'bn.js';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { w3fDelegatesKusama, w3fDelegatesPolkadot } from '../delegations/delegates';
import { getOnChainUserPosts } from '../listing/get-on-chain-user-post';
import { getUserPostCount } from '../posts/user-total-post-counts';
import { IDelegationStats } from '../delegations/get-delegation-stats';
import { isValidNetwork } from '~src/api-utils';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { getUserProfileWithUsername } from '../auth/data/userProfileWithUsername';
import { firestore } from 'firebase-admin';

const BATCH_SIZE = 1000;
const MAX_CONCURRENT_BATCHES = 5;

const GET_ACTIVE_VOTER = `query ActiveVoterQuery($voterAddresses: [String!], $startDate: DateTime!) {
        flattenedConvictionVotes(
            where: { voter_in: $voterAddresses, removedAtBlock_isNull: true, createdAt_gte: $startDate }
        ) {
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
            proposalIndex
            createdAt
        }
    }`;

const GET_POPULAR_DELEGATE = `query PopularDelegateQuery($delegateAddresses: [String!]) {
			votingDelegations(where: { to_in: $delegateAddresses}) {
				to
				type
				balance
			}
		}`;

const hasMatchingAddress = (addresses: string[], delegates: { address: string }[]): boolean => {
	return addresses.some((userAddress) => delegates.some((delegate) => delegate.address === userAddress));
};

const badgeCriteria: BadgeCriterion[] = [
	{
		check: async (user: ProfileDetailsResponse) => {
			return hasMatchingAddress(user.addresses, w3fDelegatesPolkadot);
		},
		name: BadgeName.DecentralisedVoice_polkodot
	},
	{
		check: async (user: ProfileDetailsResponse) => {
			return hasMatchingAddress(user.addresses, w3fDelegatesKusama);
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
	const profileScore = Number(user.profile_score);

	if (isNaN(profileScore)) {
		throw new Error('Invalid profile score');
	}

	const querySnapshot = await firestore_db.collection('users').where('profile_score', '>', profileScore).get();
	return querySnapshot.size + 1;
}

async function evaluateBadges(username: string, network: string): Promise<Badge[]> {
	const { data: user, error } = await getUserProfileWithUsername(username);

	if (error || !user) {
		console.error(`Failed to fetch user profile for username: ${username}. Error: ${error}`);
		return [];
	}

	const userId = user.user_id;
	const addresses = user.addresses;

	if (!userId) {
		console.error('Invalid user data: missing user_id');
		return [];
	}

	if (!addresses || addresses.length === 0) {
		console.warn(`User ${username} is missing addresses. Skipping badge evaluation.`);
		return [];
	}

	const rank = await calculateRank(user);
	const { data: postCountData } = await getUserPostCount({ network, userId });
	const { data: delegationStats } = await getDelegationStats(network);
	const { data: onChainUserPosts } = await getOnChainUserPosts({ addresses, network });

	if (!postCountData || !delegationStats || !onChainUserPosts) {
		console.error('Failed to fetch necessary data for badge evaluation');
		return [];
	}

	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const formattedDate = thirtyDaysAgo.toISOString();
	const queryVariables = {
		voterAddresses: addresses,
		startDate: formattedDate
	};

	const activeVoterRes = await fetchSubsquid({
		network,
		query: GET_ACTIVE_VOTER,
		variables: queryVariables
	});

	const activeVotes = activeVoterRes?.data?.flattenedConvictionVotes || [];
	const userVotesCount = activeVotes.length;

	const popularDelegateRes = await fetchSubsquid({
		network,
		query: GET_POPULAR_DELEGATE,
		variables: { delegateAddresses: addresses }
	});

	const delegatedVotes = popularDelegateRes?.data?.votingDelegations || [];
	const totalDelegatedTokens = delegatedVotes.reduce((acc: BN, delegation: { balance: string | null }) => {
		if (delegation.balance) {
			return acc.add(new BN(delegation.balance));
		}
		return acc;
	}, new BN(0));

	const isGov1Chain = (onChainUserPosts?.gov1_total ?? 0) > 0;
	const commentsSnapshot = await firestore_db
		.collection('useractivities')
		.where('comment_author_id', '==', userId)
		.where('type', '==', 'COMMENTED')
		.where('is_deleted', '==', false)
		.get();

	const commentsCount = commentsSnapshot.size;

	const context: BadgeCheckContext = {
		commentsCount,
		delegatedTokens: Number(totalDelegatedTokens.toString()),
		isGov1Chain,
		proposals: activeVotes,
		rank,
		totalSupply: totalDelegatedTokens.toString(),
		votesCount: userVotesCount,
		votingPower: Number(delegationStats.totalDelegatedBalance)
	};

	const badgeChecks = badgeCriteria.map(async (badge) => {
		const checkResult = await badge.check(user, context);
		if (!checkResult) {
			console.log(`Badge ${badge.name} not awarded to user ${user.username}. Reason: Criteria not met.`);
		} else {
			console.log(`Badge ${badge.name} is awarded to user ${user.username}.`);
		}
		return checkResult
			? {
					check: true,
					name: badge.name,
					unlockedAt: new Date().toISOString()
			  }
			: null;
	});

	const badges = (await Promise.all(badgeChecks)).filter((badge) => badge !== null) as Badge[];

	if (userId) {
		await updateUserAchievementBadges(userId.toString(), badges);
	} else {
		console.error('Skipping user with missing user_id:', user.username);
	}

	return badges;
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
	const profile = userDoc.data()?.profile || {};
	const existingBadges = profile.achievement_badges || [];

	const filteredNewBadges = newBadges.filter((newBadge) => !existingBadges.some((existingBadge: Badge) => existingBadge.name === newBadge.name));

	if (filteredNewBadges.length === 0) {
		console.log(`No new badges to add for User ID: ${userId}`);
		return;
	}
	const mergedBadges = [...existingBadges, ...filteredNewBadges];
	profile.achievement_badges = mergedBadges;

	const updateData: any = {
		profile: profile
	};

	if (userDoc.data()?.achievement_badges) {
		updateData.achievement_badges = firestore.FieldValue.delete();
	}

	try {
		await userDocRef.update(updateData);
		console.log(`User ID: ${userId}, badges updated successfully in profile and removed from root level`);
	} catch (error) {
		console.error(`Failed to update badges for User ID: ${userId}`, error);
	}
}

function chunkArray(array: any[], size: number) {
	const result = [];
	for (let i = 0; i < array.length; i += size) {
		result.push(array.slice(i, i + size));
	}
	return result;
}

async function updateAllUsersBadges(network: string) {
	const usersSnapshot = await firestore_db.collection('users').get();
	const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
	const chunks = chunkArray(users, BATCH_SIZE);

	const batchPromises: Promise<void>[] = [];
	const processedUserIds = new Set<string>();

	for (const chunk of chunks) {
		if (batchPromises.length >= MAX_CONCURRENT_BATCHES) {
			await Promise.all(batchPromises);
			batchPromises.length = 0;
		}

		const batch = firestore_db.batch();

		for (const user of chunk) {
			const userId = user.id;

			if (processedUserIds.has(userId)) {
				console.log(`Skipping already processed user ID: ${userId}`);
				continue;
			}

			const userDocRef = firestore_db.collection('users').doc(userId);
			const profile = user.data.profile || {};

			const newBadges = await evaluateBadges(user.data.username, network);
			const existingBadges = profile.achievement_badges || [];
			const filteredNewBadges = newBadges.filter((newBadge) => !existingBadges.some((existingBadge: Badge) => existingBadge.name === newBadge.name));

			profile.achievement_badges = [...existingBadges, ...filteredNewBadges];

			batch.update(userDocRef, { profile });

			if (user.data.achievement_badges) {
				batch.update(userDocRef, { achievement_badges: firestore.FieldValue.delete() });
			}

			processedUserIds.add(userId);
		}

		const batchPromise = batch
			.commit()
			.then(() => {
				console.log('Batch committed successfully');
			})
			.catch((error) => {
				console.error('Failed to commit batch', error);
			});

		batchPromises.push(batchPromise);
	}

	if (batchPromises.length > 0) {
		await Promise.all(batchPromises);
	}
}

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'POST') {
		const { network } = req.body;

		if (!network || !isValidNetwork(network)) {
			return res.status(400).json({ message: 'Invalid network.' });
		}

		try {
			await updateAllUsersBadges(network);
			res.status(200).json({ message: 'All users updated successfully.' });
		} catch (error) {
			console.error('Error updating users:', error);
			res.status(500).json({ message: 'Failed to update users.' });
		}
	} else {
		res.status(405).json({ message: 'Method not allowed.' });
	}
};

export default withErrorHandling(handler);
