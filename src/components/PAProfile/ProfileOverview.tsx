// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import classNames from 'classnames';
import { ProfileDetailsResponse } from '~src/auth/types';
import Image from 'next/image';
import { Tag } from 'antd';
import ProfileDelegationsCard from './ProfileDelegationsCard';
import { delegationSupportedNetworks } from '../DelegationDashboard';
import { useNetworkSelector } from '~src/redux/selectors';
import { TippingUnavailableNetworks } from '~src/ui-components/QuickView';
import dynamic from 'next/dynamic';

const ProfileTippingCard = dynamic(() => import('./ProfileTippingCard'), {
	ssr: false
});
const ProfileLinkedAddress = dynamic(() => import('./ProfileLinkedAddresses'), {
	ssr: false
});
const TotalProfileBalances = dynamic(() => import('./TotalProfileBalances'), {
	ssr: false
});

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
	selectedAddresses: string[];
	setSelectedAddresses: (pre: string[]) => void;
}

const ProfileOverview = ({ className, userProfile, addressWithIdentity, theme, selectedAddresses, setSelectedAddresses }: Props) => {
	const { network } = useNetworkSelector();
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;
	const { bio, badges } = userProfile;
	return (
		<div className={classNames(className, 'mt-6 flex gap-6')}>
			<div className='flex w-[60%] flex-col gap-5 py-1 max-md:w-full'>
				{/* About card */}
				{!!bio?.length && (
					<div className='flex flex-col gap-5 rounded-[14px] border-[1px] border-solid border-[#D2D8E0] bg-white px-4 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'>
						<span className='flex items-center gap-1.5 text-xl font-semibold dark:text-blue-dark-medium'>
							<Image
								src='/assets/profile/about.svg'
								alt=''
								width={24}
								height={24}
							/>{' '}
							About
						</span>
						<span className='text-sm font-normal'>{bio}</span>
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
					</div>
				)}
				{delegationSupportedNetworks.includes(network) && (
					<ProfileDelegationsCard
						userProfile={userProfile}
						addressWithIdentity={addressWithIdentity}
					/>
				)}
				{!TippingUnavailableNetworks.includes(network) && (
					<ProfileTippingCard
						userProfile={userProfile}
						selectedAddresses={selectedAddresses}
						addressWithIdentity={addressWithIdentity}
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
				</div>
			)}
		</div>
	);
};

export default ProfileOverview;
