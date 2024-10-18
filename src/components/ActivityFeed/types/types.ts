// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IPIPsVoting, IReactions } from 'pages/api/v1/posts/on-chain-post';
import { EAllowedCommentor, EGovType, IBeneficiary, IPostHistory } from '~src/types';

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

export interface ITabNavigationProps {
	currentTab: string | null;
	setCurrentTab: (tab: string) => void;
	gov2LatestPosts: any;
	network: string;
}

export interface IPostListProps {
	postData: IPostData[];
}

export interface ITabItem {
	key: string;
	label: string;
	posts: number;
	group: string;
}

export interface IActivityFeedPost {
	allowedCommentors: EAllowedCommentor;
	assetId?: string | null;
	post_reactions?: IReactions;
	commentsCount: any;
	content?: string;
	end?: number;
	delay?: number;
	vote_threshold?: any;
	created_at?: string;
	tippers?: any[];
	topic: {
		id: number;
		name: string;
	};
	decision?: string;
	last_edited_at?: string | Date;
	gov_type?: EGovType;
	proposalHashBlock?: string | null;
	tags?: string[] | [];
	history?: IPostHistory[];
	pips_voters?: IPIPsVoting[];
	title?: string;
	beneficiaries?: IBeneficiary[];
	[key: string]: any;
	preimageHash?: string;
	summary?: string;
}

export enum EActivityFeedTab {
	EXPLORE = 'explore',
	FOLLOWING = 'following'
}
