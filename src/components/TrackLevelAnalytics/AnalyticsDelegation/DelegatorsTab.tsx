// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTheme } from 'next-themes';
import React, { useState } from 'react';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { useNetworkSelector, useTrackLevelAnalytics } from '~src/redux/selectors';
import Address from '~src/ui-components/Address';
import { Pagination } from '~src/ui-components/Pagination';

const DelegatorsTab = () => {
	const { delegatorsData } = useTrackLevelAnalytics();
	const { network } = useNetworkSelector();
	const allDelegatorData = Object.values(delegatorsData).flatMap((delegator) => delegator.data || []);
	const { resolvedTheme: theme } = useTheme();
	const [currentPage, setCurrentPage] = useState<number>(1);
	const itemsPerPage = 10;
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;

	return (
		<section className=''>
			<div className='flex h-[56px] w-full  items-center rounded-2xl border border-solid border-section-light-container bg-[#F7F7F9] px-1 py-3 text-xs font-medium text-blue-light-medium dark:border-[#5A5A5A] dark:bg-[#222222]  dark:text-blue-dark-medium min-[450px]:text-sm sm:px-5 '>
				<div className='w-[32%] min-[450px]:w-[35%]'>Address</div>
				<div className='w-[32%] min-[450px]:w-[35%]'>Target</div>
				<div className='w-[17%] min-[450px]:w-[15%]'>Capital</div>
				<div className='w-[17%] min-[450px]:w-[15%]'>Votes</div>
			</div>
			<div>
				{allDelegatorData.slice(startIndex, endIndex).map((item, index) => (
					<div
						key={index}
						className='flex items-center justify-between border-0 border-b border-l border-r border-solid border-section-light-container px-1 py-3 text-sm font-medium text-blue-light-high dark:border-[#5A5A5A] dark:bg-[#17181a] dark:text-blue-dark-high sm:px-5'
					>
						<div className='w-[32%] min-[450px]:w-[35%]'>
							<Address
								address={item.from}
								isTruncateUsername={false}
								displayInline
								destroyTooltipOnHide={true}
								className='mt-1 hidden sm:inline-flex'
							/>
							<Address
								address={item.from}
								usernameMaxLength={3}
								isTruncateUsername={true}
								displayInline
								destroyTooltipOnHide={true}
								className='text-xs sm:hidden'
							/>
						</div>
						<div className='w-[32%] min-[450px]:w-[35%]'>
							<Address
								address={item.to}
								isTruncateUsername={false}
								displayInline
								destroyTooltipOnHide={true}
								className='mt-1 hidden sm:inline-flex'
							/>
							<Address
								address={item.to}
								isTruncateUsername={false}
								usernameMaxLength={3}
								displayInline
								destroyTooltipOnHide={true}
								className='text-xs sm:hidden'
							/>
						</div>
						<div className='my-[3px] w-[17%] text-xs font-normal text-blue-light-high dark:text-blue-dark-high min-[450px]:w-[15%]'>
							{parseBalance(item.capital, 2, true, network)}
						</div>
						<div className='my-[3px] w-[17%] text-xs font-normal text-blue-light-high dark:text-blue-dark-high min-[450px]:w-[15%]'>
							{parseBalance(item.votingPower, 2, true, network)}
						</div>
					</div>
				))}
			</div>
			<div className='mt-6 flex justify-end'>
				<Pagination
					theme={theme}
					size='small'
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

export default DelegatorsTab;
