// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal, message } from 'antd';
import React, { useState } from 'react';
import { CHANNEL } from '..';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { CloseIcon, CopyIcon } from '~src/ui-components/CustomIcons';
import CustomButton from '~src/basic-components/buttons/CustomButton';

type Props = {
	icon: any;
	title: string;
	open: boolean;
	getVerifyToken: (channel: CHANNEL) => Promise<any>;
	generatedToken?: string;
	onClose: () => void;
};

const TelegramInfoModal = ({ icon, title, open, getVerifyToken, generatedToken = '', onClose }: Props) => {
	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState(generatedToken);
	const { username } = useUserDetailsSelector();
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
			className='dark:[&>.ant-modal-content]:bg-section-dark-overlay'
			wrapClassName='dark:bg-modalOverlayDark'
			title={
				<h3 className='mb-5 flex items-center gap-3 dark:bg-section-dark-overlay dark:text-white'>
					{icon} {title}
				</h3>
			}
			open={open}
			closable
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			onCancel={onClose}
			footer={null}
		>
			<div className=''>
				<ol>
					<li className='list-inside leading-[40px] dark:text-white'>
						Click this invite link
						<span className='bg-bg-secondary border-text_secondary mx-2 rounded-md border border-solid p-1 text-pink_primary dark:text-blue-dark-helper'>
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
							className='bg-bg-secondary border-text_secondary mx-2 cursor-pointer rounded-md border border-solid p-1 text-pink_primary dark:text-blue-dark-helper'
						>
							<CopyIcon className='relative text-2xl text-lightBlue dark:text-icon-dark-inactive' /> @PolkassemblyBot
						</span>
						to your Telegram Chat as a member
					</li>
					<li className='list-inside leading-[40px] dark:text-white'>
						Send this command to the chat with the bot:
						<br />
						<span
							onClick={() => handleCopyClicked('/add <username> <verificationToken>')}
							className='bg-bg-secondary border-text_secondary mx-2 cursor-pointer rounded-md border border-solid p-1 text-pink_primary dark:text-blue-dark-helper'
						>
							<CopyIcon className='relative text-2xl text-lightBlue dark:text-icon-dark-inactive' /> {'<username>'} {'<verificationToken>'}
						</span>
						<div className='mt-4 flex justify-end'>
							<CustomButton
								loading={loading}
								onClick={handleGenerateToken}
								variant='primary'
								text='Generate Token'
							/>
						</div>
						<br />
						{token && (
							<div className='flex items-center dark:text-white'>
								<span>Username & Verification Token: </span>
								<div
									onClick={() => handleCopyClicked(`/add ${username} ${token}`)}
									className='bg-bg-secondary border-text_secondary mx-2 flex h-[30px] max-w-[230px] cursor-pointer items-center rounded-md border border-solid p-0 text-pink_primary dark:text-blue-dark-helper'
								>
									<CopyIcon className='relative text-2xl text-lightBlue dark:text-icon-dark-inactive' />{' '}
									<span className='mr-2 inline-block max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap'>{username}</span>
									<span className='inline-block max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap'>{token}</span>
								</div>
							</div>
						)}
					</li>
					<li className='list-inside dark:text-white'>
						(Optional) Send this command to get help:
						<span
							onClick={() => handleCopyClicked('/start')}
							className='bg-bg-secondary border-text_secondary mx-2 cursor-pointer rounded-md border border-solid p-1 text-pink_primary dark:text-blue-dark-helper'
						>
							<CopyIcon className='relative text-2xl text-lightBlue dark:text-icon-dark-inactive' /> /start
						</span>
					</li>
				</ol>
			</div>
		</Modal>
	);
};

export default TelegramInfoModal;
