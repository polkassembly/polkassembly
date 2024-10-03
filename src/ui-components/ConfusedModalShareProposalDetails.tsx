// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal, message as antdMessage } from 'antd';
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
		const twitterHandle = socialsData?.twitter && socialsData.twitter.length > 0 ? socialsData.twitter.substring(socialsData.twitter.lastIndexOf('/') + 1) : 'polk_gov';
		const tweetMessage = `${message} \nCheck out this proposal here: ${global.window.location.href}`;
		const twitterParameters = [`text=${encodeURI(tweetMessage)}`, 'via=' + encodeURI(twitterHandle || 'polk_gov')];
		const url = 'https://twitter.com/intent/tweet?' + twitterParameters.join('&');
		global.window.open(url);
	};

	const copyLinkToClipboard = () => {
		const link = global.window.location.href;
		const textMessage = message || 'Hey, check out this proposal and help me make a decision.';
		const finalMessage = `${textMessage} \n${link}`;
		navigator.clipboard.writeText(finalMessage);
		antdMessage.success('Link and message copied to clipboard!');
	};

	return (
		<StyledModal
			open={modalOpen}
			onCancel={() => setModalOpen(false)}
			closeIcon={<CloseIcon className='text-lightBlue' />}
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
					<p className='-mt-4 text-xl font-semibold text-[#243A57]'>Confusion everywhere, It&apos;s a Menace!</p>
				</div>
				<div className='mx-auto -mt-3'>
					<div className='relative h-12 w-[480px]'>
						<ImageIcon
							src='/assets/confusedmodalShareProposalDetails/comment.svg'
							alt='Confusion Icon'
							className=' -ml-5  w-[520px] '
						/>
						<div className='absolute inset-0 left-5 top-5 z-10 '>
							<div className=''>
								<p className='font-poppins text-[14px] text-[#485F7D]'>Add a message</p>
							</div>
							<input
								type='text'
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								placeholder='Hey check out this proposal and help me make a decision.'
								className=' h-8 w-[450px] rounded-sm border-[1px] border-[#D2D8E0] px-5 py-2.5 outline-none'
							/>
						</div>
					</div>
				</div>
				<div className='mt-24 flex justify-center gap-5'>
					<div onClick={shareOnTwitter}>
						<ImageIcon
							src='/assets/confusedmodalShareProposalDetails/x.svg'
							alt='Share on Twitter'
							className='h-auto w-auto cursor-pointer'
						/>
					</div>
					<div onClick={copyLinkToClipboard}>
						<ImageIcon
							src='/assets/confusedmodalShareProposalDetails/link.svg'
							alt='Copy Link'
							className='h-auto w-auto cursor-pointer'
						/>
					</div>
				</div>
			</div>
		</StyledModal>
	);
};

const StyledModal = styled(Modal)``;

export default ConfusedModalShareProposalDetails;
