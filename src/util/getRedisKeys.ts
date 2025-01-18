// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
type KeyArgs = {
	url?: string;
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
	subStatus?: string | string[];
	startBlockNo?: number;
	endBlockNo?: number;
};

export function generateKey({
	network,
	govType,
	subsquidProposalType,
	trackId,
	trackStatus,
	page,
	sortBy,
	filterBy,
	subStatus,
	proposalType,
	postId,
	voterAddress,
	keyType,
	url,
	endBlockNo,
	startBlockNo
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
		subStatus,
		page,
		sortBy,
		filterBy,
		voterAddress,
		url,
		endBlockNo,
		startBlockNo
	]
		.filter((value) => value !== undefined && value !== null)
		.join('_');
}
