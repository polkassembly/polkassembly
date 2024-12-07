// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IActivityFeedPost } from 'pages/api/v1/activity-feed/explore-posts';

export interface IActivityFeedState {
	explorePosts: IActivityFeedPost[];
	subscribedPosts: IActivityFeedPost[];
	loadingExplore: boolean;
	loadingSubscribed: boolean;
}
