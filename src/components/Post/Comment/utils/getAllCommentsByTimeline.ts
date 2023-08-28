// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ITimelineComments } from 'pages/api/v1/posts/comments/getCommentsByTimeline';
import { ITimelineData } from '~src/context/PostDataContext';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

// of the Apache-2.0 license. See the LICENSE file for details.
export const getAllCommentsByTimeline = async (
	postTimeline:Array<ITimelineData>,
	network: string
) => {
	try {
		const { data, error } = await nextApiClientFetch<ITimelineComments>('api/v1/posts/comments/getCommentsByTimeline', {
			network,
			postTimeline
		});

		if (data) {
			return data;
		}
		if (error) {
			return null;
		}
	} catch (e) {
		return null;
	}
};