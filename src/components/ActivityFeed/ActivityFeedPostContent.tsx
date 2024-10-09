// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import ImageIcon from '~src/ui-components/ImageIcon';
import Markdown from '~src/ui-components/Markdown';

const ActivityFeedPostContent: React.FC<{
	post: any;
	content: string;
	isCommentPost?: boolean;
}> = ({ post, content }: { post: any; content: string; isCommentPost?: boolean }) => {
	const trimmedContentForComment = content?.length > 200 ? content?.slice(0, 150) + '...' : content;
	return (
		<>
			<p className='xl:text-md pt-2 text-[15px] font-semibold text-[#243A57] dark:text-white'>
				#{post?.post_id} {post?.title || 'Untitled Post'}
			</p>
			<Markdown
				className='xl:text-md text-[14px] text-[#243A57]'
				md={trimmedContentForComment}
			/>
			<Link
				className='flex cursor-pointer gap-1 text-[12px] font-medium text-pink_primary hover:underline'
				href={`/referenda/${post?.post_id}`}
			>
				Read More{' '}
				<ImageIcon
					src='/assets/more.svg'
					alt=''
					className='-mt-0.5 h-4 w-4'
				/>
			</Link>
		</>
	);
};

export default ActivityFeedPostContent;
