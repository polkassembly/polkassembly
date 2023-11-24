// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined } from '@ant-design/icons';
import { InjectedWindow } from '@polkadot/extension-inject/types';
import { Alert, Button, Divider, Form, Input, Modal, Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { IUsernameExistResponse } from 'pages/api/v1/users/username-exist';
import React, { FC, useEffect, useState } from 'react';
import { handleTokenChange } from 'src/services/auth.service';
import { Wallet } from 'src/types';
import AuthForm from 'src/ui-components/AuthForm';
import FilteredError from 'src/ui-components/FilteredError';
import messages from 'src/util/messages';
import * as validation from 'src/util/validation';
import styled from 'styled-components';
import { trackEvent } from 'analytics';

import { TokenType } from '~src/auth/types';
import { canUsePolkasafe } from '~src/util/canUsePolkasafe';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { IconSignup } from '~src/ui-components/CustomIcons';

const WalletButtons = dynamic(() => import('~src/components/Login/WalletButtons'), {
	loading: () => (
		<div className='mb-4 mt-6 flex w-full flex-col rounded-md bg-white p-4 shadow-md dark:bg-section-dark-overlay md:p-8'>
			<Skeleton
				className='mt-8'
				active
			/>
		</div>
	),
	ssr: false
});

const Container = styled.article`
	.changeColor .ant-alert-message {
		color: ${(props) => (props.theme === 'dark' ? '#1677ff' : '#243a57')} !important;
	}
`;
interface Props {
	onWalletSelect: (wallet: Wallet) => void;
	walletError: string | undefined;
	isModal?: boolean;
	setLoginOpen?: (pre: boolean) => void;
	setSignupOpen?: (pre: boolean) => void;
	isDelegation?: boolean;
	className?: string;
	setWithPolkasafe?: any;
	theme?: string;
}

const Web2Signup: FC<Props> = ({ className, walletError, onWalletSelect, isModal, setLoginOpen, setSignupOpen, isDelegation, setWithPolkasafe, theme }) => {
	const { password, username } = validation;
	const router = useRouter();
	const currentUser = useUserDetailsSelector();
	const [open, setOpen] = useState(false);
	const dispatch = useDispatch();
	const [isPassword, setIsPassword] = useState(false);
	const [inputPassword, setInputPassword] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [signUpInfo, setSignUpInfo] = useState({
		email: '',
		username: ''
	});
	const [firstPassword, setFirstPassword] = useState('');
	const [defaultWallets, setDefaultWallets] = useState<string[]>([]);
	const { network } = useNetworkSelector();

	const getWallet = () => {
		const injectedWindow = window as Window & InjectedWindow;
		setDefaultWallets(Object.keys(injectedWindow?.injectedWeb3 || {}));
	};

	const handleSubmitForm = async (data: any) => {
		setError('');

		if (isPassword) {
			const { second_password } = data;
			if (second_password) {
				const { email, username } = signUpInfo;

				//GAEvent for new user registration
				trackEvent('signup_activity', 'new_user_registration', {
					email: email as String,
					username: username
				});

				setLoading(true);
				const { data, error } = await nextApiClientFetch<TokenType>('api/v1/auth/actions/signup', {
					email,
					password: second_password,
					username
				});

				if (error || !data) {
					setError(error || 'Something went wrong');
					console.error('Signup error', error);
					setLoading(false);
				}

				if (data) {
					if (data.token) {
						handleTokenChange(data.token, currentUser, dispatch);
						if (isModal) {
							setLoading(false);
							setSignupOpen && setSignupOpen(false);
							return;
						}
						if (email) {
							setOpen(true);
						}
					}
				}
			}
		} else {
			const { username, email } = data;
			setLoading(true);

			const { data: resData, error } = await nextApiClientFetch<IUsernameExistResponse>(`api/v1/users/username-exist?username=${username}`);
			if (error || !resData) {
				setError(error || 'Error while checking username exist or not.');
			} else {
				if (resData.isExist) {
					setError('Username already exists. Please choose a different username.');
				} else {
					if (username && email) {
						setSignUpInfo((prevInfo) => ({ ...prevInfo, email, username }));
						setIsPassword(true);
					}
				}
			}
			setLoading(false);
		}
	};

	const handleClick = () => {
		if (isModal && setSignupOpen && setLoginOpen) {
			setSignupOpen(false);
			setLoginOpen(true);
		} else {
			router.push('/login');
		}
	};
	useEffect(() => {
		isDelegation && getWallet();
	}, [isDelegation]);

	return (
		<div>
			<div>
				<div className='mt-4 flex gap-x-2 px-8'>
					<IconSignup className='m-0 p-0 text-2xl' />
					<p className='m-0 p-0 text-xl font-semibold text-bodyBlue dark:text-white'>Sign Up</p>
				</div>
				<Divider
					className='m-0 mt-4 p-0 '
					style={{ borderTop: '1px solid #E1E6EB' }}
				></Divider>
			</div>
			<Container
				className={`flex flex-col gap-y-6 rounded-md bg-white py-8 shadow-md dark:bg-section-dark-overlay ${className}`}
				theme={theme}
			>
				<div className='-mt-1 flex grid-cols-2 gap-x-5 px-8'>
					<div
						onClick={() => {
							setIsPassword(false);
							if (error) setError('');
						}}
						className='w-[268px] cursor-pointer flex-col items-center border-b-2 pb-2 text-xs font-medium text-grey_primary sm:flex-row sm:text-sm'
					>
						<div className='flex gap-x-2 gap-y-2 '>
							<span className={`flex h-4 w-4 items-center justify-center text-white sm:h-6 sm:w-6 ${isPassword ? 'bg-green_primary' : 'bg-pink_primary'} rounded-full`}>01</span>
							<span className='mt-[2px] text-bodyBlue dark:text-grey_primary'>Create Username</span>
						</div>
						<div>
							<Divider className={`${isPassword ? 'bg-green_primary' : 'bg-grey_stroke dark:bg-grey_primary'}  m-0 mt-2 border-t-[2px] p-0`}></Divider>
						</div>
					</div>
					<div className='w-[268px] flex-col items-center border-b-2 pb-2 text-xs font-medium text-grey_primary sm:flex-row sm:text-sm'>
						<div className='flex gap-x-2 gap-y-2 '>
							<span className={`flex h-6 w-6 items-center justify-center text-white sm:h-6 sm:w-6 ${isPassword ? 'bg-pink_primary' : 'bg-grey_secondary'} rounded-full`}>02</span>
							<span className='mt-[2px] text-bodyBlue dark:text-grey_primary'>Set Password</span>
						</div>
						<div>
							<Divider className={`${inputPassword ? 'bg-green_primarye' : 'bg-grey_stroke dark:bg-grey_primary'}  m-0 mt-2 border-t-[2px] p-0`}></Divider>
						</div>
					</div>
				</div>

				{defaultWallets.length === 0 && isDelegation && (
					<Alert
						message='Wallet extension not detected.'
						description='No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polkadot-js extension.'
						type='info'
						showIcon
						className='changeColor px-8 text-[#243A57] dark:bg-[var(--inactiveIconDark)] dark:text-white'
					/>
				)}
				{walletError && (
					<Alert
						message={walletError}
						type='error'
						className='px-8'
					/>
				)}
				<AuthForm
					onSubmit={handleSubmitForm}
					className='flex flex-col gap-y-6'
				>
					{isPassword ? (
						<>
							<div className='flex flex-col gap-y-1 px-8'>
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
									<Input.Password
										onChange={(e) => {
											setFirstPassword(e.target.value);
										}}
										placeholder='Password'
										className='rounded-md px-4 py-2 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F] dark:[&>input]:bg-transparent'
										id='first_password'
									/>
								</Form.Item>
							</div>
							<div className='-mt-6 flex flex-col gap-y-1 px-8'>
								<label
									className='text-base text-[#485F7D] dark:text-blue-dark-medium '
									htmlFor='second_password'
								>
									Re-enter Password
								</label>
								<Form.Item
									name='second_password'
									rules={[
										{
											message: "Password don't match",
											validator(rule, value, callback) {
												if (callback && value !== firstPassword) {
													callback(rule?.message?.toString());
												} else {
													callback();
												}
											}
										}
									]}
								>
									<Input.Password
										onChange={() => setInputPassword(true)}
										placeholder='Password'
										className='rounded-md px-4 py-2 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F] dark:[&>input]:bg-transparent'
										id='second_password'
									/>
								</Form.Item>
							</div>
						</>
					) : (
						<>
							<div className='flex flex-col gap-y-1 px-8 dark:text-blue-dark-medium'>
								<label
									className='text-sm tracking-wide text-[#485F7D] dark:text-blue-dark-medium'
									htmlFor='username'
								>
									Enter Username
								</label>
								<Form.Item
									name='username'
									rules={[
										{
											message: messages.VALIDATION_USERNAME_REQUIRED_ERROR,
											required: username.required
										},
										{
											message: messages.VALIDATION_USERNAME_PATTERN_ERROR,
											pattern: username.pattern
										},
										{
											max: username.maxLength,
											message: messages.VALIDATION_USERNAME_MAXLENGTH_ERROR
										},
										{
											message: messages.VALIDATION_USERNAME_MINLENGTH_ERROR,
											min: username.minLength
										}
									]}
								>
									<Input
										placeholder='John'
										className='rounded-md px-4 py-2 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
										id='username'
									/>
								</Form.Item>
							</div>
							<div className='-mt-6 flex flex-col gap-y-1 px-8'>
								<label
									htmlFor='email'
									className='text-sm tracking-wide text-[#485F7D] dark:text-blue-dark-medium'
								>
									Enter Email
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
										placeholder='email@example.com'
										className='rounded-md px-4 py-2 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
										id='email'
									/>
								</Form.Item>
							</div>
						</>
					)}
					<div className='px-8'>
						<WalletButtons
							disabled={loading}
							onWalletSelect={onWalletSelect}
							showPolkasafe={canUsePolkasafe(network)}
							onPolkasafeSelect={setWithPolkasafe}
							isSigningUp={true}
						/>
					</div>
					{error && (
						<FilteredError
							className='px-8 '
							text={error}
						/>
					)}
					<div className='flex items-center justify-center gap-x-2 px-8 font-semibold '>
						<label className='text-md text-[#243A57] dark:text-blue-dark-high'>Already have an account?</label>
						<div
							onClick={() => handleClick()}
							className='text-md cursor-pointer text-pink_primary'
						>
							Login
						</div>
					</div>
					<Divider
						className='m-0 p-0'
						style={{ borderTop: '1px solid #E1E6EB' }}
					></Divider>
					<div className='-mt-1 flex items-center justify-end px-8'>
						<Button
							disabled={loading}
							htmlType='submit'
							size='large'
							className='w-[144px] rounded-md border-none bg-pink_primary text-white outline-none'
						>
							{isPassword ? 'Sign Up' : 'Next'}
						</Button>
					</div>
				</AuthForm>
				<Modal
					wrapClassName='dark:bg-modalOverlayDark'
					className='rounded-md px-8 dark:[&>.ant-modal-content]:bg-section-dark-overlay'
					centered={true}
					title={"You've got some mail"}
					open={open}
					closable={false}
					footer={[
						<div
							className='flex w-full justify-center'
							key='got-it'
						>
							<Button
								icon={<CheckOutlined />}
								className='flex items-center justify-center rounded-md border-none bg-pink_primary px-5 text-lg font-medium leading-none text-white outline-none'
								onClick={() => {
									setOpen(false);
									!isModal && router.back();
								}}
							>
								Got it!
							</Button>
						</div>
					]}
				>
					We sent you an email to verify your address. Click on the link in the email.
				</Modal>
			</Container>
		</div>
	);
};

export default styled(Web2Signup)`
	.ant-input {
		color: ${(props) => (props.theme == 'dark' ? 'white' : '')} !important;
		background-color: ${(props) => (props.theme == 'dark' ? 'transparent' : '')} !important;
	}
	.ant-input::placeholder {
		color: ${(props) => (props.theme == 'dark' ? 'white' : '')} !important;
	}
`;
