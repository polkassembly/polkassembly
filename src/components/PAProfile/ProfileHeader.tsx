// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ProfileDetailsResponse } from '~src/auth/types';
import EditProfileModal from '../UserProfile/EditProfile';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Image from 'next/image';
import { TippingUnavailableNetworks } from '~src/ui-components/QuickView';
import dynamic from 'next/dynamic';
import { useDispatch } from 'react-redux';
import { setReceiver } from '~src/redux/Tipping';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import DelegateModal from '../Listing/Tracks/DelegateModal';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { DollarIcon } from '~src/ui-components/CustomIcons';

const Tipping = dynamic(() => import('~src/components/Tipping'), {
	ssr: false
});
interface Props {
	className?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
	profileDetails: ProfileDetailsResponse;
	setProfileDetails: React.Dispatch<React.SetStateAction<ProfileDetailsResponse>>;
}

const ProfileHeader = ({ className, userProfile, profileDetails, setProfileDetails, addressWithIdentity }: Props) => {
	const dispatch = useDispatch();
	const { username, id } = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const [openTipModal, setOpenTipModal] = useState<boolean>(false);
	const [openDelegateModal, setOpenDelegateModal] = useState<boolean>(false);
	const [openAddressChangeModal, setOpenAddressChangeModal] = useState<boolean>(false);
	const disableState = !profileDetails?.addresses?.length || (id !== 0 && !id);

	useEffect(() => {
		if (userProfile && userProfile) {
			setProfileDetails(userProfile);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userProfile]);

	return (
		<div className={classNames(className, 'wallet-info-board gap mt-[-25px] flex rounded-b-[20px] max-lg:absolute max-lg:left-0 max-lg:top-[80px] max-lg:w-[99.3vw]')}>
			<div className='profile-header mt-0 flex h-[192px] w-full items-end justify-end'>
				<div className='flex w-full items-center justify-end p-8'>
					{username === userProfile.username ? (
						<div>
							<EditProfileModal
								setProfileDetails={setProfileDetails}
								data={profileDetails}
							/>
						</div>
					) : (
						<div className='flex gap-3'>
							{!TippingUnavailableNetworks.includes(network) && (
								<CustomButton
									shape='circle'
									className={`rounded-full border-[1px]  border-white px-4 py-2.5 text-white max-md:p-3 ${disableState && 'opacity-50'}`}
									onClick={() => {
										if (disableState) return;
										setOpenTipModal(true);
										dispatch(setReceiver(addressWithIdentity || ''));
									}}
									disabled={!id}
								>
									<div className='flex items-center gap-1.5'>
										{' '}
										<DollarIcon className='text-lg' />
										<span className='max-md:hidden'>Tip User</span>
									</div>
								</CustomButton>
							)}
							{!['moonbeam', 'moonbase', 'moonriver'].includes(network) && isOpenGovSupported(network) && (
								<CustomButton
									shape='circle'
									className={`rounded-full border-[1px] border-white px-4 py-2.5 text-white max-md:p-3 ${disableState && 'opacity-50'}`}
									onClick={() => {
										if (disableState) return;
										setOpenDelegateModal(true);
									}}
									disabled={!id}
								>
									<Image
										src='/assets/icons/white-delegated-profile.svg'
										className='mr-1 rounded-full'
										height={20}
										width={20}
										alt='edit logo'
									/>
									<span className='max-md:hidden'>Delegate</span>
								</CustomButton>
							)}
							{/* <CustomButton
								shape='circle'
								variant='primary'
								className={`rounded-full border-none px-4 py-2.5 text-white max-md:p-3 ${disableState && 'opacity-50'}`}
								onClick={() => {
									if (disableState) return;
								}}
								disabled={!id}
							>
								<Image
									src='/assets/profile/profile-follow.svg'
									className='mr-1 rounded-full'
									height={20}
									width={20}
									alt='edit logo'
								/>
								<span className='max-md:hidden'>Follow</span>
							</CustomButton> */}
						</div>
					)}
				</div>
			</div>
			{!TippingUnavailableNetworks.includes(network) && (
				<Tipping
					open={openTipModal}
					setOpen={setOpenTipModal}
					paUsername={userProfile.username}
					setOpenAddressChangeModal={setOpenAddressChangeModal}
					openAddressChangeModal={openAddressChangeModal}
					username={userProfile.username || ''}
				/>
			)}
			{!['moonbeam', 'moonbase', 'moonriver'].includes(network) && isOpenGovSupported(network) && (
				<DelegateModal
					open={openDelegateModal}
					setOpen={setOpenDelegateModal}
					defaultTarget={getEncodedAddress(addressWithIdentity, network) || ''}
				/>
			)}
		</div>
	);
};

export default styled(ProfileHeader)`
	.profile-header {
		background-image: url('/assets/profile/profile-header.svg') !important;
	}
`;
