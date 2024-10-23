// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import ImageIcon from '~src/ui-components/ImageIcon';
import Markdown from '~src/ui-components/Markdown';
import { useTranslation } from 'react-i18next';

const ActivityFeedPostContent: React.FC<{
	post: any;
	content: string;
	isCommentPost?: boolean;
}> = ({ post, content }: { post: any; content: string; isCommentPost?: boolean }) => {
	const { t } = useTranslation();
	const trimmedContentForComment = content?.length > 250 ? content?.slice(0, 200) + '...' : content;
	const startsWithBulletPoint = trimmedContentForComment.trim().startsWith('•') || trimmedContentForComment.trim().startsWith('-');
	return (
		<>
			<p className='xl:text-md pt-2 text-[15px] font-semibold text-[#243A57] dark:text-white'>
				#{post?.post_id} {post?.title || t('untitled_post')}
			</p>
			<Markdown
				className={`xl:text-md text-[14px] text-[#243A57] ${startsWithBulletPoint ? '-ml-8' : ''}`}
				md={trimmedContentForComment}
			/>
			<Link
				className='-mt-[10px] flex cursor-pointer gap-1 pb-[10px] text-[12px] font-medium text-pink_primary hover:underline'
				href={`/referenda/${post?.post_id}`}
			>
				{t('read_more')}
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
