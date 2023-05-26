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
import { useRouter } from 'next/router';
import React, { FC, useState } from 'react';
import { useNetworkContext, useUserDetailsContext } from 'src/context';
import { handleTokenChange } from 'src/services/auth.service';
import { Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import AuthForm from 'src/ui-components/AuthForm';
import FilteredError from 'src/ui-components/FilteredError';
import Loader from 'src/ui-components/Loader';

import { ChallengeMessage, TokenType } from '~src/auth/types';
import addEthereumChain from '~src/util/addEthereumChain';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import ExtensionNotDetected from '../ExtensionNotDetected';
import { WalletIcon } from '../Login/MetamaskLogin';

interface Props {
  chosenWallet: Wallet;
  setDisplayWeb2: () => void;
  setWalletError: React.Dispatch<React.SetStateAction<string | undefined>>;
  isModal?: boolean;
  setSignupOpen?: (pre: boolean) => void;
  setLoginOpen?: (pre: boolean) => void;
}

const MetamaskSignup: FC<Props> = ({
	chosenWallet,
	setDisplayWeb2,
	isModal,
	setSignupOpen,
	setLoginOpen
}) => {
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
	const { network } = useNetworkContext();
	const currentUser = useUserDetailsContext();

	const handleClick=() => {
		if(isModal && setSignupOpen && setLoginOpen){
			setSignupOpen(false);
			setLoginOpen(true);
		}else{
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

	const handleSignup: ( values: React.BaseSyntheticEvent<object, any, any> | undefined ) => void = async  () => {

		try {

			setLoading(true);
			const { data , error } = await nextApiClientFetch<ChallengeMessage>( 'api/v1/auth/actions/addressSignupStart', { address });
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
					setErr(err.message);
					setLoading(false);
					return;
				}

				const { data: confirmData , error: confirmError } = await nextApiClientFetch<TokenType>( 'api/v1/auth/actions/addressSignupConfirm', {
					address,
					signature: result.result,
					wallet: Wallet.METAMASK
				});

				if (confirmError || !confirmData) {
					setErr(confirmError || 'Something went wrong');
					setLoading(false);
					return;
				}

				if(confirmData.token) {
					currentUser.loginWallet=Wallet.METAMASK;
					currentUser.loginAddress = address;
					currentUser.delegationDashboardAddress = address;
					handleTokenChange(confirmData.token, currentUser);
					localStorage.setItem('loginWallet', Wallet.METAMASK);
					if(isModal){
						setSignupOpen && setSignupOpen(false);
						return;
					}
					router.back();
				}else {
					throw new Error('Web3 Login failed');
				}

			});

		} catch (error) {
			console.log(error);
			setErr(error.message);
			setLoading(false);
		}
	};

	const handleToggle = () => setDisplayWeb2();

	return (
		<article className="bg-white shadow-md rounded-md p-8 flex flex-col gap-y-6">
			<h3 className="text-2xl font-semibold text-[#1E232C] flex flex-col gap-y-4">
				<span>Sign Up</span>
				<p className='flex gap-x-2 items-center justify-center'>
					<span>
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
							<AuthForm onSubmit={handleSignup} className="flex flex-col gap-y-6">
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
								{error && <FilteredError text={error}/>}
							</AuthForm>
						</>
					)
			}
			<div className="flex justify-center items-center gap-x-2 font-semibold mt-6">
				<label className="text-md text-grey_primary">
					Already have an account?
				</label>
				<div onClick={() => handleClick()} className='text-pink_primary text-md'>Login</div>
			</div>
		</article>
	);
};

export default MetamaskSignup;
