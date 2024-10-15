// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EBountiesStatuses } from '~src/components/Bounties/BountiesListing/types/types';
import { bountyStatus } from '~src/global/statuses';

const getBountiesCustomStatuses = (status: EBountiesStatuses) => {
	switch (status) {
		case EBountiesStatuses.ACTIVE:
			return [bountyStatus.ACTIVE, bountyStatus.EXTENDED];
		case EBountiesStatuses.PROPOSED:
			return [bountyStatus.PROPOSED];
		case EBountiesStatuses.CANCELLED:
			return [bountyStatus.CANCELLED];
		case EBountiesStatuses.REJECTED:
			return [bountyStatus.REJECTED];
		case EBountiesStatuses.CLAIMED:
			return [bountyStatus.AWARDED, bountyStatus.CLAIMED];
		default:
			return [];
	}
};

export default getBountiesCustomStatuses;
