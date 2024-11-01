// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { IChat } from '~src/types';
import ChatCard from './ChatCard';
import { Button, List } from 'antd';
import Image from 'next/image';

interface Props {
	className?: string;
	chats: IChat[];
	handleOpenChat: (chat: IChat) => void;
	handleNewChat: () => void;
}

const RenderChats = ({ className, handleOpenChat, chats, handleNewChat }: Props) => {
	return chats?.length > 0 ? (
		<div className={`${className} h-full w-full overflow-y-auto`}>
			<List
				itemLayout='horizontal'
				dataSource={chats}
				renderItem={(chat) => (
					<List.Item
						key={chat.chatId}
						onClick={() => handleOpenChat(chat)}
						className='cursor-pointer border-section-light-container p-0'
					>
						<ChatCard chat={chat} />
					</List.Item>
				)}
			/>
		</div>
	) : (
		<div className='flex h-full w-full flex-col items-center justify-center text-bodyBlue dark:text-blue-dark-high'>
			<Image
				src='/assets/icons/delegation-chat/empty.svg'
				height={160}
				width={160}
				alt='empty chat icon'
				className='border border-pink_primary'
			/>
			<div className='text-center text-bodyBlue dark:text-blue-dark-high'>
				<h2 className='text-xl font-bold'>No Message Found</h2>
				<p className='flex items-center justify-center gap-1'>
					<Button
						type='text'
						className='cursor-pointer border-none p-0 font-semibold text-pink_primary'
						onClick={handleNewChat}
					>
						Add
					</Button>
					New Message
				</p>
			</div>
		</div>
	);
};

export default RenderChats;
