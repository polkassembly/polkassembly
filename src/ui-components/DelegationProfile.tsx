// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Skeleton, Tooltip, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { ProfileDetailsResponse } from '~src/auth/types';
import SocialLink from './SocialLinks';
import { socialLinks } from '~src/components/UserProfile/Details';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import Address from './Address';
import { EditIcon } from './CustomIcons';
import copyToClipboard from '~src/util/copyToClipboard';
import CopyIcon from '~assets/icons/content-copy.svg';
import MessengerIcon from '~assets/icons/messenger.svg';
import EditProfileModal from '~src/components/UserProfile/EditProfile';
import dynamic from 'next/dynamic';
import { useUserDetailsContext } from '~src/context';

const ImageComponent = dynamic(() => import('src/components/ImageComponent'), {
	loading: () => <Skeleton.Avatar active />,
	ssr: false
});

interface Props {
	username: string;
	address: string;
	isSearch?: boolean;
	className?: string;
}

const DelegationProfile = ({ username, address, isSearch, className }: Props) => {
	const userProfile = useUserDetailsContext();
	const [profileDetails, setProfileDetails] = useState<ProfileDetailsResponse>({
		addresses: [],
		badges: [],
		bio: '',
		image: '',
		social_links: [],
		title: '',
		user_id: 0,
		username: ''
	});

	const { image, social_links, bio, username: userName, addresses } = profileDetails;
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

	return username?.length > 0 || username.length > 0 ? (
		<div className={`shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] flex justify-between rounded-[14px] bg-white ${className}`}>
			<div className='flex justify-center gap-[34px] '>
				<ImageComponent
					src={image}
					alt='User Picture'
					className='flex h-[105px] w-[105px] items-center justify-center bg-transparent '
					iconClassName='flex items-center justify-center text-[#FCE5F2] text-5xl w-full h-full rounded-full'
				/>
				<div className='text-bodyBlue'>
					<span className='mb-4 text-lg font-semibold tracking-wide text-bodyBlue'>{username || userName}</span>
					{address && address.length > 0 && (
						<div className='flex items-center gap-2'>
							<Address
								address={address}
								displayInline
							/>
							<span
								className='ml-2 flex cursor-pointer items-center'
								onClick={(e) => {
									isSearch && e.preventDefault();
									copyLink(address || addresses[0]);
									success();
								}}
							>
								{contextHolder}
								<CopyIcon />
							</span>
						</div>
					)}

					{bio?.length === 0 ? (
						<h2
							className={`mt-2 text-sm font-normal text-[#576D8BCC] ${username === userProfile.username && 'cursor-pointer'}`}
							onClick={() => setOpenEditModal(true)}
						>
							{username === userProfile.username ? 'Click here to add bio' : 'No Bio'}
						</h2>
					) : (
						<h2
							onClick={() => setOpenEditModal(true)}
							className={`mt-2 cursor-pointer text-sm font-normal tracking-[0.01em] text-bodyBlue ${username === userProfile.username && 'cursor-pointer'}`}
						>
							{bio}
						</h2>
					)}

					<div className={`mt-[10px] flex flex-wrap items-center gap-x-5 text-xl text-bodyBlue md:gap-x-3 ${isSearch && 'mt-0'}`}>
						{socialLinks?.map((social: any, index: number) => {
							const link = social_links && Array.isArray(social_links) ? social_links?.find((s) => s.type === social)?.link || '' : '';
							return (
								<SocialLink
									className={`flex h-[39px] w-[40px] items-center justify-center rounded-[20px] bg-[#edeff3] p-[10px] text-2xl hover:text-[#576D8B] ${isSearch ? 'mt-2' : 'mt-4'}`}
									key={index}
									link={link}
									disable={!link}
									type={social}
									iconClassName={`text-lg ${link ? 'text-[#576D8B]' : 'text-[#96A4B6]'}`}
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
							<Button
								onClick={() => setOpenEditModal(true)}
								className='h-[40px] w-[87px] border-[1px] border-solid border-pink_primary font-medium text-pink_primary max-lg:w-auto'
							>
								<EditIcon className='text-[14px] tracking-wide text-pink_primary ' />
								<span className='max-md:hidden'>Edit</span>
							</Button>
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
				/>
			)}
		</div>
	) : (
		<div className='p-6'>
			<Skeleton />
		</div>
	);
};
export default DelegationProfile;
