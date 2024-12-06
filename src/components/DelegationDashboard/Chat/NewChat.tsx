// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Spin, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { IDelegateAddressDetails } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import { useNetworkSelector } from '~src/redux/selectors';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import DelegateCard from './DelegateCard';
import { chatsActions } from '~src/redux/chats';
import { useDispatch } from 'react-redux';

interface Props {
	setIsNewChat: (isNewChat: boolean) => void;
}

const NewChat = ({ setIsNewChat }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const dispatch = useDispatch();

	const [loading, setLoading] = useState<boolean>(false);
	const [allDelegates, setAllDelegates] = useState<IDelegateAddressDetails[]>([]);
	const [searchedDelegates, setSearchedDelegates] = useState<IDelegateAddressDetails[]>([]);
	const [searchAddress, setSearchAddress] = useState<string>('');

	const handleDelegatesDataFetch = async () => {
		if (!(api && peopleChainApiReady) || !network) return;
		setLoading(true);

		const { data, error } = await nextApiClientFetch<IDelegateAddressDetails[]>('api/v1/delegations/getAllDelegates');
		if (data) {
			const updatedDelegates = data || [];

			setAllDelegates(updatedDelegates);
			setSearchedDelegates(updatedDelegates);
			setLoading(false);
		} else if (error) {
			console.log(error);
			setLoading(false);
		}
	};

	const input = document.querySelector('.ant-select-selection-search-input') as HTMLInputElement;
	if (input && !loading) {
		input.focus();
	}

	const handleSearch = (searchAddress: string) => {
		if (!searchAddress.length) {
			setSearchedDelegates([]);
			return;
		}

		const filteredDelegates = allDelegates.filter((delegate) => {
			const searchTerm = searchAddress.toLowerCase();
			const encodedAddress = delegate.address.toLowerCase();
			const substrateAddress = getSubstrateAddress(delegate.address);

			return encodedAddress.includes(searchTerm) || substrateAddress?.includes(searchAddress) || delegate.username?.toLowerCase().includes(searchTerm);
		});
		setSearchedDelegates(filteredDelegates);
	};

	const handleStartChat = (recipientAddr?: string) => {
		const recipientAddress = recipientAddr ?? searchAddress.trim();
		if (!recipientAddress) return;

		dispatch(chatsActions.setTempRecipient(recipientAddress));
		dispatch(chatsActions.setOpenChat({ chat: null, isOpen: true }));
		setIsNewChat(false);
	};

	useEffect(() => {
		handleDelegatesDataFetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, peopleChainApi, peopleChainApiReady, apiReady, network]);

	return (
		<div className='flex h-full w-full flex-col'>
			<div className='p-5'>
				<Select
					showSearch
					autoClearSearchValue={true}
					loading={loading}
					defaultValue={loading ? 'Loading...' : 'Enter or select a delegate address'}
					defaultOpen={false}
					open={!loading}
					onChange={(value) => {
						setSearchAddress(value);
						handleStartChat(value);
					}}
					onSearch={(value) => {
						if (!value?.length) {
							setSearchedDelegates(allDelegates);
						} else {
							setSearchAddress(value.trim());
							handleSearch(value.trim());
						}
					}}
					notFoundContent={
						loading ? (
							<Spin
								size='small'
								className='flex h-8 items-center justify-center p-5'
							/>
						) : (
							<p className='mb-0 px-3 py-2 text-base text-blue-light-medium dark:text-[#b4afaf]'>No results found</p>
						)
					}
					filterOption={false}
					className='h-9 w-full rounded-[6px] rounded-s-md border-section-light-container bg-white dark:border-separatorDark dark:bg-transparent [&_.ant-select-selection-search-input]:placeholder:text-[#485F7D] [&_.ant-select-selection-search-input]:focus:border-pink_primary [&_.ant-select-selection-search-input]:dark:text-blue-dark-high [&_.ant-select-selection-search-input]:dark:focus:border-[#91054F]'
					autoFocus={true}
					dropdownAlign={{ points: ['tl', 'bl'] }}
					popupClassName='dark:bg-section-dark-overlay shadow-lg border dark:shadow-white/10'
				>
					{searchedDelegates.map((delegate) => (
						<Select.Option
							key={delegate.address}
							value={delegate.address}
							className='p-0 dark:bg-section-dark-overlay'
						>
							<DelegateCard
								delegate={delegate}
								onStartChat={handleStartChat}
							/>
						</Select.Option>
					))}
				</Select>
				{loading ? (
					<Spin
						size='large'
						className='flex h-full items-center justify-center p-5'
					/>
				) : null}
			</div>
		</div>
	);
};
export default NewChat;
