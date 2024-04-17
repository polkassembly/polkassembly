// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTheme } from 'next-themes';
import React, { useState } from 'react';
import { Pagination } from '~src/ui-components/Pagination';
import DropdownGreyIcon from '~assets/icons/dropdown-grey.svg';
import { useNetworkSelector, useTrackLevelAnalytics } from '~src/redux/selectors';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import DelegateesModal from './DelegateesModal';
import Address from '~src/ui-components/Address';
import { LISTING_LIMIT } from '~src/global/listingLimit';

const DelegateesTab = () => {
	const { delegateesData } = useTrackLevelAnalytics();
	const { network } = useNetworkSelector();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const delegateeData = Object.entries(delegateesData).map(([key, value]) => {
		const sumCapital = value.data.reduce((acc, curr) => acc + BigInt(curr.capital), BigInt(0));
		const sumVotingPower = value.data.reduce((acc, curr) => acc + BigInt(curr.votingPower), BigInt(0));
		return {
			capital: sumCapital.toString(),
			count: value.count,
			from: key,
			votingPower: sumVotingPower.toString()
		};
	});
	const { resolvedTheme: theme } = useTheme();
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [open, setOpen] = useState<boolean>(false);
	const [index, setIndex] = useState<string>('');
	const startIndex = (currentPage - 1) * LISTING_LIMIT;
	const endIndex = startIndex + LISTING_LIMIT;

	return (
		<>
			<section className=''>
				<div className='flex w-full rounded-2xl border border-solid border-section-light-container bg-[#F7F7F9] px-5 py-3 text-sm font-medium text-blue-light-medium dark:border-[#5A5A5A] dark:bg-[#222222] dark:text-blue-dark-medium '>
					<div className='w-[45%]'>Address</div>
					<div className='w-[17%]'>Count</div>
					<div className='w-[17%]'>Capital</div>
					<div className='w-[19%]'>Votes</div>
				</div>
				<div>
					{delegateeData.slice(startIndex, endIndex).map((item, index) => {
						return (
							<div
								key={index}
								className='flex border-0 border-b border-l border-r border-solid border-section-light-container px-5 py-3 text-sm font-medium text-blue-light-high dark:border-[#5A5A5A] dark:bg-[#17181a] dark:text-blue-dark-high'
							>
								<div className='my-[3px] w-[45%]'>
									{' '}
									<Address
										address={item.from}
										displayInline
										isTruncateUsername={false}
									/>
								</div>
								<div className='mt-[3px] w-[17%] text-xs font-normal text-blue-light-high dark:text-blue-dark-high'>{item.count}</div>
								<div className='mt-[3px] w-[17%] text-xs font-normal text-blue-light-high dark:text-blue-dark-high'>{parseBalance(item.capital, 2, true, network)}</div>
								<div className='mt-[3px] w-[19%] text-xs font-normal text-blue-light-high dark:text-blue-dark-high'>{parseBalance(item.votingPower, 2, true, network)}</div>
								<div
									onClick={() => {
										setIndex(item.from);
										setOpen(true);
									}}
									className='w-[2%] cursor-pointer'
								>
									<DropdownGreyIcon />
								</div>
							</div>
						);
					})}
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
						total={delegateeData.length}
						showSizeChanger={false}
						pageSize={LISTING_LIMIT}
						responsive={true}
						hideOnSinglePage={true}
					/>
				</div>
			</section>
			<DelegateesModal
				open={open}
				setOpen={setOpen}
				delegateesData={delegateesData}
				index={index}
			/>
		</>
	);
};

export default DelegateesTab;
