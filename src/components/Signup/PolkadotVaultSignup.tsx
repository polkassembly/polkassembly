// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { CheckOutlined } from '@ant-design/icons';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { WalletIcon } from '../Login/MetamaskLogin';
import { Wallet } from '~src/types';
import LoginLogo from '~assets/icons/login-logo.svg';
import { useApiContext, useUserDetailsContext } from '~src/context';
import { useRouter } from 'next/router';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { QrSigner, QrState } from '~src/util/QrSigner';
import { handleTokenChange } from '~src/services/auth.service';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ChallengeMessage, TokenType } from '~src/auth/types';
import { HexString } from '@polkadot/util/types';
import { getPolkadotVaultAccounts } from '../Settings/UserAccount/ParitySigner';
// import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { Alert, Button, Divider } from 'antd';
import AuthForm from '~src/ui-components/AuthForm';
import Loader from '~src/ui-components/Loader';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import FilteredError from '~src/ui-components/FilteredError';
import AuthorizeTransactionUsingQr from '~src/ui-components/AuthorizeTransactionUsingQr';
import { stringToHex } from '@polkadot/util';

interface IPolkadotVaultSignupProps {
    chosenWallet: Wallet;
    setDisplayWeb2: () => void;
    setWalletError: React.Dispatch<React.SetStateAction<string | undefined>>;
    isModal?:boolean;
    setSignupOpen?: (pre: boolean) => void;
    setLoginOpen?: (pre: boolean) => void;
    onWalletUpdate?: () => void;
}

let qrId = 0;

const PolkadotVaultSignup: FC<IPolkadotVaultSignupProps> = (props) => {
	const { chosenWallet, setDisplayWeb2, isModal, onWalletUpdate, setLoginOpen, setSignupOpen } = props;
	const { api, apiReady } = useApiContext();

	const [error, setErr] = useState('');
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [address, setAddress] = useState<string>('');
	const [isAccountLoading, setIsAccountLoading] = useState(true);
	const [accountsNotFound, setAccountsNotFound] = useState(false);
	const [fetchAccounts, setFetchAccounts] = useState(true);
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const currentUser = useUserDetailsContext();
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
		if (isModal && setSignupOpen && setLoginOpen) {
			setSignupOpen(false);
			setLoginOpen(true);
		} else {
			router.push('/login');
		}
	};

	const handleSignup: ( values: React.BaseSyntheticEvent<object, any, any> | undefined ) => void = async  () => {
		if (!accounts.length) {
			return;
		}

		try {

			if (!api || !apiReady) {
				return;
			}

			const signer = new QrSigner(api?.registry, setQrState);

			if (!signer) {
				return console.error('Signer not available');
			}

			let substrate_address;
			if(!address.startsWith('0x')) {
				substrate_address = address;
				if(!substrate_address) return console.error('Invalid address');
			}else {
				substrate_address = address;
			}

			setLoading(true);
			const { data , error } = await nextApiClientFetch<ChallengeMessage>( 'api/v1/auth/actions/addressSignupStart', { address: substrate_address });
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

			setShowQrModal(true);
			const signature = await api.sign(address, { data: stringToHex(signMessage), type: 'bytes' }, { signer });
			console.log('signature:-', signMessage, signature);
			setShowQrModal(false);

			const { data: confirmData , error: confirmError } = await nextApiClientFetch<TokenType>( 'api/v1/auth/actions/addressSignupConfirm', {
				address: substrate_address,
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
				currentUser.loginAddress = address;
				currentUser.delegationDashboardAddress = address;
				handleTokenChange(confirmData.token, currentUser);
				localStorage.setItem('loginWallet', chosenWallet);
				if(isModal){
					setSignupOpen && setSignupOpen(false);
					return;
				}
				router.back();
			}else {
				throw new Error('Web3 Login failed');
			}
		} catch (error) {
			console.log(error);
			setErr(error.message);
			setLoading(false);
		}
	};
	const handleToggle = () => setDisplayWeb2();
	const handleBackToSignUp = () => {
		onWalletUpdate && onWalletUpdate();
	};

	return (
		<>
			<div className='flex items-center'>
				<LoginLogo className='ml-6 mr-2' />
				<h3 className="text-[20px] font-semibold text-[#243A57] mt-3">Sign Up</h3>
			</div><hr className='text-[#D2D8E0]'/>
			<article className="bg-white shadow-md rounded-md p-8 flex flex-col ">
				<h3 className="text-2xl font-semibold text-[#1E232C] flex flex-col gap-y-1 justify-center">
					{/* <span>Sign Up</span> */}
					<p className='flex gap-x-2 items-center justify-start p-0 m-0'>
						<span className='mt-2'>
							<WalletIcon which={chosenWallet} />
						</span>
						<span className='text-[#243A57] text-lg sm:text-xl'>
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
					<div className='flex flex-col justify-center items-center'>
						<p className='text-base text-[#243A57]'>
							For fetching your addresses, Polkassembly needs access to your wallet extensions. Please authorize this transaction.
						</p>
						<div className='flex'>
							<Button
								className='text-[#E5007A] outline-none border border-pink_primary border-solid rounded-md py-5 px-8 mr-3 font-medium text-lg leading-none flex items-center justify-center'
								onClick={() => handleBackToSignUp()}
							>
								Go Back
							</Button>
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
							<AuthForm onSubmit={handleSignup} className="flex flex-col gap-y-6">
								{
									accountsNotFound && (
										<div className='flex justify-center items-center my-5'>
											<Alert
												message="You need at least one account in Polkadot-js extension to login."
												description="Please reload this page after adding accounts."
												type="info"
												showIcon
											/>
										</div>
									)
								}
								{
									isAccountLoading ? (
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
								{error && <FilteredError text={error} />}
							</AuthForm>
							<div className='flex items-center justify-center'>
								<Button
									className='text-[#E5007A] outline-none border border-pink_primary border-solid rounded-md py-5 px-8 mr-3 font-medium text-lg leading-none flex items-center justify-center'
									onClick={() => handleBackToSignUp()}
								>
								Go Back
								</Button>
							</div>
						</>
					)}
				<div className="flex justify-center items-center gap-x-2 font-semibold mt-6">
					<label className="text-md text-[#243A57]">
						Already have an account?
					</label>
					<div onClick={() => handleClick()} className='text-pink_primary text-md'>Login</div>
				</div>
			</article>
		</>
	);
};

export default PolkadotVaultSignup;