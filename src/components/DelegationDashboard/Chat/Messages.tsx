// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Spin, Card, Button, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { EChatRequestStatus, IChat, IMessage, NotificationStatus } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useUserDetailsSelector } from '~src/redux/selectors';
import Identicon from '@polkadot/react-identicon';
import EthIdenticon from '~src/ui-components/EthIdenticon';
import shortenAddress from '~src/util/shortenAddress';
import AuthForm from '~src/ui-components/AuthForm';
import queueNotification from '~src/ui-components/QueueNotification';
import RequestStatus from './feedbacks/RequestStatus';

const { TextArea } = Input;

interface Props {
	chat: IChat;
	chatId: string;
}

const Messages = ({ chat, chatId }: Props) => {
	const userProfile = useUserDetailsSelector();
	const { delegationDashboardAddress, loginAddress, picture, username } = userProfile;

	const address = delegationDashboardAddress || loginAddress;

	const [loading, setLoading] = useState<boolean>(false);
	const [messages, setMessages] = useState<IMessage[]>([]);

	const [newMessage, setNewMessage] = useState<string>('');

	const recipientAddress = chat?.senderAddress === address ? chat?.receiverAddress : chat?.senderAddress;

	const isRequestSent = chat.requestStatus !== EChatRequestStatus.ACCEPTED && (messages.length > 0 || !!chat?.latestMessage?.content);

	const handleDataFetch = async () => {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<{ messages: IMessage[] }>('api/v1/delegate-chat/getChatMessages', { chatId });
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
		const requestData = {
			address,
			chatId,
			content: trimmedMsg,
			receiverAddress: recipientAddress,
			senderAddress: address,
			senderImage: picture,
			senderUsername: username
		};
		const { data, error } = await nextApiClientFetch<IMessage>('api/v1/delegate-chat/send-message', requestData);
		if (data) {
			setLoading(false);
			setMessages([...messages, data]);
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
	};

	useEffect(() => {
		handleDataFetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chatId]);

	return (
		<div className='flex h-[440px] w-full flex-col'>
			<Card
				className='w-full rounded-none border-x-0 border-t-0 text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high'
				bodyStyle={{ alignItems: 'center', display: 'flex', gap: '0.5rem', width: '100%' }}
				size='small'
			>
				{recipientAddress?.startsWith('0x') ? (
					<EthIdenticon
						size={32}
						address={recipientAddress || ''}
					/>
				) : (
					<Identicon
						value={recipientAddress || ''}
						size={32}
						theme={'polkadot'}
					/>
				)}

				<span className='text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'>{shortenAddress(recipientAddress, 5)}</span>
			</Card>
			<Spin
				spinning={loading}
				className='h-[250px]'
			>
				<div className={messages.length > 0 ? 'max-h-72 overflow-y-auto px-5 py-3' : 'hidden'}>
					{messages.map((message) => {
						const isSent = message?.senderAddress === address;
						return (
							<div
								key={message?.id}
								className={`flex items-center ${isSent ? 'justify-end' : 'justify-start'} mb-2`}
							>
								<div className={`max-w-[80%] rounded-lg px-3 py-2 text-xs ${isSent ? 'bg-[#3B47DF] text-white' : 'bg-[#D2D8E04D] text-black'}`}>{message?.content || ''}</div>
							</div>
						);
					})}
				</div>
			</Spin>
			{!loading ? (
				<>
					{messages.length > 0 && chat.requestStatus !== EChatRequestStatus.ACCEPTED ? <RequestStatus isRequestSent={isRequestSent} /> : null}
					<AuthForm
						onSubmit={handleSubmit}
						className={messages.length > 0 ? `${chat.requestStatus === EChatRequestStatus.ACCEPTED && 'mt-auto'} justify-self-end` : 'flex h-[440px] flex-col justify-between'}
					>
						{isRequestSent ? (
							<div className='bg-[#F6F7F9] px-5 py-2 shadow-sm'>
								<span className='text-sm text-[#576D8BCC]'>You can chat once message request is accepted</span>
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
							className={`custom-post-button ml-auto mr-3 flex h-9 w-full items-center justify-center space-x-2 self-center rounded-none border-none bg-[#485F7D99] px-5 text-sm font-medium tracking-wide text-white ${
								!newMessage || loading || isRequestSent ? 'opacity-60' : ''
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
