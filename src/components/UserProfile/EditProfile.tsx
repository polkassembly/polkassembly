// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CloseOutlined } from '@ant-design/icons';
import { Button, Divider, Modal, Tabs } from 'antd';
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
import validator from 'validator';
import { useTheme } from 'next-themes';

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
	const [errorCheck, setErrorCheck] = useState({
		basicInformationError: '',
		socialsError: ''
	});
	const userDetailsContext = useUserDetailsContext();
	const [username, setUsername] = useState<string>(userDetailsContext.username || '');
	const router = useRouter();
	const { resolvedTheme:theme } = useTheme();

	const validateData = ( image: string | undefined, social_links: ISocial[] | undefined) => {

		// eslint-disable-next-line no-useless-escape
		const regex = validator.isURL(image || '', { protocols: ['http','https'], require_protocol: true });

		if(image && image.trim() && !regex) {
			setErrorCheck({ ...errorCheck, basicInformationError: 'Image URL is invalid.' });
			return true;
		}
		else if(regex){
			setErrorCheck({ ...errorCheck, basicInformationError: '' });
		}

		if (social_links && Array.isArray(social_links)) {
			for (let i = 0; i < social_links.length; i++) {
				const link = social_links[i];
				if(link.link && !validator.isURL(link.link, { protocols: ['http','https'], require_protocol: true }) && !validator.isEmail(link.link)) {
					setErrorCheck({ ...errorCheck, socialsError: `${link.type} ${link.type === 'Email'? '': 'URL'} is invalid.` });
					return true;
				}
				else{
					setErrorCheck({ ...errorCheck, socialsError: '' });
				}
			}
		}
		return false;
	};

	const validateUserName = (username: string) => {

		let errorUsername = 0;
		const format = /^[a-zA-Z0-9_@]*$/;
		if(!format.test(username) || username.length > 30 || username.length < 3){
			queueNotification({
				header: 'Error',
				message: messages.USERNAME_INVALID_ERROR,
				status: NotificationStatus.ERROR
			});
			errorUsername += 1;
		}

		for (let i = 0; i < nameBlacklist.length; i++) {
			if (username.toLowerCase().includes(nameBlacklist[i])){
				queueNotification({
					header: 'Error',
					message: messages.USERNAME_BANNED,
					status: NotificationStatus.ERROR
				});
				errorUsername += 1;
			}
		}

		return errorUsername === 0;

	};

	useEffect(() => {

		if(!profile) return;

		if(validateData(profile?.image, profile?.social_links)) return;

	// eslint-disable-next-line react-hooks/exhaustive-deps
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
			setErrorCheck({ ...errorCheck, basicInformationError: 'Please fill in the required fields.' });
			return;
		}

		const { badges, bio, image, social_links, title } = profile;
		if(validateData(profile?.image, profile?.social_links)) return;
		if(!validateUserName(username)) return ;

		setLoading(true);

		const { data , error } = await nextApiClientFetch<IAddProfileResponse>( 'api/v1/auth/actions/addProfile', {
			badges: JSON.stringify(badges || []),
			bio: bio,
			custom_username:true,
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
			setErrorCheck({ ...errorCheck, basicInformationError: 'Your profile was not updated.' });
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
		setErrorCheck({ ...errorCheck, basicInformationError: '' });
		setOpen(false);
		setOpenModal && setOpenModal(false);

	};
	return (
		<div>
			<Modal
				className={`max-w-[648px] w-full max-h-[774px] h-full ${theme === 'dark'? '[&>.ant-modal-content]:bg-black' : ''} ${poppins.variable} ${poppins.className}`}
				onCancel={() => {
					setOpen(false);
					setOpenModal && setOpenModal(false);
				}}
				title={
					<h3 className='font-semibold text-xl text-[#1D2632] dark:text-white dark:bg-black'>
						Edit Profile
					</h3>
				}
				closeIcon={
					<CloseOutlined className='text-sm text-[#485F7D] dark:text-icon-dark-inactive' />
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
									className='border-pink_primary border border-solid rounded-[4px] w-[134px] h-[40px] text-pink_primary font-medium text-sm dark:bg-transparent'
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
											setErrorCheck(prevState => ({
												...prevState,
												basicInformationError: error?.message || error,
												socialInformationError: error?.socialInformationError
											}));
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
					className='ant-tabs-tab-bg-white dark:bg-section-dark-overlay text-sidebarBlue dark:text-blue-dark-medium font-medium mt-4'
					items={[
						{
							children: (
								<BasicInformation
									loading= {loading}
									profile= {profile}
									setProfile= {setProfile}
									setUsername= {setUsername}
									username= {username}
									errorCheck= {errorCheck.basicInformationError}
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
									errorCheck={errorCheck.socialsError}
								/>
							),
							key:'socials',
							label: 'Socials'
						}
					]}
				/>
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
