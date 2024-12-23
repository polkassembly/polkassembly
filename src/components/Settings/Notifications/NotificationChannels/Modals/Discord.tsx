// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal, message } from 'antd';
import React, { useState } from 'react';
import { CHANNEL } from '..';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { CloseIcon, CopyIcon } from '~src/ui-components/CustomIcons';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { shortenString } from '~src/util/shortenString';

type Props = {
	icon: any;
	title: string;
	open: boolean;
	getVerifyToken: (channel: CHANNEL) => Promise<any>;
	generatedToken?: string;
	onClose: () => void;
};

const DiscordInfoModal = ({ icon, title, open, getVerifyToken, generatedToken = '', onClose }: Props) => {
	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState(generatedToken);
	const { username } = useUserDetailsSelector();
	const handleGenerateToken = async () => {
		setLoading(true);
		const data = await getVerifyToken(CHANNEL.DISCORD);
		setToken(data);
		setLoading(false);
	};
	const handleCopyClicked = (text: string) => {
		navigator.clipboard.writeText(text);
		message.success('Copied');
	};
	return (
		<Modal
			className='min-[550px] dark:[&>.ant-modal-content]:bg-section-dark-overlay'
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
								href='https://discord.com/oauth2/authorize?client_id=1112538708219007017&permissions=397284485120&scope=bot'
								target='_blank'
								rel='noreferrer'
							>
								discord.com/api/oauth2/
							</a>
						</span>
					</li>
					<li className='list-inside leading-[40px] dark:text-white'>
						Send this command to the chat with the bot:
						<br />
						<span
							onClick={() => handleCopyClicked('/add <username> <verificationToken>')}
							className='bg-bg-secondary border-text_secondary mx-2 cursor-pointer rounded-md border border-solid p-1 text-pink_primary dark:text-blue-dark-helper'
						>
							<CopyIcon className='text-2xl text-lightBlue dark:text-icon-dark-inactive' /> {'<username>'} {'<verificationToken>'}
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
							<>
								<div className='list-inside leading-[40px] dark:text-white'>
									Copy your username:
									<span
										onClick={() => handleCopyClicked(username as string)}
										className='bg-bg-secondary border-text_secondary mx-2 cursor-pointer rounded-md border border-solid p-1 text-pink_primary dark:text-blue-dark-helper'
									>
										<CopyIcon className='relative text-2xl text-lightBlue dark:text-icon-dark-inactive' /> {username}
									</span>
								</div>

								<div className='dark:text-white'>
									<span>Verification Token: </span>
									<span
										onClick={() => handleCopyClicked(token)}
										className='token-desktop-container bg-bg-secondary border-text_secondary mx-2 cursor-pointer rounded-md border border-solid p-1 text-pink_primary dark:text-blue-dark-helper'
									>
										<CopyIcon className='relative text-2xl text-lightBlue dark:text-icon-dark-inactive' /> {token}
									</span>
									<span
										onClick={() => handleCopyClicked(token)}
										className='token-mobile-container bg-bg-secondary border-text_secondary cursor-pointer items-center justify-center rounded-md border border-solid px-1 pb-1 text-pink_primary dark:text-blue-dark-helper'
									>
										<CopyIcon className='relative text-lightBlue dark:text-icon-dark-inactive' /> {shortenString(token, 10)}
									</span>
								</div>
							</>
						)}
					</li>
				</ol>
			</div>
		</Modal>
	);
};

export default DiscordInfoModal;
