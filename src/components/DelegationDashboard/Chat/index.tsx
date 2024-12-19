// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Drawer, Button, Tooltip, Badge } from 'antd';
import { dmSans } from 'pages/_app';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import UserChats from './UserChats';
import ChatHeader from './ChatHeader';
import { useDispatch } from 'react-redux';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { chatsActions } from '~src/redux/chats';
import { useChatsSelector } from '~src/redux/selectors';

interface Props {
	className?: string;
}

interface IChatHeaderAction {
	icon: string;
	onClick: () => void;
	label: string;
	className?: string;
}

const ChatWithDelegates = ({ className }: Props) => {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [isNewChat, setIsNewChat] = useState(false);
	const [isTooltipOpen, setIsTooltipOpen] = useState(() => {
		return !localStorage.getItem('chatTooltipSeen');
	});

	const dispatch = useDispatch();
	const { unreadChatCount } = useChatsSelector();

	const openChat = () => {
		setIsModalOpen(true);
		setIsMinimized(false);
		localStorage.setItem('chatTooltipSeen', 'true');
		setIsTooltipOpen(false);
	};

	const startNewChat = () => {
		setIsNewChat(true);
	};

	const chatHeaderActions: IChatHeaderAction[] = [
		{
			icon: '/assets/icons/delegation-chat/add-message-icon.svg',
			label: 'New Message',
			onClick: startNewChat
		},
		{
			className: isMinimized ? 'transform rotate-180' : '',
			icon: '/assets/icons/delegation-chat/minimize-icon.svg',
			label: 'Collapse',
			onClick: () => setIsMinimized((prev) => !prev)
		},
		{
			icon: '/assets/icons/delegation-chat/close-icon.svg',
			label: 'Close',
			onClick: () => setIsModalOpen(false)
		}
	];

	const fetchUnreadChatCount = async () => {
		try {
			const { data, error } = await nextApiClientFetch<{ unreadCount: number }>('api/v1/delegate-chat/get-unread-chat-count');
			if (data) {
				dispatch(chatsActions.setUnreadChatCount(data.unreadCount));
			} else if (error) {
				console.error('Error fetching unread chat count:', error);
			}
		} catch (error) {
			console.error('Error fetching unread chat count:', error);
		}
	};

	useEffect(() => {
		fetchUnreadChatCount();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<Tooltip
				title={
					<div>
						<div className='flex items-center gap-2 font-semibold'>
							<span className='rounded-md bg-white px-2 py-0.5 text-xs text-bodyBlue'>NEW</span>
							<h4 className='m-0 p-0 text-sm text-white'>Chat With Delegates</h4>
						</div>
						<p className='m-0 mt-1 p-0 text-xs font-normal text-white'>Engage, network, and make every conversation count with Delegates!</p>
					</div>
				}
				placement='left'
				open={isTooltipOpen}
				color='#2D80FF'
			>
				<Badge
					count={unreadChatCount}
					overflowCount={99}
					offset={[-2, 2]}
					size='small'
					style={{ backgroundColor: 'var(--pink_primary)' }}
					className='[&_.ant-badge-count]:shadow-[0_0_0_2px_rgba(255,255,255,1)] [&_.ant-badge-count]:dark:shadow-[0_0_0_2px_rgba(0,0,0,1)]'
				>
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
				</Badge>
			</Tooltip>
			<Drawer
				title={<ChatHeader actions={chatHeaderActions} />}
				open={isModalOpen}
				placement='bottom'
				height={isMinimized ? 60 : 500}
				mask={false}
				closable={false}
				contentWrapperStyle={{ boxShadow: 'none', transform: 'none' }}
				style={{ position: 'fixed', right: '50px', top: 'auto', zIndex: '999' }}
				className={`${className} ${dmSans.variable} ${dmSans.className} w-[384px] rounded-md shadow-xl dark:bg-section-dark-overlay dark:text-blue-dark-high [&_.ant-drawer-header]:border-section-light-container`}
				bodyStyle={{ display: isMinimized ? 'none' : 'block', maxHeight: '440px', padding: '0px' }}
			>
				<UserChats
					isNewChat={isNewChat}
					setIsNewChat={setIsNewChat}
					handleNewChat={startNewChat}
				/>
			</Drawer>
		</>
	);
};
export default ChatWithDelegates;
