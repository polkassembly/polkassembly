// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined } from '@ant-design/icons';
import { InjectedWindow } from '@polkadot/extension-inject/types';
import { Divider, Form, Modal } from 'antd';
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
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Input from '~src/basic-components/Input';
import Alert from '~src/basic-components/Alert';
import Skeleton from '~src/basic-components/Skeleton';
import { useTranslation } from 'next-i18next';

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
		color: ${(props: any) => (props.theme === 'dark' ? '#1677ff' : '#243a57')} !important;
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
	const { t } = useTranslation('common');

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
					setError(error || t('something_went_wrong'));
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
				setError(error || t('username_exist_check_error'));
			} else {
				if (resData.isExist) {
					setError(t('username_already_exists'));
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
					<p className='m-0 p-0 text-xl font-semibold text-bodyBlue dark:text-white'>{t('sign_up')}</p>
				</div>
				<Divider
					className='m-0 mt-4 p-0 '
					style={{ borderTop: '1px solid #E1E6EB' }}
				></Divider>
			</div>
			<Container
				className={`flex flex-col gap-y-6 rounded-md bg-white py-8 shadow-md dark:bg-section-dark-overlay ${className}`}
				theme={theme as any}
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
							<span className='mt-[2px] text-bodyBlue dark:text-grey_primary'>{t('create_username')}</span>
						</div>
						<div>
							<Divider className={`${isPassword ? 'bg-green_primary' : 'bg-grey_stroke dark:bg-grey_primary'}  m-0 mt-2 border-t-[2px] p-0`}></Divider>
						</div>
					</div>
					<div className='w-[268px] flex-col items-center border-b-2 pb-2 text-xs font-medium text-grey_primary sm:flex-row sm:text-sm'>
						<div className='flex gap-x-2 gap-y-2 '>
							<span className={`flex h-6 w-6 items-center justify-center text-white sm:h-6 sm:w-6 ${isPassword ? 'bg-pink_primary' : 'bg-grey_secondary'} rounded-full`}>02</span>
							<span className='mt-[2px] text-bodyBlue dark:text-grey_primary'>{t('set_password')}</span>
						</div>
						<div>
							<Divider className={`${inputPassword ? 'bg-green_primarye' : 'bg-grey_stroke dark:bg-grey_primary'}  m-0 mt-2 border-t-[2px] p-0`}></Divider>
						</div>
					</div>
				</div>

				{defaultWallets.length === 0 && isDelegation && (
					<Alert
						message={<span className='dark:text-blue-dark-high'>{t('wallet_extension_not_detected')}</span>}
						description={<span className='dark:text-blue-dark-high'>{t('no_web3_integration_found')}</span>}
						type='info'
						showIcon
						className='changeColor px-8 text-[#243A57] dark:text-white'
					/>
				)}
				{walletError && (
					<Alert
						message={<span className='dark:text-blue-dark-high'>{walletError}</span>}
						type='error'
						className='px-8 '
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
									{t('set_password')}
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
										placeholder={t('password_placeholder')}
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
									{t('re_enter_password')}
								</label>
								<Form.Item
									name='second_password'
									rules={[
										{
											message: t('password_do_not_match'),
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
									<Input
										type='password'
										onChange={() => setInputPassword(true)}
										placeholder={t('password_placeholder')}
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
									{t('enter_username')}
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
										placeholder={t('username_placeholder')}
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
									{t('enter_email')}
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
										placeholder={t('email_placeholder')}
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
							isLoginFlow={true}
						/>
					</div>
					{error && (
						<FilteredError
							className='px-8 '
							text={error}
						/>
					)}
					<div className='flex items-center justify-center gap-x-2 px-8 font-semibold '>
						<label className='text-md text-[#243A57] dark:text-blue-dark-high'>{t('already_have_account')}</label>
						<div
							onClick={() => handleClick()}
							className='text-md cursor-pointer text-pink_primary'
						>
							{t('login')}
						</div>
					</div>
					<Divider
						className='m-0 p-0'
						style={{ borderTop: '1px solid #E1E6EB' }}
					></Divider>
					<div className='-mt-1 flex items-center justify-end px-8'>
						<CustomButton
							variant='primary'
							buttonsize='sm'
							disabled={loading}
							htmlType='submit'
						>
							{isPassword ? t('sign_up') : t('next')}
						</CustomButton>
					</div>
				</AuthForm>
				<Modal
					wrapClassName='dark:bg-modalOverlayDark'
					className='rounded-md px-8 dark:[&>.ant-modal-content]:bg-section-dark-overlay'
					centered={true}
					title={t('youve_got_some_mail')}
					open={open}
					closable={false}
					footer={[
						<div
							className='flex w-full justify-center'
							key='got-it'
						>
							<CustomButton
								variant='primary'
								text={t('got_it')}
								icon={<CheckOutlined />}
								buttonsize='sm'
								onClick={() => {
									setOpen(false);
									!isModal && router.back();
								}}
							/>
						</div>
					]}
				>
					{t('verify_email_instruction')}
				</Modal>
			</Container>
		</div>
	);
};

export default styled(Web2Signup)`
	.ant-input {
		color: ${(props: any) => (props.theme == 'dark' ? 'white' : '')} !important;
		background-color: ${(props: any) => (props.theme == 'dark' ? 'transparent' : '')} !important;
	}
	.ant-input::placeholder {
		color: ${(props: any) => (props.theme == 'dark' ? 'white' : '')} !important;
	}
`;
