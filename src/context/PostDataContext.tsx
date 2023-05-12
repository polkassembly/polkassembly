// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { IReactions } from 'pages/api/v1/posts/on-chain-post';
import { createContext, FC, PropsWithChildren, useState } from 'react';

import { IComment } from '~src/components/Post/Comment/Comment';
import { ProposalType } from '~src/global/proposalType';
import { IOptionPoll, IPoll, IPostHistory } from '~src/types';

export interface IPostDataContextProviderProps extends PropsWithChildren {
	initialPostData: IPostData;
}

export interface IPostData {
    postIndex: number | string;
    postType: ProposalType;
    timeline?: any[];
    title: string;
    cid?:string;
    content: string;
    created_at: string | Date;
    last_edited_at?: string | Date;
    proposer: string;
    curator: string;
    username: string;
    topic?: {
        id: number;
        name: string;
    };
    description?: string;
    status: string;
    requested?: string | number | BN;
    reward?: string | number | BN;
    post_reactions?: IReactions;
    comments: IComment[];
    polls?: IPoll[];
    optionPolls?: IOptionPoll[];
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
        tags?: string[]
    }
    track_name?: string;
    track_number?: number;
    tags: string[] | [];
    spam_users_count?: number;
    history?: IPostHistory[];
}

export interface IPostDataContext {
    postData: IPostData
	setPostData: React.Dispatch<React.SetStateAction<IPostData>>;
}

export const PostDataContext: React.Context<IPostDataContext> = createContext(
	{} as IPostDataContext
);

const PostDataContextProvider: FC<IPostDataContextProviderProps> = (props) => {
	const { initialPostData, children } = props;
	const [postData, setPostData] = useState(initialPostData || {
		postIndex: '',
		postType: ProposalType.DISCUSSIONS
	});

	return (
		<PostDataContext.Provider value={{ postData, setPostData }}>
			{children}
		</PostDataContext.Provider>
	);
};

export default PostDataContextProvider;