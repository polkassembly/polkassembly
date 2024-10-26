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
import { GET_ACTIVE_VOTER, GET_PROPOSAL_COUNT, GET_WHALE } from '~src/queries';
import { getTotalSupply } from '../utils/achievementbages';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { getW3fDelegateCheck } from '../delegations/getW3fDelegateCheck';
import { chainProperties } from '~src/global/networkConstants';
import getEncodedAddress from '~src/util/getEncodedAddress';
import dayjs from 'dayjs';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import messages from '~src/auth/utils/messages';
import { badgeNames } from '~src/components/UserProfile/utils/GetAchievementBadgesText';

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
async function checkCouncil(user: ProfileDetailsResponse, network: string): Promise<boolean> {
	if (!user?.addresses || user.addresses.length === 0 || !isValidNetwork(network)) {
		console.warn(messages.INVALID_ADDRESS);
		return false;
	}

	if (isOpenGovSupported(network || 'polkodot') || !network) return false;

	const wsProviderUrl = chainProperties[network]?.rpcEndpoint;
	if (!wsProviderUrl) {
		console.error(messages.INVALID_NETWORK);
		return false;
	}
	const wsProvider = new WsProvider(wsProviderUrl);
	const api = await ApiPromise.create({ provider: wsProvider });
	try {
		const members = await api?.query.council?.members();
		const encodedAddresses = user.addresses.map((addr) => getEncodedAddress(addr, network) || addr);
		return members.some((member) => encodedAddresses.includes(member.toString()));
	} catch (error) {
		console.error(messages.ERROR_IN_EVALUATING_BADGES);
		return false;
	} finally {
		await api.disconnect();
	}
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
			query: GET_WHALE,
			variables: { voterAddresses: addresses }
		});
		if (!voterData?.flattenedConvictionVotes) return false;
		const totalVotingPower = voterData.flattenedConvictionVotes.reduce((acc: BN, vote: any) => {
			const votingPower = vote?.lockPeriod ? new BN(vote?.balance?.value || 0).mul(new BN(vote?.lockPeriod)) : new BN(vote?.balance?.value || 0).div(new BN('10'));
			return acc.add(votingPower);
		}, new BN(0));
		const whaleThreshold = totalSupply.div(new BN('100')).mul(new BN(5));
		return totalVotingPower.gte(whaleThreshold);
	} catch (error) {
		console.error(messages.ERROR_IN_EVALUATING_BADGES);
		return false;
	}
}

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
		console.error(messages.USER_NOT_FOUND);
	}

	return badges;
}

// Function to update the user's badges in Firestore
async function updateUserAchievementBadges(userId: string, newBadges: Badge[]) {
	const userDocRef = firestore_db.collection('users').doc(userId);

	const userDoc = await userDocRef.get();
	if (!userDoc.exists || !userDoc.data()?.profile) {
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
	const updateData = {
		'profile.achievement_badges': updatedBadges.length > 0 ? updatedBadges : []
	};

	try {
		await userDocRef.update(updateData);
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
