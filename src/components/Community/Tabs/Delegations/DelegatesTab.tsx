// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState } from 'react';
import { IDelegateAddressDetails } from '~src/types';
import { Pagination } from '~src/ui-components/Pagination';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import Image from 'next/image';
import { useApiContext } from '~src/context';
import { useTheme } from 'next-themes';
import { DelegateDelegationIcon } from '~src/ui-components/CustomIcons';
import getEncodedAddress from '~src/util/getEncodedAddress';
import DelegateModal from '~src/components/Listing/Tracks/DelegateModal';
import DelegateCardInfo from './DelegateCardInfo';

const DELEGATION_LISTING = 10;

interface IDelegatesTab {
	currentPage: number;
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
	filteredDelegates: IDelegateAddressDetails[];
	loading: boolean;
	delegatesData: React.MutableRefObject<IDelegateAddressDetails[]>;
}

const DelegatesTab: FC<IDelegatesTab> = (props) => {
	const { currentPage, setCurrentPage, filteredDelegates, loading, delegatesData } = props;
	const { network } = useNetworkSelector();
	const { delegationDashboardAddress } = useUserDetailsSelector();
	const { api, apiReady } = useApiContext();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [searchInput, setSearchInput] = useState<string>('');
	const { resolvedTheme } = useTheme();
	const [open, setOpen] = useState<boolean>(false);

	return (
		<div className='min-h-[250px]'>
			{!filteredDelegates?.length && !loading ? (
				//empty state
				<div className='mt-14 flex flex-col items-center justify-center gap-4'>
					<DelegateDelegationIcon className='text-[200px]' />
					<div className='flex items-center gap-1'>
						<span className='text-lightBlue dark:text-blue-dark-high '>No results found</span>
						{searchInput?.length > 10 && !!getEncodedAddress(searchInput, network) && !!delegationDashboardAddress?.length && (
							<span className='flex gap-1 text-lightBlue dark:text-blue-dark-high'>
								<div
									className={`flex cursor-pointer items-center gap-1 border-none text-pink_primary ${!api || (!apiReady && 'opacity-50')}`}
									onClick={() => {
										setOpen(true);
									}}
								>
									<Image
										src={'assets/icons/delegate-profile.svg'}
										width={16}
										height={16}
										alt=''
									/>
									<span>Delegate</span>
								</div>
								to this address
							</span>
						)}
					</div>
				</div>
			) : (
				<>
					<div className='mt-3 grid grid-cols-2 items-end gap-6 max-lg:grid-cols-1 sm:mt-6'>
						{filteredDelegates?.slice((currentPage - 1) * DELEGATION_LISTING, (currentPage - 1) * DELEGATION_LISTING + DELEGATION_LISTING)?.map((delegate, index) => (
							<DelegateCardInfo
								key={index}
								delegate={delegate}
								disabled={!delegationDashboardAddress}
							/>
						))}
					</div>
					{delegatesData?.current?.length > DELEGATION_LISTING && (
						<div className='mt-6 flex justify-end'>
							<Pagination
								theme={resolvedTheme as any}
								size='large'
								defaultCurrent={1}
								current={currentPage}
								onChange={(page: number) => {
									setCurrentPage(page);
								}}
								total={filteredDelegates?.length}
								showSizeChanger={false}
								pageSize={DELEGATION_LISTING}
								responsive={true}
								hideOnSinglePage={true}
							/>
						</div>
					)}
				</>
			)}
			<DelegateModal
				defaultTarget={searchInput}
				open={open}
				setOpen={setOpen}
			/>
		</div>
	);
};

export default DelegatesTab;
