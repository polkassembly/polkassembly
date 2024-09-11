// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import AuthForm from 'src/ui-components/AuthForm';
import { Divider, Form } from 'antd';
import messages from '~src/util/messages';
import { username } from '~src/util/validation';
import { MailIcon, WhiteMailIcon } from '~src/ui-components/CustomIcons';
import { useTheme } from 'next-themes';
import * as validation from 'src/util/validation';
import queueNotification from './QueueNotification';
import { NotificationStatus } from '~src/types';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import nameBlacklist from '~src/auth/utils/nameBlacklist';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IAddProfileResponse } from '~src/auth/types';
import { handleTokenChange } from '~src/services/auth.service';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import ImageIcon from './ImageIcon';
import Input from '~src/basic-components/Input';
import Alert from '~src/basic-components/Alert';
import CloseIcon from '~assets/icons/close-cross-icon.svg';
import UsernameSkipAlertModal from './UsernameSkipAlertContent';
import getEncodedAddress from '~src/util/getEncodedAddress';

interface Props {
	setLoginOpen?: (pre: boolean) => void;
	setSignupOpen?: (pre: boolean) => void;
	theme?: string;
}

const LoginSuccessModal = ({ setLoginOpen, setSignupOpen }: Props) => {
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();
	const [optionalUsername, setOptionalUsername] = useState('');
	const [showSuccessModal, setShowSuccessModal] = useState(true);
	const [isError, setIsError] = useState(false);
	const [email, setEmail] = useState('');
	const [emailError, setEmailError] = useState(false);
	const [loading, setLoading] = useState(false);
	const [firstPassword, setFirstPassword] = useState('');
	const { password } = validation;
	const [skipUsername, setSkipUsername] = useState<boolean>(false);

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
				setLoading(false);
			}
		}
		return errorUsername === 0;
	};

	const handleOptionalSkip = async () => {
		setLoginOpen?.(false);
		setSignupOpen && setSignupOpen(false);
	};

	const generateCustomUsername = () => {
		if (!currentUser?.loginAddress?.length) return;
		const encodedAddress = getEncodedAddress(currentUser?.loginAddress, network) || currentUser?.loginAddress;
		const name = encodedAddress?.slice(0, 5) + '_' + encodedAddress?.slice(encodedAddress.length - 5, encodedAddress.length);
		return name;
	};

	const handleOptionalDetails = async (skipUsername?: boolean) => {
		if (optionalUsername && optionalUsername.trim() !== '' && !skipUsername) {
			if (!validateUsername(optionalUsername)) return;
		}
		setLoading(true);
		const { data, error } = await nextApiClientFetch<IAddProfileResponse>('api/v1/auth/actions/addProfile', {
			badges: JSON.stringify([]),
			bio: '',
			custom_username: !skipUsername,
			email: email || '',
			image: currentUser.picture || '',
			password: firstPassword || '',
			social_links: JSON.stringify([]),
			title: '',
			user_id: Number(currentUser.id),
			username: skipUsername ? generateCustomUsername() ?? optionalUsername : optionalUsername
		});

		if (email && email.length > 0) {
			if (error || !data) {
				console.error('Error updating profile: ', error);
				setLoading(false);
				setEmailError(true);
				setShowSuccessModal(false);
			}

			if (data?.token) {
				handleTokenChange(data?.token, { ...currentUser }, dispatch);
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
				handleTokenChange(data?.token, { ...currentUser }, dispatch);
				setLoading(false);
				setShowSuccessModal(false);
				setIsError(false);
			}
		}
	};

	return skipUsername ? (
		<UsernameSkipAlertModal
			username={generateCustomUsername() || ''}
			closeModal={() => setLoginOpen?.(false)}
		/>
	) : (
		<div>
			{showSuccessModal && (
				<AuthForm onSubmit={() => handleOptionalDetails()}>
					<div>
						<div className='px-8 pb-2 pt-8 dark:bg-section-dark-overlay'>
							<div className='flex justify-center'>
								<ImageIcon
									src='/assets/icons/Confirmation.svg'
									alt='confirmation logo'
									className='absolute -top-[80px]'
								/>
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
									className='mb-5 mt-1 p-3 text-sm'
									message={<span className='dark:text-blue-dark-high'>You can update your username from the profile page.</span>}
									type='info'
									showIcon
								/>
							) : (
								<Alert
									className='mb-5 mt-1 p-3 text-sm'
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
						<div className='mb-6 flex items-end justify-end gap-4 pr-8'>
							<CustomButton
								loading={loading}
								onClick={() => {
									setSkipUsername(true);
									handleOptionalDetails(true);
								}}
								variant='default'
								buttonsize='sm'
								className='tracking-wide'
								text='Skip'
							/>
							<CustomButton
								loading={loading}
								htmlType='submit'
								variant='primary'
								buttonsize='sm'
								className='ml-0 tracking-wide'
								text='Next'
							/>
						</div>
					</div>
				</AuthForm>
			)}
			{!showSuccessModal && (
				<AuthForm onSubmit={() => handleOptionalDetails()}>
					<div>
						<div className='my-4 ml-7 flex justify-between dark:text-white'>
							<div className='flex'>
								{theme === 'dark' ? <WhiteMailIcon className='mr-2 text-2xl' /> : <MailIcon className='mr-2 text-2xl' />}
								<p className='m-0 p-0 text-xl font-semibold text-bodyBlue dark:text-white'>Add your email</p>
							</div>
							<div
								className='mr-4'
								onClick={() => {
									setLoginOpen?.(false);
									setSignupOpen?.(false);
								}}
							>
								<CloseIcon />
							</div>
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
							<div className='flex flex-col gap-y-1'>
								<label
									className='text-base text-[#485F7D] dark:text-blue-dark-medium'
									htmlFor='first_password'
								>
									Set Password
								</label>
								<Form.Item
									name='first_password'
									rules={[
										{
											message: messages.VALIDATION_PASSWORD_ERROR,
											required: password.required
										},
										{
											message: messages.VALIDATION_PASSWORD_ERROR,
											min: password.minLength
										}
									]}
								>
									<Input
										type='password'
										onChange={(e) => {
											setFirstPassword(e.target.value);
										}}
										disabled={loading}
										placeholder='Password'
										className='rounded-md px-4 py-2 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F] dark:[&>input]:bg-transparent dark:[&>input]:text-white'
										id='first_password'
									/>
								</Form.Item>
							</div>
							{!emailError ? (
								<Alert
									className='mb-5 mt-1 p-3 text-sm'
									message={<span className='dark:text-blue-dark-high'>You can set your email later from the settings page.</span>}
									type='info'
									showIcon
								/>
							) : (
								<Alert
									className='mb-5 mt-1 p-3 text-sm'
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
							{!email && !firstPassword && (
								<CustomButton
									onClick={handleOptionalSkip}
									variant='default'
									buttonsize='sm'
									text='Skip'
								/>
							)}
							{(email || firstPassword) && (
								<CustomButton
									loading={loading}
									disabled={!email || !firstPassword}
									htmlType='submit'
									variant='primary'
									className={`${!email || !firstPassword ? 'opacity-50' : ''}`}
									buttonsize='sm'
									text='Done'
								/>
							)}
						</div>
					</div>
				</AuthForm>
			)}
		</div>
	);
};

export default styled(LoginSuccessModal)`
	#first_password {
		color: ${(props: any) => (props.theme == 'dark' ? 'white' : '')} !important;
	}
`;
