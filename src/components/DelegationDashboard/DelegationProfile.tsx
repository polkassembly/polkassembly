// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { IDelegationProfileType } from '~src/auth/types';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { EditIcon } from '~src/ui-components/CustomIcons';
import dynamic from 'next/dynamic';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Address from '~src/ui-components/Address';
import SocialsHandle from '../../ui-components/SocialsHandle';
import { useUserDetailsSelector } from '~src/redux/selectors';
import SkeletonAvatar from '~src/basic-components/Skeleton/SkeletonAvatar';
import Image from 'next/image';
import ExpandableMarkdown from '../Post/Tabs/ExpandableMarkdown';
import { useTheme } from 'next-themes';

const ImageComponent = dynamic(() => import('src/components/ImageComponent'), {
	loading: () => <SkeletonAvatar active />,
	ssr: false
});

const BecomeDelegateModal = dynamic(() => import('src/ui-components/BecomeDelegateModal'), {
	loading: () => <SkeletonAvatar active />,
	ssr: false
});

const ChatWithDelegates = dynamic(() => import('~src/components/DelegationDashboard/Chat'), {
	loading: () => <SkeletonAvatar active />,
	ssr: false
});

interface Props {
	isSearch?: boolean;
	className?: string;
	profileDetails: IDelegationProfileType;
	setIsModalOpen: (pre: boolean) => void;
	userBio: string;
	setUserBio: (pre: string) => void;
	identity: DeriveAccountRegistration | null;
}

const DelegationProfile = ({ isSearch, className, profileDetails, userBio, setUserBio, setIsModalOpen, identity }: Props) => {
	const { theme } = useTheme();
	const userProfile = useUserDetailsSelector();
	const { delegationDashboardAddress: address } = userProfile;
	const { image, social_links, username, bio } = profileDetails;
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [loading, setLoading] = useState<boolean>(false);

	const handleData = async () => {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<{ delegationMandate: string }>('api/v1/delegations/getPADelegationMandates', { address });
		if (data) {
			setUserBio?.(data?.delegationMandate);
			setLoading(false);
		} else if (error) {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		setUserBio('');
		handleData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	return (
		<Spin
			spinning={loading || !username}
			className='h-[150px]'
		>
			<div className={`shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] flex justify-between rounded-[14px] bg-white dark:bg-section-dark-overlay ${className} dark:border-none`}>
				<div className='w-full gap-[34px] max-sm:mb-2 max-sm:mt-3 sm:flex'>
					<div className='w-3/10 mb-4 flex items-start justify-between sm:mb-0'>
						<ImageComponent
							src={image}
							alt='User Picture'
							className='flex h-[105px] w-[105px] items-center justify-center bg-transparent max-sm:mx-auto '
							iconClassName='flex items-center justify-center text-[#FCE5F2] text-5xl w-full h-full rounded-full'
						/>
						{!isSearch && (
							<div className='absolute right-6 top-[34px] flex items-start justify-start gap-2.5 text-pink_primary sm:hidden'>
								{userBio || bio ? (
									<div className='flex space-x-2'>
										<CustomButton
											onClick={() => setIsEditModalOpen(true)}
											height={40}
											width={40}
											variant='default'
											className='sm:hidden'
										>
											<Image
												src={'/assets/delegation-tracks/pen-icon.svg'}
												height={20}
												width={20}
												alt=''
												className={'sm:hidden'}
											/>
										</CustomButton>
									</div>
								) : null}
							</div>
						)}
					</div>
					{!!address && !!username && (
						<div className='w-7/10 gap-1 text-bodyBlue dark:text-blue-dark-high'>
							<div className='flex max-sm:items-end max-sm:justify-center sm:gap-1'>
								<Address
									address={address}
									disableIdenticon
									destroyTooltipOnHide
									isProfileView
									className='flex gap-1 sm:hidden'
									usernameClassName='text-2xl'
									isTruncateUsername={false}
									passedUsername={identity?.display || identity?.legal || username}
									isUsedInDelegationProfile={true}
								/>
								<Address
									address={address}
									disableIdenticon
									isProfileView
									destroyTooltipOnHide
									className='mx-0 hidden gap-1 sm:flex'
									usernameClassName='text-2xl'
									isTruncateUsername={false}
									passedUsername={identity?.display || identity?.legal || username}
								/>
							</div>
							{userBio || bio ? (
								<h2 className={'mt-2.5 cursor-pointer text-sm font-normal tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high sm:ml-1 sm:mt-1.5'}>
									<ExpandableMarkdown
										md={userBio || bio}
										theme={theme}
										minHeight={90}
									/>
								</h2>
							) : null}
							{!!identity && social_links && (
								<SocialsHandle
									className='mt-3 gap-3 max-md:mr-0 max-md:mt-3 max-sm:flex max-sm:items-center max-sm:justify-center max-sm:gap-5'
									socials={social_links}
									address={address}
									onchainIdentity={identity}
									boxSize={40}
									iconSize={24}
								/>
							)}
						</div>
					)}
				</div>

				{!isSearch && (
					<div className='hidden items-start justify-start gap-2.5 text-pink_primary sm:flex'>
						<span className='flex items-center gap-6'>
							<ChatWithDelegates />
							{userBio || bio ? (
								<div className='flex space-x-2'>
									<CustomButton
										onClick={() => setIsEditModalOpen(true)}
										height={40}
										width={87}
										variant='default'
										className='max-lg:w-auto'
									>
										<EditIcon className='mt-1 text-base text-pink_primary ' />
										<span className='max-md:hidden'>Edit</span>
									</CustomButton>
								</div>
							) : (
								<div className='flex space-x-2'>
									<Button
										onClick={() => setIsModalOpen(true)}
										className={'h-10 border-pink_primary bg-white font-medium text-pink_primary dark:bg-black'}
									>
										Become a Delegate
									</Button>
								</div>
							)}
						</span>
					</div>
				)}
				<BecomeDelegateModal
					isModalOpen={isEditModalOpen}
					onchainUsername={identity?.display || identity?.legal || ''}
					setIsModalOpen={setIsEditModalOpen}
					profileDetails={profileDetails}
					userBio={userBio}
					setUserBio={setUserBio}
					isEditMode
				/>
			</div>
		</Spin>
	);
};
export default DelegationProfile;
