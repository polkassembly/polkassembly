// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined } from '@ant-design/icons';
import { InjectedAccount, InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import { Alert, Button, Divider } from 'antd';
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

import { ChallengeMessage, TokenType } from '~src/auth/types';
import addEthereumChain from '~src/util/addEthereumChain';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import ExtensionNotDetected from '../ExtensionNotDetected';
import { WalletIcon } from '../Login/MetamaskLogin';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { useTheme } from 'next-themes';

interface Props {
	chosenWallet: Wallet;
	setDisplayWeb2: () => void;
	setWalletError: React.Dispatch<React.SetStateAction<string | undefined>>;
	isModal?: boolean;
	setSignupOpen?: (pre: boolean) => void;
	setLoginOpen?: (pre: boolean) => void;
	onWalletUpdate?: () => void;
}

const MetamaskSignup: FC<Props> = ({ onWalletUpdate, chosenWallet, isModal, setSignupOpen, setLoginOpen }) => {
	const [error, setErr] = useState('');
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [address, setAddress] = useState<string>('');
	const [isAccountLoading, setIsAccountLoading] = useState(true);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [extensionNotFound, setExtensionNotFound] = useState(false);
	const [accountsNotFound, setAccountsNotFound] = useState(false);
	const router = useRouter();
	const [fetchAccounts, setFetchAccounts] = useState(true);
	const [loading, setLoading] = useState(false);
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();

	const handleClick = () => {
		if (isModal && setSignupOpen && setLoginOpen) {
			setSignupOpen(false);
			setLoginOpen(true);
		} else {
			router.push('/login');
		}
	};

	const getAccounts = async (): Promise<undefined> => {
		const ethereum = (window as any).ethereum;

		if (!ethereum) {
			return;
		}

		try {
			await addEthereumChain({
				ethereum,
				network
			});
		} catch (error) {
			setErr(error?.message || 'Something went wrong');
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

	const handleSignup: (values: React.BaseSyntheticEvent<object, any, any> | undefined) => void = async () => {
		try {
			setLoading(true);
			const { data, error } = await nextApiClientFetch<ChallengeMessage>('api/v1/auth/actions/addressSignupStart', { address });
			if (error || !data) {
				setErr(error || 'Something went wrong');
				setLoading(false);
				return;
			}

			const signMessage = data?.signMessage;
			if (!signMessage) {
				setErr('Challenge message not found');
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
						setErr(err.message);
						setLoading(false);
						return;
					}

					const { data: confirmData, error: confirmError } = await nextApiClientFetch<TokenType>('api/v1/auth/actions/addressSignupConfirm', {
						address,
						signature: result.result,
						wallet: Wallet.METAMASK
					});

					if (confirmError || !confirmData) {
						setErr(confirmError || 'Something went wrong');
						setLoading(false);
						return;
					}

					if (confirmData.token) {
						const user: any = {};
						user.loginWallet = Wallet.METAMASK;
						user.loginAddress = address;
						user.delegationDashboardAddress = address;
						handleTokenChange(confirmData.token, { ...currentUser, ...user }, dispatch);
						localStorage.setItem('loginWallet', Wallet.METAMASK);
						if (isModal) {
							setSignupOpen && setSignupOpen(false);
							return;
						}
						router.back();
					} else {
						throw new Error('Web3 Login failed');
					}
				}
			);
		} catch (error) {
			console.log(error);
			setErr(error.message);
			setLoading(false);
		}
	};

	const handleBackToLogin = (): void => {
		onWalletUpdate?.();
	};

	return (
		<article className='flex flex-col rounded-md bg-white shadow-md dark:bg-section-dark-overlay'>
			<div className='mb-1 mt-1 flex items-center'>
				{theme === 'dark' ? <LoginLogoDark className='ml-6 mr-2' /> : <LoginLogo className='ml-6 mr-2' />}
				<h3 className='mt-3 text-xl font-semibold text-bodyBlue dark:text-blue-dark-high'>Sign Up</h3>
			</div>
			<Divider
				style={{ background: '#D2D8E0', flexGrow: 1 }}
				className='mt-2 dark:bg-separatorDark'
			/>
			{fetchAccounts ? (
				<div className='-mt-6 flex flex-col px-8 pb-8'>
					<div className='my-4 flex justify-start gap-x-2'>
						<span className=''>
							<WalletIcon which={chosenWallet} />
						</span>
						<span className='mt-1 text-xl text-bodyBlue dark:text-blue-dark-high sm:text-xl'>{chosenWallet.charAt(0).toUpperCase() + chosenWallet.slice(1).replace('-', '.')}</span>
					</div>
					<p className='m-0 p-0 text-base text-bodyBlue dark:text-blue-dark-high'>
						For fetching your addresses, Polkassembly needs access to your wallet extensions. Please authorize this transaction.
					</p>
					<Divider
						style={{ background: '#D2D8E0', flexGrow: 1 }}
						className='m-0 mt-5 p-0 dark:bg-separatorDark'
					/>
					<div className='mt-4 flex w-full justify-start gap-x-2 font-normal'>
						<label className='text-bodyBlue` text-base dark:text-blue-dark-high'>Already have an account?</label>
						<div
							onClick={handleClick}
							className='cursor-pointer text-base text-pink_primary'
						>
							Login
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
			) : (
				<>
					<AuthForm
						onSubmit={handleSignup}
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
									<div className='-mt-2 flex items-center justify-center'>
										<AccountSelectionForm
											title='Choose linked account'
											accounts={accounts}
											address={address}
											onAccountChange={onAccountChange}
											linkAddressTextDisabled
											className='p-4'
										/>
									</div>
									<div className='mb-6 flex items-center justify-center gap-x-2'>
										<Button
											className='flex w-[144px] items-center justify-center rounded-md border border-solid border-pink_primary px-8 py-5 text-sm font-medium leading-none text-[#E5007A] outline-none dark:bg-transparent'
											onClick={() => handleBackToLogin()}
										>
											Go Back
										</Button>
										<Button
											disabled={loading}
											htmlType='submit'
											size='large'
											className='w-[144px] rounded-md border-none bg-pink_primary text-sm text-white outline-none'
										>
											Sign-up
										</Button>
									</div>
								</>
							)
						)}
						{error && <FilteredError text={error} />}
					</AuthForm>
					{!!chosenWallet && !accounts.length && (
						<div className='my-6 flex items-center justify-center'>
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

export default MetamaskSignup;
