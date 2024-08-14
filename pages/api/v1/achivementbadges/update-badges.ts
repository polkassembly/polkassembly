// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { firestore_db } from '~src/services/firebaseInit';
import { Badge, ProfileDetailsResponse, BadgeCheckContext } from '~src/auth/types';
import BN from 'bn.js';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getOnChainUserPosts } from '../listing/get-on-chain-user-post';
import { getUserPostCount } from '../posts/user-total-post-counts';
import { isValidNetwork } from '~src/api-utils';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { getUserProfileWithUsername } from '../auth/data/userProfileWithUsername';
import { firestore } from 'firebase-admin';
import getW3fDelegateCheck from '../delegations/getW3fDelegateCheck';
import { badgeNames, GET_ACTIVE_VOTER, GET_POPULAR_DELEGATE, GET_PROPOSAL_COUNT } from './constant';
import { getDelegationStats, getTotalSupply } from './utils';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { getWSProvider } from '~src/global/achievementbadges';

// Badge1: Check if the user is a Decentralised Voice delegate
async function checkDecentralisedVoice(user: ProfileDetailsResponse, network: string): Promise<boolean> {
	try {
		const result = await getW3fDelegateCheck(network, user.addresses);
		return result.data?.isW3fDelegate ?? false;
	} catch (err) {
		console.error(`Unexpected error while checking W3F delegate status for ${user.username}:`, err);
		return false;
	}
}

// Badge2: Check if the user qualifies for the Fellow badge based on rank
async function checkFellow(user: ProfileDetailsResponse): Promise<boolean> {
	const rank = await calculateRank(user);
	return rank >= 1;
}

// Badge3: Check if the user is on a governance chain (Gov1)
async function checkCouncil(user: ProfileDetailsResponse, context?: BadgeCheckContext, network?: string): Promise<boolean> {
	const wsProviderUrl = getWSProvider(network || '');

	if (!wsProviderUrl) {
		console.error(`WebSocket provider URL not found for network: ${network}`);
		return false;
	}

	const wsProvider = new WsProvider(wsProviderUrl);
	const api = await ApiPromise.create({ provider: wsProvider });

	if (isOpenGovSupported(context?.network || '')) {
		await api.disconnect();
		return false;
	}

	try {
		const members = await api.query.council?.members();
		return members.some((member) => user.addresses.includes(member.toString()));
	} catch (error) {
		console.error('Error checking council members:', error);
		return false;
	} finally {
		await api.disconnect();
	}
}

// Badge 4: Check if the user is an Active Voter, participating in more than 15% of proposals
async function checkActiveVoter(user: ProfileDetailsResponse, context?: BadgeCheckContext): Promise<boolean> {
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
	const formattedDate = thirtyDaysAgo.toISOString();

	try {
		const proposalCountRes = await fetchSubsquid({
			network: context?.network,
			query: GET_PROPOSAL_COUNT,
			variables: { startDate: formattedDate }
		});

		const totalProposals = proposalCountRes?.data?.proposalsConnection?.totalCount || 0;
		if (totalProposals < 5) return false;

		const activeVoterRes = await fetchSubsquid({
			network: context?.network,
			query: GET_ACTIVE_VOTER,
			variables: { voterAddresses: user.addresses, startDate: formattedDate }
		});

		const userVotes = activeVoterRes?.data?.flattenedConvictionVotes || [];
		return userVotes.length / totalProposals >= 0.15;
	} catch (error) {
		console.error('Error checking Active Voter status:', error);
		return false;
	}
}

// Badge 5: Check if the user qualifies for the Whale badge, holding more than 0.05% of the total supply
async function checkWhale(user: ProfileDetailsResponse, context?: BadgeCheckContext, network: string): Promise<boolean> {
	if (!context?.votingPower) return false;

	try {
		const totalSupply = await getTotalSupply(network);
		if (totalSupply.isZero()) return false;

		return new BN(context.votingPower).gte(totalSupply.mul(new BN(5)).div(new BN(10000)));
	} catch (error) {
		console.error('Failed to fetch or calculate total supply:', error);
		return false;
	}
}

// Badge 6: Check if the user qualifies as a Steadfast Commentor with more than 50 comments
function checkSteadfastCommentor(user: ProfileDetailsResponse, context?: BadgeCheckContext): boolean {
	return context?.commentsCount !== undefined && context.commentsCount > 50;
}

// Badge 7: Check if the user has voted more than 50 times to qualify for the GM Voter badge
function checkGMVoter(user: ProfileDetailsResponse, context?: BadgeCheckContext): boolean {
	return context?.votesCount !== undefined && context.votesCount > 50;
}

// Badge 8: Check if the user is a Popular Delegate, receiving delegations that account for more than 0.01% of the total supply
async function checkPopularDelegate(user: ProfileDetailsResponse, context?: BadgeCheckContext, network?: string): Promise<boolean> {
	try {
		const { data: delegationsData, error: delegationsError } = await fetchSubsquid({
			network: context?.network,
			query: GET_POPULAR_DELEGATE
		});

		if (delegationsError || !delegationsData) {
			console.error('Failed to fetch voting delegations:', delegationsError);
			return false;
		}

		const delegations = delegationsData?.votingDelegations || [];
		const userDelegations = delegations.filter((delegation: any) => user.addresses.includes(delegation.to));

		const totalDelegatedTokens = userDelegations.reduce((acc: any, delegation: any) => {
			return acc.add(new BN(delegation.balance));
		}, new BN(0));

		const totalSupply = await getTotalSupply(network || '');
		if (totalSupply.isZero()) return false;

		return totalDelegatedTokens.gte(totalSupply.mul(new BN(1)).div(new BN(10000)));
	} catch (error) {
		console.error('Failed to calculate Popular Delegate status:', error);
		return false;
	}
}

