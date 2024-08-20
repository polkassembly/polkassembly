// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { firestore_db } from '~src/services/firebaseInit';
import { Badge, ProfileDetailsResponse, IFellow, ProfileDetails } from '~src/auth/types';
import BN from 'bn.js';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { isValidNetwork } from '~src/api-utils';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { getUserProfileWithUsername } from '../auth/data/userProfileWithUsername';
import { badgeNames, GET_ACTIVE_VOTER, GET_PROPOSAL_COUNT } from './constant';
import { getTotalSupply } from './utils';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { getW3fDelegateCheck } from '../delegations/getW3fDelegateCheck';
import { chainProperties } from '~src/global/networkConstants';
import getEncodedAddress from '~src/util/getEncodedAddress';
import dayjs from 'dayjs';

// Badge1: Check if the user is a Decentralised Voice delegate
async function checkDecentralisedVoice(user: ProfileDetailsResponse, network: string): Promise<boolean> {
	if (!user?.addresses || user.addresses.length === 0 || !isValidNetwork(network)) {
		console.warn(`No addresses found for user: ${user.username}`);
		return false;
	}
	try {
		const { data, error } = await getW3fDelegateCheck(network, user?.addresses || []);
		if (data) {
			return data?.isW3fDelegate ?? false;
		} else {
			console.log(error);
			return false;
		}
	} catch (err) {
		console.error(`Unexpected error while checking W3F delegate status for ${user.username}:`, err);
		return false;
	}
}

// Badge2: Check if the user qualifies for the Fellow badge based on rank
async function checkFellow(user: ProfileDetailsResponse, network: string): Promise<boolean> {
	if (!user?.addresses || user.addresses.length === 0 || !isValidNetwork(network)) {
		console.warn(`No addresses found for user: ${user.username}`);
		return false;
	}

	// Only run for collectives or westend-collectives networks
	if (network !== 'collectives' && network !== 'westend-collectives') {
		return false;
	}

	const wsProviderUrl = chainProperties[network]?.rpcEndpoint;

	if (!wsProviderUrl) {
		console.error(`WebSocket provider URL not found for network: ${network}`);
		return false;
	}

	const wsProvider = new WsProvider(wsProviderUrl);
	const api = await ApiPromise.create({ provider: wsProvider }).catch((err) => {
		console.error('API creation failed:', err);
		return null;
	});
	const addresses = user.addresses;
	try {
		// Ensure the API query is available for the network
		if (!api?.query?.fellowshipCollective?.members?.entries) {
			console.warn('fellowshipCollective or members query is not available on this network.');
			return false;
		}
		// Fetch fellowship members
		const entries: [any, IFellow][] = await api.query.fellowshipCollective.members.entries();
		// Map over addresses and check their ranks
		const ranks = addresses?.map((address) => {
			const encodedAddress = getEncodedAddress(address, network);
			// Check each entry for a matching address
			for (const [key, value] of entries) {
				const memberAccountIds = key.args.map((arg: any) => arg.toString());
				// If the user's address matches, return the rank
				if (memberAccountIds.includes(encodedAddress)) {
					const userRank = value?.rank || 0;
					return userRank;
				}
			}
			// Return 0 if no match is found
			return 0;
		});
		// Return true if any rank is greater than or equal to 1
		return ranks.some((rank) => rank >= 1);
	} catch (error) {
		console.error('Failed to check fellow status:', error);
		return false;
	}
}

// Badge3: Check if the user is on a governance chain (Gov1)
async function checkCouncil(user: ProfileDetailsResponse, network: string): Promise<boolean> {
	if (!user?.addresses || user.addresses.length === 0 || !isValidNetwork(network)) {
		console.warn(`No addresses found for user: ${user.username}`);
		return false;
	}

	if (isOpenGovSupported(network || 'polkodot') || !network) return false;

	const wsProviderUrl = chainProperties[network]?.rpcEndpoint;
	if (!wsProviderUrl) {
		console.error(`WebSocket provider URL not found for network: ${network}`);
		return false;
	}
	const wsProvider = new WsProvider(wsProviderUrl);
	const api = await ApiPromise.create({ provider: wsProvider });
	try {
		const members = await api.query.council?.members();
		const encodedAddresses = user.addresses.map((addr) => getEncodedAddress(addr, network) || addr);
		return members.some((member) => encodedAddresses.includes(member.toString()));
	} catch (error) {
		console.error('Error checking council members:', error);
		return false;
	} finally {
		await api.disconnect();
	}
}

