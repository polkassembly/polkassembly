// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import classNames from 'classnames';
import { ProfileDetailsResponse } from '~src/auth/types';
import Image from 'next/image';
import { Tag } from 'antd';
import ProfileDelegationsCard from './ProfileDelegationsCard';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { TippingUnavailableNetworks } from '~src/ui-components/QuickView';
import dynamic from 'next/dynamic';
import EditProfileModal from './EditProfile';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { delegationSupportedNetworks } from '../Post/Tabs/PostStats/util/constants';
import { EditIcon } from '~src/ui-components/CustomIcons';
import { chainProperties } from '~src/global/networkConstants';

const ProfileTippingCard = dynamic(() => import('./ProfileTippingCard'), {
	ssr: false
});
const ProfileLinkedAddress = dynamic(() => import('./ProfileLinkedAddresses'), {
	ssr: false
});
const TotalProfileBalances = dynamic(() => import('./TotalProfileBalances'), {
	ssr: false
});
const ProfileBadges = dynamic(() => import('./ProfileBadges'), {
	ssr: false
});

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
	selectedAddresses: string[];
	setSelectedAddresses: (pre: string[]) => void;
	profileDetails: ProfileDetailsResponse;
	setProfileDetails: React.Dispatch<React.SetStateAction<ProfileDetailsResponse>>;
	onchainIdentity?: DeriveAccountRegistration | null;
}

