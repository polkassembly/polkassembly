// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined } from '@ant-design/icons';
import {
	InjectedAccount,
	InjectedAccountWithMeta
} from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import { Alert, Button, Divider } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC, useState } from 'react';
import { useNetworkContext, useUserDetailsContext } from 'src/context';
import { handleTokenChange } from 'src/services/auth.service';
import { Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import AuthForm from 'src/ui-components/AuthForm';
import FilteredError from 'src/ui-components/FilteredError';
import Loader from 'src/ui-components/Loader';

import NovaWalletIcon from '~assets/wallet/nova-wallet-star.svg';
import PolkadotJSIcon from '~assets/wallet/polkadotjs-icon.svg';
import SubWalletIcon from '~assets/wallet/subwallet-icon.svg';
import TalismanIcon from '~assets/wallet/talisman-icon.svg';
import MetamaskIcon from '~assets/wallet/metamask-icon.svg';
import PolyWalletIcon from '~assets/wallet/poly-wallet.svg';
import { ChallengeMessage, TokenType } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import PolkasafeIcon from './polkasafe-logo.svg';
import ExtensionNotDetected from '../ExtensionNotDetected';
import addEthereumChain from '~src/util/addEthereumChain';

interface Props {
  chosenWallet: Wallet;
  setDisplayWeb2: () => void;
  setWalletError: React.Dispatch<React.SetStateAction<string | undefined>>;
   isModal?:boolean;
  setLoginOpen?:(pre:boolean)=>void;
  setSignupOpen?: (pre: boolean) => void;
}

interface IWalletIconProps {
  which: Wallet;
  className?: string;
}

export const WalletIcon: FC<IWalletIconProps> = ({ which, className }) => {
	switch (which) {
	case Wallet.POLKADOT:
		return <PolkadotJSIcon className={`h-8 w-8 ${className}`} />;
	case Wallet.TALISMAN:
		return <TalismanIcon className={`h-8 w-8 ${className}`} />;
	case Wallet.SUBWALLET:
		return <SubWalletIcon className={`h-8 w-8 ${className}`} />;
	case Wallet.NOVAWALLET:
		return <NovaWalletIcon className={`h-8 w-8 ${className}`} />;
	case Wallet.POLYWALLET:
		return <PolyWalletIcon className={`h-8 w-8 ${className}`} />;
	case Wallet.METAMASK:
		return <MetamaskIcon className={`h-8 w-8 ${className}`} />;
	case Wallet.POLKASAFE:
		return <PolkasafeIcon className={`h-8 w-8 ${className}`} />;
	default:
		return null;
	}
};
const MetamaskLogin: FC<Props> = ({
	chosenWallet,
	setDisplayWeb2,
	isModal,
	setLoginOpen,
	setSignupOpen
}) => {
	const router = useRouter();
	const currentUser = useUserDetailsContext();

	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [address, setAddress] = useState<string>('');
	const [isAccountLoading, setIsAccountLoading] = useState(true);
	const [extensionNotFound, setExtensionNotFound] = useState(false);
	const [accountsNotFound, setAccountsNotFound] = useState(false);
	const [fetchAccounts, setFetchAccounts] = useState(true);
	const [isSignUp, setIsSignUp] = useState(false);
	const { network } = useNetworkContext();

	const handleClick=() => {
		if(isModal && setSignupOpen && setLoginOpen){
			setSignupOpen(true);
			setLoginOpen(false);}
		else{
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

		setAccounts(addresses.map((address: string): InjectedAccountWithMeta => {
			const account = {
				address: address.toLowerCase(),
				meta: {
					genesisHash: null,
					name: 'metamask',
					source: 'metamask'
				}
			};

			return account;
		}));

		if (addresses.length > 0) {
			setAddress(addresses[0]);
		}

		setIsAccountLoading(false);
	};

	const onAccountChange = (address: string) => setAddress(address);

	const handleLogin: ( values: React.BaseSyntheticEvent<object, any, any> | undefined ) => void = async  () => {
		try {
			setLoading(true);

			const { data: loginStartData , error: loginStartError } = await nextApiClientFetch<ChallengeMessage>( 'api/v1/auth/actions/addressLoginStart', { address });
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

			const msg = stringToHex(signMessage);
			const from = address;

			const params = [msg, from];
			const method = 'personal_sign';

			(window as any).web3.currentProvider.sendAsync({
				from,
				method,
				params
			}, async (err: any, result: any) => {
				if (err) {
					setError(err.message);
					setLoading(false);
					return;
				}

				const { data: addressLoginData , error: addressLoginError } = await nextApiClientFetch<TokenType>( 'api/v1/auth/actions/addressLogin', { address, signature: result.result, wallet: Wallet.METAMASK });
				if(addressLoginError) {
					console.log('Error in address login', addressLoginError);
					setError(addressLoginError);
					if(addressLoginError === 'Please sign up prior to logging in with a web3 address'){
						setIsSignUp(true);
						try {

							setLoading(true);
							const { data , error } = await nextApiClientFetch<ChallengeMessage>( 'api/v1/auth/actions/addressSignupStart', { address });
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

							const msg = stringToHex(signMessage);
							const from = address;

							const params = [msg, from];
							const method = 'personal_sign';

							(window as any).web3.currentProvider.sendAsync({
								from,
								method,
								params
							}, async (err: any, result: any) => {
								if (err) {
									setError(err.message);
									setLoading(false);
									return;
								}

								const { data: confirmData , error: confirmError } = await nextApiClientFetch<TokenType>( 'api/v1/auth/actions/addressSignupConfirm', {
									address,
									signature: result.result,
									wallet: Wallet.METAMASK
								});

								if (confirmError || !confirmData) {
									setError(confirmError || 'Something went wrong');
									setLoading(false);
									return;
								}

								if(confirmData.token) {
									currentUser.loginWallet=Wallet.METAMASK;
									currentUser.loginAddress = address;
									currentUser.delegationDashboardAddress = address;
									localStorage.setItem('delegationWallet', Wallet.METAMASK);
									localStorage.setItem('delegationDashboardAddress', address);
									localStorage.setItem('loginWallet', Wallet.METAMASK);
									handleTokenChange(confirmData.token,currentUser);
									if(isModal){
										setLoginOpen && setLoginOpen(false);
										setLoading(false);
										return;
									}
									router.push('/');
								}else {
									throw new Error('Web3 Login failed');
								}

							});

						} catch (error) {
							console.log(error);
							setError(error.message);
							setLoading(false);
						}
					}
				}
				if(addressLoginData?.token){
					currentUser.loginWallet = Wallet.METAMASK;
					currentUser.loginAddress = address;
					currentUser.delegationDashboardAddress = address;
					localStorage.setItem('delegationWallet', Wallet.METAMASK);
					localStorage.setItem('delegationDashboardAddress', address);
					localStorage.setItem('loginWallet', Wallet.METAMASK);

					handleTokenChange(addressLoginData.token, currentUser);
					if(isModal){
						setLoginOpen && setLoginOpen(false);
						setLoading(false);
						return;
					}
					router.push('/');
				}

			});

		} catch (error) {
			setError(error.message);
			setLoading(false);
		}
	};

	const handleToggle = () => setDisplayWeb2();

	return (
		<article className="bg-white shadow-md rounded-md p-8 flex flex-col gap-y-6">
			<h3 className="text-2xl font-semibold text-[#1E232C] flex flex-col gap-y-4">
				<span>Login</span>
				<p className='flex gap-x-2 items-center justify-center'>
					<span className='mt-2'>
						<WalletIcon which={chosenWallet} />
					</span>
					<span className='text-navBlue text-lg sm:text-xl'>
						{
							chosenWallet.charAt(0).toUpperCase() + chosenWallet.slice(1).replace('-', '.')
						}
					</span>
				</p>
			</h3>
			{
				fetchAccounts?
					<div className='flex flex-col justify-center items-center'>
						<p className='text-base'>
							For fetching your addresses, Polkassembly needs access to your wallet extensions. Please authorize this transaction.
						</p>
						<Button
							key='got-it'
							icon={<CheckOutlined />}
							className='bg-pink_primary text-white outline-none border border-pink_primary border-solid rounded-md py-3 px-7 font-medium text-lg leading-none flex items-center justify-center'
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
					: (
						<>
							<AuthForm onSubmit={handleLogin} className="flex flex-col gap-y-6">
								{extensionNotFound?
									<div className='flex justify-center items-center my-5'>
										<ExtensionNotDetected chosenWallet={chosenWallet} />
									</div>
									: null
								}
								{accountsNotFound && (
									<div className='flex justify-center items-center my-5'>
										<Alert
											message="You need at least one account in Polkadot-js extension to login."
											description="Please reload this page after adding accounts."
											type="info"
											showIcon
										/>
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
										{isSignUp && <Alert showIcon className='mb-2' type='info' message={<>By Signing up you agree to the terms of the <Link href='/terms-and-conditions' className='text-pink_primary'>Polkassembly end user agreement</Link>.</>} />}
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
									{error ? <FilteredError text={error}/> : <></>}
								</div>
							</AuthForm>
						</>
					)
			}
			<div className="flex justify-center items-center gap-x-2 font-semibold mt-6">
				<label className="text-md text-grey_primary">
					Don&apos;t have an account?
				</label>
				<div onClick={handleClick} className='text-pink_primary text-md'> Sign Up </div>
			</div>
		</article>
	);
};

export default MetamaskLogin;
