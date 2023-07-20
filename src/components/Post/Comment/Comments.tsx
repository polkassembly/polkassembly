// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from 'dayjs-init';
import React, { FC } from 'react';

import Comment, { IComment } from './Comment';

interface ICommentsProps {
  className?: string;
  disableEdit?: boolean;
  comments: IComment[];
}

const Comments: FC<ICommentsProps> = (props) => {
	const { className, comments } = props;
	return (
		<div className={className}>
			{comments
				.sort((a, b) => dayjs(a.created_at).diff(dayjs(b.created_at)))
				.map((comment) => (
					<Comment
						disableEdit={props.disableEdit}
						comment={comment}
						key={comment.id}
					/>
				))}
		</div>
	);
};

export default Comments;
