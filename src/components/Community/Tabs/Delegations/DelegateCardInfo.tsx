// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import Address from '~src/ui-components/Address';
import DelegatesProfileIcon from '~assets/icons/delegate-profile.svg';
import DelegatesProfileWhiteIcon from '~assets/icons/delegate-profile-white.svg';
import { Button, message, Modal } from 'antd';
import { chainProperties } from '~src/global/networkConstants';
import styled from 'styled-components';
import { CloseIcon, CopyIcon } from '~src/ui-components/CustomIcons';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { trackEvent } from 'analytics';
import Markdown from '~src/ui-components/Markdown';
import SocialsHandle from '~src/ui-components/SocialsHandle';
import { IDelegateAddressDetails } from '~src/types';
import { poppins } from 'pages/_app';
import classNames from 'classnames';
import { removeSymbols } from '~src/util/htmlDiff';
import ImageComponent from '~src/components/ImageComponent';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import DelegateModal from '~src/components/Listing/Tracks/DelegateModal';
import copyToClipboard from '~src/util/copyToClipboard';
import Image from 'next/image';
import { LeaderboardResponse } from 'pages/api/v1/leaderboard';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ScoreTag from '~src/ui-components/ScoreTag';
import { useTheme } from 'next-themes';

interface Props {
	delegate: IDelegateAddressDetails;
	className?: string;
	trackNum?: number;
	disabled?: boolean;
}

