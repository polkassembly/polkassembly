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
import { useTranslation } from 'next-i18next';

const DelegateesTab = () => {
	const { delegateesData } = useTrackLevelAnalytics();
	const { network } = useNetworkSelector();
	const { t } = useTranslation('common');

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
				<div className='flex h-[56px] w-full items-center rounded-2xl border border-solid border-section-light-container bg-[#F7F7F9] px-1 py-3 text-xs font-medium text-blue-light-medium dark:border-[#5A5A5A] dark:bg-[#222222] dark:text-blue-dark-medium min-[450px]:text-sm sm:px-5'>
					<div className='ml-1 w-[40%] min-[450px]:w-[45%] sm:ml-0'>{t('address')}</div>
					<div className='mr-2 w-[15%] min-[450px]:mr-0 min-[450px]:w-[17%]'>{t('count')}</div>
					<div className='mr-1 w-[17%] min-[450px]:mr-0'>{t('capital')}</div>
					<div className='w-[19%]'>{t('votes')}</div>
				</div>
				<div>
					{delegateeData.slice(startIndex, endIndex).map((item, index) => {
						return (
							<div
								key={index}
								className='flex items-center justify-between border-0 border-b border-l border-r border-solid border-section-light-container px-2 py-3 text-sm font-medium text-blue-light-high dark:border-[#5A5A5A] dark:bg-[#17181a] dark:text-blue-dark-high sm:px-5'
							>
								<div className='w-[42%] min-[450px]:w-[45%]'>
									{' '}
									<Address
										address={item.from}
										displayInline
										isTruncateUsername={false}
										className='mt-1 hidden sm:inline-flex'
										destroyTooltipOnHide={true}
									/>
									<Address
										address={item.from}
										usernameMaxLength={4}
										isTruncateUsername={true}
										destroyTooltipOnHide={true}
										displayInline
										className='text-xs sm:hidden'
									/>
								</div>
								<div className='w-[15%] text-xs font-normal text-blue-light-high dark:text-blue-dark-high min-[450px]:w-[17%]'>{item.count}</div>
								<div className='w-[17%] text-xs font-normal text-blue-light-high dark:text-blue-dark-high'>{parseBalance(item.capital, 1, true, network)}</div>
								<div className='w-[19%] text-xs font-normal text-blue-light-high dark:text-blue-dark-high'>{parseBalance(item.votingPower, 1, true, network)}</div>
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
						size='small'
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
