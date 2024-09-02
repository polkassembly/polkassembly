// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IPostData } from '~src/context/PostDataContext';

export interface IPostResponse {
	post_id: string;
	content: string;
	post_reactions: Record<string, any>;
	comments_count: number;
}

export interface TabNavigationProps {
	currentTab: string | null;
	setCurrentTab: (tab: string) => void;
	gov2LatestPosts: any;
	network: string;
}

export interface PostListProps {
	postData: IPostData[];
	currentUserdata?: any;
}

export interface PostItemProps {
	post: IPostData;
	currentUserdata?: any;
}
