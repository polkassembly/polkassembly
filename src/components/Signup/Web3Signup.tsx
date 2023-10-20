// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined } from '@ant-design/icons';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import { Alert, Button, Divider } from 'antd';
import { useRouter } from 'next/router';
import React, { FC, useEffect, useState } from 'react';
import { APPNAME } from 'src/global/appName';
import { handleTokenChange } from 'src/services/auth.service';
import { Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import AuthForm from 'src/ui-components/AuthForm';
import FilteredError from 'src/ui-components/FilteredError';
import Loader from 'src/ui-components/Loader';
import getEncodedAddress from 'src/util/getEncodedAddress';
import LoginLogo from '~assets/icons/login-logo.svg';
import { ChallengeMessage, TokenType } from '~src/auth/types';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import ExtensionNotDetected from '../ExtensionNotDetected';
import { WalletIcon } from '../Login/MetamaskLogin';
import Image from 'next/image';
import MultisigAccountSelectionForm from '~src/ui-components/MultisigAccountSelectionForm';
import WalletButtons from '../Login/WalletButtons';
import BN from 'bn.js';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';

const ZERO_BN = new BN(0);
interface Props {
	chosenWallet: Wallet;
	setDisplayWeb2: () => void;
	setWalletError: React.Dispatch<React.SetStateAction<string | undefined>>;
	isModal?: boolean;
	setSignupOpen?: (pre: boolean) => void;
	setLoginOpen?: (pre: boolean) => void;
	onWalletUpdate?: () => void;
	withPolkasafe?: boolean;
	setChosenWallet: any;
}

const Web3Signup: FC<Props> = ({ chosenWallet, setDisplayWeb2, setWalletError, isModal, setSignupOpen, setLoginOpen, withPolkasafe, setChosenWallet, onWalletUpdate }) => {
	const { network } = useNetworkSelector();

	const [error, setErr] = useState('');
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [address, setAddress] = useState<string>('');
	const [multiWallet, setMultiWallet] = useState<string>('');
	const [isAccountLoading, setIsAccountLoading] = useState(true);
	const [extensionNotFound, setExtensionNotFound] = useState(false);
	const [accountsNotFound, setAccountsNotFound] = useState(false);
	const [fetchAccounts, setFetchAccounts] = useState(true);
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [multisigBalance, setMultisigBalance] = useState<BN>(ZERO_BN);

	const currentUser = useUserDetailsSelector();
	const dispatch = useDispatch();

	const handleClick = () => {
		if (isModal && setSignupOpen && setLoginOpen) {
			setSignupOpen(false);
			setLoginOpen(true);
		} else {
			router.push('/login');
		}
	};

	const getAccounts = async (chosenWallet: Wallet): Promise<undefined> => {
		const injectedWindow = window as Window & InjectedWindow;

		const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[chosenWallet] : null;

		if (!wallet) {
			setExtensionNotFound(true);
			setIsAccountLoading(false);
			return;
		} else {
			setExtensionNotFound(false);
		}

		let injected: Injected | undefined;
		try {
			injected = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('Wallet Timeout'));
				}, 60000); // wait 60 sec

				if (wallet && wallet.enable) {
					wallet!
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
	};

	const onAccountChange = (address: string) => {
		setAddress(address);
		setMultiWallet('');
	};

	const handleSignup: (values: React.BaseSyntheticEvent<object, any, any> | undefined) => void = async () => {
		if (!accounts.length) return getAccounts(chosenWallet);

		try {
			const injectedWindow = window as Window & InjectedWindow;

			const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[chosenWallet === Wallet.POLKASAFE ? Wallet.POLKADOT : chosenWallet] : null;

			if (!wallet) {
				setExtensionNotFound(true);
				setIsAccountLoading(false);
				return;
			} else {
				setExtensionNotFound(false);
			}

			const injected = wallet && wallet.enable && (await wallet.enable(APPNAME));

			const signRaw = injected && injected.signer && injected.signer.signRaw;

			if (!signRaw) {
				return console.error('Signer not available');
			}

			let substrate_address;
			if (!address.startsWith('0x')) {
				substrate_address = getSubstrateAddress(address);
				if (!substrate_address) return console.error('Invalid address');
			} else {
				substrate_address = address;
			}

			setLoading(true);
			const { data, error } = await nextApiClientFetch<ChallengeMessage>('api/v1/auth/actions/addressSignupStart', { address: substrate_address, multisig: multiWallet });
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

			const { signature } = await signRaw({
				address: substrate_address,
				data: stringToHex(signMessage),
				type: 'bytes'
			});

			const { data: confirmData, error: confirmError } = await nextApiClientFetch<TokenType>('api/v1/auth/actions/addressSignupConfirm', {
				address: substrate_address,
				multisig: multiWallet,
				signature,
				wallet: chosenWallet
			});

			if (confirmError || !confirmData) {
				setErr(confirmError || 'Something went wrong');
				setLoading(false);
				return;
			}

			if (confirmData.token) {
				const user: any = {};
				user.loginWallet = chosenWallet;
				user.loginAddress = multiWallet || address;
				user.multisigAssociatedAddress = address;
				user.delegationDashboardAddress = multiWallet || address;
				handleTokenChange(confirmData.token, { ...currentUser, ...user }, dispatch);
				localStorage.setItem('loginWallet', chosenWallet);
				localStorage.setItem('multisigAssociatedAddress', address);
				localStorage.setItem('delegationWallet', chosenWallet);
				localStorage.setItem('delegationDashboardAddress', multiWallet || address);
				localStorage.setItem('multisigDelegationAssociatedAddress', address);
				if (isModal) {
					setSignupOpen && setSignupOpen(false);
					return;
				}
				router.back();
			} else {
				throw new Error('Web3 Login failed');
			}
		} catch (error) {
			setErr(error.message);
			setLoading(false);
		}
	};

	const handleToggle = () => setDisplayWeb2();
	const handleBackToSignUp = (): void => {
		onWalletUpdate && onWalletUpdate();
	};
	const handleChangeWalletWithPolkasafe = (wallet: string) => {
		setChosenWallet(wallet);
		setAccounts([]);
	};
	useEffect(() => {
		if (withPolkasafe && accounts.length === 0 && chosenWallet !== Wallet.POLKASAFE) {
			getAccounts(chosenWallet)
				.then(() => {
					setFetchAccounts(false);
				})
				.catch((err) => {
					console.error(err);
				})
				.finally(() => {
					setLoading(false);
				});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accounts.length, chosenWallet, withPolkasafe]);
	return (
		<>
			<div className='flex items-center'>
				<LoginLogo className='ml-6 mr-2' />
				<h3 className='mt-3 text-[20px] font-semibold text-[#243A57]'>{withPolkasafe ? <PolkasafeWithIcon /> : 'Sign Up'}</h3>
			</div>
			<hr className='text-[#D2D8E0]' />
			<article className='flex flex-col rounded-md bg-white p-8 shadow-md dark:bg-section-dark-overlay '>
				<h3 className='flex flex-col justify-center gap-y-1 text-2xl font-semibold text-[#1E232C]'>
					{/* <span>Sign Up</span> */}
					{!withPolkasafe && (
						<p className='m-0 flex items-center justify-start gap-x-2 p-0'>
							<span className='mt-2'>
								<WalletIcon which={chosenWallet} />
							</span>
							<span className='text-lg text-[#243A57] sm:text-xl'>{chosenWallet.charAt(0).toUpperCase() + chosenWallet.slice(1).replace('-', '.')}</span>
						</p>
					)}
					{Boolean(withPolkasafe) && (
						<WalletButtons
							disabled={loading}
							onWalletSelect={handleChangeWalletWithPolkasafe}
							showPolkasafe={false}
							onPolkasafeSelect={() => {}}
							noHeader={true}
							selectedWallet={chosenWallet}
						/>
					)}
				</h3>
				{fetchAccounts ? (
					<div className='flex flex-col items-center justify-center'>
						<p className='text-base text-[#243A57]'>
							{withPolkasafe
								? 'To fetch your Multisig details, please select a wallet extension'
								: 'For fetching your addresses, Polkassembly needs access to your wallet extensions. Please authorize this transaction.'}
						</p>
						<div className='flex'>
							<Button
								className='mr-3 flex items-center justify-center rounded-md border border-solid border-pink_primary px-8 py-5 text-lg font-medium leading-none text-[#E5007A] outline-none'
								onClick={() => handleBackToSignUp()}
							>
								Go Back
							</Button>
							{!withPolkasafe && (
								<Button
									key='got-it'
									icon={<CheckOutlined />}
									className='flex items-center justify-center rounded-md border border-solid border-pink_primary bg-pink_primary px-8 py-5 text-lg font-medium leading-none text-white outline-none'
									onClick={() => {
										getAccounts(chosenWallet)
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
							)}
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
										<div className='my-5 flex items-center justify-center'>
											{withPolkasafe ? (
												<MultisigAccountSelectionForm
													multisigBalance={multisigBalance}
													setMultisigBalance={setMultisigBalance}
													title='Choose linked account'
													accounts={accounts}
													address={address}
													onAccountChange={onAccountChange}
													walletAddress={multiWallet}
													setWalletAddress={setMultiWallet}
												/>
											) : (
												<AccountSelectionForm
													isTruncateUsername={false}
													title='Choose linked account'
													accounts={accounts}
													address={address}
													onAccountChange={onAccountChange}
													linkAddressTextDisabled
												/>
											)}
										</div>
										<div className='flex items-center justify-center'>
											<Button
												disabled={loading}
												htmlType='submit'
												size='large'
												className='w-56 rounded-md border-none bg-pink_primary text-white outline-none'
											>
												Sign-up
											</Button>
										</div>
										<div>
											<Divider>
												<div className='flex items-center gap-x-2'>
													<span className='text-md text-grey_primary'>Or</span>
													<Button
														className='text-md border-none p-0 font-semibold text-pink_primary outline-none'
														disabled={loading}
														onClick={handleToggle}
													>
														Sign-up with Username
													</Button>
												</div>
											</Divider>
										</div>
									</>
								)
							)}
							{error && <FilteredError text={error} />}
						</AuthForm>
						<div className='flex items-center justify-center'>
							<Button
								className='mr-3 flex items-center justify-center rounded-md border border-solid border-pink_primary px-8 py-5 text-lg font-medium leading-none text-[#E5007A] outline-none'
								onClick={() => handleBackToSignUp()}
							>
								Go Back
							</Button>
						</div>
					</>
				)}
				<div className='mt-6 flex items-center justify-center gap-x-2 font-semibold'>
					<label className='text-md text-[#243A57]'>Already have an account?</label>
					<div
						onClick={() => handleClick()}
						className='text-md text-pink_primary'
					>
						Login
					</div>
				</div>
			</article>
		</>
	);
};
const PolkasafeWithIcon = () => (
	<>
		Signup by Polkasafe{' '}
		<Image
			width={25}
			height={25}
			src='/assets/polkasafe-logo.svg'
			alt='polkasafe'
		/>
	</>
);

export default Web3Signup;
