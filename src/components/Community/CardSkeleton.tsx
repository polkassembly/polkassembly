// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';

const CardSkeleton = () => {
	return (
		<div
			className={`flex w-full flex-col gap-y-2 rounded-[16px] border-[1px] border-solid border-section-light-container bg-white px-5 pt-4 hover:border-pink_primary dark:border-[#3B444F]
        dark:border-separatorDark dark:bg-black sm:w-auto`}
		>
			<div className='mt-1 flex w-full items-center justify-between'>
				<div className='flex items-center gap-2 max-lg:justify-start'>
					<div className='h-8 w-8 rounded-full bg-[#D2D8E0] dark:bg-icon-dark-inactive'></div>
					<div className='h-6 w-[200px] rounded-lg bg-[#D2D8E0] dark:bg-icon-dark-inactive'></div>
				</div>
			</div>
			<div className='h-6 rounded-lg bg-[#D2D8E0] dark:bg-icon-dark-inactive  '></div>
			<div className='h-6 rounded-lg bg-[#D2D8E0] dark:bg-icon-dark-inactive'></div>
			<div className='h-[60px] rounded-lg bg-[#D2D8E0] dark:bg-icon-dark-inactive'></div>
			<div className='mb-5 mr-2 flex items-center gap-2'>
				<div className='h-8 w-8 rounded-full bg-[#D2D8E0] dark:bg-icon-dark-inactive'></div>
				<div className='h-8 w-8 rounded-full bg-[#D2D8E0] dark:bg-icon-dark-inactive'></div>
				<div className='h-8 w-8 rounded-full bg-[#D2D8E0] dark:bg-icon-dark-inactive'></div>
				<div className='h-8 w-8 rounded-full bg-[#D2D8E0] dark:bg-icon-dark-inactive'></div>
			</div>
		</div>
	);
};

export default CardSkeleton;
