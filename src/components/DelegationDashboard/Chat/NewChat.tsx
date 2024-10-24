// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Spin, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { IChat, IDelegateAddressDetails, NotificationStatus } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useUserDetailsSelector, useNetworkSelector } from '~src/redux/selectors';
import queueNotification from '~src/ui-components/QueueNotification';
import DelegateList from './DelegateList';
import EmptyState from './EmptyState';

interface Props {
	handleOpenChat: (chat: IChat) => void;
}

const NewChat = ({ handleOpenChat }: Props) => {
	const userProfile = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const { delegationDashboardAddress, loginAddress } = userProfile;

	const address = delegationDashboardAddress || loginAddress;

	const [loading, setLoading] = useState<boolean>(false);
	const [allDelegates, setAllDelegates] = useState<IDelegateAddressDetails[]>([]);
	const [searchedDelegates, setSearchedDelegates] = useState<IDelegateAddressDetails[]>([]);
	const [searchAddress, setSearchAddress] = useState<string>('');

	const handleDelegatesDataFetch = async () => {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<IDelegateAddressDetails[]>('api/v1/delegations/getAllDelegates', { address });
		if (data) {
			setAllDelegates(data);
			setSearchedDelegates(data);
			setLoading(false);
		} else if (error) {
			console.log(error);
			setLoading(false);
		}
	};

	const handleSearch = (searchTerm: string) => {
		setSearchAddress(searchTerm);
		if (searchTerm) {
			const filteredDelegates = allDelegates.filter(
				(delegate) => delegate.address.toLowerCase().includes(searchTerm.toLowerCase()) || (delegate.username && delegate.username.toLowerCase().includes(searchTerm.toLowerCase()))
			);
			setSearchedDelegates(filteredDelegates);
		} else {
			setSearchedDelegates(allDelegates);
		}
	};

	const handleStartChat = async (recipientAddr?: string) => {
		setLoading(true);
		const recipientAddress = recipientAddr ?? searchAddress.trim();

		if (!recipientAddress) {
			setLoading(false);
			return;
		}
		const requestData = {
			address,
			receiverAddress: recipientAddress,
			senderAddress: address
		};
		const { data, error } = await nextApiClientFetch<IChat>('api/v1/delegate-chat/start-chat', requestData);
		if (data) {
			setLoading(false);
			handleOpenChat(data);
		} else if (error) {
			console.log(error);
			queueNotification({
				header: 'Error!',
				message: error,
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		}
	};

	useEffect(() => {
		handleDelegatesDataFetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	return (
		<div className='flex h-full w-full flex-col'>
			<div className='p-5'>
				<Input
					type='search'
					value={searchAddress}
					onChange={(e) => handleSearch(e.target.value)}
					placeholder='Enter an address to send message'
				/>
			</div>
			<Spin
				spinning={loading}
				className='h-[250px]'
			>
				{!searchedDelegates?.length && !loading ? (
					<EmptyState
						searchAddress={searchAddress}
						network={network}
						address={address}
						onChatStart={handleStartChat}
						loading={loading}
					/>
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
