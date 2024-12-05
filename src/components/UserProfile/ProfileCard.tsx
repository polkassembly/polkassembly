// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { ProfileDetailsResponse } from '~src/auth/types';
import ImageComponent from '../ImageComponent';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import classNames from 'classnames';
import Address from '~src/ui-components/Address';
import copyToClipboard from '~src/util/copyToClipboard';
import { message } from 'antd';
import { CopyIcon } from '~src/ui-components/CustomIcons';
import dayjs from 'dayjs';
import Image from 'next/image';
import EvalutionSummary from '../Post/PostSummary/EvalutionSummary';
import SocialsHandle from '~src/ui-components/SocialsHandle';
import { useApiContext } from '~src/context';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { useNetworkSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { isAddress } from 'ethers';
import ScoreTag from '~src/ui-components/ScoreTag';
import FollowersAndFollowing from './Follow/FollowersAndFollowing';

interface Props {
	className?: string;
	userProfile: ProfileDetailsResponse;
	addressWithIdentity: string;
	onchainIdentity?: DeriveAccountRegistration | null;
}

const ProfileCard = ({ className, userProfile, addressWithIdentity, onchainIdentity }: Props) => {
	const { t } = useTranslation('common');
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const { image, created_at: profileSince, social_links: socials, username, profile_score: profileScore = 0, addresses } = userProfile;
	const [messageApi, contextHolder] = message.useMessage();
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;
	const [isW3FDelegate, setIsW3FDelegate] = useState<boolean>(false);

	const getData = async () => {
		if (!api || !apiReady) return;
		const address = addressWithIdentity || addresses?.[0];

		if (!((getEncodedAddress(address, network) || isAddress(address)) && address.length > 0)) return;

		const { data, error } = await nextApiClientFetch<{ isW3fDelegate: boolean }>('api/v1/delegations/getW3fDelegateCheck', {
			addresses: addresses || []
		});
		if (data) {
			setIsW3FDelegate(data?.isW3fDelegate || false);
		} else {
			console.log(error);
			setIsW3FDelegate(false);
		}
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, api, apiReady, addresses, addressWithIdentity]);

	const handleCopyAddress = () => {
		messageApi.open({
			content: t('address_copied'),
			duration: 10,
			type: 'success'
		});
	};

	return (
		<div
			className={classNames(
				className,
				'max-md-w-full flex h-[128px] border-[1px] max-md:h-[350px] max-md:flex-col max-md:items-center max-md:gap-2 max-md:rounded-[14px] max-md:border-solid max-md:border-[rgb(210,216,224)] max-md:bg-white max-md:py-4 max-md:dark:border-separatorDark max-md:dark:bg-section-dark-overlay'
			)}
		>
			<div className='z-50 mt-[-1px] flex h-[130px] w-[130px] items-center justify-center rounded-full border-[1px] border-solid border-section-light-container bg-white dark:border-separatorDark dark:bg-section-dark-overlay'>
				<ImageComponent
					src={image}
					alt={t('user_picture')}
					className='flex h-[130px] w-[130px] items-center justify-center '
					iconClassName='flex items-center justify-center text-[#FCE5F2] w-full h-full rounded-full'
				/>
			</div>
			<div className='ml-[-73px] flex w-full items-start justify-between rounded-e-[14px] border-section-light-container bg-white py-2 dark:border-separatorDark dark:bg-section-dark-overlay max-md:ml-0 max-md:flex-col max-md:items-center md:border-0 md:border-b-[1px] md:border-r-[1px] md:border-t-[1px] md:border-solid md:py-4'>
				<div className='flex w-full flex-col gap-2 max-md:items-center max-md:gap-4 max-md:border-none max-md:bg-transparent max-md:dark:bg-transparent md:h-[130px]'>
					{addressWithIdentity ? (
						<div className='flex items-center justify-between max-md:flex-col md:ml-[90px] md:pr-6'>
							<div className='flex items-center'>
								<Address
									address={addressWithIdentity}
									disableIdenticon
									isProfileView
									destroyTooltipOnHide
									className='flex gap-1'
									usernameClassName='text-2xl'
									isTruncateUsername={isMobile || false}
									passedUsername={userProfile?.username}
								/>
								<span
									className='flex cursor-pointer items-center p-1'
									onClick={(e) => {
										e.preventDefault();
										copyToClipboard(addressWithIdentity);
										handleCopyAddress();
									}}
								>
									{contextHolder}
									<CopyIcon className='ml-1 text-2xl text-lightBlue dark:text-icon-dark-inactive' />
								</span>
							</div>
						</div>
					) : (
						<div className='flex items-center justify-between text-2xl font-semibold text-bodyBlue dark:text-blue-dark-high max-md:flex-col md:ml-[90px] md:pr-6'>{username}</div>
					)}
					<div className='flex flex-wrap gap-2 max-sm:justify-center'>
						{addressWithIdentity && (
							<div className='md:ml-[90px]'>
								<EvalutionSummary
									isProfileView
									address={addressWithIdentity}
								/>
							</div>
						)}
						{!isNaN(profileScore) && (
							<ScoreTag
								score={profileScore}
								className='ml-1 px-1 pr-3'
								scale={1.1}
								iconWrapperClassName='ml-1.5 mt-[5.5px]'
							/>
						)}
						{isW3FDelegate && (
							<div className='ml-1 flex items-center gap-1.5 rounded-md bg-[#272525] px-2 py-1 text-xs font-normal text-white'>
								<Image
									src={'/assets/profile/w3f.svg'}
									alt=''
									width={18}
									height={18}
								/>
								{t('decentralized_voices')}
							</div>
						)}
					</div>

					<div className={`flex gap-1 ${!profileSince ? 'md:ml-[90px]' : ''} `}>
						{profileSince && (
							<div className='flex items-center text-xs tracking-wide text-blue-light-medium dark:text-blue-dark-medium  md:ml-[90px]'>
								{t('user_since')}
								<Image
									src={'/assets/icons/Calendar.svg'}
									alt={t('calendar')}
									width={20}
									height={20}
									className='ml-2'
								/>
								<span className='ml-1 text-lightBlue dark:text-blue-dark-medium'>{dayjs(profileSince).format('MMM DD, YYYY')}</span>
							</div>
						)}
						<FollowersAndFollowing
							profileSince={profileSince}
							userId={userProfile?.user_id}
						/>
					</div>
				</div>
				<SocialsHandle
					className='mr-6 gap-4 max-md:mr-0 max-md:mt-4 max-md:gap-2'
					onchainIdentity={onchainIdentity || null}
					socials={socials || []}
					address={addressWithIdentity}
					iconSize={18}
					boxSize={32}
				/>
			</div>
		</div>
	);
};

export default ProfileCard;
