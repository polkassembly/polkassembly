// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect } from 'react';
import { RightOutlined } from '@ant-design/icons';
import ImageIcon from '~src/ui-components/ImageIcon';
import { useTheme } from 'next-themes';
import { useBatchVotesSelector, useUserDetailsSelector } from '~src/redux/selectors';
import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';
import { batchVotesActions } from '~src/redux/batchVoting';
import { useAppDispatch } from '~src/redux/store';
const DefaultOptions = dynamic(() => import('./DefaultOptions/DefaultOptions'), {
	loading: () => <Skeleton active />,
	ssr: false
});
const VotingOptions = dynamic(() => import('./VotingOptions/VotingOptions'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const BatchVotingWeb = () => {
	const { resolvedTheme: theme } = useTheme();
	const dispatch = useAppDispatch();
	const { is_default_selected } = useBatchVotesSelector();
	const { loginAddress } = useUserDetailsSelector();

	useEffect(() => {
		dispatch(batchVotesActions.setBatchVotingAddress(loginAddress));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginAddress]);

	return (
		<section className='flex flex-col gap-y-6'>
			<header className='mt-4 flex items-center justify-start gap-x-2'>
				<ImageIcon
					src={theme === 'dark' ? '/assets/icons/star-icon-white.svg' : '/assets/icons/star-icon.svg'}
					alt='batch-voting'
					imgWrapperClassName='-mt-3'
				/>
				<h1 className='flex text-2xl font-semibold leading-9 text-bodyBlue dark:text-blue-dark-high'>Batch Voting</h1>
			</header>
			<article className='flex h-[64px] w-full items-center justify-start gap-x-3  rounded-xl bg-white px-6 dark:bg-black'>
				<div
					className='flex cursor-pointer items-center justify-start gap-x-2'
					onClick={() => {
						dispatch(batchVotesActions.setIsDefaultSelected(true));
					}}
				>
					{is_default_selected ? (
						<span className={'flex h-[20px] w-[20px] items-center justify-center rounded-full bg-pink_primary text-sm text-white'}>1</span>
					) : (
						<ImageIcon
							src='/assets/icons/green-tick.svg'
							alt='tick'
						/>
					)}
					<p className={`m-0 p-0 text-base ${is_default_selected ? 'font-semibold text-pink_primary' : 'font-semibold text-[#2ED47A]'} `}>Set Defaults</p>
				</div>
				<RightOutlined className={`${is_default_selected ? 'text-lightBlue dark:text-lightGreyTextColor' : 'text-[#2ED47A]'}`} />
				<div
					className='flex cursor-pointer items-center justify-start gap-x-2'
					onClick={() => {
						dispatch(batchVotesActions.setIsDefaultSelected(false));
					}}
				>
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
