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
				<h3 className='flex items-center gap-3 mb-5 dark:bg-section-dark-overlay dark:text-white'>
					{icon} {title}
				</h3>
			}
			open={open}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-blue-dark-medium'/>}
			onCancel={onClose}
			footer={null}
			className={`min-[550px] ${theme === 'dark'? '[&>.ant-modal-content]:bg-section-dark-overlay' : ''}`}
		>
			<div className=''>
				<ol>
					<li className='list-inside leading-[40px] dark:text-blue-dark-high'>
                        Click this invite link
						<span className='p-1 mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary'>
							<a
								href='https://discord.com/oauth2/authorize?client_id=1112538708219007017&permissions=397284485120&scope=bot'
								target='_blank'
								rel='noreferrer'
							>
                                discord.com/api/oauth2/
							</a>
						</span>
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
							<>
								<div className='list-inside leading-[40px] dark:text-blue-dark-medium'>
                        Copy your username:
									<span
										onClick={() =>
											handleCopyClicked(username as string)
										}
										className='p-1 cursor-pointer mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary'
									>
										<CopyIcon className='relative text-pink_primary' />{' '}
										{username}
									</span>
								</div>

								<div className=''>
									<span>Verification Token: </span>
									<span
										onClick={() => handleCopyClicked(token)}
										className='p-1 cursor-pointer mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary'
									>
										<CopyIcon className='relative text-pink_primary' />{' '}
										{token}
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
