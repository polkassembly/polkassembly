// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState } from 'react';
import CardPostHeading from '../Post/CardPostHeading';
import { Divider } from 'antd';
import Markdown from '~src/ui-components/Markdown';
// import ReferendumV2VoteInfo from '../Post/GovernanceSideBar/Referenda/ReferendumV2VoteInfo';
import { IVotesCount } from '~src/types';
import ReferendumV2CardInfo from '../Post/GovernanceSideBar/Referenda/ReferendumV2CardInfo';
import ImageIcon from '~src/ui-components/ImageIcon';
import { useRouter } from 'next/router';
interface ITinderCardsComponent {
	proposal: any;
}

const TinderCardsComponent: FC<ITinderCardsComponent> = (props) => {
	const { proposal } = props;
	const router = useRouter();
	const [ayeNayAbstainCounts, setAyeNayAbstainCounts] = useState<IVotesCount>({ abstain: 0, ayes: 0, nays: 0 });

	const sanitizeSummary = (md: string) => {
		const newMd = (md || '').trim();
		return newMd;
	};

	return (
		<section className='flex flex-col gap-y-4'>
			<div className='overflow-y-auto rounded-2xl bg-white p-4 px-4 py-6 shadow-md dark:border dark:border-solid dark:border-[#D2D8E0] dark:bg-transparent'>
				<CardPostHeading
					method={proposal?.method}
					motion_method={proposal?.motion_method}
					postArguments={proposal?.proposed_call?.args}
					className='mb-5'
					post={proposal}
				/>
				<Divider
					type='horizontal'
					className='border-l-1 border-[#D2D8E0] dark:border-icon-dark-inactive max-lg:hidden xs:mt-0.5 xs:inline-block'
				/>
				<div className='flex w-full justify-start'>
					<Markdown
						className='md text-sm font-normal leading-[26px] tracking-[0.14px] text-bodyBlue dark:text-blue-dark-high'
						md={sanitizeSummary(proposal?.summary || '')}
					/>
				</div>
				<p
					className='m-0 my-4 flex cursor-pointer justify-start p-0 text-xs text-pink_primary'
					onClick={() => {
						router.push(`/refernda/${proposal?.id}`);
					}}
				>
					Read Full Proposal
				</p>
				<div className='mx-auto flex max-h-[304px] flex-col gap-y-4 overflow-y-auto rounded-xl border border-solid border-[#D2D8E0] px-4 py-6'>
					<div className='flex items-center justify-between'>
						<h1 className='m-0 -mt-1 p-0 text-sm font-semibold text-sidebarBlue dark:text-white'>Users are saying...</h1>
						<p className='m-0 flex h-[24px] w-[124px] items-center justify-center rounded-[38px] bg-[#F6F6F6] p-0 text-[10px] text-lightBlue'>Based on comments</p>
					</div>
					<div className='flex items-start justify-center gap-x-4'>
						<ImageIcon
							src='/assets/icons/rounded-check-icon.svg'
							alt='check-icon'
						/>
						<div className='flex flex-col gap-y-2'>
							<p className='m-0 flex items-center justify-center p-0 text-xs text-bodyBlue dark:text-blue-dark-medium'>
								Ultricies ultricies interdum dolor sodales. Vitae feugiat vitae vitae quis id consectetur.{' '}
							</p>
							<div className='flex items-center justify-start gap-x-2'>
								<p className='m-0 flex h-[26px] items-center justify-center rounded-md bg-[#ECFCF3] p-0 px-2 py-1 text-[10px] text-[#1FA25B]'>tag 1</p>
								<p className='m-0 flex h-[26px] items-center justify-center rounded-md bg-[#ECFCF3] p-0 px-2 py-1 text-[10px] text-[#1FA25B]'>tag 1</p>
								<p className='m-0 flex h-[26px] items-center justify-center rounded-md bg-[#ECFCF3] p-0 px-2 py-1 text-[10px] text-[#1FA25B]'>tag 1</p>
							</div>
						</div>
					</div>
					<div className='flex items-start justify-center gap-x-4'>
						<ImageIcon
							src='/assets/icons/red-minus-icon.svg'
							alt='check-icon'
						/>
						<div className='flex flex-col gap-y-2'>
							<p className='m-0 flex items-center justify-center p-0 text-xs text-bodyBlue dark:text-blue-dark-medium'>
								Ultricies ultricies interdum dolor sodales. Vitae feugiat vitae vitae quis id consectetur.{' '}
							</p>
							<div className='flex items-center justify-start gap-x-2'>
								<p className='m-0 flex h-[26px] items-center justify-center rounded-md bg-[#FFF4E7] p-0 px-2 py-1 text-[10px] text-[#ED6A0F]'>tag 1</p>
								<p className='m-0 flex h-[26px] items-center justify-center rounded-md bg-[#FFF4E7] p-0 px-2 py-1 text-[10px] text-[#ED6A0F]'>tag 1</p>
								<p className='m-0 flex h-[26px] items-center justify-center rounded-md bg-[#FFF4E7] p-0 px-2 py-1 text-[10px] text-[#ED6A0F]'>tag 1</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className='h-full rounded-2xl bg-white p-4 shadow-md dark:border dark:border-solid dark:border-[#D2D8E0] dark:bg-transparent'>
				<ReferendumV2CardInfo
					ayeNayAbstainCounts={ayeNayAbstainCounts}
					setAyeNayAbstainCounts={setAyeNayAbstainCounts}
					tally={proposal?.tally}
					post={proposal}
				/>
			</div>
		</section>
	);
};

export default TinderCardsComponent;
