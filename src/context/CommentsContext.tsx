// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { createContext, useState } from 'react';
import { IComment } from '~src/components/Post/Comment/Comment';
import { usePostDataContext } from '~src/context';

export interface ICommentsContext {
    comments:{[index:string]:Array<IComment>},
	setComments:any;
}

export const CommentsContext = createContext({} as ICommentsContext);

export const CommentsContextProvider = ({ children }: React.PropsWithChildren<{}>) => {
	const { postData: { comments:initialComments } } = usePostDataContext();

	const [comments, setComments] = useState(initialComments);

	return (
		<CommentsContext.Provider value={{ ...comments, setComments }}>
			{children}
		</CommentsContext.Provider>
	);
};
