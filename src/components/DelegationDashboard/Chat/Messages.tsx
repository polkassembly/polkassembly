// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Spin, Card } from 'antd';
import React, { useEffect, useState } from 'react';
import { IChat, IMessage, NotificationStatus } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useUserDetailsSelector } from '~src/redux/selectors';
import Identicon from '@polkadot/react-identicon';
import EthIdenticon from '~src/ui-components/EthIdenticon';
import shortenAddress from '~src/util/shortenAddress';
import AuthForm from '~src/ui-components/AuthForm';
import ContentForm from '~src/components/ContentForm';
import queueNotification from '~src/ui-components/QueueNotification';
import Markdown from '~src/ui-components/Markdown';

interface Props {
	className?: string;
	chat: IChat;
	chatId: string;
}

const Messages = ({ className, chat, chatId }: Props) => {
	const userProfile = useUserDetailsSelector();
	const { delegationDashboardAddress, loginAddress, picture, username } = userProfile;

	const address = delegationDashboardAddress || loginAddress;

	const [loading, setLoading] = useState<boolean>(false);
	const [messages, setMessages] = useState<IMessage[]>([]);

	const [newMessage, setNewMessage] = useState<string>('');

	const recipientAddress = chat?.senderAddress === address ? chat?.receiverAddress : chat?.senderAddress;

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

	useEffect(() => {
		const toolbar = document.querySelector('.tox-toolbar__primary');
		if (toolbar) {
			let button = toolbar.querySelector('.custom-post-button') as HTMLButtonElement;
			if (!button) {
				button = document.createElement('button') as HTMLButtonElement;
				button.className =
					'custom-post-button inline-flex h-7 self-center ml-auto mr-3 w-fit px-5 items-center justify-center space-x-2 rounded-md border-none bg-[#485F7D99] text-sm font-medium tracking-wide text-white';
				button.type = 'button';
				toolbar.appendChild(button);
			}
			button.disabled = !newMessage || loading;
			button.onclick = handleSubmit;
			button.innerHTML = '<span class="text-white">Post</span>';
			button.classList.toggle('opacity-60', !newMessage || loading);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [newMessage, loading]);

	return (
		<div className='flex h-full w-full flex-col'>
			<Card
				className='w-full rounded-none border-t-0'
				bodyStyle={{ alignItems: 'center', display: 'flex', gap: '0.5rem', width: '100%' }}
				size='small'
			>
				{recipientAddress && recipientAddress?.startsWith('0x') ? (
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
				<div className={`${className} h-64 overflow-y-scroll px-5 py-3`}>
					{messages.map((message) => {
						const isSent = message?.senderAddress === address;
						return (
							<div
								key={message?.id}
								className={`flex items-center ${isSent ? 'justify-end' : 'justify-start'} mb-2`}
							>
								<div className={`max-w-[80%] rounded-lg px-3 py-2 ${isSent ? 'bg-[#3B47DF] text-white' : 'bg-[#D2D8E04D] text-black'}`}>
									<Markdown
										md={message?.content || ''}
										className={`${isSent ? 'text-white' : 'text-black'} text-xs`}
										isPreview={true}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</Spin>
			<AuthForm
				onSubmit={handleSubmit}
				className='mt-auto justify-self-end pb-1 pt-2'
			>
				<ContentForm
					value={newMessage}
					height={120}
					className='[&_.ant-form-item]:m-0 [&_.tox-editor-container]:flex-col-reverse [&_.tox-editor-header]:border-t [&_.tox-editor-header]:border-section-light-container [&_.tox-statusbar]:hidden [&_.tox]:rounded-none [&_.tox_.tox-toolbar\_\_primary]:bg-[#D2D8E0]'
					onChange={(content: string) => {
						setNewMessage(content);
					}}
				/>
			</AuthForm>
		</div>
	);
};
export default Messages;
