// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import Reply from './Reply';
import { IComment } from './Comment';
import { poppins } from 'pages/_app';

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
			{repliesArr.length > 0 && (
				<div
					className={`${poppins.variable} ${poppins.className} flex cursor-pointer items-center border-none text-xs font-medium text-[#6D7F97] dark:text-[#9E9E9ECC]`}
					onClick={toggleShowReplies}
				>
					<div className='mr-2 h-[0.7px] w-[18px] bg-[#6D7F97] dark:bg-[#9E9E9ECC]'></div>
					{showReplies ? 'Hide replies' : `View Replies(${repliesArr.length})`}
				</div>
			)}

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
