// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// TODO: Enable commented sort option once we have a way to sort by last commented

export const sortValues = {
	COMMENTED: 'commented',
	NEWEST: 'newest',
	OLDEST: 'oldest'
};

export const sortOptions = [
	{
		key: sortValues.COMMENTED,
		label: 'Last Commented'
	},
	{
		key: sortValues.NEWEST,
		label: 'Date Added (Newest)'
	},
	{
		key: sortValues.OLDEST,
		label: 'Date Added (Oldest)'
	}
];

export const votesSortValues = {
	BALANCE_ASC: 'balance_asc',
	BALANCE_DESC: 'balance_desc',
	CONVICTION_ASC: 'conviction_asc',
	CONVICTION_DESC: 'conviction_desc',
	TIME_ASC: 'time_asc',
	TIME_DESC: 'time_desc',
	VOTING_POWER_ASC: 'voting_power_asc',
	VOTING_POWER_DESC: 'voting_power_dsc'
};

export const votesSortOptions = [
	{
		key: votesSortValues.TIME_ASC,
		label: 'Time Asc'
	},
	{
		key: votesSortValues.BALANCE_ASC,
		label: 'Balance Asc'
	},
	{
		key: votesSortValues.CONVICTION_ASC,
		label: 'Conviction Asc'
	},
	{
		key: votesSortValues.TIME_DESC,
		label: 'Time Desc'
	},
	{
		key: votesSortValues.BALANCE_DESC,
		label: 'Balance Desc'
	},
	{
		key: votesSortValues.CONVICTION_DESC,
		label: 'Conviction Desc'
	},
	{
		key: votesSortValues.VOTING_POWER_ASC,
		label: 'Voting Power Asc'
	},
	{
		key: votesSortValues.VOTING_POWER_DESC,
		label: 'Voting Power Desc'
	}
];

export const isVotesSortOptionsValid = (str: string) => {
	return votesSortOptions.some((v) => v.key === str);
};
