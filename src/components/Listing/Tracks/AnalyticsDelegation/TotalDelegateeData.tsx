// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTheme } from 'next-themes';
import React, { useState } from 'react';
import { IDelegatorsAndDelegatees } from '~src/types';
import { Pagination } from '~src/ui-components/Pagination';
import DropdownGreyIcon from '~assets/icons/dropdown-grey.svg';

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
	const { resolvedTheme: theme } = useTheme();
	const [currentPage, setCurrentPage] = useState<number>(1);
	const itemsPerPage = 10;
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;

	return (
		<section className=''>
			<div className='flex w-full rounded-2xl border border-solid border-section-light-container bg-[#F7F7F9] px-5 py-3 text-sm font-medium text-blue-light-medium dark:border-[#5A5A5A] dark:bg-[#222222] dark:text-blue-dark-medium '>
				<div className='w-[45%]'>Address</div>
				<div className='w-[17%]'>Count</div>
				<div className='w-[17%]'>Capital</div>
				<div className='w-[19%]'>Votes</div>
			</div>
			<div>
				{allDelegateeData.slice(startIndex, endIndex).map((item, index) => (
					<div
						key={index}
						className='flex border-0 border-b border-l border-r border-solid border-section-light-container px-5 py-3 text-sm font-medium text-blue-light-high dark:border-[#5A5A5A] dark:bg-[#17181a] dark:text-blue-dark-high'
					>
						<div className='w-[45%]'>{item.from.slice(0, 16)}....</div>
						<div className='w-[17%]'>{item.count}</div>
						<div className='w-[17%] text-xs font-normal text-blue-light-high dark:text-blue-dark-high'>{item.capital}</div>
						<div className='w-[19%]'>{item.votingPower}</div>
						<div className='w-[2%] self-end'>
							<DropdownGreyIcon />
						</div>
					</div>
				))}
			</div>
			<div className='mt-6 flex justify-end'>
				<Pagination
					theme={theme}
					size='large'
					defaultCurrent={1}
					current={currentPage}
					onChange={(page: number) => {
						setCurrentPage(page);
					}}
					total={allDelegateeData.length}
					showSizeChanger={false}
					pageSize={itemsPerPage}
					responsive={true}
					hideOnSinglePage={true}
				/>
			</div>
		</section>
	);
};

export default TotalDelegateeData;
