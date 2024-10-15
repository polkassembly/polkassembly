// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import ImageComponent from '~src/components/ImageComponent';
import Address from '~src/ui-components/Address';
import copyToClipboard from '~src/util/copyToClipboard';
import { Divider, Form, Input, message, Modal } from 'antd';
import { CopyIcon } from '~src/ui-components/CustomIcons';
import { poppins, spaceGrotesk } from 'pages/_app';
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
import { ESocialType } from '~src/auth/types';

const CuratorProfileCard = ({ curatorData }: { curatorData: any }) => {
	const currentUser = useUserDetailsSelector();
	const address = currentUser?.loginAddress;
	const [curatorprofile, setCuratorProfile] = useState<IGetProfileWithAddressResponse | null>(null);

	const fetchCuratorProfile = async () => {
		if (address) {
			const substrateAddress = getSubstrateAddress(address);
			const { data } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`api/v1/auth/data/profileWithAddress?address=${substrateAddress}`);
			if (data) setCuratorProfile(data);
		}
	};

	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [addressWithIdentity, setAddressWithIdentity] = useState<string>('');
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const [curatorBio, setCuratorBio] = useState<string>('');
	const [onChainIdentity, setOnChainIdentity] = useState<TOnChainIdentity>({
		judgements: [],
		nickname: ''
	});
	const [form] = Form.useForm();

	const fetchCuratorBio = async () => {
		if (currentUser?.id !== undefined && currentUser?.id !== null) {
			const { data } = await nextApiClientFetch<any>('/api/v1/bounty/curator/getCuratorBio', {
				network,
				userId: currentUser?.id
			});
			if (data) setCuratorBio(data?.curatorBio);
		}
	};

	const handleCopyAddress = () => {
		message.success('Address copied to clipboard');
	};
	const handleEditClick = () => {
		setIsModalVisible(true);
		form.setFieldsValue({
			bio: curatorBio
		});
	};

	const handleCancel = () => {
		setIsModalVisible(false);
	};
	const handleOk = () => {
		form.validateFields().then(async (values) => {
			const { data, error: editError } = await nextApiClientFetch<any>('/api/v1/bounty/curator/editCuratorBio', {
				curatorBio: values?.bio
			});
			if (editError) console.log(data, editError);
			if (data) {
				message.success('Curator Bio updated successfully');
			}

			setCuratorBio(values?.bio);
			setIsModalVisible(false);
		});
	};

	useEffect(() => {
		if (!api || !apiReady || !address) return;

		let unsubscribes: (() => void)[];
		const onChainIdentity: TOnChainIdentity = {
			judgements: [],
			nickname: ''
		};
		const fetchIdentityInformation = async () => {
			const info = await getIdentityInformation({
				address: address,
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
						setAddressWithIdentity(getEncodedAddress(address, network) || '');
					} else if (!(onChainIdentity as any)[key]) {
						(onChainIdentity as any)[key] = value;
					}
				}
			});
			setOnChainIdentity(onChainIdentity);
		};

		fetchIdentityInformation();

		return () => {
			unsubscribes && unsubscribes.length > 0 && unsubscribes.forEach((unsub) => unsub && unsub());
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady, peopleChainApi, peopleChainApiReady, network]);

	useEffect(() => {
		const { email, twitter, riot, web } = onChainIdentity;

		if (onChainIdentity && (email || twitter || web || riot)) {
			const social_links = curatorprofile?.profile?.social_links || [];
			let isEmailAvailable = false;
			let isTwitterAvailable = false;
			let isRiotAvailable = false;
			social_links?.forEach((v) => {
				switch (v?.type) {
					case ESocialType.EMAIL:
						isEmailAvailable = true;
						break;
					case ESocialType.TWITTER:
						isTwitterAvailable = true;
						break;
					case ESocialType.RIOT:
						isRiotAvailable = true;
				}
			});
			if (email && !isEmailAvailable) {
				social_links?.push({
					link: email,
					type: ESocialType.EMAIL
				});
			}
			if (twitter && !isTwitterAvailable) {
				social_links?.push({
					link: `https://twitter.com/${twitter}`,
					type: ESocialType.TWITTER
				});
			}
			if (riot && !isRiotAvailable) {
				social_links?.push({
					link: `https://matrix.to/#/${riot}`,
					type: ESocialType.RIOT
				});
			}
			setCuratorProfile((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					profile: {
						...prev?.profile,
						social_links: social_links
					}
				};
			});
		} else {
			setAddressWithIdentity(address || '');
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onChainIdentity]);
	useEffect(() => {
		fetchCuratorProfile();
		fetchCuratorBio();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);
	return (
		<div className='rounded-lg border-[0.7px] border-solid border-[#D2D8E0] bg-white p-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]'>
			<div className='flex gap-5'>
				<ImageComponent
					src={curatorprofile?.profile?.image}
					alt='profile'
					className='flex h-[100px] w-[120px] items-center justify-center '
					iconClassName='flex items-center justify-center text-[#FCE5F2] w-full h-full rounded-full'
				/>
				<div className='flex w-full flex-col'>
					<div className='flex justify-between'>
						<div className='flex'>
							<Address
								address={addressWithIdentity}
								disableIdenticon
								isProfileView
								destroyTooltipOnHide
								className='flex gap-1'
								usernameClassName='text-2xl'
								isTruncateUsername={isMobile || false}
								passedUsername={curatorprofile?.username}
							/>
							<span
								className='flex cursor-pointer flex-row items-center p-1'
								onClick={(e) => {
									e.preventDefault();
									copyToClipboard(address || '');
									handleCopyAddress();
								}}
							>
								<CopyIcon className='text-2xl text-lightBlue dark:text-icon-dark-inactive' />
							</span>
						</div>
						<p
							onClick={handleEditClick}
							className={`${spaceGrotesk.className} ${spaceGrotesk.variable} cursor-pointer text-[16px] font-bold text-pink_primary`}
						>
							{' '}
							<Image
								src='/assets/icons/curator-dashboard/pen.svg'
								alt='bounty icon'
								width={24}
								height={24}
							/>
							Edit
						</p>
					</div>
					<div className='flex gap-3 text-sm font-bold'>
						<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} rounded-full bg-[#EEF2FF] p-1 px-2 text-[#4F46E5] dark:bg-[#A8A4E7] dark:bg-opacity-[20%]`}>
							<Image
								src='/assets/bounty-icons/bounty-proposals.svg'
								alt='bounty icon'
								className='mr-1'
								style={{
									filter: ' brightness(0) saturate(100%) invert(19%) sepia(82%) saturate(3493%) hue-rotate(242deg) brightness(96%) contrast(88%)'
								}}
								width={24}
								height={24}
							/>
							{curatorData?.allBounties?.count} Bounties Curated
						</p>
						<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} rounded-full bg-[#FFEEE0] p-1 px-2 text-[#DB511F] dark:bg-[#DEA38D] dark:bg-opacity-[20%]`}>
							<Image
								src='/assets/bounty-icons/child-bounty-icon.svg'
								alt='bounty icon'
								className='mr-1'
								style={{
									filter: 'invert(39%) sepia(64%) saturate(4280%) hue-rotate(355deg) brightness(93%) contrast(83%)'
								}}
								width={24}
								height={24}
							/>
							{curatorData?.childBounties?.count} Child Bounties Curated
						</p>
					</div>

					<div className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-[16px]`}>{curatorBio}</div>
					<SocialsHandle
						className='mr-6 mt-3 gap-4'
						onchainIdentity={onChainIdentity}
						socials={curatorprofile?.profile?.social_links || []}
						address={addressWithIdentity}
						iconSize={18}
						boxSize={32}
					/>
				</div>
			</div>
			<Modal
				title={
					<div>
						<div className='flex items-center gap-1.5 text-xl font-medium text-lightBlue dark:text-white'>Edit Curator Bio</div>
						<Divider
							style={{ background: '#D2D8E0', flexGrow: 1 }}
							className='mt-1 px-0 dark:bg-separatorDark'
						/>
					</div>
				}
				visible={isModalVisible}
				onOk={handleOk}
				onCancel={handleCancel}
			>
				<Form
					form={form}
					layout='vertical'
					className={`${poppins.className} ${poppins.variable}`}
				>
					<Form.Item
						name='bio'
						label={
							<div className='flex items-center gap-1.5 text-sm font-medium text-lightBlue dark:text-white'>
								Curator Bio <span className='text-red-500'>*</span>
							</div>
						}
					>
						<Input.TextArea
							rows={4}
							placeholder='Enter your bio'
						/>
					</Form.Item>
					<Divider
						style={{ background: '#D2D8E0', flexGrow: 1 }}
						className='mt-1 px-0 dark:bg-separatorDark'
					/>
				</Form>
			</Modal>
		</div>
	);
};

export default CuratorProfileCard;
