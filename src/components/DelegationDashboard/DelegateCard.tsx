// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import Address from '~src/ui-components/Address';
import DelegatesProfileIcon from '~assets/icons/delegate-profile.svg';
import { Button, Divider, Modal } from 'antd';
import DelegateModal from '../Listing/Tracks/DelegateModal';
import { chainProperties } from '~src/global/networkConstants';
import styled from 'styled-components';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { trackEvent } from 'analytics';
import Markdown from '~src/ui-components/Markdown';
import SocialsHandle from '~src/ui-components/SocialsHandle';
import { parseBalance } from '../Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { IDelegateAddressDetails } from '~src/types';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { poppins } from 'pages/_app';
import classNames from 'classnames';
import ImageComponent from '../ImageComponent';
import { removeSymbols } from '~src/util/htmlDiff';
import { useTranslation } from 'react-i18next';

interface Props {
	delegate: IDelegateAddressDetails;
	className?: string;
	trackNum?: number;
	disabled?: boolean;
}

enum EDelegateSource {
	PARITY = 'parity',
	POLKASSEMBLY = 'polkassembly',
	W3F = 'w3f',
	NOVA = 'nova'
}

const DelegateCard = ({ delegate, className, trackNum, disabled }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation();
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const [open, setOpen] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [openReadMore, setOpenReadMore] = useState<boolean>(false);
	const [isMobile, setIsMobile] = useState<boolean>(false);

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
		return content.split('\n').find((item: string) => item.length > 0) || '';
	};

	const getTrimmedBio = (bio: string) => {
		if (!bio) return t('No Bio');
		return bio.length > 100 ? `${bio.slice(0, 100)}...` : bio;
	};

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 640);
		handleResize();

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div
			className={`rounded-[6px] border-[1px] border-solid border-section-light-container hover:border-pink_primary  dark:border-[#3B444F] 
					dark:border-separatorDark
			${className}`}
		>
			{delegate?.dataSource?.length > 1 ? (
				<div
					className={`ml-[-0.6px] mr-[-0.6px] mt-[-0.5px] flex h-8 items-center space-x-[7px] rounded-t-md border-[1px] border-solid px-3 sm:space-x-3 sm:px-5 ${
						delegate?.dataSource.length > 1
							? 'border-[#485F7D] bg-[#EDEFF3] dark:border-[#9E9E9E] dark:bg-[#3D3F41]'
							: 'border-[#F89118] bg-[#FFF7EF] dark:border-[#F89118] dark:bg-[#422A0D]'
					} `}
				>
					{!!delegate?.dataSource?.includes(EDelegateSource.POLKASSEMBLY) && (
						<div className='flex items-center space-x-2 sm:space-x-3'>
							<div className='flex items-center space-x-1'>
								<Image
									src={'/assets/delegation-tracks/pa-logo-small-delegate.svg'}
									height={isMobile ? 20 : 22}
									width={isMobile ? 20 : 22}
									alt=''
								/>
								<span className={`${poppins.variable} ${poppins.className} text-[10px] font-normal text-bodyBlue dark:text-blue-dark-high sm:text-xs`}>{t('Polkassembly')}</span>
							</div>
							<Divider
								type='vertical'
								className='bg-[#7F8FA4]'
							/>
						</div>
					)}

					{!!delegate?.dataSource?.includes(EDelegateSource.W3F) && (
						<div className='flex items-center space-x-2 sm:space-x-3'>
							<div className='flex items-center space-x-1'>
								<Image
									src={'/assets/profile/w3f.svg'}
									height={isMobile ? 20 : 22}
									width={isMobile ? 20 : 22}
									alt=''
								/>
								<span className={`${poppins.variable} ${poppins.className} text-[10px] font-normal text-bodyBlue dark:text-blue-dark-high sm:text-xs`}>{t('W3f')}</span>
							</div>
							<Divider
								type='vertical'
								className='bg-[#7F8FA4]'
							/>
						</div>
					)}
					{!!delegate?.dataSource?.includes(EDelegateSource.PARITY) && (
						<div className='flex items-center space-x-2 sm:space-x-3'>
							<div className='flex items-center space-x-[6px]'>
								<Image
									src={'/assets/icons/polkadot-logo.svg'}
									height={isMobile ? 18 : 22}
									width={isMobile ? 18 : 22}
									alt=''
								/>
								<span className={`${poppins.variable} ${poppins.className} text-[10px] font-normal text-bodyBlue dark:text-blue-dark-high sm:text-xs`}>{t('Polkadot')}</span>
							</div>
							{!(delegate?.dataSource.includes(EDelegateSource.W3F) && delegate?.dataSource.length === 2) && (
								<Divider
									type='vertical'
									className='bg-[#7F8FA4]'
								/>
							)}
						</div>
					)}
					{!!delegate?.dataSource?.includes(EDelegateSource.NOVA) && (
						<div className='flex items-center space-x-1 '>
							<Image
								src={'/assets/delegation-tracks/nova-wallet.svg'}
								height={isMobile ? 20 : 22}
								width={isMobile ? 20 : 22}
								alt=''
							/>
							<span className={`${poppins.variable} ${poppins.className} text-[10px] font-normal text-bodyBlue dark:text-blue-dark-high sm:text-xs`}>{t('Nova Wallet')}</span>
						</div>
					)}
				</div>
			) : (
				<>
					{!!delegate?.dataSource?.includes(EDelegateSource.W3F) && (
						<div className='ml-[-0.6px] mr-[-0.6px] mt-[-1px] flex h-8 items-center gap-1 rounded-t-md bg-[#272525] px-3 sm:px-5'>
							<Image
								src={'/assets/profile/w3f.svg'}
								height={isMobile ? 20 : 22}
								width={isMobile ? 20 : 22}
								alt=''
							/>
							<span className={`${poppins.variable} ${poppins.className} text-[10px] font-normal text-blue-dark-high sm:text-xs`}>{t('W3F Delegate')}</span>
						</div>
					)}
					{!!delegate?.dataSource?.includes(EDelegateSource.NOVA) && (
						<div className='ml-[-0.6px] mr-[-0.6px] mt-[-1px] flex h-8 items-center gap-1 rounded-t-md border-[1px] border-solid border-[#3C74E1] bg-[#e2eafb] px-5 dark:bg-[#141C2D]'>
							<Image
								src={'/assets/delegation-tracks/nova-wallet.svg'}
								height={isMobile ? 20 : 22}
								width={isMobile ? 20 : 22}
								alt=''
							/>
							<span className={`${poppins.variable} ${poppins.className} text-[10px] font-normal text-bodyBlue dark:text-blue-dark-high sm:text-xs`}>
								{t('Nova Wallet Delegate')}
							</span>
						</div>
					)}
					{!!delegate?.dataSource?.includes(EDelegateSource.PARITY) && (
						<div className='ml-[-0.6px] mr-[-0.6px] mt-[-1px] flex h-8 items-center space-x-[6px] rounded-t-md border-[1px] border-solid border-[#7A67DF] bg-[#E4E1F9] px-3 dark:bg-[#25203D] sm:px-5'>
							<Image
								src={'/assets/icons/polkadot-logo.svg'}
								height={isMobile ? 18 : 22}
								width={isMobile ? 18 : 22}
								alt=''
							/>
							<span className={`${poppins.variable} ${poppins.className} text-[10px] font-normal text-bodyBlue dark:text-blue-dark-high sm:text-xs`}>{t('Polkadot Delegate')}</span>
						</div>
					)}
					{!!delegate?.dataSource?.includes(EDelegateSource.POLKASSEMBLY) && (
						<div className='ml-[-0.6px] mr-[-0.6px] mt-[-1px] flex h-8 items-center gap-1 rounded-t-md border-[1px] border-solid border-pink_primary bg-[#FCE5F2] px-5 dark:bg-[#33071E]'>
							<Image
								src={'/assets/delegation-tracks/pa-logo-small-delegate.svg'}
								height={isMobile ? 20 : 22}
								width={isMobile ? 20 : 22}
								alt=''
							/>
							<span className={`${poppins.variable} ${poppins.className} text-[10px] font-normal text-bodyBlue dark:text-blue-dark-high sm:text-xs`}>
								{t('Polkassembly Delegate')}
							</span>
						</div>
					)}
					{!delegate?.dataSource && (
						<div className='ml-[-0.6px] mr-[-0.6px] mt-[-1px] flex h-8 items-center gap-1 rounded-t-md border-[1px] border-solid bg-[#FCE5F2] px-3 dark:bg-section-dark-background sm:px-5'>
							<Image
								src={'/assets/icons/individual-filled.svg'}
								height={isMobile ? 19 : 20}
								width={isMobile ? 19 : 20}
								alt=''
								className={theme == 'dark' ? 'dark-icons' : ''}
							/>
							<span className={`${poppins.variable} ${poppins.className} text-[10px] font-normal tracking-wide text-bodyBlue dark:text-blue-dark-high sm:text-xs`}>
								{t('Individual')}
							</span>
						</div>
					)}
				</>
			)}
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
				<div className={`${poppins.variable} ${poppins.className} my-[4px] h-[50px] text-xs font-normal tracking-[0.015em] text-bodyBlue dark:text-blue-dark-high`}>
					<p className='inline text-[12px]'>{openReadMore ? delegate?.bio : getTrimmedBio(removeSymbols(delegate?.bio) || t('No Bio'))}</p>
					{delegate?.bio?.length > 100 && (
						<span
							onClick={() => setOpenReadMore(!openReadMore)}
							className='ml-1 cursor-pointer text-[10px] font-medium leading-3 text-[#1B61FF]'
						>
							{openReadMore ? t('Read less') : t('Read more')}
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
					<div className={`${poppins.variable} ${poppins.className}`}>
						<div className={'mb-1 mt-2 text-[10px] font-normal text-textGreyColor dark:text-blue-dark-medium'}>{t('Voting power')}</div>
						<span className='font-semibold'>{parseBalance(delegate?.delegatedBalance.toString(), 1, false, network)}</span>
						<span className='mb-[3px] ml-[2px] text-[10px] font-normal dark:text-blue-dark-high'>{unit}</span>
					</div>
					<div className={`${poppins.variable} ${poppins.className}`}>
						<div className={'mb-1 mt-2 text-[10px] font-normal text-textGreyColor dark:text-blue-dark-medium'}>{t("Recv'd Delegation")}</div>
						<span className='font-semibold'>{delegate?.receivedDelegationsCount}</span>
					</div>
					<div className={`${poppins.variable} ${poppins.className}`}>
						<div className={'mb-1 mt-2 text-[10px] font-normal text-textGreyColor dark:text-blue-dark-medium'}>{t('Voted proposals')}</div>
						<span className='font-semibold'>{delegate?.receivedDelegationsCount}</span>
					</div>
				</div>
			</div>
			{/* For Large screen */}
			<div className='hidden sm:flex sm:flex-col'>
				<div className='flex items-center justify-between px-5 pt-4'>
					<div className='flex items-center gap-2 max-lg:justify-start'>
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
							usernameClassName='font-semibold'
							isTruncateUsername={false}
							className='flex items-center'
						/>
						<div className='mr-2 flex items-center gap-2'>
							<SocialsHandle
								address={delegate?.address}
								onchainIdentity={delegate?.identityInfo || null}
								socials={[]}
								iconSize={18}
								boxSize={32}
							/>
						</div>
					</div>
					<Button
						disabled={disabled}
						onClick={handleClick}
						className={`flex items-center space-x-[6px] border-none bg-transparent px-2 shadow-none ${!!disabled && 'opacity-50'}`}
					>
						<DelegatesProfileIcon />
						<span className='text-sm font-medium text-pink_primary max-sm:hidden'>{t('Delegate')}</span>
					</Button>
				</div>
				<div className={'mb-4 mt-2 flex h-10 gap-1 pl-5 text-sm font-normal tracking-[0.015em] text-bodyBlue dark:text-blue-dark-high'}>
					<p className='bio w-4/5'>
						{delegate?.bio ? (
							<Markdown
								className='post-content'
								md={`${handleDelegationContent(delegate?.bio || '').slice(0, 54)}...`}
								isPreview={true}
								imgHidden
							/>
						) : (
							t('No Bio')
						)}
					</p>
					{delegate?.bio?.length > 100 && (
						<span
							onClick={() => setOpenReadMore(true)}
							className='mt-1 flex cursor-pointer items-center justify-center text-[10px] font-medium leading-3 text-[#1B61FF]'
						>
							{t('Read more')}
						</span>
					)}
				</div>
				<div className='flex min-h-[92px] justify-between border-0 border-t-[1px] border-solid border-section-light-container dark:border-[#3B444F] dark:border-separatorDark'>
					<div className='mt-1 flex w-[33%] flex-col items-center py-3 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
						<div className='flex flex-wrap items-end justify-center'>
							<span className='px-1 text-2xl font-semibold'>{parseBalance(delegate?.delegatedBalance.toString(), 2, false, network)}</span>
							<span className='mb-[3px] text-sm font-normal dark:text-blue-dark-high'>{unit}</span>
						</div>
						<div className='mt-[4px] text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>{t('Voting power')}</div>
					</div>
					<div className='flex w-[33%] flex-col items-center border-0 border-x-[1px] border-solid border-section-light-container py-3 text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:text-blue-dark-high'>
						<span className='text-2xl font-semibold'>{delegate?.votedProposalsCount}</span>
						<div className='mt-[2px] flex flex-col items-center'>
							<span className='mb-[2px] text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>{t('Voted proposals')}</span>
							<span className='text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>({t('Past 30 days')})</span>
						</div>
					</div>
					<div className='flex w-[33%] flex-col items-center py-3 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
						<span className='text-2xl font-semibold text-bodyBlue dark:text-blue-dark-high'>{delegate?.receivedDelegationsCount}</span>
						<span className='mb-[2px] mt-1 text-center text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>{t('Received Delegation')}</span>
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
				className={classNames('modal w-[725px] max-md:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay', poppins.className, poppins.variable)}
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
						className={`${poppins.variable} ${poppins.className} flex min-h-[56px] gap-1 px-[46px] text-sm tracking-[0.015em] text-[#576D8B] dark:text-blue-dark-high max-sm:-mt-2 sm:mt-4 sm:px-0 sm:pl-[56px]`}
					>
						<p className='w-full sm:w-[90%]'>
							{delegate?.bio ? (
								<Markdown
									className='post-content'
									md={delegate?.bio}
									isPreview={true}
									imgHidden
								/>
							) : (
								t('No Bio')
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
					<div className='flex min-h-[82px] justify-between border-0 border-t-[1px] border-solid border-section-light-container dark:border-[#3B444F] dark:border-separatorDark sm:min-h-[92px]'>
						<div className='flex w-[33%] flex-col items-center pt-1.5 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
							<div className={`${poppins.variable} ${poppins.className} flex items-center justify-center gap-1`}>
								{parseBalance(delegate?.delegatedBalance.toString(), 1, false, network)}
								<span className='mt-1 text-xs font-normal text-bodyBlue dark:text-blue-dark-high sm:text-sm'>{unit}</span>
							</div>
							<div className='w-[50%] text-center text-[10px] font-normal text-[#576D8B] dark:text-blue-dark-medium sm:w-full sm:text-xs'>{t('Voting power')}</div>
						</div>
						<div className='flex w-[33%] flex-col items-center border-0 border-x-[1px] border-solid border-section-light-container pt-1.5  text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:text-blue-dark-high'>
							{delegate?.votedProposalsCount}
							<span className='text-[10px] font-normal text-[#576D8B] dark:text-blue-dark-medium sm:text-xs'>{t('Voted proposals')}</span>
							<span className='text-[10px] font-normal text-[#576D8B] dark:text-blue-dark-medium sm:text-xs'>({t('Past 30 days')})</span>
						</div>
						<div className='flex w-[33%] flex-col items-center pt-1.5 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
							{delegate?.receivedDelegationsCount}
							<span className='mb-[2px] w-[55%] text-center text-[10px] font-normal text-[#576D8B] dark:text-blue-dark-medium sm:w-full sm:text-xs'>
								{t('Received Delegation')}
							</span>
						</div>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default styled(DelegateCard)`
	.bio {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		width: 250px;
		overflow: hidden;
	}
	.modal .ant-modal-content {
		padding: 0px 0px !important;
		border-radius: 14px !important;
		box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.08) !important;
	}
`;
