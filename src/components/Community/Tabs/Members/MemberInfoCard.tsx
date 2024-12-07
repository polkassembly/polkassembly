// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, message, Modal } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { dmSans } from 'pages/_app';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { BadgeName, User } from '~src/auth/types';
import ImageComponent from '~src/components/ImageComponent';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import Tipping from '~src/components/Tipping';
import FollowButton from '~src/components/UserProfile/Follow/FollowButton';
import { chainProperties } from '~src/global/networkConstants';
import { isFollowing } from '~src/redux/follow';
import { useNetworkSelector } from '~src/redux/selectors';
import Address from '~src/ui-components/Address';
import { CloseIcon, CopyIcon } from '~src/ui-components/CustomIcons';
import Markdown from '~src/ui-components/Markdown';
import ScoreTag from '~src/ui-components/ScoreTag';
import SocialsHandle from '~src/ui-components/SocialsHandle';
import copyToClipboard from '~src/util/copyToClipboard';

interface Props {
	user: User | any;
	className?: string;
	trackNum?: number;
	disabled?: boolean;
	isUsedInExpertTab?: boolean;
}
const MemberInfoCard = ({ user, className, isUsedInExpertTab }: Props) => {
	const { network } = useNetworkSelector();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const { resolvedTheme: theme } = useTheme();
	const [openTipping, setOpenTipping] = useState<boolean>(false);
	const [totalFollowers, setTotalFollower] = useState<number>(user?.followers_count?.[network] || 0);

	const [openReadMore, setOpenReadMore] = useState<boolean>(false);
	const [openAddressChangeModal, setOpenAddressChangeModal] = useState<boolean>(false);

	const isUserFollowing = useSelector((state: any) => isFollowing(state.follow, user?.id));

	const [messageApi, contextHolder] = message.useMessage();

	console.log('user', user);

	const handleDelegationContent = (content: string) => {
		return content?.split('\n')?.find((item: string) => item?.length > 0) || '';
	};

	const updateFollowerCount = () => {
		if (isUserFollowing) {
			setTotalFollower(totalFollowers - 1);
		} else {
			setTotalFollower(totalFollowers + 1);
		}
	};

	const success = () => {
		messageApi?.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};

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

	return (
		<div className={`${className}`}>
			<div
				className={`flex flex-col gap-y-2 rounded-[16px] border-[1px] border-solid border-section-light-container bg-white px-5 pt-4 hover:border-pink_primary dark:border-[#3B444F] dark:border-separatorDark
        dark:bg-black ${className} w-full sm:w-auto`}
			>
				<div className='mt-1 flex items-center justify-between'>
					<div className='flex items-center gap-2 max-lg:justify-start'>
						{!!user?.profile?.image?.length && (
							<ImageComponent
								src={user?.profile?.image || ''}
								alt=''
								className='h-8 w-8'
							/>
						)}
						<Address
							address={user?.addresses?.[0] || user?.address || ''}
							displayInline
							destroyTooltipOnHide
							disableIdenticon={Boolean(user?.profile?.image?.length)}
							iconSize={26}
							isTruncateUsername={false}
							usernameClassName='font-semibold text-xl'
							className='flex items-center'
						/>
					</div>
					<div className='flex items-center gap-x-4'>
						<Button
							className='m-0 ml-auto flex items-center gap-x-1 border-none bg-transparent p-0 text-sm font-medium text-pink_primary shadow-none'
							onClick={() => {
								setOpenTipping(true);
							}}
						>
							<Image
								src='/assets/icons/tipping-pink_icon.svg'
								alt='tipping-icon'
								width={20}
								height={20}
							/>{' '}
							Tip
						</Button>
						<div
							className='flex items-center gap-x-4'
							onClick={updateFollowerCount}
						>
							<FollowButton
								userId={user?.id || user?.userId}
								user={user}
								isUsedInProfileHeaders={false}
								isUsedInCommunityTab
							/>
						</div>
					</div>
				</div>
				<div className='flex items-center justify-between'>
					<div className='flex  w-full items-center gap-1 text-xs text-bodyBlue dark:text-blue-dark-high'>
						<Address
							address={user?.addresses?.[0] || user?.address || ''}
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
								copyToClipboard(user?.addresses?.[0] || user?.address || '');
								success();
							}}
						>
							{contextHolder}
							<CopyIcon className='-ml-[6px] scale-[80%] text-2xl text-lightBlue dark:text-icon-dark-inactive' />
						</span>

						<ScoreTag
							className='h-6 w-min px-[6px] py-1'
							score={user?.profile_score || 0}
							iconWrapperClassName='mt-[5.5px]'
						/>
						{isUsedInExpertTab && user?.dataSource && user?.dataSource?.length && (
							<div className='flex gap-x-2 rounded-md bg-[#FFF7EF] px-2 py-1'>
								{user?.dataSource?.map((source: string, index: number) => (
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
						{user?.identityInfo?.isVerified && (
							<div className='ml-auto flex items-center gap-x-1'>
								<Image
									src='/assets/icons/judgement-grey-icon.svg'
									alt='follow-icon'
									width={20}
									height={20}
									className={theme === 'dark' ? 'dark-icons scale-90' : 'scale-90'}
								/>
								<p className='m-0 p-0 text-xs font-normal text-lightBlue dark:text-blue-dark-medium'>Judgement:</p>
								<span className='m-0 p-0 text-xs font-medium text-bodyBlue dark:text-white'>{user?.identityInfo?.judgements?.map((item: any) => item[1])?.join(', ')}</span>
							</div>
						)}
					</div>
				</div>
				<div className='flex w-full flex-col items-start gap-y-1 md:flex-row md:items-center md:gap-x-3 md:gap-y-0'>
					<div className='flex items-center gap-1 text-xs text-bodyBlue dark:text-blue-dark-high'>
						<p className='m-0 whitespace-nowrap p-0 text-xs font-normal text-lightBlue dark:text-blue-dark-medium'>User Since: </p>
						<span className='flex items-center gap-x-1 whitespace-nowrap text-xs font-medium text-bodyBlue dark:text-white'>
							<Image
								src='/assets/icons/orange-calender-icon.svg'
								alt='calender-icon'
								width={20}
								height={20}
								className='-mt-0?.5'
							/>
							{dayjs(user?.created_at)?.format('DD MMM YYYY')}
						</span>
					</div>
					<div className='flex w-full items-center justify-between gap-x-2'>
						<div className='flex items-center gap-x-2'>
							<div className='flex items-center gap-x-3'>
								<Divider
									className='m-0 hidden border-[#D2D8E0] p-0 dark:border-icon-dark-inactive md:inline-block'
									type='vertical'
								/>
								<p className='m-0 p-0 text-xs font-normal text-lightBlue dark:text-blue-dark-medium'>Followers: </p>
								<span className='flex items-center gap-x-1 text-xs font-medium text-pink_primary'>{user?.followers_count?.[network] || 0}</span>
							</div>
							<div className='flex items-center gap-x-3'>
								<Divider
									className='m-0 border-[#D2D8E0] p-0 dark:border-icon-dark-inactive md:inline-block'
									type='vertical'
								/>
								<p className='m-0 p-0 text-xs font-normal text-lightBlue dark:text-blue-dark-medium'>Following: </p>
								<span className='flex items-center gap-x-1 text-xs font-medium text-pink_primary'>{user?.followings_count?.[network] || 0}</span>
							</div>
						</div>
					</div>
				</div>
				<div className={'mb-2 flex h-[40px] flex-col text-sm font-normal text-bodyBlue dark:text-blue-dark-high'}>
					<p className='bio m-0 w-full p-0 '>
						{user?.profile?.bio ? (
							<Markdown
								className='post-content m-0 p-0'
								md={`${
									handleDelegationContent(user?.profile?.bio || '')?.length > 50
										? handleDelegationContent(user?.profile?.bio || '')?.slice(0, 50) + '...'
										: handleDelegationContent(user?.profile?.bio || '')
								}`}
								isPreview={true}
								imgHidden
							/>
						) : (
							<p className='m-0 p-0 text-lightBlue opacity-60 dark:text-blue-dark-medium'>No Bio</p>
						)}
					</p>
					{user?.profile?.bio && user?.profile?.bio?.length > 50 && (
						<span
							onClick={() => setOpenReadMore(true)}
							className='m-0 -mt-1 flex cursor-pointer items-center justify-start p-0 text-xs font-medium text-[#3C74E1]'
						>
							Read more
						</span>
					)}
				</div>
				<div className='mr-2 flex items-center gap-2'>
					<SocialsHandle
						address={user?.addresses?.[0] || user?.address || ''}
						onchainIdentity={user?.identityInfo || null}
						socials={[]}
						iconSize={18}
						boxSize={32}
						isUsedInCommunityTab
					/>
				</div>
				{!isUsedInExpertTab ? (
					<div className='-mt-3 flex min-h-[92px] items-center justify-start gap-x-2'>
						<Image
							src={
								user?.profile?.achievement_badges?.some((badge: any) => badge?.name === BadgeName?.DECENTRALISED_VOICE)
									? '/assets/badges/decentralised_voice.svg'
									: '/assets/badges/decentralised_voice_locked.svg'
							}
							alt='achievement-badge'
							height={41}
							width={67}
						/>
						<Image
							src={user?.profile?.achievement_badges?.some((badge: any) => badge?.name === BadgeName?.FELLOW) ? '/assets/badges/fellow.svg' : '/assets/badges/fellow_locked.svg'}
							alt='achievement-badge'
							height={41}
							width={67}
						/>
						<Image
							src={user?.profile?.achievement_badges?.some((badge: any) => badge?.name === BadgeName?.COUNCIL) ? '/assets/badges/Council.svg' : '/assets/badges/council_locked.svg'}
							alt='achievement-badge'
							height={41}
							width={67}
						/>
						<Image
							src={
								user?.profile?.achievement_badges?.some((badge: any) => badge?.name === BadgeName?.ACTIVE_VOTER)
									? '/assets/badges/active_voter.svg'
									: '/assets/badges/active_voter_locked.svg'
							}
							alt='achievement-badge'
							height={41}
							width={67}
						/>
						<Image
							src={user?.profile?.achievement_badges?.some((badge: any) => badge?.name === BadgeName?.WHALE) ? '/assets/badges/whale.svg' : '/assets/badges/whale_locked.svg'}
							alt='achievement-badge'
							height={41}
							width={67}
						/>
					</div>
				) : (
					<div className=' flex min-h-[92px] justify-between border-0 border-t-[1px] border-solid  border-section-light-container dark:border-[#3B444F] dark:border-separatorDark '>
						<div className='mt-1 flex w-[33%] flex-col items-center py-3 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
							<div className='flex flex-wrap items-end justify-center'>
								<span className='px-1 text-2xl font-semibold'>{parseBalance(user?.delegatedBalance?.toString(), 2, false, network)}</span>
								<span className='mb-[3px] text-sm font-normal dark:text-blue-dark-high'>{unit}</span>
							</div>
							<div className='mt-[4px] text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>Voting power</div>
						</div>
						<div className='flex w-[33%] flex-col items-center border-0 border-x-[1px] border-solid border-section-light-container py-3  text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:text-blue-dark-high'>
							<span className='text-2xl font-semibold'>{user?.votedProposalsCount}</span>
							<div className='mt-[2px] flex flex-col items-center'>
								<span className='mb-[2px] text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>Voted proposals </span>
								<span className='text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>(Past 30 days)</span>
							</div>
						</div>
						<div className='flex w-[33%] flex-col items-center py-3 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
							<span className='text-2xl font-semibold text-bodyBlue dark:text-blue-dark-high'>{user?.receivedDelegationsCount}</span>
							<span className='mb-[2px] mt-1 text-center text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>Received Delegation</span>
						</div>
					</div>
				)}
			</div>
			<Modal
				open={openReadMore}
				onCancel={() => setOpenReadMore(false)}
				className={classNames('modal w-[725px] max-md:w-full dark:[&>?.ant-modal-content]:bg-section-dark-overlay', dmSans?.className, dmSans?.variable)}
				footer={false}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			>
				<div className={' sm:pt-[20px]'}>
					<div className='hidden items-center justify-between pt-2 sm:flex sm:pl-8'>
						<div className='flex items-center gap-2 max-lg:justify-start'>
							<Address
								address={user?.addresses?.[0] || user?.address || ''}
								displayInline
								iconSize={26}
								isTruncateUsername={false}
								usernameClassName='text-[20px] font-medium'
							/>

							<div className='mr-2 flex items-center gap-2'>
								<SocialsHandle
									address={user?.addresses?.[0] || user?.address || ''}
									onchainIdentity={user?.identityInfo || null}
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
								address={user?.addresses?.[0] || user?.address || ''}
								displayInline
								iconSize={26}
								isTruncateUsername={false}
								usernameClassName='text-[20px] font-medium'
							/>
						</div>
					</div>

					<div
						className={`${dmSans?.variable} ${dmSans?.className} flex min-h-[56px] gap-1 px-[46px] text-sm tracking-[0?.015em] text-[#576D8B] dark:text-blue-dark-high max-sm:-mt-2 sm:mt-4 sm:px-0 sm:pl-[56px]`}
					>
						<p className='w-full sm:w-[90%]'>
							{user?.profile?.bio ? (
								<Markdown
									className='post-content'
									md={user?.profile?.bio}
									isPreview={true}
									imgHidden
								/>
							) : (
								'No Bio'
							)}
						</p>
					</div>
					<div className='-mt-3 mb-4 flex items-center px-[46px] sm:hidden'>
						<SocialsHandle
							address={user?.addresses?.[0] || user?.address || ''}
							onchainIdentity={user?.identityInfo || null}
							socials={[]}
							iconSize={16}
							boxSize={30}
						/>
					</div>
				</div>
			</Modal>
			<Tipping
				username={user?.username || ''}
				open={openTipping}
				setOpen={setOpenTipping}
				key={user?.addresses?.[0] || user?.address || ''}
				paUsername={user?.username as any}
				setOpenAddressChangeModal={setOpenAddressChangeModal}
				openAddressChangeModal={openAddressChangeModal}
			/>
		</div>
	);
};

export default MemberInfoCard;
