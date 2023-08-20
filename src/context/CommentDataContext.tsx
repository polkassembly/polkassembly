// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Dayjs } from 'dayjs';
import { createContext, FC, PropsWithChildren, useState } from 'react';
import { IComment } from '~src/components/Post/Comment/Comment';

export interface ICommentsDataContextProviderProps extends PropsWithChildren {
	initialCommentsData: ICommentsData;
}

export interface ITimeline {
	date: Dayjs;
	status: string;
	id: number;
	commentsCount: number;
	firstCommentId: string;
	index: string;
	type: string;
}

export interface ICommentsData {
    timelines: Array<ITimeline>;
    comments:{[index:string]:Array<IComment>};
    currentTimeline:ITimeline | null;
}

export interface ICommentsDataContext {
    timelines: Array<ITimeline>;
    setTimelines: React.Dispatch<React.SetStateAction<ITimeline[]>>;
    comments:{[index:string]:Array<IComment>};
    setComments: React.Dispatch<React.SetStateAction<{
        [index: string]: IComment[];
    }>>;
    currentTimeline:ITimeline | null;
    setCurrentTimeline:React.Dispatch<React.SetStateAction<ITimeline | null>>
}

export const CommentsDataContext: React.Context<ICommentsDataContext> = createContext(
	{} as ICommentsDataContext
);

const CommentsDataContextProvider: FC<ICommentsDataContextProviderProps> = (props) => {
	const { initialCommentsData, children } = props;
	const [timelines, setTimelines] = useState<ITimeline[]>([]);
	const [comments, setComments] = useState<{[index:string]:Array<IComment>}>(initialCommentsData.comments);
	const [currentTimeline, setCurrentTimeline] = useState<ITimeline | null>(initialCommentsData.currentTimeline || null);

	return (
		<CommentsDataContext.Provider value={{
			comments,
			currentTimeline,
			setComments,
			setCurrentTimeline,
			setTimelines,
			timelines
		}}>
			{children}
		</CommentsDataContext.Provider>
	);
};

export default CommentsDataContextProvider;