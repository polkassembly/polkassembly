// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';

import Comment, { IComment } from './Comment';
import CommentCard from './CommentsContainer/CommentCard';

interface ICommentsProps {
	className?: string;
	disableEdit?: boolean;
	comments: IComment[];
}
const handleUniqueReplies = (repliesArr: any[]) => {
	if (repliesArr.length < 2) return repliesArr;
	const uniqueReplies: Array<{ id: string }> = Object.values(
		repliesArr.reduce((acc: any, obj) => {
			acc[obj.id] = obj;
			return acc;
		}, {})
	);
	return uniqueReplies;
};

const Comments: FC<ICommentsProps> = (props) => {
	const { className, comments } = props;
	const uniqueComments: Array<IComment> = Object.values(
		comments.reduce((acc: any, obj) => {
			const repliesArr = handleUniqueReplies([...(obj?.replies || []), ...(acc?.[obj?.id]?.replies || [])]) || [];
			acc[obj.id] = { ...obj, replies: repliesArr };
			return acc;
		}, {})
	);

	return (
		<div className={className}>
			{uniqueComments.map((comment) => (
				<CommentCard
					disableEdit={props.disableEdit}
					comment={comment}
					key={comment.id}
				/>
			))}
		</div>
	);
};

export default Comments;
