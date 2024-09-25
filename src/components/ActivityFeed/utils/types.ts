// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export interface IPostData {
	post_id: number;
	created_at: string;
	title?: string;
	content: string;
	post_reactions: Record<string, any>;
	comments_count: number;
	amount?: string;
	usdValue?: string;
	status?: string;
	topic?: {
		name: string;
	};
	proposer?: string;
	trackName?: string;
	firstVoterProfileImg?: string;
	proposerProfile?: any;
	error?: boolean;
}

export interface TabNavigationProps {
	currentTab: string | null;
	setCurrentTab: (tab: string) => void;
	gov2LatestPosts: any;
	network: string;
}

export interface PostListProps {
	postData: IPostData[];
}
