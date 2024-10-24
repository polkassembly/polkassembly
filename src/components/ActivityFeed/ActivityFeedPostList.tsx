// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import ActivityFeedPostItem from './ActivityFeedPostItem';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface IPostListProps {
	postData: any;
}

const ActivityFeedPostList: React.FC<IPostListProps> = ({ postData }) => {
	const { t } = useTranslation('common');

	return (
		<div className='hide-scrollbar space-y-5 lg:max-h-[1078px] lg:overflow-y-auto'>
			{postData?.length === 0 ? (
				<div
					className={'flex h-[900px] flex-col  items-center rounded-xl border border-solid border-[#D2D8E0] bg-white px-5 pt-5 dark:border-[#4B4B4B] dark:bg-[#0D0D0D] md:pt-10'}
				>
					<Image
						src='/assets/Gifs/login-like.gif'
						alt={t('empty_state_alt')}
						className='h-80 w-80 p-0'
						width={320}
						height={320}
					/>
					<p className='p-0 text-xl font-medium text-[#243A57] dark:text-white'>{t('youre_all_caught_up')}</p>
					<p
						className='p-0 text-center text-[#243A57] dark:text-white'
						style={{ lineHeight: '1.8' }}
					>
						{t('explore_other_categories')}
					</p>
				</div>
			) : (
				postData?.map((post: any, index: number) => (
					<ActivityFeedPostItem
						key={index}
						post={post}
					/>
				))
			)}
		</div>
	);
};

export default ActivityFeedPostList;