const ProfileOverview = ({
	className,
	userProfile,
	addressWithIdentity,
	theme,
	selectedAddresses,
	setSelectedAddresses,
	profileDetails,
	setProfileDetails,
	onchainIdentity
}: Props) => {
	const { network } = useNetworkSelector();
	const { username } = useUserDetailsSelector();
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;
	const [openEditModal, setOpenEditModal] = useState<boolean>(false);
	const [showFullBio, setShowFullBio] = useState<boolean>(false);
	const { bio, badges, achievement_badges } = profileDetails;

	return (
		<div className={classNames(className, 'mt-6')}>
			{TippingUnavailableNetworks.includes(network) && !delegationSupportedNetworks.includes(network) ? (
				<div className='flex w-full gap-6'>
					<div className='flex w-[60%] flex-col gap-6 max-lg:w-full'>
						<div className='flex flex-col gap-5 rounded-[14px] border-[1px] border-solid border-section-light-container bg-white px-4 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'>
							<span className='flex items-center gap-1.5 text-xl font-semibold dark:text-blue-dark-high'>
								<Image
									src='/assets/profile/about.svg'
									alt=''
									width={24}
									height={24}
								/>
								About
							</span>
							<span
								className={classNames('text-sm font-normal', !bio?.length && 'cursor-pointer ')}
								onClick={() => {
									if (username !== userProfile.username) return;
									setOpenEditModal(true);
								}}
							>
								{bio?.length ? (showFullBio ? bio : bio.slice(0, 300)) : username === userProfile.username ? 'Click here to add bio' : ''}
							</span>
							{(bio?.length || 0) > 300 && (
								<span
									className='-mt-4 cursor-pointer text-xs text-pink_primary'
									onClick={() => setShowFullBio(!showFullBio)}
								>
									{showFullBio ? 'Show less' : 'See More'}
								</span>
							)}
							{!!badges?.length && (
								<span>
									{badges.map((badge) => (
										<Tag
											key={badge}
											className='rounded-full px-3 py-1 text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'
										>
											{badge}
										</Tag>
									))}
								</span>
							)}
						</div>
						<ProfileLinkedAddress
							userProfile={userProfile}
							addressWithIdentity={addressWithIdentity}
							theme={theme}
							selectedAddresses={selectedAddresses}
							setSelectedAddresses={setSelectedAddresses}
						/>
						{isMobile && (
							<TotalProfileBalances
								selectedAddresses={selectedAddresses}
								userProfile={userProfile}
								addressWithIdentity={addressWithIdentity}
								theme={theme}
							/>
						)}
					</div>

					{!isMobile && (
						<div className='w-[40%]'>
							<TotalProfileBalances
								selectedAddresses={selectedAddresses}
								userProfile={userProfile}
								addressWithIdentity={addressWithIdentity}
								theme={theme}
							/>
						</div>
					)}
				</div>
			) : (
				<div className='flex gap-6'>
					<div className='flex w-[60%] flex-col gap-5 py-1 max-md:w-full'>
						{/* About card */}
						{(!!bio?.length || username === userProfile.username) && (
							<div className='flex flex-col gap-5 rounded-[14px] border-[1px] border-solid border-section-light-container bg-white px-4 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'>
								<div className='flex w-full justify-between'>
									<span className='flex items-center gap-1.5 text-xl font-semibold dark:text-blue-dark-high'>
										<Image
											src='/assets/profile/about.svg'
											alt=''
											width={24}
											height={24}
										/>
										About
									</span>
									{username === userProfile?.username && (
										<span
											className='flex cursor-pointer items-center'
											onClick={() => {
												setOpenEditModal(true);
											}}
										>
											<EditIcon className='mr-1 text-pink_primary' />
											<p className='m-0 p-0 text-pink_primary'>Edit</p>
										</span>
									)}
								</div>
								<span className={classNames('text-sm font-normal', !bio?.length && 'flex cursor-pointer flex-wrap')}>
									{bio?.length ? (showFullBio ? bio : bio.slice(0, 300)) : username === userProfile.username ? 'Click here to add bio' : ''}
								</span>
								{(bio?.length || 0) > 300 && (
									<span
										className='-mt-4 cursor-pointer text-xs text-pink_primary'
										onClick={() => setShowFullBio(!showFullBio)}
									>
										{showFullBio ? 'Show less' : 'See More'}
									</span>
								)}
								{!!badges?.length && (
									<span>
										{badges.map((badge) => (
											<Tag
												key={badge}
												className='rounded-full px-3 py-1 text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'
											>
												{badge}
											</Tag>
										))}
									</span>
								)}
							</div>
						)}
						{isMobile && (
							<div className='flex flex-col gap-6'>
								<ProfileLinkedAddress
									userProfile={userProfile}
									addressWithIdentity={addressWithIdentity}
									theme={theme}
									selectedAddresses={selectedAddresses}
									setSelectedAddresses={setSelectedAddresses}
								/>
								<TotalProfileBalances
									selectedAddresses={selectedAddresses}
									userProfile={userProfile}
									addressWithIdentity={addressWithIdentity}
									theme={theme}
								/>
								{profileDetails?.user_id && (
									<ProfileBadges
										badges={achievement_badges}
										theme={theme}
										selectedAddresses={selectedAddresses}
										userProfile={userProfile}
									/>
								)}
							</div>
						)}
						{delegationSupportedNetworks.includes(network) && !!chainProperties[network]?.subsquidUrl && (
							<ProfileDelegationsCard
								userProfile={userProfile}
								addressWithIdentity={addressWithIdentity}
								onchainIdentity={onchainIdentity}
							/>
						)}
						{!TippingUnavailableNetworks.includes(network) && (
							<ProfileTippingCard
								userProfile={userProfile}
								selectedAddresses={selectedAddresses}
								addressWithIdentity={addressWithIdentity as any}
								theme={theme}
							/>
						)}
					</div>

					{/* Link Address card */}
					{!isMobile && (
						<div className='flex w-[40%] flex-col gap-5 py-1 max-md:w-full'>
							<ProfileLinkedAddress
								userProfile={userProfile}
								addressWithIdentity={addressWithIdentity}
								theme={theme}
								selectedAddresses={selectedAddresses}
								setSelectedAddresses={setSelectedAddresses}
							/>
							<TotalProfileBalances
								selectedAddresses={selectedAddresses}
								userProfile={userProfile}
								addressWithIdentity={addressWithIdentity}
								theme={theme}
							/>
							{profileDetails?.user_id && !!chainProperties[network]?.subsquidUrl && (
								<ProfileBadges
									badges={achievement_badges}
									theme={theme}
									selectedAddresses={selectedAddresses}
									userProfile={userProfile}
								/>
							)}
						</div>
					)}
				</div>
			)}
			{!!openEditModal && username === userProfile.username && (
				<EditProfileModal
					openModal={openEditModal}
					setOpenModal={setOpenEditModal}
					data={profileDetails}
					setProfileDetails={setProfileDetails}
					fromDelegation
				/>
			)}
		</div>
	);
};

export default ProfileOverview;
