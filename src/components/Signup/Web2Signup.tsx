// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined } from '@ant-design/icons';
import { InjectedWindow } from '@polkadot/extension-inject/types';
import { Alert, Button, Form, Input, Modal, Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { IUsernameExistResponse } from 'pages/api/v1/users/username-exist';
import React, { FC, useEffect, useState } from 'react';
import { useNetworkContext, useUserDetailsContext } from 'src/context';
import { handleTokenChange } from 'src/services/auth.service';
import { Wallet } from 'src/types';
import AuthForm from 'src/ui-components/AuthForm';
import FilteredError from 'src/ui-components/FilteredError';
import messages from 'src/util/messages';
import * as validation from 'src/util/validation';
import styled from 'styled-components';

import { TokenType } from '~src/auth/types';
import { canUsePolkasafe } from '~src/util/canUsePolkasafe';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

const WalletButtons = dynamic(() => import('~src/components/Login/WalletButtons'), {
	loading: () => <div className="flex flex-col mt-6 bg-white p-4 md:p-8 rounded-md w-full shadow-md mb-4">
		<Skeleton className='mt-8' active />
	</div> ,
	ssr: false
});

const Container = styled.article`
.changeColor .ant-alert-message{
	color:#243A57;
}`;
interface Props {
	onWalletSelect: (wallet: Wallet) => void;
	walletError: string | undefined;
	isModal?: boolean
	setLoginOpen?: (pre: boolean)=> void;
	setSignupOpen?: (pre: boolean)=> void;
  isDelegation?: boolean;
  className?: string;
  setWithPolkasafe?: any;
}

const Web2Signup: FC<Props> = ({ className, walletError, onWalletSelect, isModal, setLoginOpen, setSignupOpen, isDelegation, setWithPolkasafe }) => {
	const { password, username } = validation;
	const router = useRouter();
	const currentUser = useUserDetailsContext();
	const [open, setOpen] = useState(false);

	const [isPassword, setIsPassword] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [signUpInfo, setSignUpInfo] = useState({
		email: '',
		username: ''
	});
	const [firstPassword, setFirstPassword] = useState('');
	const [defaultWallets, setDefaultWallets] = useState<string[]>([]);
	const { network } = useNetworkContext();
	const getWallet=() => {
		const injectedWindow = window as Window & InjectedWindow;
		setDefaultWallets(Object.keys(injectedWindow?.injectedWeb3 || {}));
	};

	const handleSubmitForm = async (data: any) => {
		setError('');
		if (isPassword) {
			const { second_password } = data;
			if (second_password) {
				const { email, username } = signUpInfo;

				setLoading(true);
				const { data , error } = await nextApiClientFetch<TokenType>( 'api/v1/auth/actions/signup', {
					email,
					password: second_password,
					username
				});

				if (error || !data) {
					setError(error || 'Something went wrong');
					console.error('Signup error', error);
					setLoading(false);
				}

				if(data) {
					if (data.token) {
						handleTokenChange(data.token, currentUser);
						if(isModal){
							setLoading(false);
							setSignupOpen &&  setSignupOpen(false);
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

			const { data: resData , error } = await nextApiClientFetch<IUsernameExistResponse>( `api/v1/users/username-exist?username=${username}`);
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

	const handleClick=() => {
		if(isModal && setSignupOpen &&setLoginOpen){
			setSignupOpen(false);
			setLoginOpen(true);
		}else{
			router.push('/login');
		}
	};
	useEffect(() => {
		isDelegation && getWallet();
	}, [isDelegation]);

	return (
		<Container className={`bg-white shadow-md rounded-md p-8 flex flex-col gap-y-6 ${className}`}>
			<div className='grid grid-cols-2'>
				<div onClick={() => {
					setIsPassword(false);
					if (error) setError('');
				}} className={`cursor-pointer font-medium text-grey_primary flex flex-col gap-y-2 text-xs justify-center items-center sm:flex-row sm:text-sm gap-x-2 border-b-2 pb-2 ${!isPassword &&'border-pink_primary'}`}>
					<span className={`flex justify-center items-center w-6 h-6 sm:w-8 sm:h-8 text-white ${isPassword?'bg-green_primary':'bg-pink_primary'} rounded-full`}>1</span>
					<span>Create Username</span>
				</div>
				<div className={`font-medium text-grey_primary flex flex-col gap-y-2 text-xs justify-center items-center sm:flex-row sm:text-sm gap-x-2 border-b-2 pb-2 ${isPassword &&'border-pink_primary'}`}>
					<span className={`flex justify-center items-center w-6 h-6 sm:w-8 sm:h-8 text-white ${isPassword?'bg-pink_primary':'bg-grey_secondary'} rounded-full`}>2</span>
					<span>Set Password</span>
				</div>
			</div>

			<h3 className="text-2xl font-semibold text-[#1E232C]">
				{isPassword?'Set Password': 'Sign Up'}
			</h3>

			{ defaultWallets.length === 0 && isDelegation && <Alert message='Wallet extension not detected.' description='No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polkadot-js extension.' type='info' showIcon className='text-[#243A57] changeColor'/>}
			{walletError && <Alert message={walletError} type="error" />}
			<AuthForm
				onSubmit={handleSubmitForm}
				className='flex flex-col gap-y-6'
			>
				{
					isPassword?
						<>
							<div className="flex flex-col gap-y-1">
								<label
									className="text-base text-[#485F7D]"
									htmlFor="first_password"
								>
									Set Password
								</label>
								<Form.Item
									name="first_password"
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
										className="rounded-md py-2 px-4"
										id="first_password"
									/>
								</Form.Item>
							</div>
							<div className="flex flex-col gap-y-1 -mt-6">
								<label
									className="text-base text-[#485F7D] "
									htmlFor="second_password"
								>
									Re-enter Password
								</label>
								<Form.Item
									name="second_password"
									rules={[
										{
											message: 'Password don\'t match',
											validator(rule, value, callback) {
												if (callback && value !== firstPassword){
													callback(rule?.message?.toString());
												}else {
													callback();
												}
											}
										}
									]}
								>
									<Input.Password
										placeholder='Password'
										className="rounded-md py-2 px-4"
										id="second_password"
									/>
								</Form.Item>
							</div>
						</>
						:<>
							<div className="flex flex-col gap-y-1">
								<label
									className="text-base text-[#485F7D]  tracking-wide"
									htmlFor="username"
								>
									Username
								</label>
								<Form.Item
									name="username"
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
										placeholder="John"
										className="rounded-md py-2 px-4"
										id="username"
									/>
								</Form.Item>
							</div>
							<div className="flex flex-col gap-y-1 -mt-6">
								<label
									htmlFor="email"
									className="text-base text-[#485F7D] tracking-wide"
								>
									Email
								</label>
								<Form.Item
									name="email"
									rules={
										[
											{
												message: messages.VALIDATION_EMAIL_ERROR,
												pattern: validation.email.pattern
											}
										]
									}
								>
									<Input
										placeholder="email@example.com"
										className="rounded-md py-2 px-4"
										id="email"
									/>
								</Form.Item>
							</div>
						</>
				}
				<div className="flex justify-center items-center">
					<Button
						disabled={loading}
						htmlType="submit"
						size="large"
						className="bg-pink_primary w-56 rounded-md outline-none border-none text-white"
					>
						{isPassword?'Sign Up': 'Next'}
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
				<div className='flex justify-center items-center gap-x-2 font-semibold'>
					<label className='text-md text-[#243A57]'>Already have an account?</label>
					<div onClick={() => handleClick()} className='text-pink_primary text-md cursor-pointer'>Login</div>
				</div>
			</AuthForm>
			<Modal
				className='rounded-md'
				centered={true}
				title={'You\'ve got some mail'}
				open={open}
				closable={false}
				footer={[
					<div className="w-full flex justify-center" key="got-it">
						<Button icon={<CheckOutlined />} className='bg-pink_primary text-white outline-none border-none rounded-md px-5 font-medium text-lg leading-none flex items-center justify-center' onClick={() => {
							setOpen(false);
							!isModal && router.back();
						}}>
							Got it!
						</Button>
					</div>
				]}
			>
				We sent you an email to verify your address. Click on the link in the email.
			</Modal>
		</Container>
	);
};

export default Web2Signup;