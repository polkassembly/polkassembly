// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Skeleton, message } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { ProfileDetailsResponse } from '~src/auth/types';
import { DeriveAccountRegistration, DeriveAccountInfo } from '@polkadot/api-derive/types';
import { ApiContext } from '~src/context/ApiContext';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import copyToClipboard from '~src/util/copyToClipboard';
import { CopyIcon, EditIcon } from '~src/ui-components/CustomIcons';
import MessengerIcon from '~assets/icons/messenger.svg';
import dynamic from 'next/dynamic';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Tooltip from '~src/basic-components/Tooltip';
import Address from '~src/ui-components/Address';
import SocialsHandle from './SocialsHandle';
import { IDelegate } from '~src/types';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ApiPromise } from '@polkadot/api';
import { network as AllNetworks } from '~src/global/networkConstants';
import getEncodedAddress from '~src/util/getEncodedAddress';
import Loader from './Loader';

const ImageComponent = dynamic(() => import('src/components/ImageComponent'), {
	loading: () => <Skeleton.Avatar active />,
	ssr: false
});

const BecomeDelegateEditModal = dynamic(() => import('src/ui-components/BecomeDelegateEditModal'), {
	loading: () => <Loader />,
	ssr: false
});

interface Props {
	isSearch?: boolean;
	className?: string;
	profileDetails: ProfileDetailsResponse;
	setProfileDetails: (profileDetails: ProfileDetailsResponse) => void;
	setIsModalOpen: (pre: boolean) => void;
}

const DelegationProfile = ({ isSearch, className, profileDetails, setProfileDetails, setIsModalOpen }: Props) => {
	const userProfile = useUserDetailsSelector();
	const { username, delegationDashboardAddress: address } = userProfile;
	const { network } = useNetworkSelector();
	const apiContext = useContext(ApiContext);
	const { image, social_links, bio } = profileDetails;
	const [api, setApi] = useState<ApiPromise>();
	const [apiReady, setApiReady] = useState(false);
	const encodedAddr = address ? getEncodedAddress(address, network) || '' : '';
	const [identity, setIdentity] = useState<DeriveAccountRegistration>();
	const [messageApi, contextHolder] = message.useMessage();
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	const handleData = async () => {
		const { data, error } = await nextApiClientFetch<IDelegate[]>('api/v1/delegations/delegates', { address });
		if (data && data[0]?.bio) {
			const bio = data[0].bio;
			setProfileDetails({ ...profileDetails, bio });
		} else {
			setProfileDetails({ ...profileDetails, bio: '' });
			console.log(error);
		}
	};

	useEffect(() => {
		handleData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);
	const handleIdentityInfo = () => {
		if (!api || !apiReady) return;

		let unsubscribe: () => void;

		api.derive.accounts
			.info(encodedAddr, (info: DeriveAccountInfo) => {
				setIdentity(info.identity);
			})
			.then((unsub) => {
				unsubscribe = unsub;
			})
			.catch((e) => {
				console.error(e);
			});

		return () => unsubscribe && unsubscribe();
	};

	useEffect(() => {
		if (network === AllNetworks.COLLECTIVES && apiContext.relayApi && apiContext.relayApiReady) {
			setApi(apiContext.relayApi);
			setApiReady(apiContext.relayApiReady);
		} else {
			if (!apiContext.api || !apiContext.apiReady) return;
			setApi(apiContext.api);
			setApiReady(apiContext.apiReady);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, apiContext.api, apiContext.apiReady, apiContext.relayApi, apiContext.relayApiReady, address]);

	useEffect(() => {
		if (!api || !apiReady || !address || !encodedAddr) return;

		handleIdentityInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, address, encodedAddr, network]);

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
		<div className={`shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] flex justify-between rounded-[14px] bg-white dark:bg-section-dark-overlay ${className} dark:border-none`}>
			<div className='flex w-full gap-[34px] '>
				<div className='w-3/10'>
					<ImageComponent
						src={image}
						alt='User Picture'
						className='flex h-[105px] w-[105px] items-center justify-center bg-transparent '
						iconClassName='flex items-center justify-center text-[#FCE5F2] text-5xl w-full h-full rounded-full'
					/>
				</div>
				<div className='w-7/10 text-bodyBlue dark:text-blue-dark-high'>
					{address && (
						<div className='flex items-center gap-1'>
							{address && username && (
								<Address
									address={address}
									disableIdenticon
									isProfileView
									destroyTooltipOnHide
									className='flex gap-1'
									usernameClassName='text-2xl'
									passedUsername={username}
									usernameMaxLength={20}
								/>
							)}
							<span
								className='flex cursor-pointer items-center text-xl'
								onClick={(e) => {
									isSearch && e.preventDefault();
									copyLink(address);
									success();
								}}
							>
								{contextHolder}
								<CopyIcon className='text-lightBlue dark:text-icon-dark-inactive' />
							</span>
						</div>
					)}

					{bio ? <h2 className={'mt-2.5 cursor-pointer text-sm font-normal tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high'}>{bio}</h2> : null}
					{identity && social_links && (
						<SocialsHandle
							className='mt-4 gap-3 max-md:mr-0 max-md:mt-4 max-md:gap-2'
							socials={social_links}
							address={address}
							onchainIdentity={identity}
							boxSize={40}
							iconSize={24}
						/>
					)}
				</div>
			</div>

			{!isSearch && (
				<div className='flex items-start justify-start gap-2.5 text-pink_primary'>
					<span>
						{bio ? (
							<div className='flex space-x-2'>
								<Tooltip
									title='Coming Soon'
									key={1}
									color='linear-gradient(0deg, #5A46FF, #5A46FF), linear-gradient(0deg, #AD00FF, #AD00FF), linear-gradient(0deg, #407BFF, #407BFF), #FFFFFF'
								>
									<MessengerIcon />
								</Tooltip>
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
								<Tooltip
									title='Coming Soon'
									key={1}
									color='linear-gradient(0deg, #5A46FF, #5A46FF), linear-gradient(0deg, #AD00FF, #AD00FF), linear-gradient(0deg, #407BFF, #407BFF), #FFFFFF'
								>
									<MessengerIcon />
								</Tooltip>
								<Button
									onClick={() => setIsModalOpen(true)}
									className={' mt-1 border-[#E5007A] bg-white font-medium text-pink_primary dark:bg-black'}
								>
									Become a Delegate
								</Button>
							</div>
						)}
					</span>
				</div>
			)}
			<BecomeDelegateEditModal
				isEditModalOpen={isEditModalOpen}
				setIsEditModalOpen={setIsEditModalOpen}
				className=''
				profileDetails={profileDetails}
				setProfileDetails={setProfileDetails}
				IsUsedForEdit={true}
			/>
		</div>
	);
};
export default DelegationProfile;
