// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EEnactment } from '~src/components/OpenGovTreasuryProposal';
import { EAllowedCommentor } from '~src/types';

export interface IProposalContent {
	title: string;
	content: string;
	tags: string[];
}

export interface IAddCuratorStore {
	bountyProposalIndex: number | null;
	bountyIndex: number | null;
	proposer: string;
	preimage: { hash: string; length: number };
	proposal: IProposalContent;
	track: string | null;
	curatorAddress: string | null;
	curatorFee: string;
	enactment: { key: EEnactment; value: string | null };
	bountyAmount: string;
	alreadyPreimage: boolean | null;
	allowedCommentors: EAllowedCommentor;
}
