// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';
import { StarFilled } from '@ant-design/icons';
import { useProgressReportSelector } from '~src/redux/selectors';

const RatingSuccessModal = () => {
	const { report_rating } = useProgressReportSelector();

	return (
		<section className='h-[200px] p-6'>
			<ImageIcon
				src='/assets/icons/success-icon.svg'
				alt='success-icon'
				imgWrapperClassName='mx-auto relative -top-[152px] left-[150px]'
			/>
			<div className='-mt-[136px] flex flex-col items-center justify-center gap-y-4'>
				<h1 className='m-0 p-0 text-xl font-semibold text-bodyBlue dark:text-white'>Rated successfully </h1>
				<div className='flex justify-center gap-x-1'>
					{Array.from({ length: report_rating }).map((_, index) => (
						<StarFilled
							key={index}
							className='text-[40px] text-[#FFBF60]'
						/>
					))}{' '}
				</div>
			</div>
		</section>
	);
};

export default RatingSuccessModal;
