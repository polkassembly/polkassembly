// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Drawer, Button } from 'antd';
import { poppins } from 'pages/_app';
import Image from 'next/image';
import { IChat } from '~src/types';
import Messages from './Messages';
import NewChat from './NewChat';

interface Props {
	className?: string;
	openedChat?: IChat | null;
	isDrawerOpen: boolean;
	isNewChat: boolean;
	handleCloseChat: () => void;
	handleOpenChat: (chat: IChat) => void;
}

const MessageDrawer = ({ className, isDrawerOpen, handleCloseChat, handleOpenChat, openedChat, isNewChat }: Props) => {
	return (
		<>
			<Drawer
				title={
					<div className='flex items-center gap-2 text-xl font-semibold text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						<Image
							src='/assets/icons/delegation-chat/chat-icon.svg'
							height={24}
							width={24}
							className='dark:brightness-0 dark:contrast-100 dark:grayscale dark:invert dark:filter'
							alt='chat icon'
						/>
						New Message
						<div className='ml-auto flex items-center gap-3'>
							<Button
								onClick={handleCloseChat}
								className='flex h-6 w-6 items-center justify-center border-none bg-transparent p-0 shadow-none'
							>
								<Image
									src='/assets/icons/delegation-chat/close-icon.svg'
									height={24}
									width={24}
									alt='close icon'
									className='dark:brightness-0 dark:contrast-100 dark:grayscale dark:invert dark:filter'
								/>
							</Button>
						</div>
					</div>
				}
				open={isDrawerOpen}
				placement='bottom'
				height={500}
				mask={false}
				closable={false}
				contentWrapperStyle={{ boxShadow: 'none', transform: 'none' }}
				style={{ position: 'fixed', right: '450px', top: 'auto', zIndex: '999' }}
				className={`${className} ${poppins.variable} ${poppins.className} w-[384px] rounded-md dark:bg-section-dark-overlay dark:text-blue-dark-high [&_.ant-drawer-header]:border-section-light-container`}
				bodyStyle={{ padding: '0px' }}
			>
				{isNewChat ? (
					<NewChat handleOpenChat={handleOpenChat} />
				) : (
					openedChat &&
					openedChat?.chatId && (
						<Messages
							chatId={openedChat?.chatId}
							chat={openedChat}
						/>
					)
				)}
			</Drawer>
		</>
	);
};
export default MessageDrawer;
