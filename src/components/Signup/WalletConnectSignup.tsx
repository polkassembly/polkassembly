// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Button, Divider } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { chainProperties } from 'src/global/networkConstants';
import Loader from 'src/ui-components/Loader';
import styled from 'styled-components';

import { ChallengeMessage, TokenType } from '~src/auth/types';
import { Wallet } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import { ModalContext } from '../../context/ModalContext';
import { handleTokenChange } from '../../services/auth.service';
import AccountSelectionForm from '../../ui-components/AccountSelectionForm';
import FilteredError from '../../ui-components/FilteredError';
import getNetwork from '../../util/getNetwork';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { setWalletConnectProvider } from '~src/redux/userDetails';

const NETWORK = getNetwork();

interface Props {
	className?: string;
	setMethod: React.Dispatch<React.SetStateAction<string>>;
	isModal?: boolean;
	setSignupOpen?: (pre: boolean) => void;
}

const WalletConnectSignup = ({ className, setMethod, isModal, setSignupOpen }: Props): JSX.Element => {
	const [error, setError] = useState('');
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [address, setAddress] = useState<string>('');
	// const { errors, register } = useForm();
	const [isAccountLoading, setIsAccountLoading] = useState(true);
	const [accountsNotFound, setAccountsNotFound] = useState(false);
	const [loading, setLoading] = useState(false);
	const currentUser = useUserDetailsSelector();
	const { setModal } = useContext(ModalContext);
	const [provider, setProvider] = useState<WalletConnectProvider | null>(null);
	const router = useRouter();
	const dispatch = useDispatch();

	const connect = async () => {
		setIsAccountLoading(true);

		if (provider && provider.wc.connected) {
			provider.wc.killSession();
		}

		//  Create new WalletConnect Provider
		window.localStorage.removeItem('walletconnect');
		const wcPprovider = new WalletConnectProvider({
			rpc: {
				1284: 'https://rpc.api.moonbeam.network',
				1285: 'https://rpc.api.moonriver.moonbeam.network',
				1287: 'https://rpc.api.moonbase.moonbeam.network'
			}
		});
		setProvider(wcPprovider);
	};

	const getAccounts = async () => {
		if (!provider) return;

		if (!provider.wc.connected) {
			await provider.wc.createSession();
		}

		// Subscribe to events
		provider.wc.on('modal_closed', () => {
			setProvider(null);
			setMethod('web2');
		});

		provider.wc.on('connect', (error, payload) => {
			if (error) {
				setError(error?.message);
				return;
			}

			const { accounts: addresses, chainId } = payload.params[0];

			getAccountsHandler(addresses, Number(chainId));
		});

		provider.wc.on('session_update', (error, payload) => {
			if (error) {
				setError(error?.message);
				return;
			}

			// updated accounts and chainId
			const { accounts: addresses, chainId } = payload.params[0];
			getAccountsHandler(addresses, Number(chainId));
		});

		provider.wc.on('disconnect', (error) => {
			if (error) {
				setError(error?.message);
				return;
			}

			// Delete connector
			window.localStorage.removeItem('walletconnect');
			setProvider(null);
			window.location.reload();
		});
	};

	const getAccountsHandler = async (addresses: string[], chainId: number) => {
		if (chainId !== chainProperties[NETWORK].chainId) {
			setError(`Please login using the ${NETWORK} network`);
			setAccountsNotFound(true);
			setIsAccountLoading(false);
			return;
		}

		const checksumAddresses = addresses.map((address: string) => address);

		if (checksumAddresses.length === 0) {
			setAccountsNotFound(true);
			setIsAccountLoading(false);
			return;
		}

		setAccounts(
			checksumAddresses.map((address: string): InjectedAccountWithMeta => {
				const account = {
					address: address.toLowerCase(),
					meta: {
						genesisHash: null,
						name: 'walletConnect',
						source: 'walletConnect'
					}
				};

				return account;
			})
		);

		if (checksumAddresses.length > 0) {
			setAddress(checksumAddresses[0]);
		}

		setIsAccountLoading(false);
	};

	useEffect(() => {
		connect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		getAccounts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provider]);

	const handleSignup = async () => {
		if (!provider) return;

		if (!accounts.length) {
			return getAccounts();
		}

		setError('');

		let signMessage: any = '';

		try {
			setLoading(true);
			const { data, error } = await nextApiClientFetch<ChallengeMessage>('api/v1/auth/actions/addressSignupStart', { address });
			if (error || !data) {
				setError(error || 'Something went wrong');
				setLoading(false);
				return;
			}

			signMessage = data?.signMessage;
			if (!signMessage) {
				setError('Challenge message not found');
				setLoading(false);
				return;
			}
		} catch (error) {
			setError(error);
			return;
		}

		const msg = stringToHex(signMessage);
		const from = address;

		const params = [msg, from];
		const method = 'personal_sign';

		const tx = {
			method,
			params
		};

		provider.wc
			.sendCustomRequest(tx)
			.then(async (result) => {
				try {
					const { data: confirmData, error: confirmError } = await nextApiClientFetch<TokenType>('api/v1/auth/actions/addressSignupConfirm', {
						address,
						signature: result,
						wallet: Wallet.WALLETCONNECT
					});

					if (confirmData?.token) {
						dispatch(setWalletConnectProvider(provider));
						const user: any = {};
						user.loginWallet = Wallet.WALLETCONNECT;
						user.loginAddress = address;
						user.delegationDashboardAddress = address;
						localStorage.setItem('delegationWallet', Wallet.WALLETCONNECT);
						localStorage.setItem('delegationDashboardAddress', address);
						localStorage.setItem('loginWallet', Wallet.WALLETCONNECT);
						handleTokenChange(confirmData.token, { ...currentUser, ...user }, dispatch);

						setModal({
							content: 'Add an email in settings if you want to be able to recover your account!',
							title: 'Add optional email'
						});
						if (isModal) {
							setSignupOpen && setSignupOpen(false);
							return;
						}
						router.back();
					} else {
						setError(confirmError || 'WalletConnect signup failed');
					}
				} catch (error) {
					setError(error);
				}
			})
			.catch((error) => {
				// Error returned when rejected
				setError(error);
				return;
			});
	};

	const onAccountChange = (address: string) => {
		setAddress(address);
	};

	return (
		<div className={className}>
			<h3>Sign-up with WalletConnect</h3>
			{accountsNotFound ? (
				<div className='card'>
					<div className='text-muted'>You need at least one account via WalletConnect to login.</div>
					<div className='text-muted'>Please reload this page after adding accounts.</div>
				</div>
			) : null}
			{isAccountLoading ? (
				<div className='loader-cont'>
					<Loader text={'Requesting accounts'} />
				</div>
			) : (
				accounts.length > 0 && (
					<>
						<div>
							<AccountSelectionForm
								isTruncateUsername={false}
								title='Choose linked account'
								accounts={accounts}
								address={address}
								onAccountChange={onAccountChange}
								linkAddressTextDisabled
							/>
						</div>

						<div>
							<label className='checkbox-label'>
								<input
									className={`${error ? 'error' : ' '} dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]`}
									name='termsandconditions'
									value='yes'
									type='checkbox'
								/>
								I have read and agree to the terms of the <Link href='/terms-and-conditions'>Polkassembly end user agreement</Link>.
							</label>
							{error && <div className={'errorText'}>Please agree to the terms of the Polkassembly end user agreement.</div>}
						</div>
						<div className='text-muted'>
							To see how we use your personal data please see our <Link href='/privacy'>privacy notice</Link>.
						</div>
						<div className={'mainButtonContainer'}>
							<Button
								disabled={loading}
								onClick={handleSignup}
							>
								Sign-up
							</Button>
						</div>
					</>
				)
			)}
			<div className='my-2'>{error && <FilteredError text={error} />}</div>
			<Divider plain>Or</Divider>
			<div className={'mainButtonContainer'}>
				<Button
					disabled={loading}
					onClick={() => setMethod('web2')}
				>
					Sign-up with username
				</Button>
			</div>
			<Divider plain>Or</Divider>
			<div className={'mainButtonContainer'}>
				<Button
					disabled={loading}
					onClick={() => setMethod('polkadotjs')}
				>
					Sign-up with polkadot.js
				</Button>
			</div>
		</div>
	);
};

export default styled(WalletConnectSignup)`
	.mainButtonContainer {
		align-items: center;
		display: flex;
		flex-direction: row;
		justify-content: center;
		margin-top: 3rem;
	}
	input.error {
		border-style: solid;
		border-width: 1px;
		border-color: red_secondary;
	}
	.info {
		margin: 10px 0;
	}
	.errorText {
		color: red_secondary;
	}
	.checkbox-label {
		position: relative;
		bottom: 0.1rem;
		display: inline-block !important;
		font-size: sm !important;
		font-weight: 400 !important;
		color: grey_primary !important;
		a {
			color: grey_primary;
			border-bottom-style: solid;
			border-bottom-width: 1px;
			border-bottom-color: grey_primary;
		}
	}
	.ui.dimmer {
		height: calc(100% - 6.5rem);
	}
`;
