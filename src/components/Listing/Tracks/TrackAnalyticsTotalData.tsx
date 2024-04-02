// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider } from 'antd';
import React from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';

const TrackAnalyticsTotalData = () => {
	return (
		<div className='mr-2.5 mt-2 flex items-center justify-between'>
			{/* Proposal Created */}
			<div className='flex items-center space-x-2'>
				<ImageIcon
					src='/assets/icons/analytics/proposal-created.svg'
					alt='proposal created icon'
					className=''
				/>
				<div className='flex flex-col'>
					<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>Proposal Created</span>
					<span className='text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>198K</span>
					<div className='flex items-center space-x-1'>
						<ImageIcon
							src='/assets/icons/analytics/green-arrow-top.svg'
							alt='proposal created icon'
							imgClassName='-mt-1'
						/>
						<span className='text-xs font-bold text-[#00AC4F]'>37.8%</span>
						<span className='text-xs font-normal text-[#485F7DB2] dark:text-blue-dark-medium'>this month</span>
					</div>
				</div>
			</div>

			<Divider
				className='h-[87px] bg-[#D2D8E0] dark:bg-separatorDark'
				type='vertical'
			/>

			{/* Total Voting Power */}
			<div className='flex items-center space-x-2'>
				<ImageIcon
					src='/assets/icons/analytics/voting-power.svg'
					alt='proposal created icon'
					className=''
				/>
				<div className='flex flex-col'>
					<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>Total Voting Power</span>
					<span className='text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>89</span>
					<div className='flex items-center space-x-1'>
						<ImageIcon
							src='/assets/icons/analytics/green-arrow-top.svg'
							alt='proposal created icon'
							imgClassName='-mt-1'
						/>
						<span className='text-xs font-bold text-[#00AC4F]'>11%</span>
						<span className='text-xs font-normal text-[#485F7DB2] dark:text-blue-dark-medium'>this week</span>
					</div>
				</div>
			</div>

			<Divider
				className='h-[87px] bg-[#D2D8E0] dark:bg-separatorDark'
				type='vertical'
			/>

			{/* Discussions Created */}
			<div className='flex items-center space-x-2'>
				<ImageIcon
					src='/assets/icons/analytics/discussions-created.svg'
					alt='proposal created icon'
					className=''
				/>
				<div className='flex flex-col'>
					<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>Discussions Created</span>
					<span className='text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>89</span>
					<div className='flex items-center space-x-1'>
						<ImageIcon
							src='/assets/icons/analytics/green-arrow-top.svg'
							alt='proposal created icon'
							imgClassName='-mt-1'
						/>
						<span className='text-xs font-bold text-[#00AC4F]'>11%</span>
						<span className='text-xs font-normal text-[#485F7DB2] dark:text-blue-dark-medium'>this week</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TrackAnalyticsTotalData;
