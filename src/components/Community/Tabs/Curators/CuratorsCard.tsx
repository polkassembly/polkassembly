// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { message, Modal } from 'antd';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import { User } from '~src/auth/types';
import ImageComponent from '~src/components/ImageComponent';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import Address from '~src/ui-components/Address';
import { CloseIcon, CopyIcon } from '~src/ui-components/CustomIcons';
import Markdown from '~src/ui-components/Markdown';
import ScoreTag from '~src/ui-components/ScoreTag';
import SocialsHandle from '~src/ui-components/SocialsHandle';
import copyToClipboard from '~src/util/copyToClipboard';
import Image from 'next/image';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { chainProperties } from '~src/global/networkConstants';
import { getMultisigAddressDetails } from '~src/components/DelegationDashboard/utils/getMultisigAddressDetails';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface Props {
	user: User | any;
	className?: string;
	trackNum?: number;
	disabled?: boolean;
}
const CuratorsCard = ({ user, className }: Props) => {
	const { network } = useNetworkSelector();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const { multisigAssociatedAddress } = useUserDetailsSelector();

	const [multisigData, setMultisigData] = useState<{ threshold: number; signatories: string[] }>({
		signatories: [],
		threshold: 0
	});

	const [openReadMore, setOpenReadMore] = useState<boolean>(false);
	const [messageApi, contextHolder] = message.useMessage();
	const [signatoriesImg, setSignatoriesImg] = useState<string[]>([]);

	const handleDelegationContent = (content: string) => {
		return content?.split('\n')?.find((item: string) => item?.length > 0) || '';
	};

	const success = () => {
		messageApi?.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};

	const fetchUserProfile = async (address: string): Promise<IGetProfileWithAddressResponse | { error: string }> => {
		try {
			const { data } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`/api/v1/auth/data/profileWithAddress?address=${address}`);
			if (data) {
				const { profile } = data;
				const userImg = profile?.image;
				if (userImg) {
					setSignatoriesImg((prevImgs) => [...prevImgs, userImg]);
				}
			}
			return { error: 'User profile not found' };
		} catch (error) {
			console.error(`Error fetching user profile for address ${address}:`, error);
			return { error: 'Failed to fetch user profile' };
		}
	};

	const handleMultisigAddress = async () => {
		const data = await getMultisigAddressDetails(user?.curator);
		if (data?.threshold) {
			const filteredSignaories: string[] = [];

			data?.multi_account_member?.map((addr: { address: string }) => {
				if (getEncodedAddress(addr?.address || '', network) !== getEncodedAddress(multisigAssociatedAddress || '', network)) {
					filteredSignaories?.push(addr?.address);
				}
			});

			setMultisigData({
				signatories: filteredSignaories,
				threshold: data?.threshold || 0
			});
			if (filteredSignaories?.length > 0) {
				filteredSignaories.map((signatory) => {
					fetchUserProfile(signatory);
				});
			}
		}
	};
	useEffect(() => {
		handleMultisigAddress();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.curator, user]);

	return (
		<div className={`${className}`}>
			<div
				className={`flex flex-col gap-y-2 rounded-[16px] rounded-[6px] border-[1px] border-solid border-section-light-container bg-white pt-4 hover:border-pink_primary dark:border-[#3B444F] dark:border-separatorDark
        dark:bg-black ${className} w-full sm:w-auto`}
			>
				<div className='flex w-full flex-col items-start justify-start gap-y-2 px-5 md:flex-row md:items-center md:justify-between md:gap-y-0'>
					<div className='flex items-center gap-2 max-lg:justify-start'>
						{!!user?.profile?.image?.length && (
							<ImageComponent
								src={user?.profile?.image || ''}
								alt=''
								className='h-8 w-8'
							/>
						)}
						<Address
							address={user?.curator}
							displayInline
							destroyTooltipOnHide
							disableIdenticon={Boolean(user?.profile?.image?.length)}
							iconSize={26}
							usernameClassName='font-semibold text-xl'
							isTruncateUsername={false}
							className='flex items-center'
						/>
					</div>
					{multisigData?.signatories?.length > 0 && (
						<div className='flex items-center gap-x-2'>
							<p className='m-0 p-0 text-sm font-medium text-lightBlue dark:text-blue-dark-medium'>Signatories:</p>
							<div className='flex -space-x-2'>
								{signatoriesImg &&
									multisigData?.signatories.map((_, idx) => (
										<Image
											key={idx}
											src={signatoriesImg[idx] || '/assets/icons/user-profile.png'}
											alt='user-img'
											className='rounded-full border-2 border-solid border-white dark:border-gray-800'
											height={32}
											width={32}
											style={{ zIndex: idx }}
										/>
									))}
							</div>
						</div>
					)}
				</div>
				<div className='mt-1 flex flex-col items-start gap-y-2 px-5 md:flex-row md:items-center md:justify-start md:gap-x-3 md:gap-y-0'>
					<div className='flex items-center gap-1 text-xs text-bodyBlue dark:text-blue-dark-high'>
						<Address
							address={user?.curator}
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
								copyToClipboard(user?.curator);
								success();
							}}
						>
							{contextHolder}
							<CopyIcon className='-ml-[6px] scale-[80%] text-2xl text-lightBlue dark:text-icon-dark-inactive' />
						</span>

						<ScoreTag
							className='h-6 w-min px-[6px] py-1'
							score={user?.profile_score || 0}
							iconWrapperClassName='mt-[4.5px]'
						/>
					</div>
					<div className='flex items-center gap-x-1'>
						<div className='flex items-center justify-between gap-x-1 rounded-[16px] bg-[#EEF2FF] px-2 py-1 text-xs font-bold text-[#4F46E5]'>
							<Image
								src='/assets/icons/bounty-money-icon.svg'
								alt='bounties-icon'
								height={14}
								width={14}
							/>
							{user?.bounties} Bounties
						</div>
						<div className='flex items-center justify-between gap-x-1 rounded-[16px] bg-[#FFEEE0] px-2 py-1 text-xs font-bold text-[#DB511F]'>
							<Image
								src='/assets/icons/child-bounty-money-icon.svg'
								alt='bounties-icon'
								height={14}
								width={14}
							/>
							{user?.childBounties} Child Bounties
						</div>
					</div>
				</div>
				<div className={'mb-2 flex max-h-[40px] flex-col px-5 text-sm font-normal text-bodyBlue dark:text-blue-dark-high'}>
					<p className='bio m-0 w-full p-0 '>
						{user?.profile?.bio ? (
							<Markdown
								className='post-content m-0 p-0'
								md={`${handleDelegationContent(user?.profile?.bio || '')?.slice(0, 100)}?.?.?.`}
								isPreview={true}
								imgHidden
							/>
						) : (
							'No Bio'
						)}
					</p>
					{user?.profile?.bio && user?.profile?.bio?.length > 100 && (
						<span
							onClick={() => setOpenReadMore(true)}
							className='m-0 -mt-1 flex cursor-pointer items-center justify-start p-0 text-xs font-medium text-[#3C74E1]'
						>
							Read more
						</span>
					)}
				</div>

				<div className='mb-3 flex items-center gap-2 px-5'>
					<SocialsHandle
						address={user?.curator}
						onchainIdentity={user?.identityInfo || null}
						socials={[]}
						iconSize={18}
						boxSize={32}
					/>
				</div>

				<div className=' flex min-h-[92px] items-center justify-between border-0 border-t-[1px] border-solid  border-section-light-container dark:border-[#3B444F] dark:border-separatorDark '>
					<div className='mt-1 flex w-[33%] flex-col items-center py-3 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
						<div className='flex flex-wrap items-end justify-center'>
							<span className='px-1 text-xl font-semibold md:text-2xl'>{parseBalance(user?.total_rewards?.toString(), 1, false, network)}</span>
							<span className='mb-[3px] ml-[2px] text-[10px] font-normal dark:text-blue-dark-high'>{unit}</span>
						</div>
						<div className='mt-[4px] text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>Total Rewarded</div>
					</div>
					<div className='flex w-[33%] flex-col items-center border-0 border-x-[1px] border-solid border-section-light-container py-3  text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:text-blue-dark-high'>
						<span className='text-xl font-semibold md:text-2xl'>{user?.active}</span>
						<div className='mt-[2px] flex flex-col items-center'>
							<span className='mb-[2px] text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>Active Bounties</span>
						</div>
					</div>
					<div className='flex w-[33%] flex-col items-center py-3 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
						<span className='text-xlmd:text-2xl flex items-center justify-center gap-x-1 font-semibold text-bodyBlue dark:text-blue-dark-high'>
							{user?.disbursedChildBounty}{' '}
							<div className='rounded-[4px] bg-[#FF3C5F] px-1.5 py-1 text-[8px] font-medium text-white md:text-xs'>
								Unclaimed: {parseBalance(user?.unclaimedAmount?.toString(), 1, false, network)}
							</div>
						</span>
						<span className='mb-[2px] mt-1 text-center text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>Child Bounty Disbursed </span>
					</div>
				</div>
			</div>
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
								address={user?.curator}
								displayInline
								iconSize={26}
								isTruncateUsername={false}
								usernameClassName='text-[20px] font-medium'
							/>

							<div className='mr-2 flex items-center gap-2'>
								<SocialsHandle
									address={user?.curator}
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
								address={user?.curator}
								displayInline
								iconSize={26}
								isTruncateUsername={false}
								usernameClassName='text-[20px] font-medium'
							/>
						</div>
					</div>

					<div
						className={`${poppins?.variable} ${poppins?.className} flex min-h-[56px] gap-1 px-[46px] text-sm tracking-[0?.015em] text-[#576D8B] dark:text-blue-dark-high max-sm:-mt-2 sm:mt-4 sm:px-0 sm:pl-[56px]`}
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
							address={user?.curator}
							onchainIdentity={user?.identityInfo || null}
							socials={[]}
							iconSize={16}
							boxSize={30}
						/>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default CuratorsCard;
