// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
type KeyArgs = {
    network?: string;
    govType?: string;
    subsquidProposalType?: string;
    trackId?: number;
    trackStatus?: string | string[];
    page?: string | string[] | number;
    sortBy?: string | string[];
    filterBy?: string | string[];
    proposalType?: string;
    postId?: number | string | string[] | undefined;
    voterAddress?: string | string[] | undefined;
    keyType?: string;
}

export function generateKey({
	network,
	govType,
	subsquidProposalType,
	trackId,
	trackStatus,
	page,
	sortBy,
	filterBy,
	proposalType,
	postId,
	voterAddress,
	keyType
}: KeyArgs): string {
	return [
		network,
		govType,
		subsquidProposalType,
		proposalType,
		keyType,
		postId,
		trackId,
		trackStatus,
		page,
		sortBy,
		filterBy,
		voterAddress
	].filter(value => value !== undefined && value !== null)
		.join('_');
}