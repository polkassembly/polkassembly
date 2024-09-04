// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { RightOutlined } from '@ant-design/icons';
import ImageIcon from '~src/ui-components/ImageIcon';
import { useTheme } from 'next-themes';
import DefaultOptions from './DefaultOptions/DefaultOptions';
import { useBatchVotesSelector } from '~src/redux/selectors';
import VotingOptions from './VotingOptions/VotingOptions';

const BatchVotingWeb = () => {
	const { resolvedTheme: theme } = useTheme();
	const { is_default_selected } = useBatchVotesSelector();

	return (
		<section className='flex flex-col gap-y-8'>
			<header className='flex items-center justify-start gap-x-2'>
				<ImageIcon
					src={theme === 'dark' ? '/assets/icons/star-icon-white.svg' : '/assets/icons/star-icon.svg'}
					alt='batch-voting'
				/>
				<h1 className='m-0 p-0 text-[28px] text-bodyBlue dark:text-white'>Batch Voting</h1>
			</header>
			<article className='flex h-[64px] w-full items-center justify-start gap-x-3  rounded-xl bg-white px-6 dark:bg-black'>
				<div className='flex items-center justify-start gap-x-2'>
					{is_default_selected ? (
						<span className={'flex h-[20px] w-[20px] items-center justify-center rounded-full bg-pink_primary text-sm text-white'}>1</span>
					) : (
						<ImageIcon
							src='/assets/icons/green-tick.svg'
							alt='tick'
						/>
					)}
					<p className={`m-0 p-0 text-base ${is_default_selected ? 'font-semibold text-pink_primary' : 'font-semibold text-[#2ED47A]'} `}>Set Deafaults</p>
				</div>
				<RightOutlined className={`${is_default_selected ? 'text-lightBlue dark:text-lightGreyTextColor' : 'text-[#2ED47A]'}`} />
				<div className='flex items-center justify-start gap-x-2'>
					<span
						className={`flex h-[20px] w-[20px] items-center justify-center rounded-full ${
							!is_default_selected ? 'bg-pink_primary' : 'bg-lightBlue dark:bg-lightGreyTextColor'
						} text-sm text-white`}
					>
						2
					</span>
					<p className={`m-0 p-0 text-base ${!is_default_selected ? 'font-semibold text-pink_primary' : 'font-normal text-lightBlue dark:text-lightGreyTextColor'} `}>Vote</p>
				</div>
			</article>

			{is_default_selected ? <DefaultOptions /> : <VotingOptions />}
		</section>
	);
};

export default BatchVotingWeb;
