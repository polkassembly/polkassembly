// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { RightOutlined } from '@ant-design/icons';
import ImageIcon from '~src/ui-components/ImageIcon';

const BatchVotingWeb = () => {
	const isDefaultSelected = true;

	return (
		<section className='flex flex-col gap-y-8'>
			<header className='flex items-center justify-start gap-x-2'>
				<ImageIcon
					src='/assets/icons/star-icon.svg'
					alt='batch-voting'
				/>
				<h1 className='m-0 p-0 text-[28px] text-bodyBlue dark:text-white'>Batch Voting</h1>
			</header>
			<article className='flex h-[64px] w-full items-center justify-start gap-x-3  rounded-xl bg-white px-6 dark:bg-black'>
				<div className='flex items-center justify-start gap-x-2'>
					<span
						className={`flex h-[20px] w-[20px] items-center justify-center rounded-full ${
							isDefaultSelected ? 'bg-pink_primary' : 'bg-lightBlue dark:bg-lightGreyTextColor'
						} text-sm text-white`}
					>
						1
					</span>
					<p className={`m-0 p-0 text-base ${isDefaultSelected ? 'font-semibold text-pink_primary' : 'font-normal text-lightBlue dark:text-lightGreyTextColor'} `}>Set Deafaults</p>
				</div>
				<RightOutlined className={`${isDefaultSelected ? 'text-lightBlue dark:text-lightGreyTextColor' : 'text-pink_primary'}`} />
				<div className='flex items-center justify-start gap-x-2'>
					<span
						className={`flex h-[20px] w-[20px] items-center justify-center rounded-full ${
							!isDefaultSelected ? 'bg-pink_primary' : 'bg-lightBlue dark:bg-lightGreyTextColor'
						} text-sm text-white`}
					>
						2
					</span>
					<p className={`m-0 p-0 text-base ${!isDefaultSelected ? 'font-semibold text-pink_primary' : 'font-normal text-lightBlue dark:text-lightGreyTextColor'} `}>Vote</p>
				</div>
			</article>
		</section>
	);
};

export default BatchVotingWeb;
