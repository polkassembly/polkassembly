// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAmbassadorSeedingRanks } from '../types';

const getRankNameByRank = (rank: number) => {
	switch (rank) {
		case EAmbassadorSeedingRanks.AMBASSADOR:
			return 'Amabassador';
		case EAmbassadorSeedingRanks.SENIOR_AMBASSADOR:
			return 'Senior Amabassador';
		case EAmbassadorSeedingRanks.HEAD_AMBASSADOR:
			return 'Head Amabassador';
	}
};
export default getRankNameByRank;
