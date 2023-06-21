// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedWindow } from '@polkadot/extension-inject/types';
import { Alert, Button, Form , Input, Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC, useEffect, useState } from 'react';
import { useUserDetailsContext } from 'src/context';
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

const WalletButtons = dynamic(() => import('./WalletButtons'), {
	loading: () => <div className="flex flex-col mt-6 bg-white p-4 md:p-8 rounded-md w-full shadow-md mb-4">
		<Skeleton className='mt-8' active />
	</div> ,
	ssr: false
});

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
	setLoginOpen?: (pre: boolean)=> void
	setSignupOpen?: (pre: boolean)=> void;
  isDelegation?: boolean;
  className?: string;
  setWithPolkasafe?: any;
}
const Web2Login: FC<Props> = ({ className, walletError, onWalletSelect, setLoginOpen, isModal, setSignupOpen, isDelegation, setWithPolkasafe  }) => {
	const { username } = validation;
	const router = useRouter();
	const currentUser = useUserDetailsContext();
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [defaultWallets, setDefaultWallets] = useState<string[]>([]);
	const [authResponse, setAuthResponse] = useState<IAuthResponse>(initAuthResponse);

	const getWallet=() => {
		const injectedWindow = window as Window & InjectedWindow;
		setDefaultWallets(Object.keys(injectedWindow?.injectedWeb3 || {}));
	};

	const handleSubmitForm = async (data: any) => {
		const { username, password } = data;

		if(username && password) {
			setLoading(true);
			const { data , error } = await nextApiClientFetch<IAuthResponse>('api/v1/auth/actions/login', { password, username });
			if(error || !data) {
				setError(error || 'Login failed. Please try again later.');
				setLoading(false);
				return;
			}

			if (data?.token) {
				handleTokenChange(data.token, currentUser);
				if(isModal){
					setLoading(false);
					setLoginOpen && setLoginOpen(false);
					return;
				}
				router.back();
			}else if(data?.isTFAEnabled) {
				if(!data?.tfa_token) {
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
		if(isNaN(authCode)) return;
		setLoading(true);

		const { data , error } = await nextApiClientFetch<IAuthResponse>('api/v1/auth/actions/2fa/validate', {
			auth_code: String(authCode), //use string for if it starts with 0
			tfa_token: authResponse.tfa_token,
			user_id: Number(authResponse.user_id)
		});

		if(error || !data) {
			setError(error || 'Login failed. Please try again later.');
			setLoading(false);
			return;
		}

		if (data?.token) {
			setError('');
			handleTokenChange(data.token, currentUser);
			if(isModal){
				setLoading(false);
				setAuthResponse(initAuthResponse);
				setLoginOpen?.(false);
				return;
			}
			router.back();
		}
	};

	const handleClick=() => {
		if(isModal && setSignupOpen && setLoginOpen){
			setSignupOpen(true);
			setLoginOpen(false);}
		else{
			router.push('/signup');
		}
	};

	useEffect(() => {
		isDelegation && getWallet();
	}, [isDelegation]);

	return (
		<>
			<div className='flex items-center'>
				<LoginLogo className='ml-6 mr-2' />
				<h3 className="text-[20px] font-semibold text-[#243A57] mt-3">Login</h3>
			</div>
			<hr className='text-[#D2D8E0] ' />
			<article className={`bg-white shadow-md rounded-md p-8 flex flex-col gap-y-6 ${className} `}>
				{defaultWallets.length === 0 && isDelegation && <Alert message='Wallet extension not detected.' description='No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polkadot-js extension.' type='info' showIcon className='text-[#243A57] changeColor' />}

				{walletError && <Alert message={walletError} type="error" />}
				{authResponse.isTFAEnabled ?
					<TFALoginForm
						onBack={() => {setAuthResponse(initAuthResponse); setError(''); }}
						onSubmit={handleSubmitAuthCode}
						error={error || ''}
						loading={loading}
					/> :
					<AuthForm
						onSubmit={handleSubmitForm}
						className="flex flex-col gap-y-3"
					>
						<div className="flex flex-col gap-y-1">
							<label
								className="text-base text-[#485F7D] "
								htmlFor="username"
							>
							Enter Username or Email
							</label>
							<Form.Item
								name="username"
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
								validateTrigger="onSubmit"
							>
								<Input
									disabled={loading}
									placeholder="Type here"
									className="rounded-md py-3 px-4"
									id="username" />
							</Form.Item>
						</div>

						<div className="flex flex-col gap-y-1 -mt-4">
							<label
								className="text-base text-[#485F7D]"
								htmlFor="password"
							>
							Enter Password
							</label>
							<Form.Item
								name="password"
								validateTrigger="onSubmit"
							>
								<Input.Password
									disabled={loading}
									placeholder="Type here"
									className="rounded-md py-3 px-4"
									id="password" />
							</Form.Item>
							<div className="text-right text-pink_primary mt-[-20px]">
								<Link href="/request-reset-password">Forgot Password?</Link>
							</div>
						</div>

						<div className="flex justify-center items-center">
							<Button
								loading={loading}
								htmlType="submit"
								size="large"
								className="bg-pink_primary w-56 rounded-md outline-none border-none text-white"
							>
							Login
							</Button>
						</div>

						<div>
							<WalletButtons disabled={loading} onWalletSelect={onWalletSelect} showPolkasafe={true} onPolkasafeSelect={setWithPolkasafe}/>
						</div>

						{error && <FilteredError text={error} />}

						<div className='flex justify-center items-center gap-x-2 font-semibold'>
							<label className='text-md text-[#243A57]'>Don&apos;t have an account?</label>
							<div onClick={handleClick} className='text-pink_primary text-md'> Sign Up </div>
						</div>
					</AuthForm>}
			</article>
		</>
	);
};

export default styled(Web2Login)`
.changeColor .ant-alert-message{
color:#243A57;

}`;
