// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export const ForumNetworks = ['polkadot'];

export const isForumSupportedNetwork = (network: string) => {
	return ForumNetworks.includes(network);
};
