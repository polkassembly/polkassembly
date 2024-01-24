// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export interface IVoteDataStore {
	delegatedData: any;
	delegatorLoading: boolean;
	isReferendum2: boolean | undefined;
	// active: boolean | undefined;
	setDelegationVoteModal: any;
	tally: any;
	voteData: any;
	voteType: any;
	isVoteDataModalOpen: boolean;
}
