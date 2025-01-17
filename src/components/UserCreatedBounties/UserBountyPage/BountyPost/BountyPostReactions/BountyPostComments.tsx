// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Popover } from 'antd';
import Image from 'next/image';
import { useUserDetailsSelector } from '~src/redux/selectors';
import BountyCommentsContainer from './BountyCommentsContainer';
import { IComment } from '~src/components/Post/Comment/Comment';
import { useTheme } from 'next-themes';

const BountyPostComments = ({ comments }: { comments: { [index: string]: IComment[] } }) => {
	const { id } = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();

	if (!id) {
		<div className='flex cursor-not-allowed items-center gap-1 rounded-md bg-[#F4F6F8] p-[8.5px] text-xs hover:bg-[#ebecee] dark:bg-[#1F1F21]'>
			<Image
				src={'/assets/bounty-icons/bounty-post-comment-icon.svg'}
				alt='Comments'
				width={16}
				height={16}
				className={`${theme === 'dark' ? 'dark-icons' : ''}`}
			/>
			<span className='text-xs font-medium text-blue-light-medium dark:text-blue-dark-medium'>2</span>
		</div>;
	}

	const content = (
		<BountyCommentsContainer
			id={id}
			className=''
			comments={comments}
		/>
	);
	const totalComments = Object.values(comments).reduce((acc, commentArray) => acc + commentArray.length, 0);

	return (
		<div>
			<Popover
				content={content}
				// title='Comments'
				trigger='click'
			>
				<div className='dark:dark-icons flex cursor-pointer items-center gap-1 rounded-md bg-[#F4F6F8] p-[8.5px] text-xs hover:bg-[#ebecee] dark:bg-[#1F1F21]'>
					<Image
						src={'/assets/bounty-icons/bounty-post-comment-icon.svg'}
						alt='Comments'
						width={16}
						height={16}
						className={`${theme === 'dark' ? 'dark-icons' : ''}`}
					/>
					<span className='text-xs font-medium text-blue-light-medium dark:text-blue-dark-medium'>{totalComments}</span>
				</div>
			</Popover>
		</div>
	);
};

export default BountyPostComments;
