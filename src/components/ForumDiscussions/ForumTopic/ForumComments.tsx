// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import ForumReplies from './ForumReplies';
import Markdown from '~src/ui-components/Markdown';
import { useTheme } from 'next-themes';
import formatAvatarUrl from '../utils/FormatAvatarUrl';
import ImageIcon from '~src/ui-components/ImageIcon';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import ForumLikeButton from '../utils/ForumLikeButton';

const ForumComments = ({ comments }: any) => {
	const { resolvedTheme: theme } = useTheme();
	return (
		<div className='mt-6 flex flex-col items-start gap-6 sm:ml-[140px] sm:pr-6'>
			{comments.map((comment: any) => {
				const date = new Date(comment.updated_at);
				return (
					<div key={comment.id}>
						<div className='flex gap-4'>
							<ImageIcon
								src={formatAvatarUrl(comment.avatar_template, '46')}
								alt='user image'
								imgClassName='rounded-full'
							/>
							<div className=' mt-0 rounded-t-md bg-comment_bg px-2 py-2 pt-4 dark:bg-[#141416] md:px-4'>
								<div className='flex items-center gap-[6px]'>
									<span className='text-xs font-semibold text-blue-light-high dark:text-blue-dark-high'>{comment.username}</span>
									{comment.created_at && (
										<>
											<div className='my-auto h-[2px] w-[2px] rounded-full bg-blue-light-medium dark:to-blue-dark-medium'></div>
											<div className='hidden text-[10px] text-blue-light-medium dark:text-blue-dark-medium sm:flex'>{getRelativeCreatedAt(date)}</div>
										</>
									)}
								</div>
								{comment.cooked && (
									<Markdown
										className='mt-[5px] text-sm'
										md={comment.cooked}
										theme={theme}
										disableQuote={true}
									/>
								)}
							</div>
						</div>
						{comment.reaction_users_count > 0 && (
							<div className='my-2 ml-16'>
								<ForumLikeButton like_count={comment.reaction_users_count} />
							</div>
						)}
						{comment.replies.length > 0 && <ForumReplies replies={comment.replies} />}
					</div>
				);
			})}
		</div>
	);
};

export default ForumComments;
