// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Divider, message, Modal } from 'antd';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ContentForm from '../ContentForm';
import ImageIcon from '~src/ui-components/ImageIcon';
import { useTheme } from 'next-themes';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { NetworkSocials } from '~src/types';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { trackEvent } from 'analytics';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { onchainIdentitySupportedNetwork } from '../AppLayout';
import dynamic from 'next/dynamic';

const OnchainIdentity = dynamic(() => import('~src/components/OnchainIdentity'), {
	ssr: false
});
const NotAExpertModal = ({ isModalVisible, handleCancel, isVerified }: { isModalVisible: boolean; handleCancel: () => void; isVerified: boolean }) => {
	const [open, setOpen] = useState<boolean>(false);
	const [identityMobileModal, setIdentityMobileModal] = useState<boolean>(false);
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);

	const [successSubmission, setSuccessSubmission] = useState(false);
	const [contribution, setContribution] = useState('');
	const { network } = useNetworkSelector();
	const [reason, setReason] = useState('');
	const { resolvedTheme: theme } = useTheme();
	const currentUser = useUserDetailsSelector();
	const [isInitial, setIsInitial] = useState(true);
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
		if (error) message.error('Failed to load social media data. Please try again later.');
	};

	useEffect(() => {
		getSocials();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	const handleContributionSubmit = () => {
		if (contribution.trim() === '') {
			message.error('Please provide some contributions.');
			return;
		}
		setSuccessSubmission(true);
		setContribution('');
		setReason('');
	};

	const shareOnTwitter = () => {
		trackEvent('post_share_clicked', 'share_post', {
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});

		const twitterHandle = socialsData?.twitter ? new URL(socialsData.twitter).pathname.replace('/', '') || 'polk_gov' : 'polk_gov';
		const tweetMessage = '🎉 Just submitted my expert application to Polkassembly! Excited for the journey ahead! 🚀';
		const twitterParameters = [`text=${encodeURI(tweetMessage)}`, 'via=' + encodeURI(twitterHandle)];
		const url = `https://twitter.com/intent/tweet?${twitterParameters.join('&')}`;
		window.open(url);
	};

	const copyLinkToClipboard = () => {
		const finalMessage = '🎉 Just submitted my expert application to Polkassembly! Excited for the journey ahead! 🚀';
		navigator.clipboard
			.writeText(finalMessage)
			.then(() => {
				message.success('Message copied to clipboard!');
			})
			.catch(() => {
				message.error('Failed to copy link to clipboard. Please try again.');
			});
	};

	const handleBecomeExpert = () => {
		setIsInitial(false);
	};
	const isMobile = typeof window !== 'undefined' && window.screen.width < 1024;

	const handleIdentityButtonClick = () => {
		const address = localStorage.getItem('identityAddress');
		if (isMobile) {
			setIdentityMobileModal(true);
		} else {
			if (address?.length) {
				setOpen(!open);
			} else {
				setOpenAddressLinkedModal(true);
			}
		}
	};
	const renderContent = () => {
		if (isInitial) {
			return (
				<>
					<Image
						src='/assets/Gifs/login-vote.gif'
						alt={'Expert Image'}
						width={100}
						height={100}
						className='-my-8 mx-auto block h-64 w-64'
					/>
					<div className='my-3 flex flex-col gap-1 text-center text-[#243A57]'>
						<span className='text-xl font-semibold'>Oops! Looks like you are not an expert!</span>
						<span className='px-10 text-sm'>Become an expert to add your views to various proposals and discussions!</span>
					</div>
					<div className='pb-3 text-center'>
						<Button
							className='h-10 w-96 bg-[#E5007A] text-white'
							onClick={handleBecomeExpert}
						>
							Become an expert!
						</Button>
					</div>
				</>
			);
		} else if (successSubmission) {
			return (
				<>
					<Image
						src={'/assets/Gifs/voted.gif'}
						alt='success icon'
						className='mx-auto -mt-44 block'
						width={293}
						height={327}
					/>
					<div className='-mt-5 flex flex-col gap-2'>
						<span className='text-center text-2xl font-semibold text-[#243A57]'>Congratulations!</span>
						<span className='px-8 text-center'>Your application has been submitted. It may take 3-5 days to review your application!</span>
					</div>
					<Divider
						type='horizontal'
						className='m-0 my-3 rounded-sm border-t-2 border-l-[#D2D8E0] p-0 dark:border-[#4B4B4B]'
					/>
					<div className='flex justify-center gap-5'>
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
				</>
			);
		} else {
			if (!isVerified) {
				return (
					<>
						<Image
							src='/assets/Gifs/login-vote.gif'
							alt={'Expert Image'}
							width={100}
							height={100}
							className='-my-8 mx-auto block h-64 w-64'
						/>
						<div className='my-3 flex flex-col gap-1 text-center text-[#243A57]'>
							<span className='text-xl font-semibold'>Oops! Your identity is not verified!</span>
							<span className='px-10 text-sm'>
								You need to{' '}
								<span
									onClick={(e) => {
										e.stopPropagation();
										e.preventDefault();
										if (typeof currentUser?.id === 'number' && !Number.isNaN(currentUser.id) && currentUser?.username) {
											trackEvent('set_onchain_identity_clicked', 'opened_identity_verification', {
												userId: currentUser.id.toString(),
												userName: currentUser.username
											});
											handleIdentityButtonClick();
										} else {
											setLoginOpen(true);
										}
									}}
									className='cursor-pointer font-semibold text-pink_primary underline'
								>
									verify your identity
								</span>{' '}
								before applying to become an expert.
							</span>
						</div>
						<div className='pb-3 text-center'>
							<Button
								className='h-10 w-96 bg-pink_primary text-white'
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									if (typeof currentUser?.id === 'number' && !Number.isNaN(currentUser.id) && currentUser?.username) {
										trackEvent('set_onchain_identity_clicked', 'opened_identity_verification', {
											userId: currentUser.id.toString(),
											userName: currentUser.username
										});
										handleIdentityButtonClick();
									} else {
										setLoginOpen(true);
									}
								}}
							>
								Verify Identity
							</Button>
						</div>
					</>
				);
			} else {
				return (
					<>
						<p className='mt-5 text-sm font-medium text-[#243A57]'>Why do you want to become an expert?</p>
						<ContentForm
							value={reason}
							onChange={(content: any) => setReason(content)}
							height={150}
						/>
						<p className='text-sm font-medium text-[#243A57]'>Share any relevant contributions you&apos;ve made in the past for the Polkadot ecosystem.</p>
						<ContentForm
							value={contribution}
							onChange={(content: any) => setContribution(content)}
							height={150}
						/>

						<div className='pt-4 text-right'>
							<Button
								className='mr-[8px] h-9 w-28 border-pink_primary text-pink_primary'
								onClick={handleCancel}
							>
								Cancel
							</Button>
							<Button
								className='h-9 w-28 bg-pink_primary text-white'
								onClick={handleContributionSubmit}
							>
								Submit
							</Button>
						</div>
					</>
				);
			}
		}
	};

	return (
		<div>
			<Modal
				title={
					!successSubmission && (
						<div className='flex items-center gap-2'>
							<Image
								src='/assets/icons/mentoring.svg'
								alt={'Expert Image'}
								width={24}
								height={24}
								className='h-6 w-6'
							/>
							<span className='text-xl font-semibold'>Add Expert Review</span>
						</div>
					)
				}
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={null}
			>
				{!successSubmission && (
					<Divider
						type='horizontal'
						className='m-0 rounded-sm border-t-2 border-l-[#D2D8E0] p-0 dark:border-[#4B4B4B]'
					/>
				)}
				{renderContent()}
			</Modal>
			{onchainIdentitySupportedNetwork.includes(network) && (
				<OnchainIdentity
					open={open}
					setOpen={setOpen}
					openAddressModal={openAddressLinkedModal}
					setOpenAddressModal={setOpenAddressLinkedModal}
				/>
			)}
			<SignupPopup
				setLoginOpen={setLoginOpen}
				modalOpen={openSignup}
				setModalOpen={setSignupOpen}
				isModal={true}
			/>
			<LoginPopup
				setSignupOpen={setSignupOpen}
				modalOpen={openLogin}
				setModalOpen={setLoginOpen}
				isModal={true}
			/>

			<Modal
				zIndex={100}
				open={identityMobileModal}
				footer={false}
				closeIcon={<CloseIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />}
				onCancel={() => setIdentityMobileModal(false)}
				className={'w-[600px] max-sm:w-full'}
				title={<span className='-mx-6 flex items-center gap-2 border-0 border-b-[1px] border-solid border-[#E1E6EB] px-6 pb-3 text-xl font-semibold'>On-chain identity</span>}
				wrapClassName='dark:bg-modalOverlayDark'
			>
				<div className='flex flex-col items-center gap-6 py-4 text-center'>
					<ImageIcon
						src='/assets/icons/delegation-empty-state.svg'
						alt='delegation empty state icon'
					/>
					<span className='dark:text-white'>Please use your desktop computer to verify on chain identity</span>
				</div>
			</Modal>
		</div>
	);
};

export default NotAExpertModal;