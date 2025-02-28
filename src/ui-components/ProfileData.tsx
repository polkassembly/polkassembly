// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider, message } from 'antd';
import React, { useEffect, useState } from 'react';
import ImageComponent from '~src/components/ImageComponent';
import copyToClipboard from '~src/util/copyToClipboard';
import dayjs from 'dayjs';
import { useTheme } from 'next-themes';
import Address from '~src/ui-components/Address';
import userProfileBalances from '~src/util/userProfileBalances';
import { useApiContext } from '~src/context';
import { useNetworkSelector } from '~src/redux/selectors';
import BN from 'bn.js';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import styled from 'styled-components';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import EvalutionSummary from '~src/components/Post/PostSummary/EvalutionSummary';
import ImageIcon from './ImageIcon';
import useIsMobile from '~src/hooks/useIsMobile';

const ZERO_BN = new BN(0);
interface IProfileData {
	className?: string;
	address: string;
}

const ProfileData = ({ address, className }: IProfileData) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const isMobile = useIsMobile();
	const [transferableBalance, setTransferableBalance] = useState<BN>(ZERO_BN);
	const [proposalCount, setProposalCount] = useState(0);
	const [discussionCount, setDiscussionCount] = useState(0);
	const [messageApi, contextHolder] = message.useMessage();
	const { resolvedTheme: theme } = useTheme();
	const unit = chainProperties[network]?.tokenSymbol;
	const [profileData, setProfileData] = useState<IGetProfileWithAddressResponse | undefined>();
	const userAddress = typeof address == 'string' ? address : (address as any)?.interior?.value?.id || '';

	useEffect(() => {
		if (!api || !apiReady) return;
		(async () => {
			const balances = await userProfileBalances({ address: userAddress, api, apiReady, network });
			setTransferableBalance(balances?.transferableBalance || ZERO_BN);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	const fetchUsername = async (address: string) => {
		const substrateAddress = getSubstrateAddress(userAddress);
		if (substrateAddress) {
			try {
				const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`api/v1/auth/data/profileWithAddress?address=${substrateAddress}`, undefined, 'GET');
				if (error || !data || !data.username) {
					console.error(error);
				}
				setProfileData(data);
				if (profileData && profileData?.user_id) {
					fetchData({ userId: profileData?.user_id });
				} else {
					fetchData({ addresses: [address] });
				}
			} catch (error) {
				console.log(error);
			}
		}
	};

	useEffect(() => {
		fetchUsername(userAddress);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	const success = () => {
		messageApi.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};

	const fetchData = async ({ addresses, userId }: { addresses?: string[]; userId?: number }) => {
		let payload;
		if (userId !== 0 && !userId) {
			payload = { addresses: addresses };
		} else {
			payload = { addresses: addresses || [], userId: userId };
		}
		const { data, error } = await nextApiClientFetch<any>('/api/v1/posts/user-total-post-counts', payload);
		if (data) {
			setProposalCount(data?.proposals);
			setDiscussionCount(data?.discussions);
		} else {
			console.log(error);
		}
	};

	return (
		<div className={`${className}`}>
			<div className='flex gap-x-1 sm:gap-x-4'>
				<div className=''>
					<ImageComponent
						src={profileData?.profile?.image}
						alt='User Picture'
						className='flex h-[30px] w-[30px] items-center justify-center bg-transparent sm:h-[60px] sm:w-[60px]'
						iconClassName='flex items-center justify-center text-[#FCE5F2] text-xxl w-full h-full rounded-full'
					/>
				</div>
				<div>
					<div className='flex gap-x-1'>
						<Address
							address={userAddress}
							disableIdenticon={true}
							isProfileView
							isTruncateUsername={isMobile}
							usernameMaxLength={65}
						/>
						<span
							className='-ml-2 -mt-0.5 flex cursor-pointer items-center'
							onClick={(e) => {
								e.preventDefault();
								copyToClipboard(userAddress);
								success();
							}}
						>
							{contextHolder}
							{theme === 'dark' ? (
								<ImageIcon
									src='/assets/icons/content_copy_small_white.svg'
									className='ml-2 scale-125'
									alt='WhitecopyIcon'
								/>
							) : (
								<ImageIcon
									src='/assets/icons/content_copy_small.svg'
									className='ml-2 scale-125'
									alt='GreyCopyIcon'
								/>
							)}
						</span>
					</div>
					{profileData?.profile?.bio ? (
						<div className='mt-3'>
							<p className='m-0 p-0 text-sm text-textGreyColor'>{profileData?.profile?.bio}</p>
						</div>
					) : (
						<div className='mt-3'>
							<p className='m-0 p-0 text-sm font-normal text-textGreyColor dark:text-lightGreyTextColor'>No bio added</p>
						</div>
					)}
					<div className='mt-3'>
						<EvalutionSummary
							isProfileView
							address={userAddress}
						/>
					</div>
					{profileData?.profile?.badges && profileData?.profile?.badges?.length > 0 && (
						<div className='mt-3'>
							<div className='flex gap-x-2'>
								{profileData?.profile?.badges.map((badge: string, index: number) => (
									<div
										className='border-grey_stroke flex border px-3.5 py-0.5 text-[12px] text-lightBlue hover:border-pink_primary hover:text-pink_primary dark:text-section-light-container'
										style={{ border: '1px solid #D2D8E0', borderRadius: '50px' }}
										key={index}
									>
										{badge}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
			<div
				className='mb-0 mt-2 dark:bg-separatorDark'
				style={{ borderTop: `1px dashed ${theme === 'dark' ? '' : '#D2D8E0'}` }}
			></div>
			<div className='user-info-container mt-3 flex h-[60px] items-center justify-between'>
				{profileData?.created_at && (
					<div className='info-container creation-date-container flex gap-x-2 py-4'>
						<ImageIcon
							src='/assets/icons/Calendar.svg'
							alt='calenderIcon'
							className='icon-container'
						/>
						<div className='content-container -mt-1'>
							<p className='m-0 whitespace-nowrap p-0 text-[10px] font-normal text-lightBlue opacity-70 dark:text-lightGreyTextColor'>Account Since</p>
							<span className='m-0 whitespace-nowrap p-0 text-sm font-semibold text-bodyBlue dark:text-white'>
								{dayjs(profileData?.created_at as unknown as string).format('DD MMM YYYY')}
							</span>
						</div>
					</div>
				)}
				{profileData?.created_at && (
					<Divider
						type='vertical'
						style={{ background: '#D2D8E0' }}
						className='divider-container h-[40px] dark:bg-separatorDark'
					/>
				)}
				<div className='info-container flex justify-center gap-x-2 py-4'>
					<ImageIcon
						src='/assets/icons/ClipboardText.svg'
						alt='clipboardIcon'
						className='icon-container'
					/>
					<div className='content-container -mt-1'>
						<p className='m-0 p-0 text-[10px] font-normal text-lightBlue opacity-70 dark:text-lightGreyTextColor'>Proposals</p>
						<span className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>{proposalCount < 10 ? `0${proposalCount}` : `${proposalCount}`}</span>
					</div>
				</div>
				<Divider
					type='vertical'
					style={{ background: '#D2D8E0' }}
					className='h-[40px] dark:bg-separatorDark'
				/>
				<div className='info-container flex justify-center gap-x-2 py-4'>
					<ImageIcon
						src='/assets/icons/ChatIcon.svg'
						alt='MessageIcon'
						className='icon-container'
					/>
					<div className='content-container -mt-1'>
						<p className='m-0 p-0 text-[10px] font-normal text-lightBlue opacity-70 dark:text-lightGreyTextColor'>Discussions</p>
						<span className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>{discussionCount < 10 ? `0${discussionCount}` : `${discussionCount}`}</span>
					</div>
				</div>
				<Divider
					type='vertical'
					style={{ background: '#D2D8E0' }}
					className='hide-div h-[40px] dark:bg-separatorDark'
				/>
				<div className='hide-div flex justify-end gap-x-2 py-4'>
					<ImageIcon
						src='/assets/icons/ChatIcon.svg'
						alt='MessageIcon'
						className='icon-container'
					/>
					<div className='content-container -mt-1'>
						<p className='m-0 p-0 text-[10px] font-normal text-lightBlue opacity-70 dark:text-lightGreyTextColor'>Voting Power</p>
						<span className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>
							{formatedBalance((transferableBalance.toString() || '0').toString(), unit, 2)} {unit}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default styled(ProfileData)`
	@media (max-width: 540px) and (min-width: 319px) {
		.hide-div {
			display: none !important;
		}
	}
	@media (max-width: 420px) and (min-width: 392px) {
		.icon-container {
			transform: scale(0.8);
		}
		.content-container {
			margin-top: 0px !important;
		}
		.info-container {
			gap: 0 2px !important;
		}
	}
	@media (max-width: 390px) and (min-width: 319px) {
		.creation-date-container {
			display: none !important;
		}
		.divider-container {
			display: none !important;
		}
	}
`;
