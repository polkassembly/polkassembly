// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Modal, message as antdMessage } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { CloseIcon } from './CustomIcons';
import ImageIcon from './ImageIcon';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { NetworkSocials } from '~src/types';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ProposalType } from '~src/global/proposalType';
import { trackEvent } from 'analytics';
import { useTheme } from 'next-themes';
import { poppins } from 'pages/_app';

interface Props {
	modalOpen: boolean;
	setModalOpen: (pre: boolean) => void;
	className?: string;
	postId: number | string;
	proposalType: ProposalType;
	title?: string;
}

const ConfusedModalShareProposalDetails = ({ modalOpen, setModalOpen, className, postId, proposalType, title }: Props) => {
	const [message, setMessage] = useState<string>('');
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const currentUser = useUserDetailsSelector();
	const [socialsData, setSocialsData] = useState<NetworkSocials>({
		block_explorer: '',
		description: '',
		discord: '',
		github: '',
		homepage: '',
		reddit: '',
		telegram: '',
		twitter: '',
		youtube: ''
	});

	const getSocials = async () => {
		const { data, error } = await nextApiClientFetch<NetworkSocials>('/api/v1/network-socials', {
			network
		});
		if (data) {
			setSocialsData(data);
		}
		if (error) antdMessage.error('Failed to load social media data. Please try again later.');
	};

	useEffect(() => {
		getSocials();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	const shareOnTwitter = () => {
		trackEvent('post_share_clicked', 'share_post', {
			postId: postId,
			postTitle: title,
			proposalType: proposalType,
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});

		const twitterHandle = socialsData?.twitter ? new URL(socialsData.twitter).pathname.replace('/', '') || 'polk_gov' : 'polk_gov';
		const tweetMessage = `${message} \nCheck out this proposal here: ${window.location.href}`;
		const twitterParameters = [`text=${encodeURI(tweetMessage)}`, 'via=' + encodeURI(twitterHandle || 'polk_gov')];
		const url = `https://twitter.com/intent/tweet?${twitterParameters.join('&')}`;
		window.open(url);
	};

	const copyLinkToClipboard = () => {
		const link = window.location.href;
		const textMessage = message;
		const finalMessage = `${textMessage}\n 'Check out this proposal here:' \n${link}`;

		navigator.clipboard
			.writeText(finalMessage)
			.then(() => {
				antdMessage.success('Link and message copied to clipboard!');
			})
			.catch(() => {
				antdMessage.error('Failed to copy link to clipboard. Please try again.');
			});
	};

	return (
		<StyledModal
			open={modalOpen}
			onCancel={() => setModalOpen(false)}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-[#9E9E9E]' />}
			centered
			zIndex={1002}
			className={className}
			footer={null}
		>
			<div className='flex flex-col justify-center pb-5 pt-10'>
				<div className='mx-auto -mt-72'>
					<Image
						src='/assets/Gifs/confused.gif'
						alt='Confusion GIF'
						width={320}
						height={320}
					/>
					<p className={`-mt-4 text-xl ${poppins.className} ${poppins.variable} font-semibold text-[#243A57] dark:text-blue-dark-high`}>
						Confusion everywhere, It&apos;s a Menace!
					</p>
				</div>
				<div className='mx-auto -mt-3'>
					<div className='relative h-12 w-[480px]'>
						<ImageIcon
							src={`${theme === 'dark' ? '/assets/confusedmodalShareProposalDetails/dark-comment.svg' : '/assets/confusedmodalShareProposalDetails/comment.svg'}`}
							alt='Confusion Icon'
							className=' -ml-5  w-[520px] '
						/>
						<div className='absolute inset-0 left-5 top-5 z-10 '>
							<div className=''>
								<p className='font-poppins text-[14px] text-[#485F7D]  dark:text-[#7D7C81]'>Add a message</p>
							</div>
							<textarea
								name='content'
								className={
									'suffixColor input-container -mt-1 max-h-10  w-[450px] flex-1 resize-none rounded-[4px] border-[1px] text-sm outline-none hover:border-pink_primary focus:border-pink_primary dark:border-[#3B444F] dark:text-blue-dark-high'
								}
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								placeholder={'Hey check out this proposal and help me make a decision.'}
								style={{ border: '1px solid #D2D8E0', padding: '8px 8px' }}
							/>
						</div>
					</div>
				</div>
				<div className='mt-24 flex justify-center gap-5'>
					<Button
						className='flex h-[40px] w-[40px] items-center justify-center rounded-lg border-none bg-[#FEF2F8] dark:bg-[#33071E]'
						onClick={shareOnTwitter}
					>
						<ImageIcon
							src={theme === 'dark' ? '/assets/icons/x-icon-pink-dark.svg' : '/assets/icons/x-icon-pink.svg'}
							alt='twitter-icon'
						/>
					</Button>
					<Button
						className='flex h-[40px] w-[40px] items-center justify-center rounded-lg border-none bg-[#FEF2F8] dark:bg-[#33071E]'
						onClick={copyLinkToClipboard}
					>
						<ImageIcon
							src={theme === 'dark' ? '/assets/icons/copy-pink-dark.svg' : '/assets/icons/copy-pink.svg'}
							alt='copy-icon'
						/>
					</Button>
				</div>
			</div>
		</StyledModal>
	);
};

const StyledModal = styled(Modal)``;

export default ConfusedModalShareProposalDetails;
