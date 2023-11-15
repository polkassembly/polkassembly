// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DownOutlined, UpOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

import Reply from './Reply';
import { IComment } from './Comment';

interface Props {
	className?: string;
	repliesArr: any[];
	commentId: string;
	isSubsquareUser: boolean;
	isReactionOnReply: boolean;
	comment: IComment;
}

const Replies = ({ className, commentId, repliesArr, isSubsquareUser, isReactionOnReply, comment }: Props) => {
	const [showReplies, setShowReplies] = useState<boolean>(true);
	const toggleShowReplies = () => setShowReplies(!showReplies);
	return (
		<div className={className}>
			{repliesArr.length > 0 ? (
				!showReplies ? (
					<div
						className='flex cursor-pointer items-center border-none text-sm font-medium text-sidebarBlue dark:text-white'
						onClick={toggleShowReplies}
					>
						{repliesArr.length} replies <DownOutlined className='ml-1' />
					</div>
				) : (
					<div
						className='flex cursor-pointer items-center border-none text-sm font-medium text-sidebarBlue dark:text-white'
						onClick={toggleShowReplies}
					>
						Hide replies <UpOutlined className='ml-1' />
					</div>
				)
			) : null}
			{showReplies &&
				repliesArr.map((reply: any) => {
					return (
						<div key={reply.id}>
							<Reply
								reply={reply}
								key={reply.id}
								commentId={commentId}
								userName={reply.username}
								comment={comment}
								isSubsquareUser={isSubsquareUser}
								isReactionOnReply={isReactionOnReply}
							/>
						</div>
					);
				})}
		</div>
	);
};

export default Replies;
