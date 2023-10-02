// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Modal, message } from 'antd';
import React, { useState } from 'react';
import { CloseIcon, CopyIcon } from '~src/ui-components/CustomIcons';
import { CHANNEL } from '..';
import { useUserDetailsContext } from '~src/context';

type Props = {
	icon: any;
	title: string;
	open: boolean;
	getVerifyToken: (channel: CHANNEL) => Promise<any>;
	generatedToken?: string;
	onClose: () => void;
	theme?: string;
};

const TelegramInfoModal = ({
	icon,
	title,
	open,
	getVerifyToken,
	generatedToken = '',
	onClose,
	theme
}: Props) => {
	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState(generatedToken);
	const { username } = useUserDetailsContext();
	const handleGenerateToken = async () => {
		setLoading(true);
		const data = await getVerifyToken(CHANNEL.TELEGRAM);
		setToken(data);
		setLoading(false);
	};

	const handleCopyClicked = (text: string) => {
		navigator.clipboard.writeText(text);
		message.success('Copied');
	};

	return (
		<Modal
			title={
				<h3 className='flex items-center gap-3 mb-5 dark:bg-section-dark-overlay dark:text-white'>
					{icon} {title}
				</h3>
			}
			open={open}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive'/>}
			onCancel={onClose}
			footer={null}
			className = {`${theme === 'dark'? '[&>.ant-modal-content]:bg-section-dark-overlay' : ''}`}
		>
			<div className=''>
				<ol>
					<li className='list-inside leading-[40px] dark:text-blue-dark-high dark:font-normal'>
						Click this invite link
						<span className='p-1 mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary'>
							<a
								href='https://t.me/PolkassemblyBot'
								target='_blank'
								rel='noreferrer'
							>
								t.me/PolkassemblyBot
							</a>
						</span>
						<br />
						or Add
						<span
							onClick={() => handleCopyClicked('@PolkassemblyBot')}
							className='p-1 cursor-pointer mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary'
						>
							<CopyIcon className='relative text-pink_primary' />{' '}
							@PolkassemblyBot
						</span>
						to your Telegram Chat as a member
					</li>
					<li className='list-inside leading-[40px] dark:text-blue-dark-high'>
						Send this command to the chat with the bot:
						<br />
						<span
							onClick={() =>
								handleCopyClicked(
									'/add <username> <verificationToken>'
								)
							}
							className='p-1 cursor-pointer mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary'
						>
							<CopyIcon className='relative text-pink_primary' />{' '}
							{'<username>'} {'<verificationToken>'}
						</span>
						<Button
							loading={loading}
							onClick={handleGenerateToken}
							className='bg-pink_primary text-white font-normal'
						>
							Generate Token
						</Button>
						<br />
						{token && (
							<div className='flex items-center'>
								<span>Username & Verification Token: </span>
								<div
									onClick={() => handleCopyClicked(`/add ${username} ${token}`)}
									className='flex items-center max-w-[230px] p-0 cursor-pointer mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary h-[30px]'
								>
									<CopyIcon className='relative text-pink_primary' />{' '}
									<span className='max-w-[100px] text-ellipsis overflow-hidden whitespace-nowrap inline-block mr-2'>
										{username}
									</span>
									<span className='max-w-[100px] text-ellipsis overflow-hidden whitespace-nowrap inline-block'>
										{token}
									</span>
								</div>
							</div>
						)}
					</li>
					<li className='list-inside dark:text-blue-dark-high'>
						(Optional) Send this command to get help:
						<span
							onClick={() => handleCopyClicked('/start')}
							className='p-1 cursor-pointer mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary'
						>
							<CopyIcon className='relative text-pink_primary' /> /start
						</span>
					</li>
				</ol>
			</div>
		</Modal>
	);
};

export default TelegramInfoModal;
