// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import React, { useMemo } from 'react';
import { IChat } from '~src/types';
import { useUserDetailsSelector } from '~src/redux/selectors';
import Identicon from '@polkadot/react-identicon';
import EthIdenticon from '~src/ui-components/EthIdenticon';
import shortenAddress from '~src/util/shortenAddress';
import Markdown from '~src/ui-components/Markdown';
import dayjs from 'dayjs';

interface Props {
	chat: IChat;
}

const ChatCard = ({ chat }: Props) => {
	const userProfile = useUserDetailsSelector();
	const { delegationDashboardAddress, loginAddress } = userProfile;

	const address = delegationDashboardAddress || loginAddress;
	const { latestMessage } = chat;
	const isReadMessage = latestMessage?.viewed_by?.includes(address);

	const recipientAddress = latestMessage?.receiverAddress === address ? latestMessage?.senderAddress : latestMessage?.receiverAddress;

	const renderUsername = shortenAddress(recipientAddress || '');

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
		<div className={`flex w-full gap-2 overflow-hidden px-5 py-2 ${isReadMessage ? '' : 'bg-[#3B47DF0A] dark:bg-[#3b46df33]'}`}>
			{renderUserImage}
			<div className='flex flex-col items-start gap-2 text-blue-light-medium dark:text-blue-dark-medium'>
				<div className='flex items-center gap-2'>
					<span className='text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'>{renderUsername}</span>
					<Image
						src='/assets/icons/timer.svg'
						height={16}
						width={16}
						className='dark:grayscale dark:invert dark:filter'
						alt='timer icon'
					/>
					<span className='text-xs'>{dayjs(latestMessage?.created_at).format('DD MMM YYYY')}</span>
				</div>
				<Markdown
					md={latestMessage?.content?.length > 100 ? `${latestMessage.content.slice(0, 100)}...` : latestMessage?.content}
					className={'line-clamp-2 w-full break-words text-xs'}
					isPreview={true}
				/>
			</div>
		</div>
	);
};

export default ChatCard;
