// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';
import { ClockCircleOutlined } from '@ant-design/icons';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import { IUserCreatedBounty } from '~src/types';
import dynamic from 'next/dynamic';

const ClaimedAmountPieGraph = dynamic(() => import('~src/components/Bounties/utils/ClaimedAmountPieGraph'), { ssr: false });

const DetailRow = ({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) => (
	<div className={`flex items-center gap-1 rounded-[10px] border border-solid border-[#D2D8E0B2] p-3 dark:border-separatorDark ${className}`}>
		<span className='text-sm font-medium tracking-wide text-blue-light-medium dark:text-blue-dark-medium'>{label}:</span>
		<div className='ml-1 flex items-center gap-1 text-[13px] text-blue-light-high dark:text-blue-dark-high'>{children}</div>
	</div>
);

const BountyDetails = ({ post }: { post: IUserCreatedBounty }) => {
	const { deadline_date, max_claim, twitter_handle, submission_guidelines, claimed_percentage } = post;
	const date = new Date(deadline_date);

	return (
		<section className='my-6 w-full rounded-xxl bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay md:p-4 lg:w-[30%] lg:p-6'>
			<span className='text-xl font-semibold tracking-wide text-blue-light-high dark:text-blue-dark-high'>Details</span>
			<div className='mt-3 flex flex-col gap-3'>
				{/* Deadline Row */}
				<DetailRow label='Deadline'>
					{deadline_date && (
						<div className='ml-1 items-center text-xs font-normal text-blue-light-high dark:text-blue-dark-high'>
							<ClockCircleOutlined className='mr-1' />
							{getRelativeCreatedAt(date)}
						</div>
					)}
				</DetailRow>

				{/* Submission Guidelines Row */}
				<DetailRow label='Submission Guidelines'>{submission_guidelines}</DetailRow>

				{/* Social Row */}
				{twitter_handle && (
					<DetailRow label='Social'>
						<ImageIcon
							alt='twitter'
							src='/assets/icons/user-bounties/twitter-icon.svg'
							imgClassName='ml-1 -mt-[1.5px]'
						/>
						<a
							href={`https://twitter.com/${twitter_handle}`}
							target='_blank'
							rel='noopener noreferrer'
							className='text-sm text-blue-light-high hover:underline dark:text-blue-dark-high'
						>
							{twitter_handle}
						</a>
					</DetailRow>
				)}

				{/* Claimed/Unclaimed Row */}
				<div className='flex justify-between gap-1 rounded-[10px] border border-solid border-[#D2D8E0B2] p-3 dark:border-separatorDark'>
					<div className='flex items-center gap-1'>
						<span className='mr-1 text-sm font-medium tracking-wide text-blue-light-medium dark:text-blue-dark-medium'>Claimed:</span>
						<ClaimedAmountPieGraph
							percentageClaimed={claimed_percentage}
							isUsedInBountyDetails={true}
						/>
						<span className='ml-[2px] text-[13px] text-blue-light-high dark:text-blue-dark-high'>{claimed_percentage}%</span>
					</div>
					<span className='rounded-lg bg-[#FF3C5F] px-[6px] py-1 text-xs tracking-wide text-white'>Unclaimed: $1</span>
				</div>

				{/* Max Claims Row */}
				<DetailRow label='Max no. of claims'>{max_claim}</DetailRow>
			</div>
		</section>
	);
};

export default BountyDetails;
