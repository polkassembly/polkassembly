// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IAmbassadorProposalContent } from '../ambassadorSeeding/@types';

export enum EAmbassadorRemovalSteps {
	REMOVAL_CALL = 1,
	CREATE_PREIMAGE = 2,
	CREATE_PROPOSAL = 3
}

export interface IAmbassadorRemovalStore {
	removalAmbassadorStep: EAmbassadorRemovalSteps;
	removalAmbassadorPostIndex: number | null;
	removalAmbassadorRank: number;
	removalAmbassadorProposer: string;
	removalAmbassadorAddress: string;
	removalAmbassadorCallData: string;
	removalAmbassadorXcmCallData: string;
	removalAmbassadorPreimage: { hash: string; length: number };
	removalAmbassadorDiscussion: IAmbassadorProposalContent;
	isRemovalAmbassadorPreimageCreationDone: boolean;
}
