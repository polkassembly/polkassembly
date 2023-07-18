// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { CheckOutlined } from '@ant-design/icons';
import React, { FC, useCallback, useEffect, useState } from 'react';
import LoginLogo from '~assets/icons/login-logo.svg';
import { WalletIcon } from './MetamaskLogin';
import { Wallet } from '~src/types';
import { useRouter } from 'next/router';
import { Alert, Button, Divider } from 'antd';
import FilteredError from '~src/ui-components/FilteredError';
import AuthForm from '~src/ui-components/AuthForm';
import Link from 'next/link';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import Loader from '~src/ui-components/Loader';
import TFALoginForm from './TFALoginForm';
import { useApiContext, useUserDetailsContext } from '~src/context';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { ChallengeMessage, IAuthResponse, TokenType } from '~src/auth/types';
import { initAuthResponse } from './Web3Login';
import { QrSigner, QrState } from '~src/util/QrSigner';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { handleTokenChange } from '~src/services/auth.service';
import { getPolkadotVaultAccounts } from '../Settings/UserAccount/ParitySigner';
import AuthorizeTransactionUsingQr from '~src/ui-components/AuthorizeTransactionUsingQr';
import { HexString } from '@polkadot/util/types';

interface IPolkadotVaultLoginProps {
    chosenWallet: Wallet;
    setDisplayWeb2: () => void;
    setWalletError: React.Dispatch<React.SetStateAction<string | undefined>>;
    isModal?:boolean;
    setLoginOpen?:(pre: boolean) => void;
    setSignupOpen?: (pre: boolean) => void;
    onWalletUpdate?: () => void;
}

let qrId = 0;

