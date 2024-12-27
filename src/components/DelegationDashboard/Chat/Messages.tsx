// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Spin, Card, Button, Input, Image } from 'antd';
import React, { useEffect, useState, useMemo } from 'react';
import { EChatRequestStatus, IChat, IMessage, NotificationStatus } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useChatsSelector, useUserDetailsSelector } from '~src/redux/selectors';
import Identicon from '@polkadot/react-identicon';
import EthIdenticon from '~src/ui-components/EthIdenticon';
import shortenAddress from '~src/util/shortenAddress';
import AuthForm from '~src/ui-components/AuthForm';
import queueNotification from '~src/ui-components/QueueNotification';
import RequestStatus from './feedbacks/RequestStatus';
import PendingRequestTab from './PendingRequestTab';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { useDispatch } from 'react-redux';
import { chatsActions } from '~src/redux/chats';

const { TextArea } = Input;

interface Props {
	chat?: IChat;
	chatId?: string;
	recipientAddress?: string | null;
	isNewChat?: boolean;
}

const Messages = ({ chat, chatId, recipientAddress, isNewChat }: Props) => {
	const dispatch = useDispatch();
	const userProfile = useUserDetailsSelector();
	const { delegationDashboardAddress, loginAddress } = userProfile;
	const { filteredRequests, filteredMessages } = useChatsSelector();

	const address = delegationDashboardAddress || loginAddress;
	const substrateAddress = getSubstrateAddress(address);

	const [loading, setLoading] = useState<boolean>(false);
	const [messages, setMessages] = useState<IMessage[]>([]);

	const [newMessage, setNewMessage] = useState<string>('');

	const isRequestSent = chat?.requestStatus !== EChatRequestStatus.ACCEPTED && (messages.length > 0 || !!chat?.latestMessage?.content);

	const chatRecipientAddress = isNewChat ? recipientAddress : chat?.recipientProfile?.address;

	const isReceiverAddress = chat?.chatInitiatedBy !== substrateAddress;

	const renderUserImage = useMemo(() => {
		if (chat?.recipientProfile?.image) {
			return (
				<Image
					src={chat.recipientProfile.image}
					alt='user image'
					width={32}
					height={32}
					className='overflow-hidden rounded-full'
				/>
			);
		} else if (chatRecipientAddress?.startsWith('0x')) {
			return (
				<EthIdenticon
					size={32}
					address={chatRecipientAddress || ''}
				/>
			);
		} else {
			return (
				<Identicon
					value={chatRecipientAddress || ''}
					size={32}
					theme={'polkadot'}
				/>
			);
		}
	}, [chatRecipientAddress, chat?.recipientProfile]);

	const handleDataFetch = async () => {
		if (isNewChat) return;

		setLoading(true);
		const { data, error } = await nextApiClientFetch<{ messages: IMessage[] }>('api/v1/delegate-chat/getChatMessages', { address, chatId });
		if (data) {
			setMessages(data.messages);
			setLoading(false);
		} else if (error) {
			console.log(error);
			setLoading(false);
		}
	};

	const handleSubmit = async () => {
		setLoading(true);
		const trimmedMsg = newMessage.trim();

		if (!trimmedMsg) {
			setLoading(false);
			return;
		}

		if (isNewChat && recipientAddress) {
			const existingChat = [...filteredRequests, ...filteredMessages].find(
				(chat) => chat.participants.includes(getSubstrateAddress(recipientAddress) || '') && chat.participants.includes(String(substrateAddress))
			);

			if (existingChat) {
				queueNotification({
					header: 'Error!',
					message: 'A chat with this delegate already exists',
					status: NotificationStatus.ERROR
				});
				setLoading(false);
				return;
			}

			const requestData = {
				content: trimmedMsg,
				receiverAddress: recipientAddress,
				senderAddress: substrateAddress
			};

			const { data: newChat, error } = await nextApiClientFetch<IChat>('api/v1/delegate-chat/start-chat', requestData);

			if (newChat) {
				dispatch(chatsActions.addNewChat(newChat));
				dispatch(chatsActions.setOpenChat({ chat: newChat, isOpen: true }));
				setMessages([newChat.latestMessage]);
				setNewMessage('');
			} else if (error) {
				queueNotification({
					header: 'Error!',
					message: error,
					status: NotificationStatus.ERROR
				});
			}
		} else {
			const requestData = {
				address: substrateAddress,
				chatId,
				content: trimmedMsg,
				receiverAddress: chatRecipientAddress,
				senderAddress: address
			};

			const { data, error } = await nextApiClientFetch<IMessage>('api/v1/delegate-chat/send-message', requestData);
			if (data) {
				setLoading(false);
				if (!isRequestSent) {
					dispatch(
						chatsActions.updateChatStatus({
							chatId: chat?.chatId || '',
							status: EChatRequestStatus.PENDING
						})
					);
				}
				setMessages([...messages, data]);
				dispatch(
					chatsActions.updateLatestMessage({
						chatId: chat?.chatId || '',
						message: data
					})
				);
				queueNotification({
					header: 'Success!',
					message: 'Message sent successfully',
					status: NotificationStatus.SUCCESS
				});
				setNewMessage('');
			} else if (error) {
				console.log(error);
				queueNotification({
					header: 'Error!',
					message: error,
					status: NotificationStatus.ERROR
				});
				setLoading(false);
			}
		}
		setLoading(false);
	};

	useEffect(() => {
		handleDataFetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chatId, isNewChat]);

	return (
		<div className='flex h-[440px] w-full flex-col'>
			<Card
				className='w-full rounded-none border-x-0 border-t-0 text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high'
				bodyStyle={{ alignItems: 'center', display: 'flex', gap: '0.5rem', width: '100%' }}
				size='small'
			>
				{renderUserImage}
				<span className='text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'>{chat?.recipientProfile?.username || shortenAddress(chatRecipientAddress || '', 5)}</span>
			</Card>
			<Spin
				spinning={loading}
				className='h-[250px]'
			>
				<div className={messages.length > 0 ? 'max-h-72 overflow-y-auto px-5 py-3' : 'hidden'}>
					{messages.map((message) => {
						const isSent = message?.senderAddress === substrateAddress;
						return (
							<div
								key={message?.id}
								className={`flex items-center ${isSent ? 'justify-end' : 'justify-start'} mb-2`}
							>
								<div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${isSent ? 'bg-[#3B47DF] text-white' : 'bg-[#D2D8E04D] text-black'}`}>{message?.content || ''}</div>
							</div>
						);
					})}
				</div>
			</Spin>
			{!loading ? (
				<>
					{messages.length > 0 && chat?.requestStatus !== EChatRequestStatus.ACCEPTED ? (
						isReceiverAddress && chat ? (
							<PendingRequestTab
								chat={chat}
								className='mt-auto w-full px-5 py-2'
							/>
						) : (
							<RequestStatus isRequestSent={isRequestSent} />
						)
					) : null}
					<AuthForm
						onSubmit={handleSubmit}
						className={messages.length > 0 ? `${chat?.requestStatus === EChatRequestStatus.ACCEPTED && 'mt-auto'} justify-self-end` : 'flex h-[440px] flex-col justify-between'}
					>
						{isRequestSent ? (
							<div className='bg-[#F6F7F9] px-5 py-2 shadow-sm'>
								<span className='text-sm text-[#576D8BCC]'>{isReceiverAddress ? 'Accept message request to initiate chat' : 'You can chat once message request is accepted'}</span>
							</div>
						) : (
							<TextArea
								rows={messages.length > 0 ? 2 : 3}
								placeholder='Type your message here'
								maxLength={1500}
								autoFocus
								value={newMessage}
								className={messages.length > 0 ? 'rounded-none shadow-md' : 'mx-auto mt-5 w-[90%]'}
								onChange={(e) => {
									setNewMessage(e.target.value);
								}}
							/>
						)}
						{messages.length === 0 ? <RequestStatus isRequestSent={false} /> : null}
						<Button
							className={`custom-post-button ml-auto mr-3 flex h-9 w-full items-center justify-center space-x-2 self-center rounded-none border-none px-5 text-sm font-medium tracking-wide text-white ${
								!newMessage || loading || isRequestSent ? 'bg-[#485F7D99] text-[#4A4A4A] dark:bg-[#1D1D1D]' : 'dark-[#5A1138] bg-pink_primary'
							}`}
							type='primary'
							disabled={!newMessage || loading || isRequestSent}
							onClick={handleSubmit}
						>
							<span className='text-white'>Send</span>
						</Button>
					</AuthForm>
				</>
			) : null}
		</div>
	);
};
export default Messages;
