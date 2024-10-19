// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { IChat } from '~src/types';
import ChatCard from './ChatCard';
import { List } from 'antd';

interface Props {
	className?: string;
	chats: IChat[];
	setIsChatOpen: (isChatOpen: boolean) => void;
	setOpenedChat: (openedChat: IChat | null) => void;
}

const RenderChats = ({ className, setIsChatOpen, setOpenedChat, chats }: Props) => {
	const openChat = (chat: IChat) => {
		setIsChatOpen(true);
		setOpenedChat(chat);
	};
	return (
		<div className={`${className} h-full w-full overflow-y-auto`}>
			<List
				itemLayout='horizontal'
				dataSource={chats}
				renderItem={(chat) => (
					<List.Item
						key={chat.chatId}
						onClick={() => openChat(chat)}
						className='cursor-pointer border-section-light-container p-0'
					>
						<ChatCard chat={chat} />
					</List.Item>
				)}
			/>
		</div>
	);
};
export default RenderChats;
