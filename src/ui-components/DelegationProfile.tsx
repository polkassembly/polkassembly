// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Spin, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { IDelegationProfileType } from '~src/auth/types';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import copyToClipboard from '~src/util/copyToClipboard';
import { CopyIcon, EditIcon } from '~src/ui-components/CustomIcons';
import dynamic from 'next/dynamic';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Address from '~src/ui-components/Address';
import SocialsHandle from './SocialsHandle';
import { IDelegate } from '~src/types';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import getEncodedAddress from '~src/util/getEncodedAddress';
import SkeletonAvatar from '~src/basic-components/Skeleton/SkeletonAvatar';
import Markdown from './Markdown';

const ImageComponent = dynamic(() => import('src/components/ImageComponent'), {
	loading: () => <SkeletonAvatar active />,
	ssr: false
});

const BecomeDelegateModal = dynamic(() => import('src/ui-components/BecomeDelegateModal'), {
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
	const userProfile = useUserDetailsSelector();
	const { delegationDashboardAddress: address } = userProfile;
	const { network } = useNetworkSelector();
	const { image, social_links, username, bio } = profileDetails;
	const [messageApi, contextHolder] = message.useMessage();
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [loading, setLoading] = useState<boolean>(false);

	const handleData = async () => {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<IDelegate[]>('api/v1/delegations/delegates', { address });
		if (data && data[0]?.bio && data[0]?.dataSource?.includes('polkassembly')) {
			setUserBio(data[0]?.bio || '');
			setLoading(false);
		} else {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		setUserBio('');
		handleData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	const success = () => {
		messageApi.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};
	const copyLink = (address: string) => {
		copyToClipboard(address);
	};

	return (
		<Spin
			spinning={loading || !username}
			className='h-[150px]'
		>
			<div className={`shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] flex justify-between rounded-[14px] bg-white dark:bg-section-dark-overlay ${className} dark:border-none`}>
				<div className='flex w-full gap-[34px]'>
					<div className='w-3/10'>
						<ImageComponent
							src={image}
							alt='User Picture'
							className='flex h-[105px] w-[105px] items-center justify-center bg-transparent '
							iconClassName='flex items-center justify-center text-[#FCE5F2] text-5xl w-full h-full rounded-full'
						/>
					</div>
					{!!address && !!username && (
						<div className='w-7/10 gap-1 text-bodyBlue dark:text-blue-dark-high'>
							<div className='flex gap-1'>
								<span className='text-2xl font-semibold'>{identity?.display || identity?.legal || username}</span>
								<div className='flex items-center gap-1 text-sm font-normal text-lightBlue dark:text-blue-dark-medium'>
									(
									<Address
										address={address}
										disableIdenticon
										destroyTooltipOnHide
										className='mr-0 flex items-center'
										addressClassName='items-center text-sm font-normal text-lightBlue dark:text-blue-dark-medium'
										disableHeader
										passedUsername={identity?.display || identity?.legal || username}
										addressMaxLength={5}
									/>
									)
									<span
										className='flex cursor-pointer items-center text-base'
										onClick={(e) => {
											isSearch && e.preventDefault();
											copyLink(getEncodedAddress(address, network) || '');
											success();
										}}
									>
										{contextHolder}
										<CopyIcon className='text-2xl text-lightBlue dark:text-icon-dark-inactive' />
									</span>
								</div>
							</div>
							{userBio || bio ? (
								<h2 className={'mt-1.5 cursor-pointer text-sm font-normal tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high'}>
									<Markdown
										md={userBio || bio}
										className={'max-h-32 overflow-y-auto'}
										isPreview={true}
									/>
								</h2>
							) : null}
							{identity && social_links && (
								<SocialsHandle
									className='mt-3 gap-3 max-md:mr-0 max-md:mt-4 max-md:gap-2'
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
					<div className='flex items-start justify-start gap-2.5 text-pink_primary'>
						<span>
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
								<div className='flex items-center justify-center gap-2'>
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
