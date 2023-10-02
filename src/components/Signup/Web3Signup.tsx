// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined } from '@ant-design/icons';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import {
	Injected,
	InjectedAccount,
	InjectedWindow
} from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import { Alert, Button, Divider } from 'antd';
import { useRouter } from 'next/router';
import React, { FC, useEffect, useState } from 'react';
import { useNetworkContext, useUserDetailsContext } from 'src/context';
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

interface Props {
  chosenWallet: Wallet;
  setDisplayWeb2: () => void;
  setWalletError: React.Dispatch<React.SetStateAction<string | undefined>>;
   isModal?:boolean;
  setSignupOpen?: (pre: boolean) => void;
  setLoginOpen?: (pre: boolean) => void;
  onWalletUpdate?: () => void;
  withPolkasafe?: boolean;
  setChosenWallet: any;
}

const Web3Signup: FC<Props> = ({
	chosenWallet,
	setDisplayWeb2,
	setWalletError,
	isModal,
	setSignupOpen,
	setLoginOpen,
	withPolkasafe,
	setChosenWallet,
	onWalletUpdate
}) => {
	const { network } = useNetworkContext();

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

	const currentUser = useUserDetailsContext();

	const handleClick=() => {
		if(isModal && setSignupOpen &&setLoginOpen){
			setSignupOpen(false);
			setLoginOpen(true);
		}else{
			router.push('/login');
		}
	};

	const getAccounts = async (chosenWallet: Wallet): Promise<undefined> => {
		const injectedWindow = window as Window & InjectedWindow;

		const wallet = isWeb3Injected
			? injectedWindow.injectedWeb3[chosenWallet]
			: null;

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

				if(wallet && wallet.enable) {
					wallet!.enable(APPNAME)
						.then((value) => { clearTimeout(timeoutId); resolve(value); })
						.catch((error) => { reject(error); });
				}

			});
		} catch (err) {
			setIsAccountLoading(false);
			console.log(err?.message);
			if (err?.message == 'Rejected') {
				setWalletError('');
				handleToggle();
			} else if (
				err?.message ==
        'Pending authorisation request already exists for this site. Please accept or reject the request.'
			) {
				setWalletError(
					'Pending authorisation request already exists. Please accept or reject the request on the wallet extension and try again.'
				);
				handleToggle();
			} else if (err?.message == 'Wallet Timeout') {
				setWalletError(
					'Wallet authorisation timed out. Please accept or reject the request on the wallet extension and try again.'
				);
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

	const handleSignup: ( values: React.BaseSyntheticEvent<object, any, any> | undefined ) => void = async  () => {
		if (!accounts.length) return getAccounts(chosenWallet);

		try {
			const injectedWindow = window as Window & InjectedWindow;

			const wallet = isWeb3Injected
				? injectedWindow.injectedWeb3[chosenWallet === Wallet.POLKASAFE ? Wallet.POLKADOT : chosenWallet]
				: null;

			if (!wallet) {
				setExtensionNotFound(true);
				setIsAccountLoading(false);
				return;
			} else {
				setExtensionNotFound(false);
			}

			const injected =  wallet && wallet.enable && await wallet.enable(APPNAME);

			const signRaw = injected && injected.signer && injected.signer.signRaw;

			if (!signRaw) {
				return console.error('Signer not available');
			}

			let substrate_address;
			if(!address.startsWith('0x')) {
				substrate_address = getSubstrateAddress(address);
				if(!substrate_address) return console.error('Invalid address');
			}else {
				substrate_address = address;
			}

			setLoading(true);
			const { data , error } = await nextApiClientFetch<ChallengeMessage>( 'api/v1/auth/actions/addressSignupStart', { address: substrate_address, multisig: multiWallet });
			if (error || !data) {
				setErr(error || 'Something went wrong');
				setLoading(false);
				return;
			}

			const signMessage = data?.signMessage;
			if (!signMessage){
				setErr('Challenge message not found');
				setLoading(false);
				return;
			}

			const { signature } = await signRaw({
				address: substrate_address,
				data: stringToHex(signMessage),
				type: 'bytes'
			});

			const { data: confirmData , error: confirmError } = await nextApiClientFetch<TokenType>( 'api/v1/auth/actions/addressSignupConfirm', {
				address: substrate_address,
				multisig:multiWallet,
				signature,
				wallet: chosenWallet
			});

			if (confirmError || !confirmData) {
				setErr(confirmError || 'Something went wrong');
				setLoading(false);
				return;
			}

			if(confirmData.token) {
				currentUser.loginWallet = chosenWallet;
				currentUser.loginAddress = multiWallet ||  address;
				currentUser.multisigAssociatedAddress = address;
				currentUser.delegationDashboardAddress = multiWallet ||  address;
				handleTokenChange(confirmData.token, currentUser);
				localStorage.setItem('loginWallet', chosenWallet);
				localStorage.setItem('multisigAssociatedAddress', address);
				localStorage.setItem('delegationWallet', chosenWallet);
				localStorage.setItem('delegationDashboardAddress', multiWallet || address);
				localStorage.setItem('multisigDelegationAssociatedAddress', address );
				if(isModal){
					setSignupOpen && setSignupOpen(false);
					return;
				}
				router.back();
			}else {
				throw new Error('Web3 Login failed');
			}
		} catch (error) {
			setErr(error.message);
			setLoading(false);
		}
	};

	const handleToggle = () => setDisplayWeb2();
	const handleBackToSignUp = ():void => {
		onWalletUpdate && onWalletUpdate();
	};
	const handleChangeWalletWithPolkasafe = (wallet:string) => {
		setChosenWallet(wallet);
		setAccounts([]);
	};
	useEffect(() => {
		if(withPolkasafe && accounts.length === 0 && chosenWallet !== Wallet.POLKASAFE){
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
	},[accounts.length, chosenWallet, withPolkasafe]);
	return (
		<><div className='flex items-center dark:bg-section-dark-overlay'>
			<LoginLogo className='ml-6 mr-2' />
			<h3 className="text-[20px] font-semibold text-blue-light-high dark:text-blue-dark-high mt-3">{withPolkasafe ? <PolkasafeWithIcon/> : 'Sign Up'}</h3>
		</div><hr className='text-[#D2D8E0] dark:text-separatorDark'/>
		<article className="bg-white dark:bg-section-dark-overlay shadow-md rounded-md p-8 flex flex-col ">
			<h3 className="text-2xl font-semibold text-[#1E232C] flex flex-col gap-y-1 justify-center">
				{/* <span>Sign Up</span> */}
				{!withPolkasafe &&<p className='flex gap-x-2 items-center justify-start p-0 m-0'>
					<span className='mt-2'>
						<WalletIcon which={chosenWallet} />
					</span>
					<span className='text-blue-light-high dark:text-blue-dark-high text-lg sm:text-xl'>
						{chosenWallet.charAt(0).toUpperCase() + chosenWallet.slice(1).replace('-', '.')}
					</span>
				</p>}
				{ Boolean(withPolkasafe) && (
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
			{fetchAccounts ?
				<div className='flex flex-col justify-center items-center'>
					<p className='text-base text-blue-light-high dark:text-blue-dark-high'>
						{withPolkasafe ? 'To fetch your Multisig details, please select a wallet extension' :'For fetching your addresses, Polkassembly needs access to your wallet extensions. Please authorize this transaction.'}
					</p>
					<div className='flex'>
						<Button className='text-[#E5007A] outline-none border border-pink_primary border-solid rounded-md py-5 px-8 mr-3 font-medium text-lg leading-none flex items-center justify-center dark:bg-transparent' onClick={() => handleBackToSignUp()}>
								Go Back</Button>
						{!withPolkasafe &&<Button
							key='got-it'
							icon={<CheckOutlined />}
							className='bg-pink_primary text-white outline-none border border-pink_primary border-solid rounded-md py-5 px-8 font-medium text-lg leading-none flex items-center justify-center'
							onClick={() => {
								getAccounts(chosenWallet)
									.then(() => {
										setFetchAccounts(false);
									})
									.catch((err) => {
										console.error(err);
									});
							} }
						>
								Got it!
						</Button>}
					</div>
				</div>
				: (
					<>
						<AuthForm onSubmit={handleSignup} className="flex flex-col gap-y-6">
							{extensionNotFound ?
								<div className='flex justify-center items-center my-5'>
									<ExtensionNotDetected chosenWallet={chosenWallet} />
								</div>
								: null}
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
										text="Requesting Web3 accounts" />
								</div>
							) : accounts.length > 0 && (
								<>
									<div className='flex justify-center items-center my-5'>
										{withPolkasafe ? (
											<MultisigAccountSelectionForm
												title="Choose linked account"
												accounts={accounts}
												address={address}
												onAccountChange={onAccountChange}
												walletAddress={multiWallet}
												setWalletAddress={setMultiWallet}
											/>
										):(
											<AccountSelectionForm
												title='Choose linked account'
												accounts={accounts}
												address={address}
												onAccountChange={onAccountChange}
												linkAddressTextDisabled
											/>
										)}
									</div>
									<div className="flex justify-center items-center">
										<Button
											disabled={loading}
											htmlType="submit"
											size="large"
											className="bg-pink_primary w-56 rounded-md outline-none border-none text-white"
										>
												Sign-up
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
														Sign-up with Username
												</Button>
											</div>
										</Divider>
									</div>
								</>
							)}
							{error && <FilteredError text={error} />}
						</AuthForm>
						<div className='flex items-center justify-center'>
							<Button className='text-[#E5007A] outline-none border border-pink_primary border-solid rounded-md py-5 px-8 mr-3 font-medium text-lg leading-none flex items-center justify-center' onClick={() => handleBackToSignUp()}>
								Go Back
							</Button>
						</div>
					</>
				)}
			<div className="flex justify-center items-center gap-x-2 font-semibold mt-6">
				<label className="text-md text-blue-light-high dark:text-blue-dark-high">
						Already have an account?
				</label>
				<div onClick={() => handleClick()} className='text-pink_primary text-md'>Login</div>
			</div>
		</article></>
	);
};
const PolkasafeWithIcon = () => (
	<>
		Signup by Polkasafe <Image width={25} height={25} src='/assets/polkasafe-logo.svg' alt='polkasafe'/>
	</>
);

export default Web3Signup;