// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Drawer, Button } from 'antd';
import { poppins } from 'pages/_app';
import { useState } from 'react';
import Image from 'next/image';
import UserChats from './UserChats';

interface Props {
	className?: string;
}

interface IChatHeaderAction {
	icon: string;
	onClick: () => void;
	title: string;
	className?: string;
}

const ChatWithDelegates = ({ className }: Props) => {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [isNewChat, setIsNewChat] = useState(false);

	const openChat = () => {
		setIsModalOpen(true);
		setIsMinimized(false);
	};

	const chatHeaderActions: IChatHeaderAction[] = [
		{
			icon: '/assets/icons/delegation-chat/add-message-icon.svg',
			onClick: () => setIsNewChat(true),
			title: 'Add message'
		},
		{
			className: isMinimized ? 'transform rotate-180' : '',
			icon: '/assets/icons/delegation-chat/minimize-icon.svg',
			onClick: () => setIsMinimized((prev) => !prev),
			title: 'Minimize'
		},
		{
			icon: '/assets/icons/delegation-chat/close-icon.svg',
			onClick: () => setIsModalOpen(false),
			title: 'Close'
		}
	];

	return (
		<>
			<Button
				onClick={openChat}
				className={'h-10 w-10 border-pink_primary bg-white px-0 font-medium dark:bg-black'}
			>
				<Image
					src={'/assets/icons/delegation-chat/message-icon.svg'}
					height={20}
					width={20}
					alt='message icon'
				/>
			</Button>
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
						Messages
						<div className='ml-auto flex items-center gap-3'>
							{chatHeaderActions.map((action) => (
								<Button
									key={action.title}
									onClick={action.onClick}
									className={`flex h-6 w-6 items-center justify-center border-none bg-transparent p-0 shadow-none ${action?.className}`}
								>
									<Image
										src={action.icon}
										height={24}
										width={24}
										alt={action.title}
										className='dark:brightness-0 dark:contrast-100 dark:grayscale dark:invert dark:filter'
									/>
								</Button>
							))}
						</div>
					</div>
				}
				open={isModalOpen}
				placement='bottom'
				height={isMinimized ? 60 : 500}
				mask={false}
				closable={false}
				contentWrapperStyle={{ boxShadow: 'none', transform: 'none' }}
				style={{ position: 'fixed', right: '50px', top: 'auto', zIndex: '999' }}
				className={`${className} ${poppins.variable} ${poppins.className} w-[384px] rounded-md dark:bg-section-dark-overlay dark:text-blue-dark-high [&_.ant-drawer-header]:border-section-light-container`}
				bodyStyle={{ display: isMinimized ? 'none' : 'block', padding: '0px' }}
			>
				<UserChats
					isNewChat={isNewChat}
					setIsNewChat={setIsNewChat}
				/>
			</Drawer>
		</>
	);
};
export default ChatWithDelegates;
