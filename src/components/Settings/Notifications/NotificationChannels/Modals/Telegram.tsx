// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Modal } from 'antd';
import React, {  useState } from 'react';
import CopyIcon from '~assets/icons/content-copy.svg';
import { CHANNEL } from '..';

type Props = {
    icon: any;
    title: string;
    open: boolean;
    getVerifyToken: any;
    generatedToken?: string;
};

const TelegramInfoModal = ({
	icon,
	title,
	open,
	getVerifyToken,
	generatedToken = ''
}: Props) => {
	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState(generatedToken);
	const handleGenerateToken = async () => {
		setLoading(true);
		const data = await getVerifyToken(CHANNEL.TELEGRAM);
		setToken(data);
		setLoading(false);
	};
	return (
		<Modal
			title={
				<h3 className='flex items-center gap-3 mb-5'>
					{icon} {title}
				</h3>
			}
			open={open}
			closable
		>
			<div className=''>
				<ol>
					<li className='list-inside leading-[40px]'>
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
						<span className='p-1 cursor-pointer mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary'>
							<CopyIcon className='relative top-[6px]' />{' '}
                            @PolkassemblyBot
						</span>
                        to your Telegram Chat as a member
					</li>
					<li className='list-inside leading-[40px]'>
                        Send this command to the chat with the bot:
						<br />
						<span
							onClick={() => {}}
							className='p-1 cursor-pointer mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary'
						>
							<CopyIcon className='relative top-[6px]' />{' '}
							{'<web3Address>'} {'<verificationToken>'}
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
								<span>Verification Token: </span>
								<span className='p-1 cursor-pointer mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary'>
									<CopyIcon className='relative top-[6px]' />{' '}
									{token}
								</span>
							</>
						)}
					</li>
					<li className='list-inside'>
                        (Optional) Send this command to get help:
						<span className='p-1 cursor-pointer mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary'>
							<CopyIcon className='relative top-[6px]' /> /start
						</span>
					</li>
				</ol>
			</div>
		</Modal>
	);
};

export default TelegramInfoModal;
