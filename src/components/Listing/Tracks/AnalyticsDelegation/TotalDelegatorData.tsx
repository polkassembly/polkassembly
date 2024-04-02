// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { IDelegatorsAndDelegatees } from '~src/types';

interface IProps {
	delegatorsData: IDelegatorsAndDelegatees;
}

const TotalDelegatorData = ({ delegatorsData }: IProps) => {
	const data = delegatorsData.delegatorsData?.data || [];

	return (
		<section className=''>
			<div className='flex w-full rounded-2xl border border-solid border-section-light-container bg-[#F7F7F9] px-5 py-3 text-sm font-medium text-blue-light-medium dark:text-blue-dark-medium'>
				<div className='w-[35%]'>Address</div>
				<div className='w-[35%]'>Target</div>
				<div className='w-[15%]'>Capital</div>
				<div className='w-[15%]'>Voting Power</div>
			</div>
			<div>
				{data.map((item, index) => (
					<div
						key={index}
						className='flex border-0 border-b border-l border-r border-solid border-section-light-container px-5 py-3 text-sm font-medium text-blue-light-high dark:text-blue-dark-high'
					>
						<div className='w-[35%]'>{item.from}</div>
						<div className='w-[35%]'>{item.to}</div>
						<div className='w-[15%] text-xs font-normal text-blue-light-high dark:text-blue-dark-high'>{(parseInt(item.capital) / 10 ** 12).toFixed(3)} KSM</div>
						<div className='w-[15%]'>{item.votingPower}</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default TotalDelegatorData;