// Helper function to calculate the rank of a user based on their profile score
async function calculateRank(user: ProfileDetailsResponse): Promise<number> {
	const profileScore = Number(user.profile_score);

	if (isNaN(profileScore)) {
		throw new Error('Invalid profile score');
	}

	const querySnapshot = await firestore_db.collection('users').where('profile_score', '>', profileScore).get();
	return querySnapshot.size + 1;
}

// Main function to evaluate badges for a user
async function evaluateBadges(username: string, network: string): Promise<Badge[]> {
	const { data: user, error } = await getUserProfileWithUsername(username);

	if (error || !user) {
		console.error(`Failed to fetch user profile for username: ${username}. Error: ${error}`);
		return [];
	}

	const userId = user.user_id;
	const addresses = user.addresses;

	if (!userId || !addresses || addresses.length === 0) {
		console.warn(`Invalid user data for ${username}. Skipping badge evaluation.`);
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

	const context: BadgeCheckContext = {
		commentsCount: (
			await firestore_db.collection('useractivities').where('comment_author_id', '==', userId).where('type', '==', 'COMMENTED').where('is_deleted', '==', false).get()
		).size,
		delegatedTokens: Number(delegationStats.totalDelegatedBalance),
		isGov1Chain: (onChainUserPosts?.gov1_total ?? 0) > 0,
		proposals:
			(
				await fetchSubsquid({
					network,
					query: GET_ACTIVE_VOTER,
					variables: { voterAddresses: addresses, startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString() }
				})
			)?.data?.flattenedConvictionVotes || [],
		rank,
		totalSupply: delegationStats.totalDelegatedBalance.toString(),
		votesCount: (
			await fetchSubsquid({
				network,
				query: GET_ACTIVE_VOTER,
				variables: { voterAddresses: addresses, startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString() }
			})
		)?.data?.flattenedConvictionVotes.length,
		votingPower: Number(delegationStats.totalDelegatedBalance),
		network: network
	};

	const badgeChecks = await Promise.all([
		checkDecentralisedVoice(user, network),
		checkFellow(user),
		checkCouncil(user, context, network),
		checkActiveVoter(user, context),
		checkWhale(user, context, network),
		checkSteadfastCommentor(user, context),
		checkGMVoter(user, context),
		checkPopularDelegate(user, context, network)
	]);

	const badges = badgeChecks
		.map((checkResult, index) => {
			if (checkResult) {
				return {
					check: true,
					name: badgeNames[index],
					unlockedAt: new Date().toISOString()
				};
			}
			return null;
		})
		.filter((badge) => badge !== null) as Badge[];

	if (userId) {
		await updateUserAchievementBadges(userId.toString(), badges);
	} else {
		console.error('Skipping user with missing user_id:', user.username);
	}

	return badges;
}

// Function to update the user's badges in Firestore
async function updateUserAchievementBadges(userId: string, newBadges: Badge[]) {
	const userDocRef = firestore_db.collection('users').doc(userId);
	const userDoc = await userDocRef.get();
	const profile = userDoc.data()?.profile || {};
	const existingBadges = profile.achievement_badges || [];

	const updatedBadges = existingBadges.filter((existingBadge: Badge) => newBadges.some((newBadge) => newBadge.name === existingBadge.name));
	const mergedBadges = [...updatedBadges, ...newBadges];

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

// Function to update badges for users
async function updateUserBadges(username: string, network: string) {
	const { data: user, error } = await getUserProfileWithUsername(username);

	if (error || !user) {
		console.error(`Failed to fetch user profile for username: ${username}. Error: ${error}`);
		return;
	}

	const userId = user.user_id;
	const userDocRef = firestore_db.collection('users').doc(userId.toString());

	const newBadges = await evaluateBadges(username, network);
	const existingBadges = user.achievement_badges || [];

	// Determine which existing badges are still valid
	const validExistingBadges = existingBadges.filter((existingBadge) => newBadges.some((newBadge) => newBadge.name === existingBadge.name));

	// Identify new badges that need to be added
	const filteredNewBadges = newBadges.filter((newBadge) => !existingBadges.some((existingBadge) => existingBadge.name === newBadge.name));

	// Merge valid existing badges with newly awarded badges
	const updatedBadges = [...validExistingBadges, ...filteredNewBadges];

	// Prepare the update data
	const updateData: any = {
		achievement_badges: updatedBadges.length > 0 ? updatedBadges : []
	};

	try {
		await userDocRef.update(updateData);
		console.log(`User ID: ${userId}, badges updated successfully.`);
	} catch (error) {
		console.error(`Failed to update badges for User ID: ${userId}`, error);
	}
}

// Main API handler for processing badge updates
const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'POST') {
		const { network, username } = req.body;

		if (!network || !isValidNetwork(network)) {
			return res.status(400).json({ message: 'Invalid network.' });
		}

		if (!username) {
			return res.status(400).json({ message: 'Username is required.' });
		}

		try {
			await updateUserBadges(username, network);
			res.status(200).json({ message: `Badges updated successfully for user: ${username}.` });
		} catch (error) {
			console.error(`Error updating badges for user: ${username}`, error);
			res.status(500).json({ message: 'Failed to update user badges.' });
		}
	} else {
		res.status(405).json({ message: 'Method not allowed.' });
	}
};

export default withErrorHandling(handler);
