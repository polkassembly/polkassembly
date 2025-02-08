// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export interface IProposalContent {
	discussionTitle: string;
	discussionContent: string;
	discussionTags: string[];
}

export interface IAddCuratorStore {
	bountyProposalIndex: number | null;
	bountyIndex: number | null;
	proposer: string;
	preimage: { hash: string; length: number };
	discussion: IProposalContent;
	trackNumber: number | null;
	curatorAddress: string | null;
	curatorFee: string;
	enactment: { atBlockNo: number | null; afterBlockNo: number | null };
	bountyAmount: string;
	alreadyPreimage: boolean | null;
}
