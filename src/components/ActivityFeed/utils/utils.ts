// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import moment from 'moment';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import { ProposalType } from '~src/global/proposalType';

export const fetchVoterProfileImage = async (username: string): Promise<string | null> => {
	try {
		const { data, error } = await nextApiClientFetch<any>(`/api/v1/auth/data/userProfileWithUsername?username=${username}`);
		if (error || !data || !data?.image) {
			return null;
		}
		return data.image;
	} catch (error) {
		console.error('Error fetching voter profile image:', error);
		return null;
	}
};

export const fetchUserProfile = async (address: string): Promise<IGetProfileWithAddressResponse | null> => {
	try {
		const { data } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`/api/v1/auth/data/profileWithAddress?address=${address}`);

		if (data) {
			const { custom_username, user_id, username, web3Signup, profile } = data;
			return {
				custom_username,
				profile: {
					achievement_badges: [],
					image: profile?.image || '/assets/rankcard3.svg'
				},
				user_id,
				username,
				web3Signup
			};
		}
		return null;
	} catch (error) {
		console.error(`Error fetching user profile for address ${address}:`, error);
		return null;
	}
};

export const toPascalCase = (str: string): string => {
	const specialCases: Record<string, string> = {
		all: 'allGov2Posts',
		discussions: 'discussionPosts'
	};
	return specialCases[str] || str.replace(/-./g, (match) => match.charAt(1).toUpperCase());
};

export const getProposalType = (tabKey: string): string => {
	return tabKey === 'discussions' ? ProposalType.DISCUSSIONS : ProposalType.REFERENDUM_V2;
};

export const formatDate = (date: string): string => {
	const now = moment();
	const postDate = moment(date);
	const diffInDays = now.diff(postDate, 'days');

	if (diffInDays < 1) {
		return postDate.fromNow();
	} else if (diffInDays >= 15) {
		return postDate.format('DD MMM YYYY');
	} else {
		return postDate.fromNow();
	}
};

export const truncateContent = (content: string, wordLimit: number): string => {
	const words = content.split(' ');
	if (words.length > wordLimit) {
		return words.slice(0, wordLimit).join(' ') + '...';
	}
	return content;
};
