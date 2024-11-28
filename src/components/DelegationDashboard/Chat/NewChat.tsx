// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Spin, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { IDelegateAddressDetails } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import { useNetworkSelector } from '~src/redux/selectors';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import DelegateList from './DelegateList';
import EmptyState from './feedbacks/EmptyState';
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
			//putting polkassembly Delegate first;
			const updatedDelegates = data || [];

			updatedDelegates.sort((a: any, b: any) => {
				const addressess = [getSubstrateAddress('13mZThJSNdKUyVUjQE9ZCypwJrwdvY8G5cUCpS9Uw4bodh4t')];
				const aIndex = addressess.indexOf(getSubstrateAddress(a.address));
				const bIndex = addressess.indexOf(getSubstrateAddress(b.address));

				if (aIndex !== -1 && bIndex !== -1) {
					return aIndex - bIndex;
				}

				if (aIndex !== -1) return -1;
				if (bIndex !== -1) return 1;
				return 0;
			});

			setAllDelegates(updatedDelegates);
			setLoading(false);
		} else if (error) {
			console.log(error);
			setLoading(false);
		}
	};

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
				<Input
					type='search'
					value={searchAddress}
					onChange={(e) => {
						if (!e.target.value?.length) {
							setSearchedDelegates([]);
						}
						setSearchAddress(e.target.value.trim());
						handleSearch(e.target.value.trim());
					}}
					ref={(input) => input?.focus()}
					placeholder='Enter an address to send message'
					className=' border-1 h-8 w-full rounded-[6px] rounded-s-md border-section-light-container bg-white focus:border-pink_primary dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
				/>
			</div>
			<Spin
				spinning={loading}
				className='h-[250px]'
			>
				{!searchedDelegates?.length && !loading ? (
					<EmptyState />
				) : (
					<DelegateList
						delegates={searchedDelegates}
						onStartChat={handleStartChat}
					/>
				)}
			</Spin>
		</div>
	);
};
export default NewChat;
