// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IChildBounty } from '~src/types';

export enum EBountiesStatuses {
	ACTIVE = 'active',
	PROPOSED = 'proposed',
	CLAIMED = 'claimed',
	CANCELLED = 'cancelled',
	REJECTED = 'rejected'
}

export interface IBountyListing {
	proposer?: string;
	index: number;
	curator: string;
	title: string;
	reward: string;
	claimedAmount?: string;
	claimed?: number;
	payee?: string;
	totalChildBountiesAmt?: string;
	status: string;
	source?: string;
	totalChildBountiesCount?: number;
	createdAt?: string;
	date?: string;
	categories: string[];
	children?: IBountyListing;
	childBounties?: IChildBounty[];
	post_index?: string | number;
}
