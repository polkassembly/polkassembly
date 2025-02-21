// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useMemo, useState } from 'react';

import Comment, { IComment } from './Comment';
import { Divider } from 'antd';
import { DownArrowIcon } from '~src/ui-components/CustomIcons';
interface ICommentsProps {
	className?: string;
	disableEdit?: boolean;
	comments: IComment[];
	BountyPostIndex?: number;
	isUsedInBounty?: boolean;
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
	const { className, comments, BountyPostIndex, isUsedInBounty } = props;
	const [showSpam, setShowSpam] = useState(false);
	const uniqueComments: Array<IComment> = Object.values(
		comments.reduce((acc: any, obj) => {
			const repliesArr = handleUniqueReplies([...(obj?.replies || []), ...(acc?.[obj?.id]?.replies || [])]) || [];
			acc[obj.id] = { ...obj, replies: repliesArr };
			return acc;
		}, {})
	);

	const spamComments = useMemo(() => uniqueComments?.filter((comment) => !!comment?.spam_users_count), [uniqueComments]);
	const nonSpamComments = useMemo(() => uniqueComments?.filter((comment) => !comment.spam_users_count), [uniqueComments]);

	return (
		<div className={className}>
			{nonSpamComments.map((comment) => (
				<Comment
					disableEdit={props.disableEdit}
					comment={comment}
					key={comment.id}
					BountyPostIndex={BountyPostIndex}
					isUsedInBounty={isUsedInBounty}
				/>
			))}

			{!!spamComments.length && (
				<div className='mt-4'>
					<Divider
						className='my-4 bg-section-light-container dark:bg-separatorDark'
						type='horizontal'
					/>
					<div className='flex items-center justify-center'>
						<button
							className='cursor-pointer border-none bg-transparent p-0 text-sm font-medium text-pink_primary  dark:text-[#FF60B5]'
							onClick={() => setShowSpam(!showSpam)}
						>
							<div className='flex gap-1'>
								{showSpam ? 'Hide Likely Spam' : 'Show Likely Spam'}({spamComments.length})
								<DownArrowIcon className={`${showSpam ? 'rotate-180' : ''} text-xl`} />
							</div>
						</button>
					</div>
					{showSpam && (
						<div className='mt-4'>
							{spamComments.map((comment) => (
								<Comment
									disableEdit={props.disableEdit}
									comment={comment}
									key={comment.id}
									BountyPostIndex={BountyPostIndex}
									isUsedInBounty={isUsedInBounty}
								/>
							))}
						</div>
					)}
					<Divider
						className='my-4 bg-section-light-container dark:bg-separatorDark'
						type='horizontal'
					/>
				</div>
			)}
		</div>
	);
};

export default Comments;
