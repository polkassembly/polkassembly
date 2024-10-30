// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Tooltip } from 'antd';
import Image from 'next/image';

interface IChatHeaderAction {
	icon: string;
	onClick: () => void;
	label: string;
	className?: string;
}

interface Props {
	actions: IChatHeaderAction[];
}

const ChatHeader = ({ actions }: Props) => {
	return (
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
				{actions.map((action) => (
					<Tooltip
						key={action.label}
						title={action.label}
					>
						<Button
							onClick={action.onClick}
							className={`flex h-7 w-7 items-center justify-center rounded-full border-none bg-transparent p-2 shadow-none hover:bg-black/5 dark:hover:bg-white/10 ${action?.className}`}
						>
							<Image
								src={action.icon}
								height={24}
								width={24}
								alt={action.label}
								className='dark:brightness-0 dark:contrast-100 dark:grayscale dark:invert dark:filter'
							/>
						</Button>
					</Tooltip>
				))}
			</div>
		</div>
	);
};
export default ChatHeader;
