// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';

const TotalDelegationData = () => {
	return (
		<div className='mt-[30px] flex flex-wrap gap-6 rounded-xxl bg-white p-5 drop-shadow-md dark:bg-section-dark-overlay md:p-6'>
			{/* Total Supply */}
			<div className='flex space-x-3 border-2 border-[#D2D8E0]'>
				<ImageIcon
					src='/assets/delegation-tracks/polkadot-delegation.svg'
					alt='polkadot delegation icon'
				/>
				<div className='flex flex-col'>
					<span className='text-xs text-blue-light-medium dark:text-blue-dark-high'>Total Supply</span>
					<span className='text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>
						14M<span className='ml-[3px] text-sm font-medium text-blue-light-medium'>DOT</span>
					</span>
				</div>
			</div>
			<Divider
				type='vertical'
				className='h-[44px]'
			/>

			{/* Delegated tokens */}
			<div className='flex space-x-3'>
				<ImageIcon
					src='/assets/delegation-tracks/delegate-tokens.svg'
					alt='delegate tokens icon'
				/>
				<div className='flex flex-col '>
					<span className='text-xs text-blue-light-medium dark:text-blue-dark-high'>Delegated Tokens</span>
					<span className='text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>
						679.6K<span className='ml-[3px] text-sm font-medium text-blue-light-medium'>DOT</span>
					</span>
				</div>
			</div>
			<Divider
				type='vertical'
				className='h-[44px]'
			/>

			{/* Total Delegated Votes */}
			<div className='flex space-x-3'>
				<ImageIcon
					src='/assets/delegation-tracks/total-delegated-tokens.svg'
					alt='Total delegate tokens icon'
				/>
				<div className='flex flex-col '>
					<span className='text-xs text-blue-light-medium dark:text-blue-dark-high'>Total Delegated Tokens</span>
					<div className='flex space-x-2'>
						<span className='text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>
							123.6K<span className='ml-[3px] text-sm font-medium text-blue-light-medium'>DOT</span>
						</span>
						<span
							style={{ border: '1px solid #485F7D99' }}
							className='my-[3px] flex items-center rounded-md bg-[#f6f7f8] px-[6px] text-xs font-medium text-blue-light-medium'
						>
							7d
						</span>
					</div>
				</div>
			</div>
			<Divider
				type='vertical'
				className='h-[44px]'
			/>

			{/* Total Delegates */}
			<div className='flex space-x-3'>
				<ImageIcon
					src='/assets/delegation-tracks/total-delegates.svg'
					alt='Total delegate icon'
				/>
				<div className='flex flex-col'>
					<span className='text-xs text-blue-light-medium dark:text-blue-dark-high'>Total Delegates</span>
					<span className='text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>108</span>
				</div>
			</div>
			<Divider
				type='vertical'
				className='h-[44px]'
			/>

			{/* Total Delegatees */}
			<div className='flex space-x-3'>
				<ImageIcon
					src='/assets/delegation-tracks/total-delegatees.svg'
					alt='Total delegatees icon'
				/>
				<div className='flex flex-col'>
					<span className='text-xs text-blue-light-medium dark:text-blue-dark-high'>Total Delegatees</span>
					<span className='text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>21,203</span>
				</div>
			</div>
		</div>
	);
};

export default TotalDelegationData;
