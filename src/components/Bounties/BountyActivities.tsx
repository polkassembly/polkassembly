// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Image from 'next/image';
import { spaceGrotesk } from 'pages/_app';

const BountyActivities = () => {
	const activities = [
		{ amount: '$50', name: 'Marsha Fisher', time: '2 days ago' },
		{ amount: '$50', name: 'Marsha Fisher', time: '2 days ago' },
		{ amount: '$50', name: 'Marsha Fisher', time: '2 days ago' },
		{ amount: '$50', name: 'Marsha Fisher', time: '2 days ago' },
		{ amount: '$50', name: 'Marsha Fisher', time: '2 days ago' },
		{ amount: '$50', name: 'Marsha Fisher', time: '2 days ago' },
		{ amount: '$50', name: 'Marsha Fisher', time: '2 days ago' }
	];

	return (
		<div className='mt-1 flex h-[400px] w-full flex-col gap-[18px]'>
			{activities.map((activity, index) => (
				<div
					key={index}
					className={` ${spaceGrotesk.className} ${spaceGrotesk.variable} flex items-center gap-x-1 rounded-[14px] border border-solid border-section-light-container bg-white px-3 py-2 dark:border-section-dark-container dark:bg-section-dark-overlay`}
				>
					<Image
						src={'/assets/icons/user-profile.png'}
						width={16}
						height={16}
						className='-mt-[2px]'
						alt='user image'
					/>
					<span className='inline-block text-[15px] font-semibold text-blue-light-high dark:text-blue-dark-high'>{activity.name}</span>
					<span className='text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium'>claimed</span>
					<span className='text-[20px] font-normal text-pink_primary'>{activity.amount}</span>
					<span className='text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium'>bounty</span>
					<div className='mx-2 h-[5px] w-[5px] rounded-full bg-[#485F7DB2] dark:bg-[#909090B2]'></div>
					<span className='rounded-full text-xs text-[#485F7DB2] dark:text-blue-dark-medium'>{activity.time}</span>
				</div>
			))}
		</div>
	);
};

export default BountyActivities;
