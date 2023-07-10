// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import nextApiClientFetch from '~src/util/nextApiClientFetch';

// of the Apache-2.0 license. See the LICENSE file for details.
export const getPaginatedComments = async (
	postId: string,
	lastDocumentId: any,
	network: string,
	pageSize: number,
	postType: string
) => {
	try{
		const { data, error } = await nextApiClientFetch<any>('api/v1/posts/comments/getCommentByPostId',{
			lastDocumentId,
			network,
			pageSize,
			postId,
			postType
		});
		if(data){
			return data || [];
		}
		if(error){
			return [];
		}
	}catch(e){
		return [];
	}
};