// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { votesSortValues } from '~src/global/sortOptions';

// of the Apache-2.0 license. See the LICENSE file for details.
export const getOrderBy = (sortByValue: string, shouldSelectTotalVotingPower: boolean, isOpenGov: boolean) => {
	switch (sortByValue) {
		case votesSortValues.BALANCE_ASC:
			return ['balance_value_ASC', 'id_ASC'];
		case votesSortValues.BALANCE_DESC:
			return ['balance_value_DESC', 'id_DESC'];
		case votesSortValues.CONVICTION_ASC:
			return ['lockPeriod_ASC', 'id_ASC'];
		case votesSortValues.CONVICTION_DESC:
			return ['lockPeriod_DESC', 'id_DESC'];
		case votesSortValues.VOTING_POWER_ASC:
			return shouldSelectTotalVotingPower ? ['totalVotingPower_ASC', 'id_ASC'] : ['votingPower_ASC', 'id_ASC'];
		case votesSortValues.VOTING_POWER_DESC:
			return shouldSelectTotalVotingPower ? ['totalVotingPower_DESC', 'id_DESC'] : ['votingPower_DESC', 'id_DESC'];
		case votesSortValues.TIME_ASC:
			return ['timestamp_ASC', 'id_ASC'];
		default:
			return isOpenGov ? ['createdAtBlock_DESC', 'id_DESC'] : ['timestamp_DESC', 'id_DESC'];
	}
};
