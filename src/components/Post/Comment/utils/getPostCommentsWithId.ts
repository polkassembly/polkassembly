// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getFirestoreProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

// of the Apache-2.0 license. See the LICENSE file for details.
export const getCommentsWithId = async (
	postId: string,
	commentId: string,
	network: string,
	pageSize: number,
	postType: string
) => {
	try {
		const { data, error } = await nextApiClientFetch<any>('api/v1/posts/comments/getCommentsWithId', {
			commentId,
			network,
			pageSize,
			postId,
			postType: getFirestoreProposalType(postType)
		});

		if (data) {
			return data || [];
		}
		if (error) {
			return [];
		}
	} catch (e) {
		return [];
	}
};