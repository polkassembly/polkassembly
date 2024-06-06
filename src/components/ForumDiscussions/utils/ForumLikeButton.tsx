// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTheme } from 'next-themes';
import React from 'react';
import LikeOutlined from '~assets/icons/reactions/LikeOutlined.svg';
import LikeOutlinedDark from '~assets/icons/reactions/LikeOutlinedDark.svg';

const ForumLikeButton = ({ like_count, className }: { like_count: number; className?: string }) => {
	const { resolvedTheme: theme } = useTheme();
	return (
		<div className={className}>
			<span className='flex w-min cursor-not-allowed items-center gap-1 rounded-md bg-[#F4F6F8] px-2 py-[1.5px] hover:bg-[#ebecee] dark:bg-[#1F1F21] dark:hover:bg-[#313133]'>
				<span className='mt-1'>{theme == 'dark' ? <LikeOutlinedDark /> : <LikeOutlined />}</span>
				<span className='text-xs font-semibold text-lightBlue dark:text-icon-dark-inactive'>{like_count}</span>
			</span>
		</div>
	);
};

export default ForumLikeButton;
