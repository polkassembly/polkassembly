// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined } from '@ant-design/icons';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import { Divider } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC, useEffect, useState } from 'react';
import { APPNAME } from 'src/global/appName';
import { handleTokenChange } from 'src/services/auth.service';
import { Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import AuthForm from 'src/ui-components/AuthForm';
import Loader from 'src/ui-components/Loader';
import getEncodedAddress from 'src/util/getEncodedAddress';
import LoginLogo from '~assets/icons/login-logo.svg';
import { ChallengeMessage, IAuthResponse, TokenType } from '~src/auth/types';
import LoginLogoDark from '~assets/icons/login-logo-dark.svg';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import ExtensionNotDetected from '../ExtensionNotDetected';
import { WalletIcon } from './MetamaskLogin';
import Image from 'next/image';
import WalletButtons from './WalletButtons';
import MultisigAccountSelectionForm from '~src/ui-components/MultisigAccountSelectionForm';
import TFALoginForm from './TFALoginForm';
import BN from 'bn.js';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { decodeToken } from 'react-jwt';
import { JWTPayloadType } from '~src/auth/types';
import MANUAL_USERNAME_25_CHAR from '~src/auth/utils/manualUsername25Char';
import { useTheme } from 'next-themes';
import LoginSuccessModal from '~src/ui-components/LoginSuccessModal';
import styled from 'styled-components';
import { trackEvent } from 'analytics';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Alert from '~src/basic-components/Alert';
import FilteredError from '~src/ui-components/FilteredError';
import { useTranslation } from 'next-i18next';
import { chainProperties } from '~src/global/networkConstants';
import { subscanApiHeaders } from '~src/global/apiHeaders';

const ZERO_BN = new BN(0);
interface Props {
	chosenWallet: Wallet;
	setDisplayWeb2: () => void;
	setWalletError: React.Dispatch<React.SetStateAction<string | undefined>>;
	isModal?: boolean;
	setLoginOpen?: (pre: boolean) => void;
	setSignupOpen?: (pre: boolean) => void;
	onWalletUpdate?: () => void;
	withPolkasafe?: boolean;
	setChosenWallet: any;
	setIsClosable?: (pre: boolean) => void;
	className?: string;
}

const initAuthResponse: IAuthResponse = {
	isTFAEnabled: false,
	tfa_token: '',
	token: '',
	user_id: 0
};

const Web3Login: FC<Props> = ({
	chosenWallet,
	setDisplayWeb2,
	setIsClosable,
	setWalletError,
	isModal,
	setLoginOpen,
	setSignupOpen,
	withPolkasafe,
	setChosenWallet,
	onWalletUpdate,
	className
}) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();

	const router = useRouter();
	const currentUser = useUserDetailsSelector();
	const dispatch = useDispatch();

	const [error, setError] = useState('');
	const { t } = useTranslation('common');
	const [loading, setLoading] = useState(false);
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [address, setAddress] = useState<string>('');
	const [multisigAddress, setMultisigAddress] = useState<string>('');
	const [isAccountLoading, setIsAccountLoading] = useState(true);
	const [extensionNotFound, setExtensionNotFound] = useState(false);
	const [accountsNotFound, setAccountsNotFound] = useState(false);
	const [fetchAccounts, setFetchAccounts] = useState(true);
	const [isSignUp, setIsSignUp] = useState(false);
	const [authResponse, setAuthResponse] = useState<IAuthResponse>(initAuthResponse);
	const [multisigBalance, setMultisigBalance] = useState<BN>(ZERO_BN);
	const [showOptionalFields, setShowOptionalFields] = useState(false);

	const handleClick = () => {
		if (isModal && setSignupOpen && setLoginOpen) {
			setSignupOpen(true);
			setLoginOpen(false);
		} else {
			router.push('/signup');
		}
	};

	const getAccounts = async (chosenWallet: Wallet): Promise<void> => {
		if (['moonbase', 'moonbeam', 'moonriver', 'laossigma'].includes(network)) {
			const wallet = chosenWallet === Wallet.SUBWALLET ? (window as any).SubWallet : (window as any).talismanEth;
			if (!wallet) {
				if (!extensionNotFound) {
					setExtensionNotFound(true);
				}
				setIsAccountLoading(false);
				return;
			} else {
				if (extensionNotFound) {
					setExtensionNotFound(false);
				}
			}
			const accounts: string[] = (await wallet.request({ method: 'eth_requestAccounts' })) || [];

			if (accounts.length === 0) {
				setAccountsNotFound(true);
				setIsAccountLoading(false);
				return;
			} else {
				setAccountsNotFound(false);
			}

			const walletName = chosenWallet === Wallet.SUBWALLET ? Wallet.SUBWALLET : chosenWallet === Wallet.TALISMAN ? Wallet.TALISMAN : 'MetaMask';

			const injectedAccounts = accounts.map(
				(account) =>
					({
						address: account,
						name: walletName,
						source: walletName
					}) as InjectedAccount
			);

			setAccounts(injectedAccounts);
			if (injectedAccounts.length > 0) {
				setAddress(injectedAccounts[0].address);
			}
			setIsAccountLoading(false);
			return;
		} else {
			const injectedWindow = window as Window & InjectedWindow;
			const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[chosenWallet] : null;
			if (!wallet) {
				if (!extensionNotFound) {
					setExtensionNotFound(true);
				}
				setIsAccountLoading(false);
				return;
			} else {
				if (extensionNotFound) {
					setExtensionNotFound(false);
				}
			}

			let injected: Injected | undefined;
			try {
				injected = await new Promise((resolve, reject) => {
					const timeoutId = setTimeout(() => {
						reject(new Error('Wallet Timeout'));
					}, 60000); // wait 60 sec

					if (wallet && wallet.enable) {
						wallet
							.enable(APPNAME)
							.then((value) => {
								clearTimeout(timeoutId);
								resolve(value);
							})
							.catch((error) => {
								reject(error);
							});
					}
				});
			} catch (err) {
				setIsAccountLoading(false);
				console.log(err?.message);
				if (err?.message == 'Rejected') {
					setWalletError('');
					handleToggle();
				} else if (err?.message == 'Pending authorisation request already exists for this site. Please accept or reject the request.') {
					setWalletError('Pending authorisation request already exists. Please accept or reject the request on the wallet extension and try again.');
					handleToggle();
				} else if (err?.message == 'Wallet Timeout') {
					setWalletError('Wallet authorisation timed out. Please accept or reject the request on the wallet extension and try again.');
					handleToggle();
				}
			}
			if (!injected) {
				return;
			}

			const accounts = await injected.accounts.get();
			if (accounts.length === 0) {
				setAccountsNotFound(true);
				setIsAccountLoading(false);
				return;
			} else {
				setAccountsNotFound(false);
			}

			accounts.forEach((account) => {
				account.address = getEncodedAddress(account.address, network) || account.address;
			});

			setAccounts(accounts);
			if (accounts.length > 0) {
				setAddress(accounts[0].address);
			}

			setIsAccountLoading(false);
			return;
		}
	};

	const onAccountChange = (address: string) => {
		setAddress(address);
		setMultisigAddress('');
	};

	const handleLogin: (values: React.BaseSyntheticEvent<object, any, any> | undefined) => void = async () => {
		if (!accounts.length) return getAccounts(chosenWallet);

		try {
			const injectedWindow = window as Window & InjectedWindow;
			const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[chosenWallet] : null;

			if (!wallet) {
				setExtensionNotFound(true);
				setIsAccountLoading(false);
				return;
			} else {
				setExtensionNotFound(false);
			}

			const injected = wallet && wallet.enable && (await wallet.enable(APPNAME));

			const signRaw = injected && injected.signer && injected.signer.signRaw;
			if (!signRaw) return console.error('Signer not available');

			setLoading(true);

			let substrate_address;
			if (!address.startsWith('0x')) {
				substrate_address = getSubstrateAddress(address);
				if (!substrate_address) return console.error('Invalid address');
			} else {
				substrate_address = address;
			}

			let multisigAddressInfo = {};
			if (multisigAddress) {
				const response = await fetch(`${chainProperties[network].externalLinks}/api/v2/scan/search`, {
					body: JSON.stringify({
						key: multisigAddress,
						row: 1
					}),
					headers: subscanApiHeaders,
					method: 'POST'
				});
				const responseJSON = await response.json();
				if (responseJSON.data?.account) {
					multisigAddressInfo = responseJSON.data?.account;
				}
			}

			const { data: loginStartData, error: loginStartError } = await nextApiClientFetch<ChallengeMessage>('api/v1/auth/actions/addressLoginStart', {
				address: substrate_address,
				wallet: chosenWallet
			});
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

			const { signature } = await signRaw({
				address: substrate_address,
				data: stringToHex(signMessage),
				type: 'bytes'
			});

			const { data: addressLoginData, error: addressLoginError } = await nextApiClientFetch<IAuthResponse>('api/v1/auth/actions/addressLogin', {
				address: substrate_address,
				multisig: multisigAddress,
				signature,
				wallet: chosenWallet
			});
			if (addressLoginError) {
				setError(addressLoginError);
				// TODO: change this method of checking if user is already signed up
				if (addressLoginError === 'Please sign up prior to logging in with a web3 address') {
					setIsSignUp(true);
					try {
						setLoading(true);
						const { data, error } = await nextApiClientFetch<ChallengeMessage>('api/v1/auth/actions/addressSignupStart', { address: substrate_address, multisig: multisigAddress });
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

						const { signature } = await signRaw({
							address: substrate_address,
							data: stringToHex(signMessage),
							type: 'bytes'
						});

						const { data: confirmData, error: confirmError } = await nextApiClientFetch<TokenType>('api/v1/auth/actions/addressSignupConfirm', {
							address: substrate_address,
							multisig: multisigAddress,
							signature: signature,
							wallet: chosenWallet
						});

						if (confirmError || !confirmData) {
							setError(confirmError || 'Something went wrong');
							setLoading(false);
							return;
						}

						if (confirmData.token) {
							const user: any = {};
							user.loginWallet = chosenWallet;
							user.loginAddress = multisigAddress || address;
							user.multisigAssociatedAddress = address;
							user.delegationDashboardAddress = multisigAddress || address;
							localStorage.setItem('delegationWallet', chosenWallet);
							localStorage.setItem('delegationDashboardAddress', multisigAddress || address);
							localStorage.setItem('multisigDelegationAssociatedAddress', address);
							localStorage.setItem('loginWallet', chosenWallet);
							localStorage.setItem('loginAddress', address);
							localStorage.setItem('multisigAssociatedAddress', address);
							handleTokenChange(confirmData.token, { ...currentUser, ...user }, dispatch);
							if (isModal) {
								const localCurrentUser: any = decodeToken<JWTPayloadType>(confirmData.token);
								if (localCurrentUser?.web3signup && localCurrentUser?.username.length === 25 && !MANUAL_USERNAME_25_CHAR.includes(localCurrentUser?.username)) {
									setLoginOpen?.(true);
									setShowOptionalFields(true);
								} else {
									setLoginOpen?.(false);
									setShowOptionalFields(false);
								}
								setIsClosable?.(false);
								setLoading(false);
								return;
							}
							{
								router.push(isOpenGovSupported(network) ? '/opengov' : '/');
							}
						} else {
							throw new Error('Web3 Login failed');
						}
					} catch (error) {
						setError(error.message);
						setLoading(false);
					}
				}
				setLoading(false);
				return;
			}

			if (addressLoginData?.token) {
				const user: any = {};
				user.loginWallet = chosenWallet;
				user.loginAddress = multisigAddress || address;
				user.delegationDashboardAddress = multisigAddress || address;
				user.multisigAssociatedAddress = address;
				user.multisigAddressInfo = multisigAddressInfo;
				localStorage.setItem('delegationWallet', chosenWallet);
				localStorage.setItem('delegationDashboardAddress', multisigAddress || address);
				localStorage.setItem('multisigDelegationAssociatedAddress', address);
				localStorage.setItem('loginWallet', chosenWallet);
				localStorage.setItem('loginAddress', address);

				localStorage.setItem('multisigAssociatedAddress', address);
				localStorage.setItem('multisigAddressInfo', JSON.stringify(multisigAddressInfo));
				handleTokenChange(addressLoginData.token, { ...currentUser, ...user }, dispatch);

				if (isModal) {
					const localCurrentUser: any = decodeToken<JWTPayloadType>(addressLoginData.token);

					// GAEvent for login successful
					trackEvent('user_login_successful', 'successful_user_login', {
						address: localCurrentUser?.default_address || '',
						isWeb3Login: localCurrentUser?.web3signup,
						userId: localCurrentUser?.id || currentUser?.id || '',
						userName: localCurrentUser?.username || currentUser?.username || ''
					});

					if (localCurrentUser?.web3signup && localCurrentUser?.username.length === 25 && !MANUAL_USERNAME_25_CHAR.includes(localCurrentUser?.username)) {
						setLoginOpen?.(true);
						setShowOptionalFields(true);
					} else {
						setLoginOpen?.(false);
						setShowOptionalFields(false);
					}
					setIsClosable?.(false);
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
		} catch (error) {
			console.log(error);
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
			login_wallet: chosenWallet,
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

	const handleToggle = () => setDisplayWeb2();

	const handleBackToLogin = (): void => {
		onWalletUpdate && onWalletUpdate();
	};

	const handleChangeWalletWithPolkasafe = (wallet: string) => {
		setChosenWallet(wallet);
		setAccounts([]);
	};
	useEffect(() => {
		if (fetchAccounts && withPolkasafe && accounts.length === 0 && chosenWallet !== Wallet.POLKASAFE) {
			setLoading(true);
			getAccounts(chosenWallet)
				.then(() => setFetchAccounts(false))
				.catch((err) => {
					console.error(err);
				})
				.finally(() => setLoading(false));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accounts.length, chosenWallet, withPolkasafe, fetchAccounts]);

	return (
		<div className={`${className}`}>
			{!showOptionalFields && (
				<div>
					<div className='mb-1 mt-2 flex items-center'>
						{theme === 'dark' ? <LoginLogoDark className='ml-6 mr-2' /> : <LoginLogo className='ml-6 mr-2' />}
						<h3 className='mt-3 text-xl font-semibold text-bodyBlue dark:text-blue-dark-high'>{withPolkasafe ? <PolkasafeWithIcon /> : t('login')}</h3>
					</div>
					<Divider
						style={{ background: '#D2D8E0', flexGrow: 1 }}
						className='mt-2 dark:bg-separatorDark'
					/>

					<article className='-mt-1 flex flex-col gap-y-3 rounded-md bg-white px-8 pb-4 shadow-md dark:bg-section-dark-overlay'>
						<h3 className='flex flex-col gap-y-2 dark:text-blue-dark-medium'>
							{!withPolkasafe && (
								<p className='m-0 flex items-center justify-start gap-x-2 p-0'>
									<span className='-ml-2 mt-2 scale-75'>
										<WalletIcon which={chosenWallet} />
									</span>
									<span className='text-xl text-bodyBlue dark:text-blue-dark-high sm:text-xl'>
										{chosenWallet === Wallet.SUBWALLET
											? chosenWallet.charAt(0).toUpperCase() + chosenWallet.slice(1).split('-')[0]
											: chosenWallet.charAt(0).toUpperCase() + chosenWallet.slice(1).replace('-', '.')}
									</span>
								</p>
							)}
							{withPolkasafe && (
								<WalletButtons
									disabled={loading}
									onWalletSelect={handleChangeWalletWithPolkasafe}
									showPolkasafe={false}
									noHeader={true}
									selectedWallet={chosenWallet}
								/>
							)}
						</h3>
						{fetchAccounts ? (
							<div className='-mt-3 flex flex-col items-center justify-center'>
								<p className='m-0 p-0 text-base text-bodyBlue dark:text-blue-dark-high'>{withPolkasafe ? t('fetch_multisig_details') : t('fetch_addresses')}</p>
								<Divider
									style={{ background: '#D2D8E0', flexGrow: 1 }}
									className='m-0 mt-5 p-0 dark:bg-separatorDark'
								/>
								<div className='flex w-full justify-start'>
									<div className='no-account-text-container mt-4 flex pb-5 font-normal'>
										<label className='text-base text-bodyBlue dark:text-blue-dark-high'>{t('dont_have_account')}</label>
										<div
											onClick={handleClick}
											className='signup-button cursor-pointer text-base text-pink_primary'
										>
											&nbsp; {t('sign_up')}
										</div>
									</div>
								</div>
								<Divider
									style={{ background: '#D2D8E0', flexGrow: 1 }}
									className='m-0 mb-4 p-0 dark:bg-separatorDark'
								/>
								<div className='web3-button-container ml-auto flex'>
									<CustomButton
										text={t('go_back')}
										variant='default'
										buttonsize='sm'
										onClick={() => handleBackToLogin()}
										className='web3-button mr-3 w-[144px]'
									/>

									{!withPolkasafe && (
										<CustomButton
											icon={<CheckOutlined />}
											text={t('got_it')}
											variant='primary'
											buttonsize='sm'
											onClick={() => {
												getAccounts(chosenWallet)
													.then(() => {
														setFetchAccounts(false);
													})
													.catch((err) => {
														console.error(err);
													});
											}}
											className='web3-button w-[144px]'
										/>
									)}
								</div>
							</div>
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
										className='flex flex-col'
									>
										{extensionNotFound ? (
											<div>
												<div className='-mt-1 mb-5 flex items-center justify-center'>
													<ExtensionNotDetected chosenWallet={chosenWallet} />
												</div>
											</div>
										) : null}
										{accountsNotFound && (
											<div className='my-5 flex items-center justify-center px-4'>
												<Alert
													message={<span className='dark:text-blue-dark-high'>{t('need_one_account')}</span>}
													description={<span className='dark:text-blue-dark-high'>{t('reload_after_adding')}</span>}
													type='info'
													showIcon
												/>
											</div>
										)}
										{isAccountLoading ? (
											<div className='my-5 px-4'>
												<Loader
													size='large'
													timeout={3000}
													text={t('requesting_web3_accounts')}
												/>
											</div>
										) : (
											accounts.length > 0 && (
												<>
													<div className='mb-4 flex items-center justify-center'>
														{withPolkasafe ? (
															<MultisigAccountSelectionForm
																multisigBalance={multisigBalance}
																setMultisigBalance={setMultisigBalance}
																title={t('choose_linked_account')}
																accounts={accounts}
																address={address}
																onAccountChange={onAccountChange}
																walletAddress={multisigAddress}
																setWalletAddress={setMultisigAddress}
															/>
														) : (
															<AccountSelectionForm
																isTruncateUsername={false}
																title={t('choose_linked_account')}
																accounts={accounts}
																address={address}
																onAccountChange={onAccountChange}
																linkAddressTextDisabled
															/>
														)}
													</div>
													{isSignUp && (
														<Alert
															showIcon
															className='mb-2 px-4 '
															type='info'
															message={
																<span className='dark:text-blue-dark-high'>
																	{t('sign_up_agreement')}{' '}
																	<Link
																		href='/terms-and-conditions'
																		className='text-pink_primary'
																	>
																		{t('user_agreement')}
																	</Link>
																	.
																</span>
															}
														/>
													)}
													<div className='my-2 flex items-center justify-center gap-x-2 px-4'>
														<CustomButton
															text={t('go_back')}
															variant='default'
															buttonsize='sm'
															onClick={() => handleBackToLogin()}
															className='mr-3'
														/>
														<CustomButton
															text={t('login')}
															variant='primary'
															buttonsize='sm'
															loading={loading}
															disabled={withPolkasafe && !multisigAddress}
															htmlType='submit'
														/>
													</div>
												</>
											)
										)}
										<div>
											{error ? (
												<FilteredError
													text={error}
													type={'info'}
												/>
											) : (
												<></>
											)}
										</div>
									</AuthForm>
								)}

								{!!chosenWallet && !accounts.length && (
									<div className='flex items-center justify-center'>
										<CustomButton
											text={t('go_back')}
											variant='default'
											buttonsize='sm'
											onClick={() => handleBackToLogin()}
										/>
									</div>
								)}
							</>
						)}
					</article>
				</div>
			)}
			{showOptionalFields && <LoginSuccessModal setLoginOpen={setLoginOpen} />}
		</div>
	);
};

const PolkasafeWithIcon = () => (
	<>
		Login by Polkasafe{' '}
		<Image
			width={25}
			height={25}
			src='/assets/polkasafe-logo.svg'
			alt='polkasafe'
		/>
	</>
);

export default styled(Web3Login)`
	@media (max-width: 392px) and (min-width: 319px) {
		.web3-button {
			padding: 20px 15px !important;
		}
		.web3-button-container {
			margin-left: 0 !important;
		}
	}
	@media (max-width: 365px) and (min-width: 319px) {
		.no-account-text-container {
			display: block !important;
		}
		.signup-button {
			margin-left: -8px !important;
		}
	}
`;
