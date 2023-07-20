// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// TODO: Enable commented sort option once we have a way to sort by last commented

export const sortValues = {
	COMMENTED: 'commented',
	NEWEST: 'newest',
	OLDEST: 'oldest',
};

export const sortOptions = [
	{
		key: sortValues.COMMENTED,
		label: 'Last Commented',
	},
	{
		key: sortValues.NEWEST,
		label: 'Date Added (Newest)',
	},
	{
		key: sortValues.OLDEST,
		label: 'Date Added (Oldest)',
	},
];

export const votesSortValues = {
	BALANCE: 'balance',
	TIME: 'time',
};

export const votesSortOptions = [
	{
		key: votesSortValues.TIME,
		label: 'Time',
	},
	{
		key: votesSortValues.BALANCE,
		label: 'Balance',
	},
];

export const isVotesSortOptionsValid = (str: string) => {
	return votesSortOptions.some((v) => v.key === str);
};
