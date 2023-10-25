// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { createContext, FC, PropsWithChildren, useState } from 'react';
import { IComment } from '~src/components/Post/Comment/Comment';
import { ITimeline } from '~src/components/Post/Comment/CommentsContainer';
import { ESentiments } from '~src/types';

export interface ICommentsDataContextProviderProps extends PropsWithChildren {
	initialCommentsData: ICommentsData;
}
export interface ICommentsData {
	timelines: Array<ITimeline>;
	comments: { [index: string]: Array<IComment> };
	currentTimeline: ITimeline | null;
	overallSentiments: {
		[index: string]: number;
	};
}

export interface ICommentsDataContext {
	timelines: Array<ITimeline>;
	setTimelines: React.Dispatch<React.SetStateAction<ITimeline[]>>;
	comments: { [index: string]: Array<IComment> };
	setComments: React.Dispatch<
		React.SetStateAction<{
			[index: string]: IComment[];
		}>
	>;
	currentTimeline: ITimeline | null;
	setCurrentTimeline: React.Dispatch<React.SetStateAction<ITimeline | null>>;
	overallSentiments: {
		[index: string]: number;
	};
	setOverallSentiments: React.Dispatch<React.SetStateAction<{ [index: string]: number }>>;
}

export const CommentsDataContext: React.Context<ICommentsDataContext> = createContext({} as ICommentsDataContext);

const CommentsDataContextProvider: FC<ICommentsDataContextProviderProps> = (props) => {
	const { initialCommentsData, children } = props;
	const [timelines, setTimelines] = useState<ITimeline[]>(initialCommentsData.timelines);
	const [comments, setComments] = useState<{ [index: string]: Array<IComment> }>(initialCommentsData.comments);
	const [currentTimeline, setCurrentTimeline] = useState<ITimeline | null>(initialCommentsData.currentTimeline || null);
	const [overallSentiments, setOverallSentiments] = useState<{ [index: string]: number }>({
		[ESentiments.Against]: 0,
		[ESentiments.SlightlyAgainst]: 0,
		[ESentiments.Neutral]: 0,
		[ESentiments.SlightlyFor]: 0,
		[ESentiments.For]: 0
	});
	return (
		<CommentsDataContext.Provider
			value={{
				comments,
				currentTimeline,
				overallSentiments,
				setComments,
				setCurrentTimeline,
				setOverallSentiments,
				setTimelines,
				timelines
			}}
		>
			{children}
		</CommentsDataContext.Provider>
	);
};

export default CommentsDataContextProvider;
