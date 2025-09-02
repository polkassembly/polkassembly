// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Skeleton, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { ProfileDetailsResponse } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import copyToClipboard from '~src/util/copyToClipboard';
import { CopyIcon, EditIcon } from '~src/ui-components/CustomIcons';
import MessengerIcon from '~assets/icons/messenger.svg';
import EditProfileModal from '~src/components/UserProfile/EditProfile';
import dynamic from 'next/dynamic';
import { useUserDetailsSelector } from '~src/redux/selectors';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Tooltip from '~src/basic-components/Tooltip';
import { socialLinks } from '~src/components/UserProfile/Socials';
import Address from '~src/ui-components/Address';
import SocialLink from '~src/ui-components/SocialLinks';
import SkeletonAvatar from '~src/basic-components/Skeleton/SkeletonAvatar';

const ImageComponent = dynamic(() => import('src/components/ImageComponent'), {
	loading: () => <SkeletonAvatar active />,
	ssr: false
});

interface Props {
	username: string;
	address: string;
	isSearch?: boolean;
	className?: string;
}

const SearchProfile = ({ username, address, isSearch, className }: Props) => {
	const userProfile = useUserDetailsSelector();
	const [profileDetails, setProfileDetails] = useState<ProfileDetailsResponse>({
		achievement_badges: [],
		addresses: [],
		badges: [],
		bio: '',
		image: '',
		social_links: [],
		title: '',
		user_id: 0,
		username: ''
	});

	const { image, social_links, bio, username: userName } = profileDetails;
	const [openEditModal, setOpenEditModal] = useState<boolean>(false);
	const [messageApi, contextHolder] = message.useMessage();

	const getData = async () => {
		const { data, error } = await nextApiClientFetch(`api/v1/auth/data/userProfileWithUsername?username=${username}`);

		if (data) {
			setProfileDetails({ ...profileDetails, ...data });
		} else {
			console.log(error);
		}
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [username, address]);

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

	return username?.length > 0 ? (
		<div className={`shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] flex justify-between rounded-[14px] bg-white dark:bg-section-dark-overlay ${className} dark:border-none`}>
			<div className='flex w-full gap-[34px] '>
				<div className='w-3/10'>
					<ImageComponent
						src={image}
						alt='User Picture'
						className='flex h-[55px] w-[55px] items-center justify-center bg-transparent md:h-[105px] md:w-[105px] '
						iconClassName='flex items-center justify-center text-[#FCE5F2] text-5xl w-full h-full rounded-full'
					/>
				</div>
				<div className='w-7/10 text-bodyBlue dark:text-blue-dark-high'>
					<span className='mb-4 text-lg font-semibold tracking-wide text-bodyBlue dark:text-blue-dark-high'>{username || userName}</span>
					{address && address.length > 0 && (
						<div className='mt-1 flex items-center gap-1'>
							<Address
								address={address}
								displayInline
								isTruncateUsername={false}
							/>
							<span
								className='flex cursor-pointer items-center text-xl'
								onClick={(e) => {
									isSearch && e.preventDefault();
									copyLink(address);
									success();
								}}
							>
								{contextHolder}
								<CopyIcon className='text-2xl text-lightBlue dark:text-icon-dark-inactive' />
							</span>
						</div>
					)}

					{!bio ? (
						<h2
							className={`mt-2 text-sm font-normal text-[#576D8BCC] dark:text-white ${username === userProfile.username && 'cursor-pointer'}`}
							onClick={() => setOpenEditModal(true)}
						>
							{username === userProfile.username ? 'Click here to add bio' : 'No Bio'}
						</h2>
					) : (
						<h2
							onClick={() => setOpenEditModal(true)}
							className={`mt-2 cursor-pointer text-sm font-normal tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high ${
								username === userProfile.username && 'cursor-pointer'
							}`}
						>
							{bio}
						</h2>
					)}

					<div className={`mt-[10px] flex flex-wrap items-center gap-x-5 text-xl text-bodyBlue dark:text-blue-dark-high md:gap-x-3 ${isSearch && 'mt-0'}`}>
						{socialLinks?.map((social: any, index: number) => {
							const link = social_links && Array.isArray(social_links) ? social_links?.find((s) => s.type === social)?.link || '' : '';
							return (
								<SocialLink
									className={`flex h-[30px] w-[30px] items-center justify-center rounded-[20px] bg-[#edeff3] p-[6px] text-2xl hover:text-[#576D8B] dark:bg-inactiveIconDark md:h-[39px] md:w-[40px] md:p-[10px] ${
										isSearch ? 'mt-2' : 'mt-4'
									}`}
									key={index}
									link={link}
									disable={!link}
									type={social}
									iconClassName={`text-lg ${link ? 'text-[#576D8B] dark:text-blue-dark-medium' : 'text-[#96A4B6] dark:text-[#424141]'}`}
								/>
							);
						})}
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
								onClick={() => setOpenEditModal(true)}
								height={40}
								width={87}
								variant='solid'
								className='max-lg:w-auto'
							>
								<EditIcon className='text-sm tracking-wide text-pink_primary ' />
								<span className='max-md:hidden'>Edit</span>
							</CustomButton>
						)}
					</span>
				</div>
			)}
			{openEditModal && username === userProfile.username && (
				<EditProfileModal
					openModal={openEditModal}
					setOpenModal={setOpenEditModal}
					data={profileDetails}
					setProfileDetails={setProfileDetails}
					fromDelegation
				/>
			)}
		</div>
	) : (
		<div className='h-52 p-6'>
			<Skeleton />
		</div>
	);
};
export default SearchProfile;
