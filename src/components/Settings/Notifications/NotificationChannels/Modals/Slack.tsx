// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal, message } from 'antd';
import React, { useState } from 'react';
import CopyIcon from '~assets/icons/content-copy-pink.svg';
import { CHANNEL } from '..';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import ImageIcon from '~src/ui-components/ImageIcon';
import { shortenString } from '~src/util/shortenString';

type Props = {
	icon: any;
	title: string;
	open: boolean;
	getVerifyToken: (channel: CHANNEL) => Promise<any>;
	generatedToken?: string;
	onClose: () => void;
};

const SlackInfoModal = ({ icon, title, open, getVerifyToken, generatedToken = '', onClose }: Props) => {
	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState(generatedToken);

	const handleGenerateToken = async () => {
		setLoading(true);
		const data = await getVerifyToken(CHANNEL.SLACK);
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
				<h3 className='mb-5 flex items-center gap-3 dark:text-white'>
					{icon} {title}
				</h3>
			}
			open={open}
			closable
			onCancel={onClose}
			footer={null}
		>
			<div className=''>
				<ol>
					<li className='list-inside leading-[40px] dark:text-white'>
						Click this to get invite link <br />
						<a
							target='_blank'
							href='https://slack.com/oauth/v2/authorize?client_id=1965962071360.5335403564179&scope=channels:join,channels:read,chat:write,commands,im:write&user_scope='
							rel='noreferrer'
						>
							<ImageIcon
								alt='Add to Slack'
								// height={40}
								// width={139}
								src='https://platform.slack-edge.com/img/add_to_slack.png'
								// srcSet='https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x'
							/>
						</a>
					</li>
					<li className='list-inside leading-[40px] dark:text-white'>
						Send this command to the chat with the bot:
						<br />
						<span
							onClick={() => handleCopyClicked('/polkassembly-add <username> <verificationToken>')}
							className='token-desktop-container bg-bg-secondary border-text_secondary cursor-pointer rounded-md border border-solid p-1 text-pink_primary'
						>
							/polkassembly-add {'<username>'} {'<verificationToken>'} <CopyIcon className='relative top-[6px] text-2xl text-lightBlue dark:text-icon-dark-inactive' />
						</span>
						<span
							onClick={() => handleCopyClicked('/polkassembly-add <username> <verificationToken>')}
							className='token-mobile-container bg-bg-secondary border-text_secondary hidden cursor-pointer rounded-md border border-solid p-1 text-pink_primary'
						>
							{shortenString('/polkassembly-add <username> <verificationToken>', 10)} <CopyIcon className='relative top-[6px]' />
						</span>
						<div className='mt-4 flex justify-end'>
							<CustomButton
								loading={loading}
								onClick={handleGenerateToken}
								type='primary'
								text='Generate Token'
							/>
						</div>
						{token && (
							<>
								<br />
								<span className='dark:text-white'>Verification Token: </span>
								<br />
								<span
									onClick={() => handleCopyClicked(token)}
									className='token-desktop-container bg-bg-secondary border-text_secondary mx-2 cursor-pointer rounded-md border border-solid p-1 text-pink_primary'
								>
									{token} <CopyIcon className='relative top-[6px] text-lightBlue dark:text-icon-dark-inactive' />
								</span>
								<span
									onClick={() => handleCopyClicked(token)}
									className='token-mobile-container bg-bg-secondary border-text_secondary cursor-pointer rounded-md border border-solid p-1 text-pink_primary'
								>
									{shortenString(token, 10)} <CopyIcon className='relative top-[6px] text-lightBlue dark:text-icon-dark-inactive' />
								</span>
							</>
						)}
					</li>
				</ol>
			</div>
		</Modal>
	);
};

export default SlackInfoModal;
