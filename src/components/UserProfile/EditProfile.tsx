// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CloseOutlined } from '@ant-design/icons';
import { Alert, Button, Divider, Modal, Tabs } from 'antd';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { IAddProfileResponse, ISocial, ProfileDetails, ProfileDetailsResponse } from '~src/auth/types';
import { NotificationStatus } from '~src/types';
import { handleTokenChange } from 'src/services/auth.service';

import { EditIcon } from '~src/ui-components/CustomIcons';
import queueNotification from '~src/ui-components/QueueNotification';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import BasicInformation from './BasicInformation';
import Socials from './Socials';
import messages from '~src/auth/utils/messages';
import nameBlacklist from '~src/auth/utils/nameBlacklist';
import { useRouter } from 'next/router';
import { useUserDetailsContext } from '~src/context';
import { poppins } from 'pages/_app';

interface IEditProfileModalProps {
    id?: number | null;
    data?: ProfileDetailsResponse;
	setProfileDetails: React.Dispatch<React.SetStateAction<ProfileDetailsResponse>>;
  openModal?: boolean;
  setOpenModal?: (pre:boolean) => void;
}

const getDefaultProfile: () => ProfileDetails = () => {
	return {
		badges: [],
		bio: '',
		imgUrl: '',
		social_links: [],
		title: ''
	};
};

const EditProfileModal: FC<IEditProfileModalProps> = (props) => {
	const { data, id, setProfileDetails, openModal, setOpenModal } = props;
	const [open, setOpen] = useState(false);
	const [profile, setProfile] = useState(getDefaultProfile());
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const userDetailsContext = useUserDetailsContext();
	const [username, setUsername] = useState<string>(userDetailsContext.username || '');
	const router = useRouter();

	const validateData = ( image: string | undefined, social_links: ISocial[] | undefined) => {

		// eslint-disable-next-line no-useless-escape
		const regex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);

		if(image && image.trim() && !image?.match(regex)) {
			setError('Image URL is invalid.');
			return;
		}

		if (social_links && Array.isArray(social_links)) {
			for (let i = 0; i < social_links.length; i++) {
				const link = social_links[i];
				if(link.link && !link.link?.match(regex)) {
					setError(`${link.type} ${link.type === 'Email'? '': 'URL'} is invalid.`);
					return;
				}
			}
		}
	};

	const validateUserName = (username: string) => {

		let error = 0;
		const format = /^[a-zA-Z0-9]*$/;
		if(!format.test(username) || username.length > 30 || username.length < 3){
			queueNotification({
				header: 'Error',
				message: messages.USERNAME_INVALID_ERROR,
				status: NotificationStatus.ERROR
			});
			error += 1;
		}

		for (let i = 0; i < nameBlacklist.length; i++) {
			if (username.toLowerCase().includes(nameBlacklist[i])){
				queueNotification({
					header: 'Error',
					message: messages.USERNAME_BANNED,
					status: NotificationStatus.ERROR
				});
				error += 1;
			}
		}

		return error === 0;

	};

	useEffect(() => {

		if(!profile) return;

		validateData(profile?.image, profile?.social_links);

	}, [profile]);

	const populateData = useCallback(() => {
		if (data) {
			const { badges, bio, image, social_links, title } = data;
			setProfile({
				badges,
				bio,
				image,
				social_links,
				title
			});
		} else {
			setProfile(getDefaultProfile());
		}
	}, [data]);

	useEffect(() => {
		populateData();
	}, [populateData]);

	const updateProfileData = async () => {
		if (!profile) {
			setError('Profile is empty');
			return;
		}

		const { badges, bio, image, social_links, title } = profile;
		validateData(image, social_links);
		if(!validateUserName(username)) return ;

		setLoading(true);

		const { data , error } = await nextApiClientFetch<IAddProfileResponse>( 'api/v1/auth/actions/addProfile', {
			badges: JSON.stringify(badges || []),
			bio: bio,
			image: image,
			social_links: JSON.stringify(social_links || []),
			title: title,
			user_id: Number(id),
			username: username || userDetailsContext.username
		});

		if(error || !data) {
			console.error('Error updating profile: ', error);
			queueNotification({
				header: 'Error!',
				message: error || 'Your profile was not updated.',
				status: NotificationStatus.ERROR
			});
			setError(error || 'Error updating profile');
		}

		if (data?.token) {
			queueNotification({
				header: 'Success!',
				message: 'Your profile was updated.',
				status: NotificationStatus.SUCCESS
			});
			setProfileDetails((prev) => {
				return {
					...prev,
					badges: badges || [],
					bio: bio || '',
					image: image || '',
					social_links: social_links || [],
					title: title || ''
				};
			});
			setProfile(getDefaultProfile());
			handleTokenChange(data?.token,  { ...userDetailsContext, picture: image } );
			router.push(`/user/${username}`);
		}

		setLoading(false);
		setError('');
		setOpen(false);
		setOpenModal && setOpenModal(false);

	};
	return (
		<div>
			<Modal
				className={`max-w-[648px] w-full max-h-[774px] h-full ${poppins.variable} ${poppins.className}`}
				onCancel={() => {
					setOpen(false);
					setOpenModal && setOpenModal(false);
				}}
				title={
					<h3 className='font-semibold text-xl text-[#1D2632]'>
						Edit Profile
					</h3>
				}
				closeIcon={
					<CloseOutlined className='text-sm text-[#485F7D]' />
				}
				footer={
					<div className='-mx-6 px-6 -mb-5 pb-4'>
						<Divider className='mt-6 mb-4' />
						{
							[
								<Button
									key='cancel'
									onClick={() => {
										setOpenModal && setOpenModal(false); setOpen(false);
									}}
									disabled={loading}
									size='middle'
									className='border-pink_primary border border-solid rounded-[4px] w-[134px] h-[40px] text-pink_primary font-medium text-sm'
								>
									Cancel
								</Button>,
								<Button
									key='update profile'
									disabled={loading}
									loading={loading}
									onClick={async () => {
										try {
											await updateProfileData();
										} catch (error) {
											setError(error?.message || error);
										}
									}}
									size='middle'
									className='border-pink_primary border border-solid rounded-[4px] w-[134px] h-[40px] text-white bg-pink_primary font-medium text-sm'
								>
									Save
								</Button>
							]
						}
					</div>
				}
				zIndex={1002}
				open={openModal ? openModal : open}
			>
				<Tabs
					type="card"
					className='ant-tabs-tab-bg-white text-sidebarBlue font-medium mt-4'
					items={[
						{
							children: (
								<BasicInformation
									loading= {loading}
									profile= {profile}
									setProfile= {setProfile}
									setUsername= {setUsername}
									username= {username}
								/>
							),
							key:'basic_information',
							label: 'Basic Information'
						},
						{
							children: (
								<Socials
									loading={loading}
									profile={profile}
									setProfile={setProfile}
								/>
							),
							key:'socials',
							label: 'Socials'
						}
					]}
				/>
				{
					error?
						<Alert className='mt-4' type='error' message={error} />
						: null
				}
			</Modal>
			{!setOpenModal && <button
				className='rounded-[4px] md:h-[40px] md:w-[87px] outline-none text-[#fff] flex items-center justify-center bg-transparent border-0 md:border border-solid border-white gap-x-1.5 font-medium text-sm cursor-pointer'
				onClick={() => {
					setOpen(true);
					populateData();
				}}
			>
				<EditIcon className='text-white text-2xl md:text-[15px]' />
				<span className=' md:block'>
					Edit
				</span>
			</button>}
		</div>
	);
};

export default EditProfileModal;
