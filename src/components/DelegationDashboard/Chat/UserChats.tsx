// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { IChat, IChatsResponse } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useUserDetailsSelector } from '~src/redux/selectors';
import RenderChats from './RenderChats';
import ChatTab from './ChatTab';
import MessageDrawer from './MessageDrawer';

interface Props {
	className?: string;
	isNewChat: boolean;
	setIsNewChat: (isNewChat: boolean) => void;
}

const UserChats = ({ className, isNewChat, setIsNewChat }: Props) => {
	const userProfile = useUserDetailsSelector();
	const { delegationDashboardAddress, loginAddress } = userProfile;

	const address = delegationDashboardAddress || loginAddress;

	const [loading, setLoading] = useState<boolean>(false);
	const [sentChats, setSentChats] = useState<IChat[]>([]);
	const [receivedChats, setReceivedChats] = useState<IChat[]>([]);
	const [selectedChatTab, setSelectedChatTab] = useState<'sent' | 'received'>('received');
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
			setSentChats(data?.sentChats);
			setReceivedChats(data?.receivedChats);
			setLoading(false);
		} else if (error) {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		handleDataFetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	return (
		<>
			<div className={`${className} h-full w-full overflow-y-scroll pb-5`}>
				<div className='flex flex-col gap-2 p-5'>
					<ChatTab
						setSelectedChatTab={setSelectedChatTab}
						selectedChatTab={selectedChatTab}
						sentCount={sentChats?.length || 0}
						receivedCount={receivedChats?.length || 0}
					/>
				</div>
				<Spin
					spinning={loading}
					className='h-[250px]'
				>
					<RenderChats
						handleOpenChat={handleChatToggle}
						chats={selectedChatTab === 'sent' ? sentChats : receivedChats}
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
