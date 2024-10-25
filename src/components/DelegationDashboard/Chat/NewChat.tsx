// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Spin, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { IChat, IDelegateAddressDetails, NotificationStatus } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import { useUserDetailsSelector, useNetworkSelector } from '~src/redux/selectors';
import queueNotification from '~src/ui-components/QueueNotification';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import DelegateList from './DelegateList';
import EmptyState from './EmptyState';

interface Props {
	handleOpenChat: (chat: IChat) => void;
}

const NewChat = ({ handleOpenChat }: Props) => {
	const userProfile = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const { delegationDashboardAddress, loginAddress } = userProfile;
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();

	const address = delegationDashboardAddress || loginAddress;

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
			setSearchedDelegates(updatedDelegates);
			setLoading(false);
		} else if (error) {
			console.log(error);
			setLoading(false);
		}
	};

	const handleSearch = () => {
		if (!searchAddress.length) {
			setSearchedDelegates(allDelegates);
			return;
		}

		const filteredDelegates = allDelegates.filter(
			(delegate) => delegate.address.toLowerCase().match(searchAddress.toLowerCase()) || (delegate.username && delegate.username.toLowerCase().match(searchAddress.toLowerCase()))
		);
		setSearchedDelegates(filteredDelegates);
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
	}, [api, peopleChainApi, peopleChainApiReady, apiReady, network]);

	return (
		<div className='flex h-full w-full flex-col'>
			<div className='p-5'>
				<Input
					type='search'
					value={searchAddress}
					onChange={(e) => {
						if (!e.target.value?.length) {
							setSearchedDelegates(allDelegates || []);
						}
						setSearchAddress(e.target.value.trim());
					}}
					onPressEnter={handleSearch}
					placeholder='Enter an address to send message'
					className=' border-1 h-8 w-full rounded-[6px] rounded-s-md border-section-light-container bg-white dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
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
