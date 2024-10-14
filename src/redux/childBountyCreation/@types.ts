// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAllowedCommentor } from '~src/types';

export interface IChildBountyCreationStore {
	parentBountyIndex: number | null;
	title: string;
	content: string;
	categories: string[];
	description: string;
	proposer: string;
	link: string;
	curator: string;
	reqAmount: string;
	firstStepPercentage: number;
	secondStepPercentage: number;
	childBountyIndex: null | number;
	allowedCommentors: EAllowedCommentor;
	curatorFee: string;
}
