// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Spin } from 'antd';
import React, { useEffect } from 'react';
import { EChatFilter, EChatTab, IChat, IChatsResponse } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useUserDetailsSelector, useChatsSelector } from '~src/redux/selectors';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { useDispatch } from 'react-redux';
import { chatsActions } from '~src/redux/chats';
import RenderChats from './RenderChats';
import ChatFilter from './ChatFilter';
import MessageDrawer from './MessageDrawer';
import ChatTab from './ChatTab';

interface Props {
	className?: string;
	isNewChat: boolean;
	setIsNewChat: (isNewChat: boolean) => void;
	handleNewChat: () => void;
}

const UserChats = ({ className, isNewChat, setIsNewChat, handleNewChat }: Props) => {
	const userProfile = useUserDetailsSelector();
	const { delegationDashboardAddress, loginAddress } = userProfile;
	const dispatch = useDispatch();

	const address = delegationDashboardAddress || loginAddress;
	const substrateAddress = getSubstrateAddress(address);

	const { messages, requests, filteredMessages, filteredRequests, selectedChatTab, loading, isChatOpen, openedChat } = useChatsSelector();

	const handleChatToggle = (chat?: IChat | null) => {
		if (chat) {
			if (!chat.chatId) {
				console.error('Invalid chat');
				return;
			}
			setIsNewChat(false);
			dispatch(chatsActions.setOpenChat({ chat, isOpen: true }));
			dispatch(chatsActions.setTempRecipient(null));
		} else {
			dispatch(chatsActions.setOpenChat({ chat: null, isOpen: false }));
			setIsNewChat(false);
			dispatch(chatsActions.setTempRecipient(null));
		}
	};

	const handleDataFetch = async () => {
		dispatch(chatsActions.setLoading(true));
		const { data, error } = await nextApiClientFetch<IChatsResponse>('api/v1/delegate-chat/getDelegateChats', { address });
		if (data) {
			dispatch(
				chatsActions.setChats({
					messages: data.messages,
					requests: data.requests
				})
			);
		} else if (error) {
			console.log(error);
			dispatch(chatsActions.setError(error));
		}
		dispatch(chatsActions.setLoading(false));
	};

	const handleSearch = (searchText: string) => {
		const lowercasedText = searchText.toLowerCase();
		if (selectedChatTab === 'messages') {
			const filtered = messages.filter((chat: IChat) =>
				chat.latestMessage?.receiverAddress === substrateAddress
					? chat.latestMessage?.senderAddress.toLowerCase().includes(lowercasedText)
					: chat?.latestMessage?.receiverAddress.toLowerCase().includes(lowercasedText)
			);
			dispatch(chatsActions.setFilteredMessages(filtered));
		} else {
			const filtered = requests.filter((chat: IChat) =>
				chat.latestMessage?.receiverAddress === substrateAddress
					? chat.latestMessage?.senderAddress.toLowerCase().includes(lowercasedText)
					: chat?.latestMessage?.receiverAddress.toLowerCase().includes(lowercasedText)
			);
			dispatch(chatsActions.setFilteredRequests(filtered));
		}
	};

	const handleFilterChange = (filterType: EChatFilter) => {
		const filterFunction = (chat: IChat) => {
			if (filterType === 'all') return true;
			if (filterType === 'read') return chat.latestMessage?.viewed_by?.includes(String(substrateAddress));
			return !chat.latestMessage?.viewed_by?.includes(String(substrateAddress));
		};

		if (selectedChatTab === EChatTab.MESSAGES) {
			dispatch(chatsActions.setFilteredMessages(messages.filter(filterFunction)));
		} else {
			dispatch(chatsActions.setFilteredRequests(requests.filter(filterFunction)));
		}
	};

	useEffect(() => {
		handleDataFetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	return (
		<>
			<div className={`${className} h-full w-full overflow-y-scroll pb-5`}>
				<ChatFilter
					onSearch={handleSearch}
					onFilterChange={handleFilterChange}
					selectedChatTab={selectedChatTab}
				/>
				<div className='flex flex-col gap-2 px-5 pb-4 pt-3'>
					<ChatTab
						selectedChatTab={selectedChatTab}
						messagesCount={filteredMessages?.length || 0}
						requestsCount={filteredRequests?.length || 0}
					/>
				</div>
				<Spin
					spinning={loading}
					className='h-[250px]'
				>
					<RenderChats
						handleOpenChat={handleChatToggle}
						handleNewChat={handleNewChat}
						chats={selectedChatTab === 'messages' ? filteredMessages : filteredRequests}
					/>
				</Spin>
			</div>

			<MessageDrawer
				openedChat={openedChat}
				setIsNewChat={setIsNewChat}
				isNewChat={isNewChat}
				isDrawerOpen={isNewChat || isChatOpen}
				handleChatToggle={handleChatToggle}
			/>
		</>
	);
};

export default UserChats;
