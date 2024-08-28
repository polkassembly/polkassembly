// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { firestore_db } from '~src/services/firebaseInit';
import { Badge, ProfileDetailsResponse, ProfileDetails } from '~src/auth/types';
import BN from 'bn.js';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { isValidNetwork } from '~src/api-utils';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { getUserProfileWithUsername } from '../auth/data/userProfileWithUsername';
import { GET_ACTIVE_VOTER, GET_PROPOSAL_COUNT } from '~src/queries';
import { getTotalSupply } from '../utils/achievementbages';
import { isOpenGovSupported, openGovNetworks } from '~src/global/openGovNetworks';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { getW3fDelegateCheck } from '../delegations/getW3fDelegateCheck';
import { chainProperties } from '~src/global/networkConstants';
import getEncodedAddress from '~src/util/getEncodedAddress';
import dayjs from 'dayjs';
import { badgeNames } from '~src/global/achievementbadges';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import messages from '~src/auth/utils/messages';

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
			console.log(messages.ERROR_IN_EVALUATING_BADGES, error);
			return false;
		}
	} catch (err) {
		console.error(messages.ERROR_IN_EVALUATING_BADGES);
		return false;
	}
}

// Badge2: Check if the user qualifies for the Fellow badge based on rank
async function checkFellow(user: ProfileDetailsResponse): Promise<boolean> {
	if (!user?.addresses?.length) {
		console.warn(messages.INVALID_ADDRESS);
		return false;
	}
	const network = 'collectives';
	const wsProviderUrl = chainProperties[network]?.rpcEndpoint;
	if (!wsProviderUrl) {
		console.error(messages.INVALID_ADDRESS);
		return false;
	}
	let api: ApiPromise | null = null;
	try {
		const wsProvider = new WsProvider(wsProviderUrl);
		api = await ApiPromise.create({ provider: wsProvider });
		if (!api.query?.fellowshipCollective?.members?.entries) {
			console.warn(messages.INVALID_ADDRESS);
			return false;
		}
		const entries = await api.query.fellowshipCollective.members.entries();
		const hasFellowRank = user.addresses.some((address) => {
			const encodedAddress = getEncodedAddress(address, network);
			for (const [key, value] of entries) {
				if ((key?.toHuman() as string[])?.includes(encodedAddress || '')) {
					const userRank = (value?.toHuman() as { rank?: number })?.rank || 0;
					return userRank >= 1;
				}
			}
			return false;
		});
		return hasFellowRank;
	} catch (error) {
		console.error(messages.ERROR_IN_EVALUATING_BADGES);
		return false;
	} finally {
		if (api) {
			await api.disconnect();
		}
	}
}

// Badge3: Check if the user is on a governance chain (Gov1)
async function checkCouncil(user: ProfileDetailsResponse): Promise<boolean> {
	if (!user?.addresses || user.addresses.length === 0) {
		console.warn(messages.INVALID_ADDRESS);
		return false;
	}

	for (const network of openGovNetworks) {
		const wsProviderUrl = chainProperties[network]?.rpcEndpoint;
		if (!wsProviderUrl) {
			console.error(`${messages.INVALID_NETWORK}: ${network}`);
			return false;
		}

		const wsProvider = new WsProvider(wsProviderUrl);
		const api = await ApiPromise.create({ provider: wsProvider });
		if (!api) {
			console.error(messages.ERROR_IN_EVALUATING_BADGES);
			return false;
		}
		try {
			const members = await api?.query.council?.members();
			const encodedAddresses = user.addresses.map((addr) => getEncodedAddress(addr, network) || addr);
			if (members.some((member) => encodedAddresses.includes(member.toString()))) {
				await api.disconnect();
				return true;
			}
		} catch (error) {
			console.error(`${messages.ERROR_IN_EVALUATING_BADGES} on network ${network}`, error);
		} finally {
			await api.disconnect();
		}
	}

	return false;
}

