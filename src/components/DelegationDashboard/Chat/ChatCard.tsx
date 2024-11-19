// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import { EChatRequestStatus, IChat } from '~src/types';
import { useUserDetailsSelector } from '~src/redux/selectors';
import Identicon from '@polkadot/react-identicon';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import EthIdenticon from '~src/ui-components/EthIdenticon';
import shortenAddress from '~src/util/shortenAddress';
import dayjs from 'dayjs';
import { Card } from 'antd';
import PendingRequestTab from './PendingRequestTab';

interface Props {
	chat: IChat;
	handleAcceptRequestSuccess: (chat: IChat) => void;
}

const ChatCard = ({ chat, handleAcceptRequestSuccess }: Props) => {
	const userProfile = useUserDetailsSelector();
	const { delegationDashboardAddress, loginAddress } = userProfile;

	const address = delegationDashboardAddress || loginAddress;
	const { latestMessage } = chat;
	const [isReadMessage, setIsReadMessage] = useState<boolean>(latestMessage?.viewed_by?.includes(address));
	const [isRejectedRequest, setIsRejectedRequest] = useState<boolean>(chat.requestStatus === EChatRequestStatus.REJECTED);
	const [isPendingRequest, setIsPendingRequest] = useState<boolean>(chat.requestStatus === EChatRequestStatus.PENDING);

	const recipientAddress = latestMessage?.receiverAddress === address ? latestMessage?.senderAddress : latestMessage?.receiverAddress;

	const renderUsername = shortenAddress(recipientAddress || '');

	const handleReadChat = async () => {
		if (isReadMessage) {
			return;
		}
		const requestData = {
			address,
			chatId: chat?.chatId,
			participants: chat.participants
		};
		const { data, error } = await nextApiClientFetch<IChat>('api/v1/delegate-chat/mark-chat-as-read', requestData);
		if (data) {
			setIsReadMessage(true);
		} else if (error) {
			console.log(error);
		}
	};

	const renderUserImage = useMemo(() => {
		if (recipientAddress?.startsWith('0x')) {
			return (
				<EthIdenticon
					size={32}
					address={recipientAddress || ''}
				/>
			);
		} else {
			return (
				<Identicon
					value={recipientAddress || ''}
					size={32}
					theme={'polkadot'}
				/>
			);
		}
	}, [recipientAddress]);

	return (
		<Card
			onClick={handleReadChat}
			size='small'
			bodyStyle={{ display: 'flex', gap: '0.5rem', width: '100%' }}
			className={`flex w-full gap-2 overflow-hidden rounded-none border-none shadow-sm ${
				isReadMessage ? 'bg-transparent' : 'bg-[#3B47DF0A] dark:bg-[#3b46df33]'
			} hover:bg-black/5 dark:hover:bg-white/10`}
		>
			{renderUserImage}
			<div className='flex w-full flex-col items-start gap-2 text-blue-light-medium dark:text-blue-dark-medium'>
				<div className='flex w-full items-center gap-2'>
					<span className='text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'>{renderUsername}</span>
					<Image
						src='/assets/icons/timer.svg'
						height={16}
						width={16}
						className='dark:grayscale dark:invert dark:filter'
						alt='timer icon'
					/>
					<span className='text-xs'>{dayjs(latestMessage?.created_at).format('DD MMM YYYY')}</span>
					{isRejectedRequest ? (
						<div className='ml-auto flex items-center gap-1.5'>
							<span className='h-2 w-2 rounded-full bg-[#FB123C]'></span>
							<span className='text-xs font-medium text-[#FB123C]'>Rejected</span>
						</div>
					) : null}
				</div>

				<div className='line-clamp-2 w-full break-words text-xs'>{latestMessage?.content?.length > 100 ? `${latestMessage.content.slice(0, 100)}...` : latestMessage?.content}</div>

				{isPendingRequest && latestMessage.senderAddress !== address ? (
					<PendingRequestTab
						chat={chat}
						setIsRejectedRequest={setIsRejectedRequest}
						setIsPendingRequest={setIsPendingRequest}
						handleAcceptRequestSuccess={handleAcceptRequestSuccess}
					/>
				) : null}
			</div>
		</Card>
	);
};

export default ChatCard;