// Badge 4: Check if the user is an Active Voter, participating in more than 15% of proposals
async function checkActiveVoter(user: ProfileDetailsResponse, network: string): Promise<boolean> {
	if (!user?.addresses || user.addresses.length === 0 || !isValidNetwork(network)) {
		console.warn(`No addresses found for user: ${user.username}`);
		return false;
	}

	const thirtyDaysAgo = dayjs().subtract(30, 'days').toISOString();
	const formattedDate = thirtyDaysAgo;

	try {
		const proposalCountRes = await fetchSubsquid({
			network: network || 'polkodot',
			query: GET_PROPOSAL_COUNT,
			variables: { startDate: formattedDate }
		});

		const totalProposals = proposalCountRes?.data?.proposalsConnection?.totalCount || 0;
		if (totalProposals < 5) return false;

		const activeVoterRes = await fetchSubsquid({
			network: network || 'polkodot',
			query: GET_ACTIVE_VOTER,
			variables: { startDate: formattedDate, voterAddresses: user.addresses }
		});

		const userVotes = activeVoterRes?.data?.flattenedConvictionVotes || [];
		return userVotes.length / totalProposals >= 0.15;
	} catch (error) {
		console.error('Error checking Active Voter status:', error);
		return false;
	}
}

// Badge 5: Check if the user qualifies for the Whale badge, holding more than 0.05% of the total supply
async function checkWhale(user: ProfileDetailsResponse, network: string): Promise<boolean> {
	if (!user?.addresses || user.addresses.length === 0 || !isValidNetwork(network)) {
		console.warn(`No addresses found for user: ${user.username}`);
		return false;
	}

	const addresses = user.addresses;
	try {
		const totalSupply = await getTotalSupply(network || 'polkodot');
		if (totalSupply.isZero()) return false;

		const { data: voterData } = await fetchSubsquid({
			network: network || 'polkodot',
			query: GET_ACTIVE_VOTER,
			variables: { startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(), voterAddresses: addresses }
		});

		if (!voterData?.flattenedConvictionVotes) return false;
		const totalVotingPower = voterData.flattenedConvictionVotes.reduce((acc: BN, vote: any) => {
			const selfVotingPower = new BN(vote.parentVote?.selfVotingPower || '0');
			const delegatedVotingPower = vote.parentVote?.delegatedVotes.reduce((dAcc: BN, delegation: any) => {
				return dAcc.add(new BN(delegation.votingPower || '0'));
			}, new BN(0));

			return acc.add(selfVotingPower).add(delegatedVotingPower);
		}, new BN(0));
		const whaleThreshold = totalSupply.mul(new BN(5)).div(new BN(10000)); // 0.05% of total supply
		return totalVotingPower.gte(whaleThreshold);
	} catch (error) {
		console.error('Failed to calculate Whale status:', error);
		return false;
	}
}

// Badge 6: Check if the user qualifies as a Steadfast Commentor with more than 50 comments
// async function checkSteadfastCommentor(user: ProfileDetailsResponse): Promise<boolean> {
//   try {
//     const commentCount = (
//       await firestore_db.collection('useractivities').where('comment_author_id', '==', user.user_id).where('type', '==', 'COMMENTED').where('is_deleted', '==', false).get()
//     ).size;
//     return commentCount > 50;
//   } catch (error) {
//     console.error(`Error checking Steadfast Commentor for user: ${user.username}`, error);
//     return false;
//   }
// }

