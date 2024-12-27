// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Card, Image } from 'antd';
import React, { useMemo } from 'react';
import { EChatRequestStatus, IChat } from '~src/types';
import { useUserDetailsSelector } from '~src/redux/selectors';
import Identicon from '@polkadot/react-identicon';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import EthIdenticon from '~src/ui-components/EthIdenticon';
import shortenAddress from '~src/util/shortenAddress';
import dayjs from 'dayjs';
import PendingRequestTab from './PendingRequestTab';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { useDispatch } from 'react-redux';
import { chatsActions } from '~src/redux/chats';

interface Props {
	chat: IChat;
}

const ChatCard = ({ chat }: Props) => {
	const dispatch = useDispatch();
	const userProfile = useUserDetailsSelector();
	const { delegationDashboardAddress, loginAddress } = userProfile;

	const address = delegationDashboardAddress || loginAddress;
	const substrateAddress = getSubstrateAddress(address);

	const { latestMessage } = chat;
	const isReadMessage = latestMessage?.viewed_by?.includes(String(substrateAddress));
	const isRejectedRequest = chat.requestStatus === EChatRequestStatus.REJECTED;
	const isPendingRequest = chat.requestStatus === EChatRequestStatus.PENDING;

	const renderUsername = chat.recipientProfile?.username || shortenAddress(chat.recipientProfile?.address || '');

	const handleReadChat = async () => {
		if (isReadMessage) {
			return;
		}
		const requestData = {
			address: substrateAddress,
			chatId: chat?.chatId,
			participants: chat.participants
		};
		const { data, error } = await nextApiClientFetch<IChat>('api/v1/delegate-chat/mark-chat-as-read', requestData);
		if (data) {
			dispatch(
				chatsActions.updateLatestMessageViewedBy({
					address: substrateAddress || '',
					chatId: chat.chatId
				})
			);
			dispatch(chatsActions.markChatAsRead({ address: substrateAddress!, chatId: chat.chatId }));
		} else if (error) {
			console.log(error);
		}
	};

	const chatRecipientAddress = chat?.recipientProfile?.address;

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

	return (
		<Card
			onClick={handleReadChat}
			size='small'
			bodyStyle={{ display: 'flex', gap: '0.5rem', width: '100%' }}
			className={`flex w-full gap-2 overflow-hidden rounded-none border-none shadow-sm ${
				isReadMessage ? 'bg-transparent' : 'bg-[#3B47DF0A] dark:bg-[#1A1B34]'
			} hover:bg-black/5 dark:hover:bg-white/10`}
		>
			{renderUserImage}
			<div className='flex w-full flex-col items-start gap-2 text-blue-light-medium dark:text-blue-dark-medium'>
				<div className='flex w-full items-center gap-1'>
					<span className='text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'>{renderUsername}</span>
					<Image
						src='/assets/icons/timer.svg'
						height={12}
						width={12}
						className='ml-1 dark:grayscale dark:invert dark:filter'
						alt='timer icon'
					/>
					<span className='text-xs text-blue-light-medium dark:text-[#9e9e9e]'>{dayjs(latestMessage?.created_at).format('DD MMM YYYY')}</span>
					{isRejectedRequest ? (
						<div className='ml-auto flex items-center gap-1.5'>
							<span className='h-2 w-2 rounded-full bg-[#FB123C]'></span>
							<span className='text-xs font-medium text-[#FB123C]'>Rejected</span>
						</div>
					) : null}
				</div>

				<div className='-mt-1 line-clamp-2 w-full break-words text-xs text-blue-light-medium dark:text-[#9e9e9e]'>
					{latestMessage?.content?.length > 100 ? `${latestMessage.content.slice(0, 100)}...` : latestMessage?.content}
				</div>

				{isPendingRequest && chat.chatInitiatedBy !== substrateAddress ? <PendingRequestTab chat={chat} /> : null}
			</div>
		</Card>
	);
};

export default ChatCard;
