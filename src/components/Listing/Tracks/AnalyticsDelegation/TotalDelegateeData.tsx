// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { IDelegatorsAndDelegatees } from '~src/types';

interface IProps {
	delegateesData: IDelegatorsAndDelegatees;
}

const TotalDelegateeData = ({ delegateesData }: IProps) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const allDelegateeData = Object.entries(delegateesData).flatMap(([_, delegatee]) => {
		return (
			delegatee.data?.map((item) => ({
				...item,
				count: delegatee.count
			})) || []
		);
	});

	return (
		<section className=''>
			<div className='flex w-full rounded-2xl border border-solid border-section-light-container bg-[#F7F7F9] px-5 py-3 text-sm font-medium text-blue-light-medium dark:border-[#5A5A5A] dark:bg-[#222222] dark:text-blue-dark-medium '>
				<div className='w-[50%]'>Address</div>
				<div className='w-[16%]'>Count</div>
				<div className='w-[16%]'>Capital</div>
				<div className='w-[18%]'>Votes</div>
			</div>
			<div>
				{allDelegateeData.map((item, index) => (
					<div
						key={index}
						className='flex border-0 border-b border-l border-r border-solid border-section-light-container px-5 py-3 text-sm font-medium text-blue-light-high dark:border-[#5A5A5A] dark:bg-[#17181a] dark:text-blue-dark-high'
					>
						<div className='w-[50%]'>{item.from}</div>
						<div className='w-[16%]'>{item.count}</div>
						<div className='w-[16%] text-xs font-normal text-blue-light-high dark:text-blue-dark-high'>{item.capital} KSM</div>
						<div className='w-[18%]'>{item.votingPower}</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default TotalDelegateeData;