// Badge 7: Check if the user has voted more than 50 times to qualify for the GM Voter badge
// async function checkGMVoter(user: ProfileDetailsResponse, network: string): Promise<boolean> {
//   try {
//     const data = await getUserPostCount({ network, userId: user.user_id });
//     const voteCount = data.data.votes || 0;
//     return voteCount > 50;
//   } catch (error) {
//     console.error(`Error checking GM Voter for user: ${user.username}`, error);
//     return false;
//   }
// }

// Badge 8: Check if the user is a Popular Delegate, receiving delegations that account for more than 0.01% of the total supply
// async function checkPopularDelegate(user: ProfileDetailsResponse, network?: string): Promise<boolean> {
//   try {
//     const { data: delegationsData, error: delegationsError } = await fetchSubsquid({
//       network: network || 'polkadot',
//       query: GET_POPULAR_DELEGATE
//     });
//     if (delegationsError || !delegationsData) {
//       console.error('Failed to fetch voting delegations:', delegationsError);
//       return false;
//     }
//     const delegations = delegationsData?.votingDelegations || [];
//     const userDelegations = delegations.filter((delegation: any) => user.addresses.includes(delegation.to));
//     const totalDelegatedTokens = userDelegations.reduce((acc: any, delegation: any) => {
//       return acc.add(new BN(delegation.balance));
//     }, new BN(0));

//     const totalSupply = await getTotalSupply(network || 'polkadot');
//     if (totalSupply.isZero()) return false;
//     return totalDelegatedTokens.gte(totalSupply.mul(new BN(1)).div(new BN(10000)));
//   } catch (error) {
//     console.error('Failed to calculate Popular Delegate status:', error);
//     return false;
//   }
// }

//Main function to evaluate badges for a user
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

	const badgeChecks = await Promise.all([
		checkDecentralisedVoice(user, network),
		checkFellow(user, network),
		checkCouncil(user, network),
		checkActiveVoter(user, network),
		checkWhale(user, network)
		// checkSteadfastCommentor(user),
		// checkGMVoter(user, network),
		// checkPopularDelegate(user, network)
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
	if (!userDoc.exists) {
		console.error(`User document with ID ${userId} does not exist.`);
		return;
	}
	const profile: ProfileDetails = userDoc.data()?.profile || {};

	const existingBadges = profile.achievement_badges || [];

	const validBadges = existingBadges.filter((existingBadge: Badge) => newBadges.some((newBadge: Badge) => newBadge.name === existingBadge.name));

	const updatedBadges = [...validBadges, ...newBadges];

	const updateData = {
		'profile.achievement_badges': updatedBadges
	};

	try {
		await userDocRef.update(updateData);
		console.log(`User ID: ${userId}, badges updated successfully.`);
	} catch (error) {
		console.error(`Failed to update badges for User ID: ${userId}`, error);
	}
}

// Function to update badges for users
export async function updateUserBadges(username: string, network: string) {
	const { data: user, error } = await getUserProfileWithUsername(username);
	if (error || !user) {
		console.error(`Failed to fetch user profile for username: ${username}. Error: ${error}`);
		return;
	}
	const userId = user.user_id;
	const userDocRef = firestore_db.collection('users').doc(userId.toString());
	const newBadges = await evaluateBadges(username, network);
	const existingBadges = user.achievement_badges || [];
	const validExistingBadges = existingBadges.filter((existingBadge) => newBadges.some((newBadge) => newBadge.name === existingBadge.name));
	const filteredNewBadges = newBadges.filter((newBadge) => !existingBadges.some((existingBadge) => existingBadge.name === newBadge.name));
	const updatedBadges = [...validExistingBadges, ...filteredNewBadges];
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
		const refinedname = username.replace(/[^a-zA-Z0-9]/g, '');
		try {
			await updateUserBadges(refinedname, network);
			res.status(200).json({ message: `Badges updated successfully for user.` });
		} catch (error) {
			console.error(`Error updating badges for user: ${encodeURIComponent(username)}`, error);
			res.status(500).json({ message: 'Failed to update user badges.' });
		}
	} else {
		res.status(405).json({ message: 'Method not allowed.' });
	}
};

export default withErrorHandling(handler);