const DelegateCardInfo = ({ delegate, className, trackNum, disabled }: Props) => {
	// const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const currentUser = useUserDetailsSelector();
	const [open, setOpen] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [openReadMore, setOpenReadMore] = useState<boolean>(false);
	const [currentUserData, setCurrentUserData] = useState<any>();
	const [messageApi, contextHolder] = message.useMessage();
	const success = () => {
		messageApi?.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};

	console.log('delegates data: ', delegate);
	const getCurrentuserData = async () => {
		const username = delegate?.username;
		if (username) {
			try {
				const response = await nextApiClientFetch<LeaderboardResponse>('api/v1/leaderboard', { username });
				if (response?.data) {
					setCurrentUserData(response?.data?.data[0]?.profile_score);
				}
			} catch (error) {
				console?.error('Failed to fetch current user data:', error);
			}
		}
	};

	useEffect(() => {
		getCurrentuserData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [delegate?.username]);

	const renderSourceIcon = (source: any) => {
		switch (source) {
			case 'parity':
				return '/assets/icons/polkadot-logo.svg';
			case 'polkassembly':
				return '/assets/delegation-tracks/pa-logo-small-delegate.svg';
			case 'w3f':
				return '/assets/profile/w3f.svg';
			case 'nova':
				return '/assets/delegation-tracks/nova-wallet.svg';
			default:
				return '/assets/icons/individual-filled.svg';
		}
	};

	const handleClick = () => {
		// GAEvent for delegate CTA clicked
		trackEvent('delegate_cta_clicked', 'clicked_delegate_cta', {
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});
		setOpen(true);
		setAddress(address);
	};

	const handleDelegationContent = (content: string) => {
		return content?.split('\n')?.find((item: string) => item?.length > 0) || '';
	};

	const getTrimmedBio = (bio: string) => {
		if (!bio) return 'No Bio';
		return bio?.length > 100 ? `${bio?.slice(0, 100)}?.?.?.` : bio;
	};

	return (
		<div
			className={`rounded-[16px] border-[1px] border-solid border-section-light-container hover:border-pink_primary dark:border-[#3B444F] 
					dark:border-separatorDark
			${className}`}
		>
			{/* For Small Screen */}
			<div className='px-[10px] py-[5px] sm:hidden'>
				<div className=' flex items-center justify-between'>
					<div className='flex items-center gap-2 max-lg:justify-start'>
						{!!delegate?.image?.length && (
							<ImageComponent
								src={delegate?.image || ''}
								alt='image'
								className='h-8 w-8'
							/>
						)}
						<Address
							address={delegate?.address}
							displayInline
							destroyTooltipOnHide
							disableIdenticon={Boolean(delegate?.image?.length)}
							iconSize={22}
							usernameClassName='font-semibold text-sm'
							isTruncateUsername={true}
							className='flex items-center'
							usernameMaxLength={28}
						/>
					</div>
					<Button
						disabled={disabled}
						onClick={handleClick}
						className={`flex items-center space-x-[6px] border-none bg-transparent px-2 shadow-none ${!!disabled && 'opacity-50'}`}
					>
						<DelegatesProfileIcon />
					</Button>
				</div>
				<div className='flex items-center justify-between'>
					<div className='flex w-full items-center gap-1 text-xs text-bodyBlue dark:text-blue-dark-high'>
						<Address
							address={delegate?.address}
							disableHeader={network !== 'kilt'}
							iconSize={network === 'kilt' ? 26 : 20}
							disableIdenticon={true}
							addressMaxLength={5}
							addressClassName='text-xs font-normal dark:text-blue-dark-medium'
							disableTooltip
							showKiltAddress={network === 'kilt'}
						/>
						<span
							className='flex cursor-pointer items-center'
							onClick={(e) => {
								e?.preventDefault();
								copyToClipboard(delegate?.address || '');
								success();
							}}
						>
							{contextHolder}
							<CopyIcon className='-ml-[6px] scale-[60%] text-2xl text-lightBlue dark:text-icon-dark-inactive' />
						</span>
						{currentUserData && (
							<ScoreTag
								className='h-6 w-min px-[6px] py-1'
								score={currentUserData}
								iconWrapperClassName='mt-[5?.5px]'
							/>
						)}
						{delegate?.dataSource && delegate?.dataSource?.length && (
							<div className='flex gap-x-2 rounded-md bg-[#FFF7EF] px-2 py-1'>
								{delegate?.dataSource?.map((source, index) => (
									<Image
										key={index}
										src={renderSourceIcon(source)}
										alt={source}
										className={`${source === 'parity' ? 'scale-90' : ''}`}
										width={20}
										height={20}
									/>
								))}
							</div>
						)}
						{delegate?.identityInfo?.isVerified && (
							<div className='ml-auto flex items-center gap-x-1'>
								<Image
									src='/assets/icons/judgement-grey-icon.svg'
									alt='follow-icon'
									width={20}
									height={20}
									className={theme === 'dark' ? 'dark-icons scale-90' : 'scale-90'}
								/>
								<p className='m-0 p-0 text-xs font-normal text-lightBlue dark:text-blue-dark-medium'>Judgement:</p>
								<span className='m-0 p-0 text-xs font-medium text-bodyBlue dark:text-white'>{delegate?.identityInfo?.judgements?.map((item: any) => item[1])?.join(', ')}</span>
							</div>
						)}
					</div>
				</div>
				<div className={`${poppins.variable} ${poppins.className} my-[4px] h-[50px]  text-xs font-normal tracking-[0.015em] text-bodyBlue dark:text-blue-dark-high`}>
					<p className='inline text-[12px]'>{openReadMore ? delegate?.bio : getTrimmedBio(removeSymbols(delegate?.bio) || 'No bio')}</p>
					{delegate?.bio?.length > 100 && (
						<span
							onClick={() => setOpenReadMore(!openReadMore)}
							className='ml-1 cursor-pointer text-[10px] font-medium leading-3 text-[#1B61FF]'
						>
							{openReadMore ? 'Read less' : 'Read more'}
						</span>
					)}
				</div>
				<div className='mt-[6px] flex items-center gap-2'>
					<SocialsHandle
						address={address}
						onchainIdentity={delegate?.identityInfo || null}
						socials={[]}
						iconSize={12}
						boxSize={18}
					/>
				</div>
				<div className='mb-2 flex justify-between'>
					<div className={`${poppins?.variable} ${poppins?.className}`}>
						<div className={'mb-1 mt-2 text-[10px] font-normal text-textGreyColor dark:text-blue-dark-medium'}>Voting power</div>
						<span className='font-semibold'>{parseBalance(delegate?.delegatedBalance?.toString(), 1, false, network)}</span>
						<span className='mb-[3px] ml-[2px] text-[10px] font-normal dark:text-blue-dark-high'>{unit}</span>
					</div>
					<div className={`${poppins?.variable} ${poppins?.className}`}>
						<div className={'mb-1 mt-2 text-[10px] font-normal text-textGreyColor dark:text-blue-dark-medium'}>Recv&apos;d Delegation</div>

						<span className='font-semibold'>{delegate?.receivedDelegationsCount}</span>
					</div>
					<div className={`${poppins?.variable} ${poppins?.className}`}>
						<div className={'mb-1 mt-2 text-[10px] font-normal text-textGreyColor dark:text-blue-dark-medium'}>Voted proposals</div>
						<span className='font-semibold'>{delegate?.receivedDelegationsCount}</span>
					</div>
				</div>
			</div>
			{/* For Large screen */}
			<div className='hidden gap-y-2 rounded-[16px] bg-white pt-4 dark:bg-black sm:flex sm:flex-col'>
				<div className='flex items-center justify-between px-5'>
					<div className='flex items-center gap-2'>
						{!!delegate?.image?.length && (
							<ImageComponent
								src={delegate?.image || ''}
								alt=''
								className='h-8 w-8'
							/>
						)}
						<Address
							address={delegate?.address}
							displayInline
							destroyTooltipOnHide
							disableIdenticon={Boolean(delegate?.image?.length)}
							iconSize={26}
							usernameClassName='font-semibold text-xl'
							isTruncateUsername={false}
							className='flex items-center'
						/>
					</div>
					<Button
						disabled={disabled}
						onClick={handleClick}
						className={`flex items-center space-x-[6px] rounded-[26px] border border-solid border-pink_primary bg-pink_primary px-4 shadow-none ${!!disabled && 'opacity-50'}`}
					>
						<DelegatesProfileWhiteIcon />
						<span className='text-sm font-medium text-white max-sm:hidden'>Delegate</span>
					</Button>
				</div>
				<div className='flex items-center justify-between px-5'>
					<div className='flex w-full items-center gap-1 text-xs text-bodyBlue dark:text-blue-dark-high'>
						<Address
							address={delegate?.address}
							disableHeader={network !== 'kilt'}
							iconSize={network === 'kilt' ? 26 : 20}
							disableIdenticon={true}
							addressMaxLength={5}
							addressClassName='text-base font-normal dark:text-blue-dark-medium'
							disableTooltip
							showKiltAddress={network === 'kilt'}
						/>
						<span
							className='flex cursor-pointer items-center'
							onClick={(e) => {
								e?.preventDefault();
								copyToClipboard(delegate?.address || '');
								success();
							}}
						>
							{contextHolder}
							<CopyIcon className='-ml-[6px] scale-[80%] text-2xl text-lightBlue dark:text-icon-dark-inactive' />
						</span>
						{currentUserData && (
							<ScoreTag
								className='h-6 w-min px-[6px] py-1'
								score={currentUserData}
								iconWrapperClassName='mt-[5?.5px]'
							/>
						)}
						<div className='flex gap-x-2 rounded-md bg-[#FFF7EF] px-2 py-1'>
							{delegate?.dataSource?.map((source, index) => (
								<Image
									key={index}
									src={renderSourceIcon(source)}
									alt={source}
									className={`${source === 'parity' ? 'scale-90' : ''}`}
									width={20}
									height={20}
								/>
							))}
						</div>
						{delegate?.identityInfo?.isVerified && (
							<div className='ml-auto flex items-center gap-x-1'>
								<Image
									src='/assets/icons/judgement-grey-icon.svg'
									alt='follow-icon'
									width={20}
									height={20}
									className={theme === 'dark' ? 'dark-icons scale-90' : 'scale-90'}
								/>
								<p className='m-0 p-0 text-xs font-normal text-lightBlue dark:text-blue-dark-medium'>Judgement:</p>
								<span className='m-0 p-0 text-xs font-medium text-bodyBlue dark:text-white'>{delegate?.identityInfo?.judgements?.map((item: any) => item[1])?.join(', ')}</span>
							</div>
						)}
					</div>
				</div>
				<div className={'mb-4 mt-2  flex h-10 gap-1 pl-5 text-sm font-normal tracking-[0.015em] text-bodyBlue dark:text-blue-dark-high'}>
					<p className='bio w-4/5'>
						{delegate?.bio ? (
							<Markdown
								className='post-content'
								md={`${handleDelegationContent(delegate?.bio || '').slice(0, 54)}...`}
								isPreview={true}
								imgHidden
							/>
						) : (
							'No Bio'
						)}
					</p>
					{delegate?.bio?.length > 100 && (
						<span
							onClick={() => setOpenReadMore(true)}
							className='mt-1 flex cursor-pointer items-center justify-center text-[10px] font-medium leading-3 text-[#1B61FF]'
						>
							Read more
						</span>
					)}
				</div>
				<div className='flex items-center gap-2 px-5 py-3'>
					<SocialsHandle
						address={delegate?.address}
						onchainIdentity={delegate?.identityInfo || null}
						socials={[]}
						isUsedInCommunityTab
						iconSize={18}
						boxSize={32}
					/>
				</div>
				<div className=' flex min-h-[92px] justify-between border-0 border-t-[1px] border-solid  border-section-light-container dark:border-[#3B444F] dark:border-separatorDark '>
					<div className='mt-1 flex w-[33%] flex-col items-center py-3 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
						<div className='flex flex-wrap items-end justify-center'>
							<span className='px-1 text-2xl font-semibold'>{parseBalance(delegate?.delegatedBalance?.toString(), 2, false, network)}</span>
							<span className='mb-[3px] text-sm font-normal dark:text-blue-dark-high'>{unit}</span>
						</div>
						<div className='mt-[4px] text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>Voting power</div>
					</div>
					<div className='flex w-[33%] flex-col items-center border-0 border-x-[1px] border-solid border-section-light-container py-3  text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:text-blue-dark-high'>
						<span className='text-2xl font-semibold'>{delegate?.votedProposalsCount}</span>
						<div className='mt-[2px] flex flex-col items-center'>
							<span className='mb-[2px] text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>Voted proposals </span>
							<span className='text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>(Past 30 days)</span>
						</div>
					</div>
					<div className='flex w-[33%] flex-col items-center py-3 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
						<span className='text-2xl font-semibold text-bodyBlue dark:text-blue-dark-high'>{delegate?.receivedDelegationsCount}</span>
						<span className='mb-[2px] mt-1 text-center text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>Received Delegation</span>
					</div>
				</div>
			</div>
			<DelegateModal
				defaultTarget={delegate?.address}
				open={open}
				trackNum={trackNum}
				setOpen={setOpen}
			/>
			<Modal
				open={openReadMore}
				onCancel={() => setOpenReadMore(false)}
				className={classNames('modal w-[725px] max-md:w-full dark:[&>?.ant-modal-content]:bg-section-dark-overlay', poppins?.className, poppins?.variable)}
				footer={false}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			>
				<div className={' sm:pt-[20px]'}>
					<div className='hidden items-center justify-between pt-2 sm:flex sm:pl-8'>
						<div className='flex items-center gap-2 max-lg:justify-start'>
							<Address
								address={delegate?.address}
								displayInline
								iconSize={26}
								isTruncateUsername={false}
								usernameClassName='text-[20px] font-medium'
							/>

							<div className='mr-2 flex items-center gap-2'>
								<SocialsHandle
									address={address}
									onchainIdentity={delegate?.identityInfo || null}
									socials={[]}
									iconSize={18}
									boxSize={32}
								/>
							</div>
						</div>
					</div>

					<div className='p-4 sm:hidden'>
						<div className='flex items-center gap-2 max-lg:justify-start'>
							<Address
								address={delegate?.address}
								displayInline
								iconSize={26}
								isTruncateUsername={false}
								usernameClassName='text-[20px] font-medium'
							/>
						</div>
					</div>

					<div
						className={`${poppins?.variable} ${poppins?.className} flex h-8 max-h-8 gap-1 px-[46px] text-sm tracking-[0.015em] text-[#576D8B] dark:text-blue-dark-high max-sm:-mt-2 sm:mt-4 sm:px-0 sm:pl-[56px]`}
					>
						<p className='m-0 w-full p-0 sm:w-[90%] '>
							{delegate?.bio ? (
								<Markdown
									className='post-content'
									md={delegate?.bio}
									isPreview={true}
									imgHidden
								/>
							) : (
								<p className='m-0 p-0 text-lightBlue opacity-60'>No Bio</p>
							)}
						</p>
					</div>
					<div className='-mt-3 mb-4 flex items-center px-[46px] sm:hidden'>
						<SocialsHandle
							address={address}
							onchainIdentity={delegate?.identityInfo || null}
							socials={[]}
							iconSize={16}
							boxSize={30}
						/>
					</div>
					<div className='flex min-h-[82px] justify-between border-0 border-t-[1px] border-solid border-section-light-container  dark:border-[#3B444F] dark:border-separatorDark  sm:min-h-[92px] '>
						<div className='pt-1?.5 flex w-[33%] flex-col items-center text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
							<div className={`${poppins?.variable} ${poppins?.className} flex items-center justify-center gap-1`}>
								{parseBalance(delegate?.delegatedBalance?.toString(), 1, false, network)}
								<span className='mt-1 text-xs font-normal text-bodyBlue dark:text-blue-dark-high sm:text-sm'>{unit}</span>
							</div>
							<div className='w-[50%] text-center text-[10px] font-normal text-[#576D8B] dark:text-blue-dark-medium sm:w-full sm:text-xs'>Voting power</div>
						</div>
						<div className='pt-1?.5 flex w-[33%] flex-col items-center border-0 border-x-[1px] border-solid border-section-light-container  text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:text-blue-dark-high'>
							{delegate?.votedProposalsCount}
							<span className='text-[10px] font-normal text-[#576D8B] dark:text-blue-dark-medium sm:text-xs'>Voted proposals </span>
							<span className='text-[10px] font-normal text-[#576D8B] dark:text-blue-dark-medium sm:text-xs'>(Past 30 days)</span>
						</div>
						<div className='pt-1?.5 flex w-[33%] flex-col items-center text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
							{delegate?.receivedDelegationsCount}
							<span className='mb-[2px] w-[55%] text-center text-[10px] font-normal text-[#576D8B] dark:text-blue-dark-medium sm:w-full sm:text-xs'>Received Delegation</span>
						</div>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default styled(DelegateCardInfo)`
	?.bio {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		width: 250px;
		overflow: hidden;
	}
	?.modal ?.ant-modal-content {
		padding: 0px 0px !important;
		border-radius: 14px !important;
		box-shadow: 0px 4px 6px rgba(0, 0, 0, 0?.08) !important;
	}
`;
