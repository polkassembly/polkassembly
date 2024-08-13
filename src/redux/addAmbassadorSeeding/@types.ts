// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export interface IAmbassadorProposalContent {
	discussionTitle: string;
	discussionContent: string;
	discussionTags: string[];
}

export enum EAmbassadorSeedingSteps {
	CREATE_APPLICANT = 1,
	CREATE_PREIMAGE = 2,
	CREATE_PROPOSAL = 3
}

export interface IAmbassadorStore {
	ambassadorPostIndex: number | null;
	rank: number;
	proposer: string;
	applicantAddress: string;
	promoteCallData: string;
	xcmCallData: string;
	ambassadorPreimage: { hash: string; length: number };
	discussion: IAmbassadorProposalContent;
	isPreimageCreationDone: boolean;
	step: EAmbassadorSeedingSteps;
}
