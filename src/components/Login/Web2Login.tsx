// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedWindow } from '@polkadot/extension-inject/types';
import { Alert, Button, Divider, Form, Input, Skeleton } from 'antd';
import dynamic from 'next/dynamic';
// import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC, useEffect, useState } from 'react';
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
import { canUsePolkasafe } from '~src/util/canUsePolkasafe';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import LoginLogoDark from '~assets/icons/login-logo-dark.svg';

const WalletButtons = dynamic(() => import('./WalletButtons'), {
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
		color: #1677ff;
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
	setLoginOpen?: (pre: boolean) => void;
	setSignupOpen?: (pre: boolean) => void;
	isDelegation?: boolean;
	className?: string;
	setWithPolkasafe?: any;
	theme?: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Web2Login: FC<Props> = ({ className, walletError, onWalletSelect, setLoginOpen, isModal, setSignupOpen, isDelegation, setWithPolkasafe, theme }) => {
	const { username } = validation;
	const dispatch = useDispatch();
	const router = useRouter();
	const currentUser = useUserDetailsSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [web2LoginClicked, setWeb2LoginClicked] = useState<boolean>(false);
	const [web3Login, setWeb3Login] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [defaultWallets, setDefaultWallets] = useState<string[]>([]);
	const [authResponse, setAuthResponse] = useState<IAuthResponse>(initAuthResponse);
	const { network } = useNetworkSelector();
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
				setLoading(false);
				return;
			}

			if (data?.token) {
				handleTokenChange(data.token, currentUser, dispatch);
				if (isModal) {
					setLoading(false);
					setLoginOpen && setLoginOpen(false);
					return;
				}
				router.back();
			} else if (data?.isTFAEnabled) {
				if (!data?.tfa_token) {
					setError(error || 'TFA token missing. Please try again.');
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
			handleTokenChange(data.token, currentUser, dispatch);
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

	useEffect(() => {
		setWeb3Login(true);
		setWeb2LoginClicked(false);
	}, [onWalletSelect, walletError, isModal, setLoginOpen, isDelegation, setSignupOpen, className, setWithPolkasafe]);

	return (
		<Container className={`flex flex-col rounded-md bg-white shadow-md dark:bg-section-dark-overlay ${className} `}>
			<div className='flex items-center justify-start px-8 pb-2 pt-4'>
				{theme === 'dark' ? <LoginLogoDark className='mr-3' /> : <LoginLogo className='mr-3' />}
				<span className='text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>Login to Polkassembly</span>
			</div>
			<Divider
				style={{ background: '#D2D8E0', flexGrow: 1 }}
				className='mt-1 px-0 dark:bg-separatorDark'
			/>
			{web3Login && (
				<AuthForm
					onSubmit={handleSubmitForm}
					className='web3-login-container flex flex-col px-24'
				>
					<p className='my-0 text-center text-base text-lightBlue dark:text-white'>Select a wallet</p>
					<div>
						<WalletButtons
							disabled={loading}
							onWalletSelect={onWalletSelect}
							showPolkasafe={canUsePolkasafe(network)}
							onPolkasafeSelect={setWithPolkasafe}
							isOptionalLogin={true}
						/>
					</div>
					<p
						className='mb-5 mt-3 cursor-pointer text-center text-sm text-lightBlue'
						onClick={() => {
							setWeb2LoginClicked(true);
							setWeb3Login(false);
						}}
					>
						Or <span className='font-semibold text-pink_primary'>Login with Username/Email</span>
					</p>
				</AuthForm>
			)}
			{defaultWallets.length === 0 && isDelegation && (
				<Alert
					message='Wallet extension not detected.'
					description='No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polkadot-js extension.'
					type='info'
					showIcon
					className='changeColor  mx-8 mb-5 text-bodyBlue dark:bg-[var(--inactiveIconDark)] dark:text-white'
				/>
			)}
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
				/>
			) : (
				web2LoginClicked && (
					<AuthForm
						onSubmit={handleSubmitForm}
						className='flex flex-col gap-y-3 px-8'
					>
						<div className='flex flex-col gap-y-1'>
							<label
								className='text-base text-lightBlue dark:text-blue-dark-medium '
								htmlFor='username'
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
									placeholder='Type here'
									className='rounded-md border-[1px] px-4 py-3 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
									id='username'
								/>
							</Form.Item>
						</div>

						<div className='-mt-4 flex flex-col gap-y-1'>
							<label
								className='text-base text-lightBlue dark:text-blue-dark-medium'
								htmlFor='password'
							>
								Enter Password
							</label>
							<Form.Item
								name='password'
								validateTrigger='onSubmit'
							>
								<Input.Password
									disabled={loading}
									placeholder='Type here'
									className='rounded-md border-[1px] px-4 py-3 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F] dark:[&>input]:bg-transparent'
									id='password'
								/>
							</Form.Item>
							<div className='mt-[-20px] text-right text-pink_primary dark:text-blue-dark-helper'>
								<div
									className='cursor-pointer'
									onClick={() => {
										isModal && setLoginOpen && setLoginOpen(false);
										router.push('/request-reset-password');
									}}
								>
									Forgot Password?
								</div>
							</div>
						</div>

						<div className='flex items-center justify-center'>
							<Button
								loading={loading}
								htmlType='submit'
								size='large'
								className='w-[144px] rounded-md border-none bg-pink_primary text-white outline-none'
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

						<div className='mb-5 mt-2 flex items-center justify-center gap-x-2 font-semibold dark:font-medium'>
							<label className='text-md text-bodyBlue dark:text-blue-dark-high'>Don&apos;t have an account?</label>
							<div
								onClick={handleClick}
								className='text-md cursor-pointer text-pink_primary dark:text-blue-dark-helper'
							>
								{' '}
								Sign Up{' '}
							</div>
						</div>
					</AuthForm>
				)
			)}
		</Container>
	);
};

export default styled(Web2Login)`
	.ant-input {
		color: ${(props) => (props.theme == 'dark' ? 'white' : '')} !important;
		background-color: ${(props) => (props.theme == 'dark' ? 'transparent' : '')} !important;
	}
	.ant-input::placeholder {
		color: ${(props) => (props.theme == 'dark' ? 'white' : '')} !important;
	}
	@media (max-width: 365px) and (min-width: 319px) {
		.web3-login-container {
			padding-left: 40px !important;
			padding-right: 40px !important;
		}
	}
`;
