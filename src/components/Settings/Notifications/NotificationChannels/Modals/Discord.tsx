// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Modal, message } from 'antd';
import React, { useState } from 'react';
import { CloseIcon, CopyIcon } from '~src/ui-components/CustomIcons';
import { CHANNEL } from '..';
import { useUserDetailsContext } from '~src/context';

type Props = {
<<<<<<< HEAD
    icon: any;
    title: string;
    open: boolean;
    getVerifyToken:  (channel: CHANNEL) => Promise<any>;
    generatedToken?: string;
    onClose: () => void;
	theme?: string;
};

const DiscordInfoModal = ({
	icon,
	title,
	open,
	getVerifyToken,
	generatedToken = '',
	onClose,
	theme
}: Props) => {
=======
	icon: any;
	title: string;
	open: boolean;
	getVerifyToken: (channel: CHANNEL) => Promise<any>;
	generatedToken?: string;
	onClose: () => void;
};

const DiscordInfoModal = ({ icon, title, open, getVerifyToken, generatedToken = '', onClose }: Props) => {
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState(generatedToken);
	const { username } = useUserDetailsContext();
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
			title={
<<<<<<< HEAD
				<h3 className='flex items-center gap-3 mb-5 dark:bg-section-dark-overlay dark:text-white'>
=======
				<h3 className='mb-5 flex items-center gap-3'>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
					{icon} {title}
				</h3>
			}
			open={open}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive'/>}
			onCancel={onClose}
			footer={null}
			wrapClassName='dark:bg-modalOverlayDark'
			className={`min-[550px] ${theme === 'dark'? '[&>.ant-modal-content]:bg-section-dark-overlay' : ''}`}
		>
			<div className=''>
				<ol>
<<<<<<< HEAD
					<li className='list-inside leading-[40px] dark:text-blue-dark-high'>
                        Click this invite link
						<span className='p-1 mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary'>
=======
					<li className='list-inside leading-[40px]'>
						Click this invite link
						<span className='bg-bg-secondary border-text_secondary mx-2 rounded-md border border-solid p-1 text-pink_primary'>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
							<a
								href='https://discord.com/oauth2/authorize?client_id=1112538708219007017&permissions=397284485120&scope=bot'
								target='_blank'
								rel='noreferrer'
							>
								discord.com/api/oauth2/
							</a>
						</span>
					</li>
<<<<<<< HEAD
					<li className='list-inside leading-[40px] dark:text-blue-dark-high'>
                        Send this command to the chat with the bot:
=======
					<li className='list-inside leading-[40px]'>
						Send this command to the chat with the bot:
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
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
							<>
<<<<<<< HEAD
								<div className='list-inside leading-[40px] dark:text-blue-dark-medium'>
                        Copy your username:
=======
								<div className='list-inside leading-[40px]'>
									Copy your username:
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
									<span
										onClick={() => handleCopyClicked(username as string)}
										className='bg-bg-secondary border-text_secondary mx-2 cursor-pointer rounded-md border border-solid p-1 text-pink_primary'
									>
<<<<<<< HEAD
										<CopyIcon className='relative text-pink_primary' />{' '}
										{username}
=======
										<CopyIcon className='relative top-[6px]' /> {username}
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
									</span>
								</div>

								<div className=''>
									<span>Verification Token: </span>
									<span
										onClick={() => handleCopyClicked(token)}
										className='bg-bg-secondary border-text_secondary mx-2 cursor-pointer rounded-md border border-solid p-1 text-pink_primary'
									>
<<<<<<< HEAD
										<CopyIcon className='relative text-pink_primary' />{' '}
										{token}
=======
										<CopyIcon className='relative top-[6px]' /> {token}
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
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
