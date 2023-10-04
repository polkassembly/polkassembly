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

<<<<<<< HEAD
const TelegramInfoModal = ({
	icon,
	title,
	open,
	getVerifyToken,
	generatedToken = '',
	onClose,
	theme
}: Props) => {
=======
const TelegramInfoModal = ({ icon, title, open, getVerifyToken, generatedToken = '', onClose }: Props) => {
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
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
<<<<<<< HEAD
				<h3 className='flex items-center gap-3 mb-5 dark:bg-section-dark-overlay dark:text-white'>
=======
				<h3 className='mb-5 flex items-center gap-3'>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
					{icon} {title}
				</h3>
			}
			wrapClassName='dark:bg-modalOverlayDark'
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
						<span className='bg-bg-secondary border-text_secondary mx-2 rounded-md border border-solid p-1 text-pink_primary'>
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
							className='bg-bg-secondary border-text_secondary mx-2 cursor-pointer rounded-md border border-solid p-1 text-pink_primary'
						>
<<<<<<< HEAD
							<CopyIcon className='relative text-pink_primary' />{' '}
							@PolkassemblyBot
=======
							<CopyIcon className='color-pink_primary relative top-[6px]' /> @PolkassemblyBot
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
						</span>
						to your Telegram Chat as a member
					</li>
					<li className='list-inside leading-[40px] dark:text-blue-dark-high'>
						Send this command to the chat with the bot:
						<br />
						<span
							onClick={() => handleCopyClicked('/add <username> <verificationToken>')}
							className='bg-bg-secondary border-text_secondary mx-2 cursor-pointer rounded-md border border-solid p-1 text-pink_primary'
						>
<<<<<<< HEAD
							<CopyIcon className='relative text-pink_primary' />{' '}
							{'<username>'} {'<verificationToken>'}
=======
							<CopyIcon className='relative top-[6px]' /> {'<username>'} {'<verificationToken>'}
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
						</span>
						<Button
							loading={loading}
							onClick={handleGenerateToken}
							className='bg-pink_primary font-normal text-white'
						>
							Generate Token
						</Button>
						<br />
						{token && (
							<div className='flex items-center'>
								<span>Username & Verification Token: </span>
								<div
									onClick={() => handleCopyClicked(`/add ${username} ${token}`)}
									className='bg-bg-secondary border-text_secondary mx-2 flex h-[30px] max-w-[230px] cursor-pointer items-center rounded-md border border-solid p-0 text-pink_primary'
								>
<<<<<<< HEAD
									<CopyIcon className='relative text-pink_primary' />{' '}
									<span className='max-w-[100px] text-ellipsis overflow-hidden whitespace-nowrap inline-block mr-2'>
										{username}
									</span>
									<span className='max-w-[100px] text-ellipsis overflow-hidden whitespace-nowrap inline-block'>
										{token}
									</span>
=======
									<CopyIcon className='relative' /> <span className='mr-2 inline-block max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap'>{username}</span>
									<span className='inline-block max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap'>{token}</span>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
								</div>
							</div>
						)}
					</li>
					<li className='list-inside dark:text-blue-dark-high'>
						(Optional) Send this command to get help:
						<span
							onClick={() => handleCopyClicked('/start')}
							className='bg-bg-secondary border-text_secondary mx-2 cursor-pointer rounded-md border border-solid p-1 text-pink_primary'
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
