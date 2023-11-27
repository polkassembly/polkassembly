// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import AuthForm from 'src/ui-components/AuthForm';
import ConfirmationIcon from '~assets/icons/Confirmation.svg';
import { Alert, Button, Divider, Form, Input } from 'antd';
import messages from '~src/util/messages';
import { username } from '~src/util/validation';
import { MailIcon, WhiteMailIcon } from '~src/ui-components/CustomIcons';
import { useTheme } from 'next-themes';
import * as validation from 'src/util/validation';
import queueNotification from './QueueNotification';
import { NotificationStatus } from '~src/types';
import { useUserDetailsSelector } from '~src/redux/selectors';
import nameBlacklist from '~src/auth/utils/nameBlacklist';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IAddProfileResponse } from '~src/auth/types';
import { handleTokenChange } from '~src/services/auth.service';
import { useDispatch } from 'react-redux';

interface Props {
	// setLoading: (pre: boolean) => void;
	setLoginOpen?: (pre: boolean) => void;
	setSignupOpen?: (pre: boolean) => void;
}

const LoginSuccessModal = ({ setLoginOpen, setSignupOpen }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const [optionalUsername, setOptionalUsername] = useState('');
	const [showSuccessModal, setShowSuccessModal] = useState(true);
	const [isError, setIsError] = useState(false);
	const [email, setEmail] = useState('');
	const [emailError, setEmailError] = useState(false);
	const userDetailsContext = useUserDetailsSelector();
	const currentUser = useUserDetailsSelector();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);

	const validateUsername = (optionalUsername: string) => {
		let errorUsername = 0;
		const format = /^[a-zA-Z0-9_]*$/;
		if (!format.test(optionalUsername) || optionalUsername.length > 30 || optionalUsername.length < 3) {
			queueNotification({
				header: 'Error',
				message: 'Username is Invalid',
				status: NotificationStatus.ERROR
			});
			errorUsername += 1;
		}

		// banned username
		for (let i = 0; i < nameBlacklist.length; i++) {
			if (optionalUsername.toLowerCase().includes(nameBlacklist[i])) {
				queueNotification({
					header: 'Error',
					message: 'Entered Username is Banned',
					status: NotificationStatus.ERROR
				});
				errorUsername += 1;
				setLoading(true);
			}
		}
		return errorUsername === 0;
	};

	const handleOptionalSkip = async () => {
		setLoginOpen?.(false);
		setSignupOpen && setSignupOpen(false);
	};

	const handleOptionalDetails = async () => {
		if (optionalUsername && optionalUsername.trim() !== '') {
			if (!validateUsername(optionalUsername)) return;
		}
		setLoading(true);
		const { data, error } = await nextApiClientFetch<IAddProfileResponse>('api/v1/auth/actions/addProfile', {
			badges: JSON.stringify([]),
			bio: '',
			custom_username: true,
			email: email || '',
			image: currentUser.picture || '',
			social_links: JSON.stringify([]),
			title: '',
			user_id: Number(currentUser.id),
			username: optionalUsername
		});

		if (email && email.length > 0) {
			if (error || !data) {
				console.error('Error updating profile: ', error);
				setLoading(false);
				setEmailError(true);
				setShowSuccessModal(false);
			}

			if (data?.token) {
				handleTokenChange(data?.token, { ...userDetailsContext }, dispatch);
				setLoading(false);
				setEmailError(false);
				setLoginOpen?.(false);
				setSignupOpen && setSignupOpen(false);
				setShowSuccessModal(false);
			}
		} else {
			if (error || !data) {
				console.error('Error updating profile: ', error);
				setLoading(false);
				setLoginOpen?.(true);
				setSignupOpen && setSignupOpen(true);
				setShowSuccessModal(true);
				setIsError(true);
			}

			if (data?.token) {
				handleTokenChange(data?.token, { ...userDetailsContext }, dispatch);
				setLoading(false);
				setShowSuccessModal(false);
				setIsError(false);
			}
		}
	};

	return (
		<div>
			{showSuccessModal && (
				<AuthForm onSubmit={handleOptionalDetails}>
					<div>
						<div className='px-8 pb-2 pt-8 dark:bg-section-dark-overlay'>
							<div className='flex justify-center'>
								<ConfirmationIcon className='confirm-logo-conatiner absolute -top-[78px]' />
							</div>
							<p className='mt-20 justify-center text-center text-xl font-semibold text-bodyBlue dark:text-white'>You are successfully logged in</p>
							<div className='flex flex-col gap-y-1'>
								<label
									className='text-base text-lightBlue dark:text-blue-dark-medium '
									htmlFor='username'
								>
									Enter Username
									<span className='text-pink_primary'>*</span>
								</label>
								<Form.Item
									name='username'
									rules={[
										{
											message: messages.VALIDATION_USERNAME_REQUIRED_ERROR,
											required: username.required
										},
										{
											max: username.maxLength,
											message: messages.VALIDATION_USERNAME_MAXLENGTH_ERROR
										},
										{
											message: messages.VALIDATION_USERNAME_MINLENGTH_ERROR,
											min: username.minLength
										},
										{
											message: messages.VALIDATION_USERNAME_PATTERN_ERROR,
											pattern: username.pattern
										}
									]}
									validateTrigger='onSubmit'
								>
									<Input
										disabled={loading}
										onChange={(e) => setOptionalUsername(e.target.value)}
										placeholder='Type here'
										className='rounded-md px-4 py-3 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
										id='username'
									/>
								</Form.Item>
							</div>
							{!isError ? (
								<Alert
									className='mb-5 mt-1 p-3 text-sm dark:border-[#91CAFF] dark:bg-[#91CAFF]/20'
									message={<span className='dark:text-blue-dark-high'>You can update your username from the settings page.</span>}
									type='info'
									showIcon
								/>
							) : (
								<Alert
									className='mb-5 mt-1 p-3 text-sm dark:border-[#FF3C5F] dark:bg-[#FF3C5F]/20'
									message={<span className='dark:text-blue-dark-high'>Username already exists. Please try again </span>}
									type='error'
									showIcon
								/>
							)}
						</div>
						<Divider
							style={{ background: '#D2D8E0', flexGrow: 1 }}
							className='-mt-2 dark:bg-separatorDark'
						/>
						<div className='mb-6 flex px-8'>
							<Button
								size='large'
								loading={loading}
								htmlType='submit'
								className='ml-auto w-[144px] rounded-md border-none bg-pink_primary text-white outline-none'
							>
								Next
							</Button>
						</div>
					</div>
				</AuthForm>
			)}
			{!showSuccessModal && (
				<AuthForm onSubmit={handleOptionalDetails}>
					<div>
						<div className='my-4 ml-7 flex dark:text-white'>
							{theme === 'dark' ? <WhiteMailIcon className='mr-2 text-2xl' /> : <MailIcon className='mr-2 text-2xl' />}
							<p className='m-0 p-0 text-xl font-semibold text-bodyBlue dark:text-white'>Add your email</p>
						</div>
						<Divider
							style={{ background: '#D2D8E0', flexGrow: 1 }}
							className='-mt-1 mb-5 dark:bg-separatorDark'
						/>
						<div className='px-8 pb-8'>
							<div className='flex flex-col gap-y-1'>
								<label
									htmlFor='email'
									className='text-base text-lightBlue dark:text-blue-dark-medium'
								>
									Email
								</label>
								<Form.Item
									name='email'
									rules={[
										{
											message: messages.VALIDATION_EMAIL_ERROR,
											pattern: validation.email.pattern
										}
									]}
								>
									<Input
										onChange={(e) => {
											setEmail(e.target.value);
										}}
										disabled={loading}
										placeholder='email@example.com'
										className='rounded-md px-4 py-2 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
										id='email'
									/>
								</Form.Item>
							</div>
							{!emailError ? (
								<Alert
									className='mb-5 mt-1 p-3 text-sm dark:border-[#91CAFF] dark:bg-[#91CAFF]/20'
									message={<span className='dark:text-blue-dark-high'>You can set your email later from the settings page.</span>}
									type='info'
									showIcon
								/>
							) : (
								<Alert
									className='mb-5 mt-1 p-3 text-sm dark:border-[#FF3C5F] dark:bg-[#FF3C5F]/20'
									message={<span className='dark:text-blue-dark-high'>Email already exists. Please use a different email or link your address with the existing account.</span>}
									type='error'
									showIcon
								/>
							)}
						</div>
						<Divider
							style={{ background: '#D2D8E0', flexGrow: 1 }}
							className='-mt-6 mb-5 dark:bg-separatorDark'
						/>
						<div className='mb-6 flex justify-end gap-x-5 px-8'>
							{!email && (
								<Button
									size='large'
									onClick={handleOptionalSkip}
									className='w-[144px] rounded-md border border-solid border-pink_primary text-pink_primary outline-none dark:bg-transparent'
								>
									Skip
								</Button>
							)}
							{email && (
								<Button
									loading={loading}
									size='large'
									htmlType='submit'
									className='w-[144px] rounded-md border-none bg-pink_primary text-white outline-none'
								>
									Done
								</Button>
							)}
						</div>
					</div>
				</AuthForm>
			)}
		</div>
	);
};

export default LoginSuccessModal;
