// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import ForumReply from './ForumReply';
import formatAvatarUrl from '../utils/FormatAvatarUrl';
import ImageIcon from '~src/ui-components/ImageIcon';
import LikeButton from '../utils/ForumLikeButton';
import { useTranslation } from 'next-i18next';

const ForumReplies = ({ replies }: any) => {
	const [showReplies, setShowReplies] = useState<boolean>(true);
	const { t } = useTranslation('common');
	const toggleShowReplies = () => setShowReplies(!showReplies);

	return (
		<div className='comment-content my-3 sm:ml-[44px]'>
			{replies.length > 0 ? (
				!showReplies ? (
					<div
						className='flex cursor-pointer items-center border-none text-sm font-medium text-sidebarBlue dark:text-white sm:ml-5'
						onClick={toggleShowReplies}
					>
						{t('replies_count', { count: replies.length })} <DownOutlined className='ml-1' />
					</div>
				) : (
					<div
						className='mb-4 flex cursor-pointer items-center border-none text-sm font-medium text-sidebarBlue dark:text-white sm:ml-5'
						onClick={toggleShowReplies}
					>
						{t('hide_replies')} <UpOutlined className='ml-1' />
					</div>
				)
			) : null}
			<div className='flex flex-col items-start gap-6 sm:ml-6'>
				{showReplies &&
					replies.map((reply: any) => {
						return (
							<div key={reply.id}>
								<div className='flex gap-4'>
									<ImageIcon
										src={formatAvatarUrl(reply.avatar_template, '46')}
										alt={t('user_image_alt')}
										imgClassName='rounded-full'
									/>
									<div className='reply-user-container -mt-1 rounded-t-md dark:bg-[#141416]'>
										<ForumReply reply={reply} />
									</div>
								</div>
								{reply.reaction_users_count > 0 && (
									<div className='my-2 ml-[62px]'>
										<LikeButton like_count={reply.reaction_users_count} />
									</div>
								)}
							</div>
						);
					})}
			</div>
		</div>
	);
};

export default ForumReplies;
