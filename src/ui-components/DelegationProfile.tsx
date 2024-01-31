// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Skeleton, message } from 'antd';
import React, { useEffect } from 'react';
import { ProfileDetailsResponse } from '~src/auth/types';
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
import { useUserDetailsSelector } from '~src/redux/selectors';

const ImageComponent = dynamic(() => import('src/components/ImageComponent'), {
	loading: () => <Skeleton.Avatar active />,
	ssr: false
});

interface Props {
	isSearch?: boolean;
	className?: string;
	setIsModalOpen: (pre: boolean) => void;
	userBio: string;
	setUserBio: (userBio: string) => void;
	profileDetails: ProfileDetailsResponse;
	address: string;
}

const DelegationProfile = ({ isSearch, className, setIsModalOpen, userBio, setUserBio, profileDetails, address }: Props) => {
	const { image, social_links, username } = profileDetails;
	const userProfile = useUserDetailsSelector();

	// const [openEditModal, setOpenEditModal] = useState<boolean>(false);
	const [messageApi, contextHolder] = message.useMessage();

	const handleData = async () => {
		// setLoading(true);

		const { data, error } = await nextApiClientFetch<IDelegate[]>('api/v1/delegations/delegates', { address });
		if (data && data[0]?.bio) {
			setUserBio(data[0].bio);
		} else {
			console.log(error);
		}
		// setLoading(false);
	};

	useEffect(() => {
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

	return username && username?.length > 0 ? (
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
					{address && address.length > 0 && (
						<div className='flex items-center gap-1'>
							{address && (
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

					{!userBio ? (
						<h2
							className={`mt-2 text-sm font-normal text-[#576D8BCC] dark:text-white ${username === userProfile.username && 'cursor-pointer'}`}
							onClick={() => setIsModalOpen(true)}
						>
							{username === userProfile.username ? 'Click here to add bio' : 'No Bio'}
						</h2>
					) : (
						<h2
							onClick={() => setIsModalOpen(true)}
							className={`mt-2 cursor-pointer text-sm font-normal tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high ${
								username === userProfile.username && 'cursor-pointer'
							}`}
						>
							{userBio}
						</h2>
					)}

					<div className={'mt-[10px] flex flex-wrap items-center gap-x-5 text-xl text-bodyBlue dark:text-blue-dark-high md:gap-x-3 '}>
						{social_links && (
							<SocialsHandle
								socials={social_links}
								address={address}
								onchainIdentity={null}
							/>
						)}
					</div>
				</div>
			</div>

			{!isSearch && (
				<div className='flex gap-2.5 text-pink_primary'>
					<Tooltip
						title='Coming Soon'
						key={1}
						color='linear-gradient(0deg, #5A46FF, #5A46FF), linear-gradient(0deg, #AD00FF, #AD00FF), linear-gradient(0deg, #407BFF, #407BFF), #FFFFFF'
					>
						<MessengerIcon />
					</Tooltip>
					<span>
						{username === userProfile.username && (
							<CustomButton
								onClick={() => setIsModalOpen(true)}
								height={40}
								width={87}
								variant='default'
								className='max-lg:w-auto'
							>
								<EditIcon className='mt-1 text-base text-pink_primary ' />
								<span className='max-md:hidden'>Edit</span>
							</CustomButton>
						)}
					</span>
				</div>
			)}
			{/* {openEditModal && username === userProfile.username && (
				<EditProfileModal
					openModal={openEditModal}
					setOpenModal={setOpenEditModal}
					data={profileDetails}
					setProfileDetails={setProfileDetails}
					fromDelegation
				/>
			)} */}
		</div>
	) : (
		<div className='h-52 p-6'>
			<Skeleton />
		</div>
	);
};
export default DelegationProfile;
