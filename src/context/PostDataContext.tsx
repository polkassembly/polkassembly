// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { IReactions } from 'pages/api/v1/posts/on-chain-post';
import { createContext, FC, PropsWithChildren, useState } from 'react';

import { IComment } from '~src/components/Post/Comment/Comment';
import { ITimeline } from '~src/components/Post/Comment/CommentsContainer';
import { ProposalType } from '~src/global/proposalType';
import { EAllowedCommentor, IBeneficiary, IOptionPoll, IPoll, IPostHistory } from '~src/types';

export interface IPostDataContextProviderProps extends PropsWithChildren {
	initialPostData: IPostData;
}

export interface ITimelineData {
	commentsCount: number;
	index: number;
	type: string;
	statuses: any[] | any;
	hash: any;
	[index: string]: any;
}

export interface IPostData {
	allowedCommentors: EAllowedCommentor;
	assetId: string | null;
	beneficiaries?: IBeneficiary[];
	postIndex: number | string;
	postType: ProposalType;
	timeline?: ITimelineData[];
	title: string;
	cid?: string;
	content: string;
	summary?: string;
	created_at: string | Date;
	currentTimeline?: ITimeline;
	last_edited_at?: string | Date;
	proposer: string;
	proposalHashBlock?: string | null;
	curator: string;
	username: string;
	userId: number;
	topic?: {
		id: number;
		name: string;
	};
	description?: string;
	status: string;
	requested?: string | number | BN;
	reward?: string;
	post_reactions?: IReactions;
	marketMetadata: any | null;
	comments: { [index: string]: Array<IComment> };
	polls?: IPoll[];
	optionPolls?: IOptionPoll[];
	hash: string;
	post_link?: {
		id?: string | number;
		type?: string;
		title?: string;
		description?: string;
		created_at?: Date | string;
		last_edited_at?: Date | string;
		proposer?: string;
		username?: string;
		topic?: {
			id: number;
			name: string;
		};
		tags?: string[];
	};
	subscribers: number[];
	track_name?: string;
	track_number?: number;
	tags: string[] | [];
	spam_users_count?: number;
	history?: IPostHistory[];
	statusHistory?: any[];
	identityId?: string | null;
	preimageHash?: string;
	progress_report?: any;
}
export interface IPostDataContext {
	postData: IPostData;
	setPostData: React.Dispatch<React.SetStateAction<IPostData>>;
}

export const PostDataContext: React.Context<IPostDataContext> = createContext({} as IPostDataContext);

const PostDataContextProvider: FC<IPostDataContextProviderProps> = (props) => {
	const { initialPostData, children } = props;
	const [postData, setPostData] = useState(
		initialPostData || {
			postIndex: '',
			postType: ProposalType.DISCUSSIONS
		}
	);

	return <PostDataContext.Provider value={{ postData, setPostData }}>{children}</PostDataContext.Provider>;
};

export default PostDataContextProvider;
