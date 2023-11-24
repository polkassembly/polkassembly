// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined } from '@ant-design/icons';
import { InjectedAccount, InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import { Alert, Button, Divider } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC, useState } from 'react';
import { handleTokenChange } from 'src/services/auth.service';
import { Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import AuthForm from 'src/ui-components/AuthForm';
import FilteredError from 'src/ui-components/FilteredError';
import Loader from 'src/ui-components/Loader';
import LoginLogoDark from '~assets/icons/login-logo-dark.svg';
import LoginLogo from '~assets/icons/login-logo.svg';

import NovaWalletIcon from '~assets/wallet/nova-wallet-star.svg';
import PolkadotJSIcon from '~assets/wallet/polkadotjs-icon.svg';
import PolkagateIcon from '~assets/wallet/polkagate-icon.svg';
import SubWalletIcon from '~assets/wallet/subwallet-icon.png';
import TalismanIcon from '~assets/wallet/talisman-icon.svg';
import MetamaskIcon from '~assets/wallet/metamask-icon.svg';
import PolyWalletIcon from '~assets/wallet/poly-wallet.svg';
import PolkasafeIcon from '~assets/polkasafe-logo.svg';
import { ChallengeMessage, IAuthResponse, TokenType } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import ExtensionNotDetected from '../ExtensionNotDetected';
import addEthereumChain from '~src/util/addEthereumChain';
import TFALoginForm from './TFALoginForm';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { useTheme } from 'next-themes';
import PolkaSafeDarkIcon from '~assets/polkasafe-white-logo.svg';
import Image from 'next/image';

interface Props {
	chosenWallet: Wallet;
	setDisplayWeb2: () => void;
	setWalletError: React.Dispatch<React.SetStateAction<string | undefined>>;
	isModal?: boolean;
	setLoginOpen?: (pre: boolean) => void;
	setSignupOpen?: (pre: boolean) => void;
	onWalletUpdate?: () => void;
}

interface IWalletIconProps {
	which: Wallet;
	className?: string;
}

const initAuthResponse: IAuthResponse = {
	isTFAEnabled: false,
	tfa_token: '',
	token: '',
	user_id: 0
};

export const WalletIcon: FC<IWalletIconProps> = ({ which, className }) => {
	const { resolvedTheme: theme } = useTheme();
	switch (which) {
		case Wallet.POLKADOT:
			return <PolkadotJSIcon className={`h-8 w-8 ${className}`} />;
		case Wallet.TALISMAN:
			return <TalismanIcon className={`h-8 w-8 ${className}`} />;
		case Wallet.SUBWALLET:
			return (
				<span className={`h-8 w-8 ${className}`}>
					<Image
						alt=''
						src={SubWalletIcon}
						className='-mt-2 h-[26px] w-[20px]'
					/>
				</span>
			);
		case Wallet.POLKAGATE:
			return <PolkagateIcon className={`h-8 w-8 ${className}`} />;
		case Wallet.NOVAWALLET:
			return <NovaWalletIcon className={`h-8 w-8 ${className}`} />;
		case Wallet.POLYWALLET:
			return <PolyWalletIcon className={`h-8 w-8 ${className}`} />;
		case Wallet.METAMASK:
			return <MetamaskIcon className={`h-8 w-8 ${className}`} />;
		case Wallet.POLKASAFE:
			if (theme === 'dark') {
				return <PolkaSafeDarkIcon className={`relative -top-1 scale-[2] ${className}`} />;
			} else {
				return <PolkasafeIcon className={`h-8 w-6 ${className}`} />;
			}
		default:
			return null;
	}
};

const MetamaskLogin: FC<Props> = ({ chosenWallet, isModal, setLoginOpen, setSignupOpen, onWalletUpdate }) => {
	const router = useRouter();
	const currentUser = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const dispatch = useDispatch();
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [address, setAddress] = useState<string>('');
	const [isAccountLoading, setIsAccountLoading] = useState(true);
	const [extensionNotFound, setExtensionNotFound] = useState(false);
	const [accountsNotFound, setAccountsNotFound] = useState(false);
	const [fetchAccounts, setFetchAccounts] = useState(true);
	const [isSignUp, setIsSignUp] = useState(false);
	const [authResponse, setAuthResponse] = useState<IAuthResponse>(initAuthResponse);
	const { resolvedTheme: theme } = useTheme();

	const handleClick = () => {
		if (isModal && setSignupOpen && setLoginOpen) {
			setSignupOpen(true);
			setLoginOpen(false);
		} else {
			router.push('/signup');
		}
	};

	const getAccounts = async (): Promise<undefined> => {
		const ethereum = (window as any).ethereum;

		if (!ethereum) {
			setExtensionNotFound(true);
			return;
		}

		try {
			await addEthereumChain({
				ethereum,
				network
			});
		} catch (error) {
			setError(error?.message || 'Something went wrong');
			setIsAccountLoading(false);
			return;
		}

		let addresses = await ethereum.request({ method: 'eth_requestAccounts' });
		addresses = addresses.map((address: string) => address);

		if (addresses.length === 0) {
			setAccountsNotFound(true);
			setIsAccountLoading(false);
			return;
		}

		setAccounts(
			addresses.map((address: string): InjectedAccountWithMeta => {
				const account = {
					address: address.toLowerCase(),
					meta: {
						genesisHash: null,
						name: 'metamask',
						source: 'metamask'
					}
				};

				return account;
			})
		);

		if (addresses.length > 0) {
			setAddress(addresses[0]);
		}

		setIsAccountLoading(false);
	};

	const onAccountChange = (address: string) => setAddress(address);

	const handleLogin: (values: React.BaseSyntheticEvent<object, any, any> | undefined) => void = async () => {
		setError('');
		if (!(window as any).ethereum.isMetaMask) {
			setError('Please install metamask');
			return;
		}

		try {
			setLoading(true);

			const { data: loginStartData, error: loginStartError } = await nextApiClientFetch<ChallengeMessage>('api/v1/auth/actions/addressLoginStart', { address });

			if (loginStartError) {
				console.log('Error in address login start', loginStartError);
				setError(loginStartError);
				setLoading(false);
				return;
			}

			const signMessage = loginStartData?.signMessage;

			if (!signMessage) {
				throw new Error('Challenge message not found');
			}

			const msg = stringToHex(signMessage);
			const from = address;

			const params = [msg, from];
			const method = 'personal_sign';

			(window as any).ethereum.sendAsync(
				{
					from,
					method,
					params
				},
				async (err: any, result: any) => {
					if (err) {
						setError(err.message);
						setLoading(false);
						return;
					}

					const { data: addressLoginData, error: addressLoginError } = await nextApiClientFetch<IAuthResponse>('api/v1/auth/actions/addressLogin', {
						address,
						signature: result.result,
						wallet: Wallet.METAMASK
					});

					if (addressLoginError) {
						console.log('Error in address login', addressLoginError);
						setError(addressLoginError);
						// TODO: change this method of checking if user is already signed up
						if (addressLoginError === 'Please sign up prior to logging in with a web3 address') {
							setIsSignUp(true);

							try {
								setLoading(true);
								const { data, error } = await nextApiClientFetch<ChallengeMessage>('api/v1/auth/actions/addressSignupStart', { address });
								if (error || !data) {
									setError(error || 'Something went wrong');
									setLoading(false);
									return;
								}

								const signMessage = data?.signMessage;
								if (!signMessage) {
									setError('Challenge message not found');
									setLoading(false);
									return;
								}

								const msg = stringToHex(signMessage);
								const from = address;

								const params = [msg, from];
								const method = 'personal_sign';

								(window as any).ethereum.sendAsync(
									{
										from,
										method,
										params
									},
									async (err: any, result: any) => {
										if (err) {
											setError(err.message);
											setLoading(false);
											return;
										}

										const { data: confirmData, error: confirmError } = await nextApiClientFetch<TokenType>('api/v1/auth/actions/addressSignupConfirm', {
											address,
											signature: result.result,
											wallet: Wallet.METAMASK
										});

										if (confirmError || !confirmData) {
											setError(confirmError || 'Something went wrong');
											setLoading(false);
											return;
										}

										if (confirmData.token) {
											const user: any = {};
											user.loginWallet = Wallet.METAMASK;
											user.loginAddress = address;
											user.delegationDashboardAddress = address;
											localStorage.setItem('delegationWallet', Wallet.METAMASK);
											localStorage.setItem('delegationDashboardAddress', address);
											localStorage.setItem('loginWallet', Wallet.METAMASK);
											localStorage.setItem('loginAddress', address);
											handleTokenChange(confirmData.token, { ...currentUser, ...user }, dispatch);
											if (isModal) {
												setLoginOpen && setLoginOpen(false);
												setLoading(false);
												return;
											}
											router.push(isOpenGovSupported(network) ? '/opengov' : '/');
										} else {
											throw new Error('Web3 Login failed');
										}
									}
								);
							} catch (error) {
								console.log(error);
								setError(error.message);
								setLoading(false);
							}
						}
					}

					if (addressLoginData?.token) {
						const user: any = {};
						user.loginWallet = Wallet.METAMASK;
						user.loginAddress = address;
						user.delegationDashboardAddress = address;
						localStorage.setItem('delegationWallet', Wallet.METAMASK);
						localStorage.setItem('delegationDashboardAddress', address);
						localStorage.setItem('loginWallet', Wallet.METAMASK);
						localStorage.setItem('loginAddress', address);

						handleTokenChange(addressLoginData.token, { ...currentUser, ...user }, dispatch);
						if (isModal) {
							setLoginOpen?.(false);
							setLoading(false);
							return;
						}
						router.push(isOpenGovSupported(network) ? '/opengov' : '/');
					} else if (addressLoginData?.isTFAEnabled) {
						if (!addressLoginData?.tfa_token) {
							setError(error || 'TFA token missing. Please try again.');
							setLoading(false);
							return;
						}

						setAuthResponse(addressLoginData);
						setLoading(false);
					}
				}
			);
		} catch (error) {
			setError(error.message);
			setLoading(false);
		}
	};

	const handleSubmitAuthCode = async (formData: any) => {
		const { authCode } = formData;
		if (isNaN(authCode)) return;
		setLoading(true);

		const { data, error } = await nextApiClientFetch<IAuthResponse>('api/v1/auth/actions/2fa/validate', {
			auth_code: String(authCode), //use string for if it starts with 0
			login_address: address,
			login_wallet: Wallet.METAMASK,
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
			const user: any = {};
			user.loginWallet = Wallet.METAMASK;
			user.loginAddress = address;
			user.delegationDashboardAddress = address;
			localStorage.setItem('delegationWallet', Wallet.METAMASK);
			localStorage.setItem('delegationDashboardAddress', address);
			localStorage.setItem('loginWallet', Wallet.METAMASK);
			localStorage.setItem('loginAddress', address);

			handleTokenChange(data.token, { ...currentUser, ...user }, dispatch);
			if (isModal) {
				setLoading(false);
				setAuthResponse(initAuthResponse);
				setLoginOpen?.(false);
				return;
			}
			router.push(isOpenGovSupported(network) ? '/opengov' : '/');
		}
	};

	const handleBackToLogin = (): void => {
		onWalletUpdate?.();
	};

	return (
		<article className='flex flex-col rounded-md bg-white shadow-md dark:bg-section-dark-overlay'>
			<div className='mb-1 mt-1 flex items-center'>
				{theme === 'dark' ? <LoginLogoDark className='ml-6 mr-2' /> : <LoginLogo className='ml-6 mr-2' />}
				<h3 className='mt-3 text-xl font-semibold text-bodyBlue dark:text-blue-dark-high'>Login</h3>
			</div>
			<Divider
				style={{ background: '#D2D8E0', flexGrow: 1 }}
				className='mt-2 dark:bg-separatorDark'
			/>
			{fetchAccounts ? (
				<>
					<div className='-mt-6 flex flex-col px-8 pb-8'>
						<div className='my-4 flex justify-start gap-x-2'>
							<span className=''>
								<WalletIcon which={chosenWallet} />
							</span>
							<span className='mt-1 text-xl text-bodyBlue dark:text-blue-dark-high sm:text-xl'>
								{chosenWallet.charAt(0).toUpperCase() + chosenWallet.slice(1).replace('-', '.')}
							</span>
						</div>
						<p className='m-0 p-0 text-base text-bodyBlue dark:text-blue-dark-high'>
							For fetching your addresses, Polkassembly needs access to your wallet extensions. Please authorize this transaction.
						</p>
						<Divider
							style={{ background: '#D2D8E0', flexGrow: 1 }}
							className='m-0 mt-5 p-0 dark:bg-separatorDark'
						/>
						<div className='mt-4 flex w-full justify-start gap-x-2 font-normal'>
							<label className='text-bodyBlue` text-base dark:text-blue-dark-high'>Don&apos;t have an account?</label>
							<div
								onClick={handleClick}
								className='cursor-pointer text-base text-pink_primary'
							>
								{' '}
								Sign Up{' '}
							</div>
						</div>
						<Divider
							style={{ background: '#D2D8E0', flexGrow: 1 }}
							className='my-4 p-0 dark:bg-separatorDark'
						/>
						<div className='flex justify-end'>
							<Button
								className='mr-3 flex items-center justify-center rounded-md border border-solid border-pink_primary px-8 py-5 text-sm font-medium leading-none text-[#E5007A] outline-none dark:bg-transparent'
								onClick={() => handleBackToLogin()}
							>
								Go Back
							</Button>
							<Button
								key='got-it'
								icon={<CheckOutlined />}
								className='flex items-center justify-center rounded-md border border-solid border-pink_primary bg-pink_primary px-7 py-5 text-sm font-medium leading-none text-white outline-none'
								onClick={() => {
									getAccounts()
										.then(() => {
											setFetchAccounts(false);
										})
										.catch((err) => {
											console.error(err);
										});
								}}
							>
								Got it!
							</Button>
						</div>
					</div>
				</>
			) : (
				<>
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
						<AuthForm
							onSubmit={handleLogin}
							className='flex flex-col gap-y-6'
						>
							{extensionNotFound ? (
								<div className='my-5 flex items-center justify-center'>
									<ExtensionNotDetected chosenWallet={chosenWallet} />
								</div>
							) : null}
							{accountsNotFound && (
								<div className='my-5 flex items-center justify-center'>
									<Alert
										message='You need at least one account in Polkadot-js extension to login.'
										description='Please reload this page after adding accounts.'
										type='info'
										showIcon
									/>
								</div>
							)}
							{isAccountLoading ? (
								<div className='my-5'>
									<Loader
										size='large'
										timeout={3000}
										text='Requesting Web3 accounts'
									/>
								</div>
							) : (
								accounts.length > 0 && (
									<>
										<h3 className='flex flex-col gap-y-2 px-8 dark:text-blue-dark-medium'>
											<p className='m-0 flex items-center justify-start gap-x-2 p-0'>
												<span className='mt-2'>
													<WalletIcon which={chosenWallet} />
												</span>
												<span className='text-xl text-bodyBlue dark:text-blue-dark-high sm:text-xl'>
													{chosenWallet === Wallet.SUBWALLET
														? chosenWallet.charAt(0).toUpperCase() + chosenWallet.slice(1).split('-')[0]
														: chosenWallet.charAt(0).toUpperCase() + chosenWallet.slice(1).replace('-', '.')}
												</span>
											</p>
										</h3>
										<div className='-mt-4 flex items-center justify-center'>
											<AccountSelectionForm
												title='Choose linked account'
												accounts={accounts}
												address={address}
												onAccountChange={onAccountChange}
												linkAddressTextDisabled
												className='p-4'
											/>
										</div>
										{isSignUp && (
											<Alert
												showIcon
												className='mb-2'
												type='info'
												message={
													<>
														By Signing up you agree to the terms of the{' '}
														<Link
															href='/terms-and-conditions'
															className='text-pink_primary'
														>
															Polkassembly end user agreement
														</Link>
														.
													</>
												}
											/>
										)}
										<div className='flex items-center justify-center gap-x-2'>
											<Button
												className='flex h-10 w-[144px] items-center justify-center rounded-md border border-solid border-pink_primary px-8 py-5 text-sm font-medium leading-none text-[#E5007A] outline-none dark:bg-transparent'
												onClick={() => handleBackToLogin()}
											>
												Go Back
											</Button>
											<Button
												loading={loading}
												htmlType='submit'
												size='large'
												className='h-10 w-[144px] rounded-md border-none bg-pink_primary text-sm text-white outline-none'
											>
												Login
											</Button>
										</div>
									</>
								)
							)}
							<div className='mt-4'>{error ? <FilteredError text={error} /> : <></>}</div>
						</AuthForm>
					)}

					{!!chosenWallet && !accounts.length && (
						<div className='mb-6 mt-4 flex items-center justify-center'>
							<Button
								className='flex items-center justify-center rounded-md border border-solid border-pink_primary px-8 py-5 text-lg font-medium leading-none text-[#E5007A] outline-none dark:bg-transparent'
								onClick={() => handleBackToLogin()}
							>
								Go Back
							</Button>
						</div>
					)}
				</>
			)}
		</article>
	);
};

export default MetamaskLogin;
