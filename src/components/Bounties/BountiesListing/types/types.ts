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

export interface IBounty {
	proposer: string;
	index: number;
	status: string;
	reward: string;
	payee: string;
	title: string;
	source: string;
	curator: string;
	totalChildBountiesCount: number;
	createdAt: string;
	claimedAmount: string;
	categories: string[];
}

export interface IBountyListing {
	index: number;
	curator: string;
	title: string;
	reward: string;
	claimed: number;
	date: string;
	status: string;
	categories: string[];
	totalChildBountiesCount?: number;
	children?: IBountyListing;
	childbounties?: IChildBounty[];
}
