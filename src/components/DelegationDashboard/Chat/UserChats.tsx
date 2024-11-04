// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { EChatFilter, IChat, IChatsResponse } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useUserDetailsSelector } from '~src/redux/selectors';
import RenderChats from './RenderChats';
import ChatTab from './ChatTab';
import MessageDrawer from './MessageDrawer';
import ChatFilter from './ChatFilter';

interface Props {
	className?: string;
	isNewChat: boolean;
	setIsNewChat: (isNewChat: boolean) => void;
	handleNewChat: () => void;
}

const UserChats = ({ className, isNewChat, setIsNewChat, handleNewChat }: Props) => {
	const userProfile = useUserDetailsSelector();
	const { delegationDashboardAddress, loginAddress } = userProfile;
	const address = delegationDashboardAddress || loginAddress;

	const [loading, setLoading] = useState<boolean>(false);
	const [messages, setMessages] = useState<IChat[]>([]);
	const [requests, setRequests] = useState<IChat[]>([]);
	const [filteredMessages, setFilteredMessages] = useState<IChat[]>([]);
	const [filteredRequests, setFilteredRequests] = useState<IChat[]>([]);
	const [selectedChatTab, setSelectedChatTab] = useState<'messages' | 'requests'>('messages');
	const [openedChat, setOpenedChat] = useState<IChat | null>(null);
	const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

	const handleChatToggle = (chat?: IChat | null) => {
		if (chat) {
			if (!chat.chatId) {
				console.error('Invalid chat');
				return;
			}
			setIsNewChat(false);
			setIsChatOpen(true);
			setOpenedChat(chat);
		} else {
			setIsChatOpen(false);
			setIsNewChat(false);
			setOpenedChat(null);
		}
	};

	const handleDataFetch = async () => {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<IChatsResponse>('api/v1/delegate-chat/getDelegateChats', { address });
		if (data) {
			setMessages(data?.messages);
			setRequests(data?.requests);
			setFilteredMessages(data?.messages);
			setFilteredRequests(data?.requests);
			setLoading(false);
		} else if (error) {
			console.log(error);
			setLoading(false);
		}
	};

	const handleSearch = (searchText: string) => {
		const lowercasedText = searchText.toLowerCase();

		if (selectedChatTab === 'messages') {
			const filteredMessages = messages.filter((chat) =>
				chat.latestMessage?.receiverAddress === address
					? chat.latestMessage?.senderAddress.toLowerCase().includes(lowercasedText)
					: chat?.latestMessage?.receiverAddress.toLowerCase().includes(lowercasedText)
			);
			setFilteredMessages(filteredMessages);
		} else {
			const filteredRequests = requests.filter((chat) =>
				chat.latestMessage?.receiverAddress === address
					? chat.latestMessage?.senderAddress.toLowerCase().includes(lowercasedText)
					: chat?.latestMessage?.receiverAddress.toLowerCase().includes(lowercasedText)
			);
			setFilteredRequests(filteredRequests);
		}
	};

	const handleFilterChange = (filterType: EChatFilter) => {
		const filterFunction = (chat: IChat) => {
			if (filterType === 'all') return true;
			if (filterType === 'read') return chat.latestMessage?.viewed_by?.includes(address);
			return !chat.latestMessage?.viewed_by?.includes(address);
		};

		if (selectedChatTab === 'messages') {
			setFilteredMessages(messages.filter(filterFunction));
		} else {
			setFilteredRequests(requests.filter(filterFunction));
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
				<div className='flex flex-col gap-2 p-5 pt-3'>
					<ChatTab
						setSelectedChatTab={setSelectedChatTab}
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
						setFilteredMessages={setFilteredMessages}
						setFilteredRequests={setFilteredRequests}
						chats={selectedChatTab === 'messages' ? filteredMessages : filteredRequests}
					/>
				</Spin>
			</div>

			<MessageDrawer
				openedChat={openedChat}
				isNewChat={isNewChat}
				isDrawerOpen={isNewChat || isChatOpen}
				handleChatToggle={handleChatToggle}
			/>
		</>
	);
};

export default UserChats;
