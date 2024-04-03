// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTheme } from 'next-themes';
import React, { useState } from 'react';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { useNetworkSelector } from '~src/redux/selectors';
import { IDelegatorsAndDelegatees } from '~src/types';
import { Pagination } from '~src/ui-components/Pagination';

interface IProps {
	delegatorsData: IDelegatorsAndDelegatees;
}

const TotalDelegatorData = ({ delegatorsData }: IProps) => {
	const { network } = useNetworkSelector();
	const allDelegatorData = Object.values(delegatorsData).flatMap((delegator) => delegator.data || []);
	const { resolvedTheme: theme } = useTheme();
	const [currentPage, setCurrentPage] = useState<number>(1);
	const itemsPerPage = 10;
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;

	return (
		<section className=''>
			<div className='flex w-full rounded-2xl border border-solid border-section-light-container bg-[#F7F7F9] px-5 py-3 text-sm font-medium text-blue-light-medium  dark:border-[#5A5A5A] dark:bg-[#222222] dark:text-blue-dark-medium '>
				<div className='w-[35%]'>Address</div>
				<div className='w-[35%]'>Target</div>
				<div className='w-[15%]'>Capital</div>
				<div className='w-[15%]'>Votes</div>
			</div>
			<div>
				{allDelegatorData.slice(startIndex, endIndex).map((item, index) => (
					<div
						key={index}
						className='flex border-0 border-b border-l border-r border-solid border-section-light-container px-5 py-3 text-sm font-medium text-blue-light-high dark:border-[#5A5A5A] dark:bg-[#17181a] dark:text-blue-dark-high'
					>
						<div className='w-[35%]'>{item.from.slice(0, 16)}....</div>
						<div className='w-[35%] '>{item.to.slice(0, 16)}....</div>
						<div className='w-[15%] text-xs font-normal text-blue-light-high dark:text-blue-dark-high'>{parseBalance(item.capital, 2, true, network)}</div>
						<div className='w-[15%] text-xs font-normal text-blue-light-high dark:text-blue-dark-high'>{parseBalance(item.votingPower, 2, true, network)}</div>
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
					total={allDelegatorData.length}
					showSizeChanger={false}
					pageSize={itemsPerPage}
					responsive={true}
					hideOnSinglePage={true}
				/>
			</div>
		</section>
	);
};

export default TotalDelegatorData;