// Badge 4: Check if the user is an Active Voter, participating in more than 15% of proposals
async function checkActiveVoter(user: ProfileDetailsResponse, network: string): Promise<boolean> {
	if (!user?.addresses || user.addresses.length === 0 || !isValidNetwork(network)) {
		console.warn(messages.INVALID_ADDRESS);
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
		const encodedAddresses = user.addresses.map((addr) => getEncodedAddress(addr, network) || addr);
		const activeVoterRes = await fetchSubsquid({
			network: network || 'polkodot',
			query: GET_ACTIVE_VOTER,
			variables: { startDate: formattedDate, voterAddresses: encodedAddresses || [] }
		});
		const userVotes = activeVoterRes?.data?.flattenedConvictionVotes || [];
		return userVotes.length / totalProposals >= 0.15;
	} catch (error) {
		console.error(messages.ERROR_IN_EVALUATING_BADGES);
		return false;
	}
}

// Badge 5: Check if the user qualifies for the Whale badge, holding more than 0.05% of the total supply
async function checkWhale(user: ProfileDetailsResponse, network: string): Promise<boolean> {
	if (!user?.addresses || user.addresses.length === 0 || !isValidNetwork(network)) {
		console.warn(messages.INVALID_ADDRESS);
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
		console.error(messages.ERROR_IN_EVALUATING_BADGES);
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
		console.error(messages.API_FETCH_ERROR, error);
		return [];
	}

	const userId = user?.user_id;
	const addresses = user.addresses;

	if (!userId || !addresses || addresses.length === 0) {
		console.warn(messages.USER_NOT_FOUND);
		return [];
	}

	const badgeChecks = await Promise.all([
		checkDecentralisedVoice(user, network),
		checkFellow(user),
		checkCouncil(user),
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
		console.error(messages.USER_NOT_FOUND);
	}

	return badges;
}

// Function to update the user's badges in Firestore
async function updateUserAchievementBadges(userId: string, newBadges: Badge[]) {
	const userDocRef = firestore_db.collection('users').doc(userId);

	const userDoc = await userDocRef.get();
	if (!userDoc.exists) {
		console.error(messages.USER_NOT_FOUND);
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
		console.log(messages.SUCCESS);
	} catch (error) {
		console.error(messages.ERROR_IN_UPDATING_BADGES, error);
	}
}

// Function to update badges for users
export async function updateUserBadges(username: string, network: string): Promise<void> {
	const { data: user, error } = await getUserProfileWithUsername(username);

	if (error || !user) {
		console.error(messages.API_FETCH_ERROR, error);
		return;
	}

	const userId = user?.user_id;
	const userDocRef = firestore_db.collection('users').doc(userId?.toString() || '');
	let newBadges: Badge[] = [];
	try {
		newBadges = await evaluateBadges(username, network);
	} catch (error) {
		console.error(messages.ERROR_IN_EVALUATING_BADGES, error);
		return;
	}
	const existingBadges: Badge[] = user?.achievement_badges || [];
	const validExistingBadges = existingBadges.filter((existingBadge) => newBadges.some((newBadge) => newBadge.name === existingBadge.name));
	const filteredNewBadges = newBadges.filter((newBadge) => !existingBadges.some((existingBadge) => existingBadge.name === newBadge.name));
	const updatedBadges = [...validExistingBadges, ...filteredNewBadges];

	try {
		await userDocRef.update({
			profile: {
				...(user?.achievement_badges || {}),
				achievement_badges: updatedBadges
			}
		});
		console.log(messages.SUCCESS);
	} catch (error) {
		console.error(messages.ERROR_IN_UPDATING_BADGES, error);
	}
}

// Main API handler for processing badge updates
const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== 'POST') {
		return res.status(405).json({ message: messages.METHOD_NOT_ALLOWED });
	}
	storeApiKeyUsage(req);

	const { network, username } = req.body;

	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ message: messages.INVALID_NETWORK });
	}

	if (!username) {
		return res.status(400).json({ message: messages.INVALID_PARAMS });
	}

	const refinedName = username.replace(/[^a-zA-Z0-9_-]/g, '');
	const encodedName = encodeURIComponent(refinedName);

	try {
		/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
		const result = await updateUserBadges(encodedName, network);
		console.log(messages.SUCCESS);

		return res.status(200).json({ message: messages.SUCCESS });
	} catch (error) {
		console.error(messages.ERROR_IN_UPDATING_BADGES, error);
		return res.status(500).json({ message: 'Failed to update user badges.' });
	}
};
export default withErrorHandling(handler);
