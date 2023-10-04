// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedWindow } from '@polkadot/extension-inject/types';
import { Alert, Button, Divider, Form, Input, Skeleton } from 'antd';
import dynamic from 'next/dynamic';
// import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC, useEffect, useState } from 'react';
import { useNetworkContext, useUserDetailsContext } from 'src/context';
import { handleTokenChange } from 'src/services/auth.service';
import { Wallet } from 'src/types';
import AuthForm from 'src/ui-components/AuthForm';
import FilteredError from 'src/ui-components/FilteredError';
import messages from 'src/util/messages';
import * as validation from 'src/util/validation';
import styled from 'styled-components';
import LoginLogo from '~assets/icons/login-logo.svg';
import { IAuthResponse } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import TFALoginForm from './TFALoginForm';
import { trackEvent } from 'analytics';
import { canUsePolkasafe } from '~src/util/canUsePolkasafe';
import LoginLogoDark from '~assets/icons/login-logo-dark.svg';

const WalletButtons = dynamic(() => import('./WalletButtons'), {
<<<<<<< HEAD
	loading: () => <div className="flex flex-col mt-6 bg-white dark:bg-section-dark-overlay p-4 md:p-8 rounded-md w-full shadow-md mb-4">
		<Skeleton className='mt-8' active />
	</div>,
=======
	loading: () => (
		<div className='mb-4 mt-6 flex w-full flex-col rounded-md bg-white p-4 shadow-md md:p-8'>
			<Skeleton
				className='mt-8'
				active
			/>
		</div>
	),
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
	ssr: false
});

const Container = styled.article`
	.changeColor .ant-alert-message {
		color: var(--bodyBlue);
	}
`;

const initAuthResponse: IAuthResponse = {
	isTFAEnabled: false,
	tfa_token: '',
	token: '',
	user_id: 0
};

