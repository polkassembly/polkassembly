// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Divider, Modal } from 'antd';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { IAddProfileResponse, ISocial, ProfileDetails, ProfileDetailsResponse } from '~src/auth/types';
import { NotificationStatus } from '~src/types';
import { handleTokenChange } from 'src/services/auth.service';

import { CloseIcon, EditIcon } from '~src/ui-components/CustomIcons';
import queueNotification from '~src/ui-components/QueueNotification';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import BasicInformation from './BasicInformation';
import Socials from './Socials';
import messages from '~src/auth/utils/messages';
import nameBlacklist from '~src/auth/utils/nameBlacklist';
import { useRouter } from 'next/router';
import { poppins } from 'pages/_app';
import validator from 'validator';
import { useDispatch } from 'react-redux';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { Tabs } from '~src/ui-components/Tabs';
import { trackEvent } from 'analytics';

interface IEditProfileModalProps {
	id?: number | null;
	data?: ProfileDetailsResponse;
	setProfileDetails: React.Dispatch<React.SetStateAction<ProfileDetailsResponse>>;
	openModal?: boolean;
	setOpenModal?: (pre: boolean) => void;
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
	const { resolvedTheme: theme } = useTheme();
	const { data, id, setProfileDetails, openModal, setOpenModal } = props;
	const [open, setOpen] = useState(false);
	const [profile, setProfile] = useState(getDefaultProfile());
	const [loading, setLoading] = useState(false);
	const [errorCheck, setErrorCheck] = useState({
		basicInformationError: '',
		socialsError: ''
	});
	const dispatch = useDispatch();
	const userDetailsContext = useUserDetailsSelector();
	const [username, setUsername] = useState<string>(userDetailsContext.username || '');
	const router = useRouter();
	const currentUser = useUserDetailsSelector();

	const validateData = (image: string | undefined, social_links: ISocial[] | undefined) => {
		// eslint-disable-next-line no-useless-escape
		const regex = validator.isURL(image || '', { protocols: ['http', 'https'], require_protocol: true });

		if (image && image.trim() && !regex) {
			setErrorCheck({ ...errorCheck, basicInformationError: 'Image URL is invalid.' });
			return true;
		} else if (regex) {
			setErrorCheck({ ...errorCheck, basicInformationError: '' });
		}

		if (social_links && Array.isArray(social_links)) {
			for (let i = 0; i < social_links.length; i++) {
				const link = social_links[i];
				if (link.link && !validator.isURL(link.link, { protocols: ['http', 'https'], require_protocol: true }) && !validator.isEmail(link.link)) {
					setErrorCheck({ ...errorCheck, socialsError: `${link.type} ${link.type === 'Email' ? '' : 'URL'} is invalid.` });
					return true;
				} else {
					setErrorCheck({ ...errorCheck, socialsError: '' });
				}
			}
		}
		return false;
	};

	const validateUserName = (username: string) => {
		let errorUsername = 0;
		const format = /^[a-zA-Z0-9_@]*$/;
		if (!format.test(username) || username.length > 30 || username.length < 3) {
			queueNotification({
				header: 'Error',
				message: messages.USERNAME_INVALID_ERROR,
				status: NotificationStatus.ERROR
			});
			errorUsername += 1;
		}

		for (let i = 0; i < nameBlacklist.length; i++) {
			if (username.toLowerCase().includes(nameBlacklist[i])) {
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
		if (!profile) return;

		if (validateData(profile?.image, profile?.social_links)) return;

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
		if (validateData(profile?.image, profile?.social_links)) return;
		if (!validateUserName(username)) return;

		setLoading(true);

		const { data, error } = await nextApiClientFetch<IAddProfileResponse>('api/v1/auth/actions/addProfile', {
			badges: JSON.stringify(badges || []),
			bio: bio,
			custom_username: true,
			image: image,
			social_links: JSON.stringify(social_links || []),
			title: title,
			user_id: Number(id),
			username: username || userDetailsContext.username
		});

		if (error || !data) {
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
			handleTokenChange(data?.token, { ...userDetailsContext, picture: image }, dispatch);
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
				wrapClassName='dark:bg-modalOverlayDark'
				className={`h-full max-h-[774px] w-full max-w-[648px] ${poppins.variable} ${poppins.className} dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				onCancel={() => {
					setOpen(false);
					setOpenModal && setOpenModal(false);
				}}
				title={<div className='text-xl font-semibold text-[#1D2632] dark:bg-section-dark-overlay dark:text-white'>Edit Profile</div>}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				footer={
					<div className='-mx-6 -mb-5 px-6 pb-4'>
						<Divider className='mb-4 mt-6' />
						{[
							<Button
								key='cancel'
								onClick={() => {
									setOpenModal && setOpenModal(false);
									setOpen(false);
								}}
								disabled={loading}
								size='middle'
								className='h-[40px] w-[134px] rounded-[4px] border border-solid border-pink_primary text-sm font-medium text-pink_primary dark:bg-section-dark-overlay'
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

										//GAEvent to track user profile edit
										trackEvent('user_profile_updated', 'user_profile_edit', {
											userId: currentUser?.id || '',
											username: username || currentUser.username || ''
										});
									} catch (error) {
										setErrorCheck((prevState) => ({
											...prevState,
											basicInformationError: error?.message || error,
											socialInformationError: error?.socialInformationError
										}));
									}
								}}
								size='middle'
								className='h-[40px] w-[134px] rounded-[4px] border border-solid border-pink_primary bg-pink_primary text-sm font-medium text-white'
							>
								Save
							</Button>
						]}
					</div>
				}
				zIndex={1002}
				open={openModal ? openModal : open}
			>
				<Tabs
					theme={theme}
					type='card'
					className='ant-tabs-tab-bg-white mt-4 font-medium text-sidebarBlue'
					items={[
						{
							children: (
								<BasicInformation
									loading={loading}
									profile={profile}
									setProfile={setProfile}
									setUsername={setUsername}
									username={username}
									errorCheck={errorCheck.basicInformationError}
								/>
							),
							key: 'basic_information',
							label: 'Basic Information'
						},
						{
							children: (
								<Socials
									theme={theme}
									loading={loading}
									profile={profile}
									setProfile={setProfile}
									errorCheck={errorCheck.socialsError}
								/>
							),
							key: 'socials',
							label: 'Socials'
						}
					]}
				/>
			</Modal>
			{!setOpenModal && (
				<button
					className='flex cursor-pointer items-center justify-center gap-x-1.5 rounded-[4px] border-0 border-solid border-white bg-transparent text-sm font-medium text-[#fff] outline-none dark:border-[#3B444F] md:h-[40px] md:w-[87px] md:border'
					onClick={() => {
						// GAEvent when user clicks on profile edit button
						trackEvent('profile_edit_clicked', 'edit_profile', {
							address: currentUser?.loginAddress || '',
							userId: currentUser?.id || '',
							userName: currentUser?.username || ''
						});

						setOpen(true);
						populateData();
					}}
				>
					<EditIcon className='text-2xl text-white md:text-[15px]' />
					<span className=' md:block'>Edit</span>
				</button>
			)}
		</div>
	);
};

export default EditProfileModal;
