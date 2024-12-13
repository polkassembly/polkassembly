// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Image from 'next/image';

interface ISidebarCardProps {
	post?: any;
}

const SidebarCard: FC<ISidebarCardProps> = (props) => {
	const { post } = props;
	console.log(post);

	return (
		<GovSidebarCard className='mx-1 flex min-h-[200px] flex-col gap-y-4 '>
			<div className='flex gap-1.5 dark:text-white'>
				<span className='text-xl font-semibold text-bodyBlue dark:text-white'>Details</span>
			</div>
			<div className='flex h-[46px] items-center justify-start gap-x-2 rounded-[10px] border border-solid border-[#D2D8E0] px-3 py-2 dark:border-separatorDark'>
				<Image
					src='/assets/icons/timer-clock.png'
					alt='timer'
					width={14}
					height={14}
				/>
				<p className='m-0 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium'>Deadline: </p>
				<span className={'m-0 flex items-center gap-x-1 p-0 font-medium text-bodyBlue dark:text-white'}>
					<ClockCircleOutlined />
					{dayjs(new Date(post?.deadline_date)).format('DD MMM YYYY')}
				</span>
			</div>
			<div className='flex items-start justify-start gap-x-2 rounded-[10px] border border-solid border-[#D2D8E0] px-3 py-3 dark:border-separatorDark'>
				<p className='m-0 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium'>Submission Guidelines: </p>
				<span className={'m-0 flex items-center gap-x-1 p-0 font-medium text-bodyBlue dark:text-white'}>{post?.submission_guidelines}</span>
			</div>
			<div className='flex h-[46px] items-center justify-start gap-x-2 rounded-[10px] border border-solid border-[#D2D8E0] px-3 py-2 dark:border-separatorDark'>
				<p className='m-0 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium'>Social: </p>
				<span className={'m-0 flex items-center gap-x-1 p-0 font-medium text-bodyBlue dark:text-white'}>
					<Image
						src='/assets/icons/twitter-rounded-black.png'
						alt='timer'
						width={24}
						height={24}
					/>{' '}
					{post?.twitter_handle}
				</span>
			</div>
			<div className='flex h-[46px] items-center justify-start gap-x-2 rounded-[10px] border border-solid border-[#D2D8E0] px-3 py-2 dark:border-separatorDark'>
				<p className='m-0 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium'>Claimed: </p>
				<span className={'m-0 flex items-center gap-x-1 p-0 font-medium text-bodyBlue dark:text-white'}>{post?.maxClaim}</span>
			</div>
			<div className='flex h-[46px] items-center justify-start gap-x-2 rounded-[10px] border border-solid border-[#D2D8E0] px-3 py-2 dark:border-separatorDark'>
				<p className='m-0 p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium'>Max no of claims: </p>
				<span className={'m-0 flex items-center gap-x-1 p-0 font-medium text-bodyBlue dark:text-white'}>{post?.max_claim}</span>
			</div>
		</GovSidebarCard>
	);
};

export default SidebarCard;
