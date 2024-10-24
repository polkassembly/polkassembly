// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import Image from 'next/image';

interface Props {
	handleCloseChat: () => void;
}

const MessageDrawerHeader = ({ handleCloseChat }: Props) => {
	return (
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
	);
};
export default MessageDrawerHeader;
