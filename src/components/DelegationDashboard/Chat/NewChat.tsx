// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { List, Spin, Card, Input, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { IChat, IDelegateAddressDetails, NotificationStatus } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useUserDetailsSelector, useNetworkSelector } from '~src/redux/selectors';
import Identicon from '@polkadot/react-identicon';
import EthIdenticon from '~src/ui-components/EthIdenticon';
import shortenAddress from '~src/util/shortenAddress';
import { DelegateDelegationIcon } from '~src/ui-components/CustomIcons';
import getEncodedAddress from '~src/util/getEncodedAddress';
import queueNotification from '~src/ui-components/QueueNotification';

interface Props {
	className?: string;
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
			queueNotification({
				header: 'Success!',
				message: 'Message sent successfully',
				status: NotificationStatus.SUCCESS
			});
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

	useEffect(() => {
		handleSearch(searchAddress);
	}, [searchAddress, allDelegates]);

	return (
		<div className='flex h-[calc(100%-300px)] w-full flex-col'>
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
					//empty state
					<div className='mt-14 flex flex-col items-center justify-center gap-4'>
						<DelegateDelegationIcon className='text-[200px]' />
						<div className='flex flex-col items-center gap-5'>
							<span className='text-lightBlue dark:text-blue-dark-high '>No results found</span>
							{searchAddress.length > 10 && !!getEncodedAddress(searchAddress, network) && !!address?.length && (
								<Button
									className={`flex h-10 w-full items-center justify-center space-x-2 border-none bg-[#485F7D99] text-sm font-medium tracking-wide text-white ${
										loading ? '' : 'opacity-60'
									}`}
									type='primary'
									onClick={() => handleStartChat()}
									disabled={loading}
								>
									<span className='text-white'>Chat with this address</span>
								</Button>
							)}
						</div>
					</div>
				) : (
					<List
						itemLayout='horizontal'
						dataSource={searchedDelegates}
						renderItem={(delegate) => (
							<List.Item
								key={delegate?.address}
								onClick={() => handleStartChat(delegate?.address)}
								className='cursor-pointer border-section-light-container p-0'
							>
								<Card
									key={delegate?.address}
									className='w-full rounded-none border-t-0'
									bodyStyle={{ alignItems: 'center', display: 'flex', gap: '0.5rem', width: '100%' }}
									size='small'
								>
									{delegate?.address && delegate?.address?.startsWith('0x') ? (
										<EthIdenticon
											size={32}
											address={delegate?.address || ''}
										/>
									) : (
										<Identicon
											value={delegate?.address || ''}
											size={32}
											theme={'polkadot'}
										/>
									)}

									<span className='text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'>
										{delegate?.username ? delegate?.username : shortenAddress(delegate?.address, 5)}
									</span>
								</Card>
							</List.Item>
						)}
					/>
				)}
			</Spin>
		</div>
	);
};
export default NewChat;
