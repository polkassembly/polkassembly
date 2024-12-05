// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import ImageComponent from '~src/components/ImageComponent';
import Address from '~src/ui-components/Address';
import copyToClipboard from '~src/util/copyToClipboard';
import { Form, message } from 'antd';
import { CopyIcon } from '~src/ui-components/CustomIcons';
import { spaceGrotesk } from 'pages/_app';
import SocialsHandle from '~src/ui-components/SocialsHandle';
import Image from 'next/image';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { TOnChainIdentity } from '~src/components/UserProfile';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { CuratorData } from '../types/types';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import AddOrEditCuratorBioModal from './AddOrEditCuratorBioModal';
import { useTranslation } from 'next-i18next';

const CuratorProfileCard = ({ curatorData }: { curatorData: CuratorData }) => {
	const { t } = useTranslation('common');
	const { loginAddress, id } = useUserDetailsSelector();
	const [curatorProfile, setCuratorProfile] = useState<IGetProfileWithAddressResponse | null>(null);
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;
	const [openAddOrEditModal, setAddOrEditModal] = useState(false);
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const [curatorBio, setCuratorBio] = useState<string>('');
	const [onChainIdentity, setOnChainIdentity] = useState<TOnChainIdentity>({
		judgements: [],
		nickname: ''
	});
	const [form] = Form.useForm();

	const fetchCuratorProfile = async () => {
		if (!loginAddress) return;
		const substrateAddress = getSubstrateAddress(loginAddress);
		const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`api/v1/auth/data/profileWithAddress?address=${substrateAddress}`);
		if (data) setCuratorProfile(data);
		if (error) {
			console.log(error, 'error');
			setCuratorProfile(null);
		}
	};

	const fetchCuratorBio = async () => {
		if (!id || isNaN(id) || id < 0) return;
		const { data, error } = await nextApiClientFetch<any>('/api/v1/bounty/curator/getCuratorBio', {
			network,
			userId: id
		});
		if (data) setCuratorBio(data?.curatorBio);
		if (error) console.log(error, 'error');
	};

	const handleCopyAddress = () => {
		if (getEncodedAddress(loginAddress, network)) {
			copyToClipboard(getEncodedAddress(loginAddress, network) || loginAddress);
			message.success(t('address_copied'));
		} else {
			message.error(t('no_address_available'));
		}
	};

	const handleEditClick = () => {
		setAddOrEditModal(true);
		form.setFieldsValue({
			bio: curatorBio
		});
	};

	const fetchIdentityInformation = async () => {
		const onChainIdentity: TOnChainIdentity = {
			judgements: [],
			nickname: ''
		};
		const info = await getIdentityInformation({
			address: loginAddress,
			api: peopleChainApi ?? api,
			network: network
		});

		if (info?.nickname && !onChainIdentity?.nickname) {
			onChainIdentity.nickname = info?.nickname;
		}
		Object.entries(info).forEach(([key, value]) => {
			if (value) {
				if (Array.isArray(value) && value.length > 0 && (onChainIdentity as any)[key]?.length === 0) {
					(onChainIdentity as any)[key] = value;
				} else if (!(onChainIdentity as any)[key]) {
					(onChainIdentity as any)[key] = value;
				}
			}
		});
		setOnChainIdentity(onChainIdentity);
	};

	useEffect(() => {
		if (!api || !apiReady || !loginAddress) return;

		fetchIdentityInformation();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginAddress, api, apiReady, peopleChainApi, peopleChainApiReady, network]);

	useEffect(() => {
		if (!getEncodedAddress(loginAddress, network)) return;
		fetchCuratorProfile();
		fetchCuratorBio();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginAddress]);

	return (
		<div className='rounded-lg border-[0.7px] border-solid border-[#D2D8E0] bg-white p-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]'>
			<div className='flex gap-5'>
				<ImageComponent
					src={curatorProfile?.profile?.image}
					alt='profile'
					className='flex h-[100px] w-[120px] items-center justify-center '
					iconClassName='flex items-center justify-center text-[#FCE5F2] w-full h-full rounded-full'
				/>
				<div className='flex w-full flex-col'>
					<div className='flex justify-between'>
						<div className='flex'>
							<Address
								address={loginAddress}
								disableIdenticon
								isProfileView
								className='flex gap-1'
								usernameClassName='text-xl'
								disableTooltip
								isTruncateUsername={isMobile || false}
								passedUsername={curatorProfile?.username}
							/>
							<span
								className='flex cursor-pointer flex-row items-center p-1'
								onClick={(e) => {
									e.preventDefault();
									copyToClipboard(getEncodedAddress(loginAddress, network) || '');
									handleCopyAddress();
								}}
							>
								<CopyIcon className='text-2xl text-lightBlue dark:text-icon-dark-inactive' />
							</span>
						</div>
						<CustomButton
							variant='default'
							onClick={handleEditClick}
							className={`${spaceGrotesk.className} ${spaceGrotesk.variable} cursor-pointer gap-1 border-none p-0 text-sm font-bold text-pink_primary`}
						>
							<Image
								src='/assets/icons/curator-dashboard/pen.svg'
								alt='bounty icon'
								width={18}
								height={18}
							/>
							{!curatorBio?.length ? t('add_bio') : t('edit_bio')}
						</CustomButton>
					</div>
					<div className='flex gap-3 text-sm font-bold'>
						<p
							className={`${spaceGrotesk.className} ${spaceGrotesk.variable} flex items-center rounded-full bg-[#EEF2FF] p-1 px-2 text-[#4F46E5] dark:bg-[#A8A4E7] dark:bg-opacity-[20%]`}
						>
							<Image
								src='/assets/bounty-icons/bounty-proposals.svg'
								alt='bounty icon'
								className='mr-1'
								style={{
									filter: ' brightness(0) saturate(100%) invert(19%) sepia(82%) saturate(3493%) hue-rotate(242deg) brightness(96%) contrast(88%)'
								}}
								width={20}
								height={20}
							/>
							{t('bounties_curated', { count: curatorData?.allBounties?.count })}
						</p>
						<p
							className={`${spaceGrotesk.className} ${spaceGrotesk.variable} flex items-center rounded-full bg-[#FFEEE0] p-1 px-2 text-[#DB511F] dark:bg-[#DEA38D] dark:bg-opacity-[20%]`}
						>
							<Image
								src='/assets/bounty-icons/child-bounty-icon.svg'
								alt='bounty icon'
								className='mr-1'
								style={{
									filter: 'invert(39%) sepia(64%) saturate(4280%) hue-rotate(355deg) brightness(93%) contrast(83%)'
								}}
								width={20}
								height={20}
							/>
							{t('child_bounties_curated', { count: curatorData?.childBounties?.count })}
						</p>
					</div>

					<div className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-[16px]`}>{curatorBio}</div>
					<SocialsHandle
						className='mr-6 mt-3 gap-4'
						onchainIdentity={onChainIdentity}
						socials={curatorProfile?.profile?.social_links || []}
						address={loginAddress}
						iconSize={18}
						boxSize={32}
					/>
				</div>
			</div>
			<AddOrEditCuratorBioModal
				curatorInitialBio={curatorBio}
				setCuratorInitialBio={setCuratorBio}
				open={openAddOrEditModal}
				setOpen={setAddOrEditModal}
			/>
		</div>
	);
};

export default CuratorProfileCard;