const PolkadotVaultLogin: FC<IPolkadotVaultLoginProps> = (props) => {
	const { chosenWallet, isModal, setLoginOpen, setSignupOpen, setDisplayWeb2, onWalletUpdate } = props;
	const { api, apiReady } = useApiContext();

	const router = useRouter();
	const currentUser = useUserDetailsContext();

	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [address, setAddress] = useState<string>('');
	const [isAccountLoading, setIsAccountLoading] = useState(true);
	const [accountsNotFound, setAccountsNotFound] = useState(false);
	const [fetchAccounts, setFetchAccounts] = useState(true);
	const [isSignUp, setIsSignUp] = useState(false);
	const [authResponse, setAuthResponse] = useState<IAuthResponse>(initAuthResponse);
	const [{ isQrHashed, qrAddress, qrPayload, qrResolve }, setQrState] = useState<QrState>(() => ({ isQrHashed: false, qrAddress: '', qrPayload: new Uint8Array() }));
	const [showQrModal, setShowQrModal] = useState(false);
	const [isScanned, setIsScanned] = useState(false);

	const onAccountChange = (address: string) => setAddress(address);

	useEffect(() => {
		const accounts = getPolkadotVaultAccounts();
		setAccounts(accounts);
		setFetchAccounts(false);
		setIsAccountLoading(false);
		if (accounts.length > 0) {
			setAddress(accounts[0].address);
		} else {
			setAccountsNotFound(true);
		}
	}, []);

	const _addQrSignature = useCallback(
		({ signature }: { signature: string }) => {
			if (isScanned) {
				return;
			}
			setIsScanned(true);
			qrResolve && qrResolve({
				id: ++qrId,
				signature: signature as HexString
			});
		},
		[qrResolve, isScanned]
	);

	const handleClick=() => {
		if(isModal && setSignupOpen && setLoginOpen) {
			setSignupOpen(true);
			setLoginOpen(false);
		} else{
			router.push('/signup');
		}
	};

	const handleLogin: ( values: React.BaseSyntheticEvent<object, any, any> | undefined ) => void = async  () => {
		if (!accounts.length) {
			return;
		}

		try {

			if (!api || !apiReady) {
				return;
			}

			const signer = new QrSigner(api?.registry, setQrState);
			const signRaw = signer.signRaw;
			if (!signRaw) return console.error('Signer not available');

			setLoading(true);

			let substrate_address;
			if(!address.startsWith('0x')) {
				substrate_address = getSubstrateAddress(address);
				if(!substrate_address) return console.error('Invalid address');
			} else {
				substrate_address = address;
			}

			const { data: loginStartData , error: loginStartError } = await nextApiClientFetch<ChallengeMessage>( 'api/v1/auth/actions/addressLoginStart', { address: substrate_address, wallet: chosenWallet });
			if(loginStartError) {
				console.log('Error in address login start', loginStartError);
				setError(loginStartError);
				setLoading(false);
				return;
			}
			const signMessage = loginStartData?.signMessage;

			if (!signMessage) {
				throw new Error('Challenge message not found');
			}

			setShowQrModal(true);
			const { signature } = await signRaw({
				address: substrate_address,
				data: signMessage,
				type: 'bytes'
			});
			setShowQrModal(false);

			const { data: addressLoginData , error: addressLoginError } = await nextApiClientFetch<IAuthResponse>( 'api/v1/auth/actions/addressLogin', { address: substrate_address, signature, wallet: chosenWallet });
			if(addressLoginError) {
				setError(addressLoginError);
				// TODO: change this method of checking if user is already signed up
				if (addressLoginError === 'Please sign up prior to logging in with a web3 address') {
					setIsSignUp(true);
					try {
						setLoading(true);
						const { data , error } = await nextApiClientFetch<ChallengeMessage>( 'api/v1/auth/actions/addressSignupStart', { address: substrate_address });
						if (error || !data) {
							setError(error || 'Something went wrong');
							setLoading(false);
							return;
						}

						const signMessage = data?.signMessage;
						if (!signMessage){
							setError('Challenge message not found');
							setLoading(false);
							return;
						}

						setShowQrModal(true);
						const { signature } = await signRaw({
							address: substrate_address,
							data: signMessage,
							type: 'bytes'
						});
						setShowQrModal(false);

						const { data: confirmData , error: confirmError } = await nextApiClientFetch<TokenType>( 'api/v1/auth/actions/addressSignupConfirm', {
							address: substrate_address,
							signature: signature,
							wallet: chosenWallet
						});

						if (confirmError || !confirmData) {
							setError(confirmError || 'Something went wrong');
							setLoading(false);
							return;
						}

						if(confirmData.token) {
							currentUser.loginWallet= chosenWallet;
							currentUser.loginAddress = address;
							currentUser.delegationDashboardAddress = address;
							localStorage.setItem('delegationWallet', chosenWallet);
							localStorage.setItem('delegationDashboardAddress', address);
							localStorage.setItem('loginWallet', chosenWallet);
							handleTokenChange(confirmData.token, currentUser);
							if(isModal){
								setLoginOpen && setLoginOpen(false);
								setLoading(false);
								return;
							}
							router.push('/');
						}else {
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

			if(addressLoginData?.token){
				currentUser.loginWallet= chosenWallet;
				currentUser.loginAddress = address;
				currentUser.delegationDashboardAddress = address;

				localStorage.setItem('delegationWallet', chosenWallet);
				localStorage.setItem('delegationDashboardAddress', address);
				localStorage.setItem('loginWallet', chosenWallet);

				handleTokenChange(addressLoginData.token, currentUser);
				if(isModal){
					setLoginOpen?.(false);
					setLoading(false);
					return;
				}
				router.push('/');
			}else if(addressLoginData?.isTFAEnabled) {
				if(!addressLoginData?.tfa_token) {
					setError(error || 'TFA token missing. Please try again.');
					setLoading(false);
					return;
				}

				setAuthResponse(addressLoginData);
				setLoading(false);
			}

		} catch (error) {
			setError(error.message);
			setLoading(false);
		}
	};

	const handleSubmitAuthCode = async (formData: any) => {
		const { authCode } = formData;
		if(isNaN(authCode)) return;
		setLoading(true);

		const { data , error } = await nextApiClientFetch<IAuthResponse>('api/v1/auth/actions/2fa/validate', {
			auth_code: String(authCode), //use string for if it starts with 0
			login_address: address,
			login_wallet: chosenWallet,
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

	const handleToggle = () => setDisplayWeb2();

	const handleBackToLogin = () => {
		onWalletUpdate && onWalletUpdate();
	};

	return (
		<>
			<article className="bg-white shadow-md rounded-md flex flex-col gap-y-3">
				<div className='flex items-center px-4 pt-4 pb-2'>
					<LoginLogo className='mr-3' />
					<span className="text-[20px] font-semibold text-bodyBlue">Login</span>
				</div>
				<hr className='border-[#D2D8E0] border-opacity-30 -mt-2' />
				<h3 className="text-2xl font-semibold text-[#1E232C] flex flex-col px-4 mb-0">
					{/* <span>Login</span> */}
					<p className='flex gap-x-2 items-center justify-start p-0 m-0'>
						<span>
							<WalletIcon which={chosenWallet} />
						</span>
						<span className='text-bodyBlue text-lg sm:text-xl'>
							{chosenWallet.charAt(0).toUpperCase() + chosenWallet.slice(1).replace('-', '.')}
						</span>
					</p>
				</h3>
				<AuthorizeTransactionUsingQr
					open={showQrModal}
					setOpen={setShowQrModal}
					api={api}
					apiReady={apiReady}
					qrAddress={qrAddress}
					qrPayload={qrPayload}
					isQrHashed={isQrHashed}
					onScan={_addQrSignature}
					isScanned={isScanned}
				/>
				{fetchAccounts ?
					<div className='flex flex-col justify-center items-center px-4'>
						<p className='text-base text-bodyBlue'>
							For fetching your addresses, Polkassembly needs access to your wallet extensions. Please authorize this transaction.
						</p>
						<div className='flex'>
							<Button className='text-[#E5007A] outline-none border border-pink_primary border-solid rounded-md py-5 px-8 mr-3 font-medium text-lg leading-none flex items-center justify-center' onClick={() => handleBackToLogin()}>
								Go Back</Button>
							<Button
								key='got-it'
								icon={<CheckOutlined />}
								className='bg-pink_primary text-white outline-none border border-pink_primary border-solid rounded-md py-5 px-8 font-medium text-lg leading-none flex items-center justify-center'
								onClick={() => {}}
							>
								Got it!
							</Button>
						</div>
					</div>
					: (
						<>
							{authResponse.isTFAEnabled ?
								<TFALoginForm
									onBack={() => {setAuthResponse(initAuthResponse); setError(''); }}
									onSubmit={handleSubmitAuthCode}
									error={error || ''}
									loading={loading}
								/> :
								<AuthForm onSubmit={handleLogin} className="flex flex-col px-4">
									{accountsNotFound && (
										<div className='flex justify-center items-center my-5'>
											<Alert
												message="You need at least one account in Polkadot-js extension to login."
												description="Please reload this page after adding accounts."
												type="info"
												showIcon />
										</div>
									)}
									{isAccountLoading ? (
										<div className="my-5">
											<Loader
												size="large"
												timeout={3000}
												text="Requesting Web3 accounts"
											/>
										</div>
									) : accounts.length > 0 && (
										<>
											<div className='flex justify-center items-center my-5'>
												<AccountSelectionForm
													title='Choose linked account'
													accounts={accounts}
													address={address}
													onAccountChange={onAccountChange}
												/>
											</div>
											{
												isSignUp && <Alert
													showIcon
													className='mb-2'
													type='info'
													message={
														<>
                                                            By Signing up you agree to the terms of the
															<Link
																href='/terms-and-conditions' className='text-pink_primary'
															>
                                                                Polkassembly end user agreement
															</Link>.
														</>
													}
												/>

											}
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
												<Divider>
													<div className="flex gap-x-2 items-center">
														<span className="text-grey_primary text-md">Or</span>
														<Button
															className="p-0 border-none outline-none text-pink_primary text-md font-semibold"
															disabled={loading}
															onClick={handleToggle}
														>
														Login with Username
														</Button>
													</div>
												</Divider>
											</div>
										</>
									)}
									<div>
										{error && <FilteredError text={error} />}
									</div>
								</AuthForm>
							}

							{
								!authResponse.isTFAEnabled && <div className='flex items-center justify-center'>
									<Button
										className='text-[#E5007A] outline-none border border-pink_primary border-solid rounded-md py-5 px-8 mr-3 font-medium text-lg leading-none flex items-center justify-center'
										onClick={() => handleBackToLogin()}
									>
                                        Go Back
									</Button>
								</div>
							}
						</>
					)}
				<div className="flex justify-center items-center pb-5 font-medium mt-6">
					<label className="text-lg text-bodyBlue">
						Don&apos;t have an account?
					</label>
					<div onClick={handleClick} className='text-lg text-pink_primary cursor-pointer'>&nbsp; Sign Up </div>
				</div>
			</article>
		</>
	);
};

export default PolkadotVaultLogin;