interface Props {
	onWalletSelect: (wallet: Wallet) => void;
	walletError: string | undefined;
	isModal?: boolean;
<<<<<<< HEAD
	setLoginOpen?: (pre: boolean)=> void
	setSignupOpen?: (pre: boolean)=> void;
  isDelegation?: boolean;
  className?: string;
  setWithPolkasafe?: any;
  theme?: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Web2Login: FC<Props> = ({ className, walletError, onWalletSelect, setLoginOpen, isModal, setSignupOpen, isDelegation, setWithPolkasafe, theme  }) => {
=======
	setLoginOpen?: (pre: boolean) => void;
	setSignupOpen?: (pre: boolean) => void;
	isDelegation?: boolean;
	className?: string;
	setWithPolkasafe?: any;
}
const Web2Login: FC<Props> = ({ className, walletError, onWalletSelect, setLoginOpen, isModal, setSignupOpen, isDelegation, setWithPolkasafe }) => {
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
	const { username } = validation;
	const router = useRouter();
	const currentUser = useUserDetailsContext();
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [defaultWallets, setDefaultWallets] = useState<string[]>([]);
	const [authResponse, setAuthResponse] = useState<IAuthResponse>(initAuthResponse);
	const { network } = useNetworkContext();
	const getWallet = () => {
		const injectedWindow = window as Window & InjectedWindow;
		setDefaultWallets(Object.keys(injectedWindow?.injectedWeb3 || {}));
	};

	const handleSubmitForm = async (data: any) => {
		const { username, password } = data;

		if (username && password) {
			setLoading(true);
			const { data, error } = await nextApiClientFetch<IAuthResponse>('api/v1/auth/actions/login', { password, username });
			if (error || !data) {
				setError(error || 'Login failed. Please try again later.');
				trackEvent('Login', 'Failed Login', 'Login');
				setLoading(false);
				return;
			}

			if (data?.token) {
				handleTokenChange(data.token, currentUser);
				if (isModal) {
					setLoading(false);
					setLoginOpen && setLoginOpen(false);
					return;
				}
				trackEvent('Login', 'Successful Login', 'Login');
				router.back();
			} else if (data?.isTFAEnabled) {
				if (!data?.tfa_token) {
					setError(error || 'TFA token missing. Please try again.');
					trackEvent('Login', 'Failed Login', 'Login');
					setLoading(false);
					return;
				}
				setAuthResponse(data);
				setLoading(false);
			}
		}
	};

	const handleSubmitAuthCode = async (formData: any) => {
		const { authCode } = formData;
		if (isNaN(authCode)) return;
		setLoading(true);

		const { data, error } = await nextApiClientFetch<IAuthResponse>('api/v1/auth/actions/2fa/validate', {
			auth_code: String(authCode), //use string for if it starts with 0
			tfa_token: authResponse.tfa_token,
			user_id: Number(authResponse.user_id)
		});

		if (error || !data) {
			setError(error || 'Login failed. Please try again later.');
			setLoading(false);
			return;
		}

		if (data?.token) {
			setError('');
			handleTokenChange(data.token, currentUser);
			if (isModal) {
				setLoading(false);
				setAuthResponse(initAuthResponse);
				setLoginOpen?.(false);
				return;
			}
			router.back();
		}
	};

	const handleClick = () => {
		if (isModal && setSignupOpen && setLoginOpen) {
			setSignupOpen(true);
			setLoginOpen(false);
		} else {
			router.push('/signup');
		}
	};

	useEffect(() => {
		isDelegation && getWallet();
	}, [isDelegation]);

	return (
<<<<<<< HEAD
		<Container className={`bg-white dark:bg-section-dark-overlay shadow-md rounded-md flex flex-col ${className} `}>
			<div className='flex items-center justify-start px-8 pt-4 pb-2'>
				{
					theme === 'dark' ?
						<LoginLogoDark className='mr-3' />
						:
						<LoginLogo className='mr-3' />
				}
				<span className="text-[20px] font-semibold text-blue-light-high dark:text-blue-dark-high">Login</span>
			</div>
			<Divider className='mt-1 px-0 bg-[#D2D8E0] dark:bg-separatorDark' />
			{defaultWallets.length === 0 && isDelegation && <Alert message='Wallet extension not detected.' description='No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polkadot-js extension.' type='info' showIcon className='text-blue-light-high dark:text-blue-dark-high changeColor' />}
=======
		<Container className={`flex flex-col rounded-md bg-white shadow-md ${className} `}>
			<div className='flex items-center justify-start px-8 pb-2 pt-4'>
				<LoginLogo className='mr-3' />
				<span className='text-[20px] font-semibold text-bodyBlue'>Login</span>
			</div>
			<Divider
				style={{ background: '#D2D8E0', flexGrow: 1 }}
				className='mt-1 px-0'
			/>
			{defaultWallets.length === 0 && isDelegation && (
				<Alert
					message='Wallet extension not detected.'
					description='No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polkadot-js extension.'
					type='info'
					showIcon
					className='changeColor  mx-8 mb-5 text-bodyBlue'
				/>
			)}
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29

			{walletError && (
				<Alert
					message={walletError}
					type='error'
				/>
			)}
			{authResponse.isTFAEnabled ? (
				<TFALoginForm
					onBack={() => {
						setAuthResponse(initAuthResponse);
						setError('');
					}}
					onSubmit={handleSubmitAuthCode}
					error={error || ''}
					loading={loading}
<<<<<<< HEAD
					theme={theme}
				/> :
=======
				/>
			) : (
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
				<AuthForm
					onSubmit={handleSubmitForm}
					className='flex flex-col gap-y-3 px-8'
				>
					<div className='flex flex-col gap-y-1'>
						<label
<<<<<<< HEAD
							className="text-base text-lightBlue dark:text-blue-dark-medium"
							htmlFor="username"
=======
							className='text-base text-lightBlue '
							htmlFor='username'
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
						>
							Enter Username or Email
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
								}
							]}
							validateTrigger='onSubmit'
						>
							<Input
								disabled={loading}
<<<<<<< HEAD
								placeholder="Type here"
								className="rounded-md py-3 px-4 dark:bg-transparent dark:text-blue-dark-high dark:border-[#3B444F] border-[1px] dark:focus:border-[#91054F]"
								id="username" />
=======
								placeholder='Type here'
								className='rounded-md px-4 py-3'
								id='username'
							/>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
						</Form.Item>
					</div>

					<div className='-mt-4 flex flex-col gap-y-1'>
						<label
<<<<<<< HEAD
							className="text-base text-lightBlue dark:text-blue-dark-medium"
							htmlFor="password"
=======
							className='text-base text-lightBlue'
							htmlFor='password'
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
						>
							Enter Password
						</label>
						<Form.Item
							name='password'
							validateTrigger='onSubmit'
						>
							<Input.Password
								disabled={loading}
<<<<<<< HEAD
								placeholder="Type here"
								className="rounded-md py-3 px-4 dark:bg-black dark:text-blue-dark-high dark:border-[#3B444F] border-[1px] dark:focus:border-[#91054F]"
								id="password" />
						</Form.Item>
						<div className="text-right text-pink_primary dark:text-blue-dark-helper mt-[-20px]">
							<div className='cursor-pointer' onClick={() => {isModal && setLoginOpen && setLoginOpen(false); router.push('/request-reset-password');}}>Forgot Password?</div>
=======
								placeholder='Type here'
								className='rounded-md px-4 py-3'
								id='password'
							/>
						</Form.Item>
						<div className='mt-[-20px] text-right text-pink_primary'>
							<div
								className='cursor-pointer'
								onClick={() => {
									isModal && setLoginOpen && setLoginOpen(false);
									router.push('/request-reset-password');
								}}
							>
								Forgot Password?
							</div>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
						</div>
					</div>

					<div className='flex items-center justify-center'>
						<Button
							loading={loading}
							htmlType='submit'
							size='large'
							className='w-56 rounded-md border-none bg-pink_primary text-white outline-none'
						>
							Login
						</Button>
					</div>

					<div>
						<WalletButtons
							disabled={loading}
							onWalletSelect={onWalletSelect}
							showPolkasafe={canUsePolkasafe(network)}
							onPolkasafeSelect={setWithPolkasafe}
						/>
					</div>

					{error && <FilteredError text={error} />}

<<<<<<< HEAD
					<div className='flex justify-center items-center gap-x-2 mt-2 mb-5 font-semibold dark:font-medium'>
						<label className='text-md text-blue-light-high dark:text-[#6C6C6C]'>Don&apos;t have an account?</label>
						<div onClick={handleClick} className='text-md text-pink_primary cursor-pointer dark:text-blue-dark-helper'> Sign Up </div>
=======
					<div className='mb-5 mt-2 flex items-center justify-center gap-x-2 font-semibold'>
						<label className='text-md text-bodyBlue'>Don&apos;t have an account?</label>
						<div
							onClick={handleClick}
							className='text-md cursor-pointer text-pink_primary'
						>
							{' '}
							Sign Up{' '}
						</div>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
					</div>
				</AuthForm>
			)}
		</Container>
	);
};

<<<<<<< HEAD
export default styled(Web2Login)`
 .ant-input{
	color:  ${props => props.theme=='dark' ? 'white' : ''} !important;
	background-color: ${props => props.theme=='dark' ? 'transparent' : ''} !important;
 }
 .ant-input::placeholder{
	color:  ${props => props.theme=='dark' ? 'white' : ''} !important;
 }
`;
=======
export default Web2Login;
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
