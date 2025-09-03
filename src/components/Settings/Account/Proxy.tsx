// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import React, { FC, useState } from 'react';
import { Divider, Form, Modal } from 'antd';
import { useDispatch } from 'react-redux';
import { handleTokenChange } from 'src/services/auth.service';
import { Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import FilteredError from 'src/ui-components/FilteredError';
import { ChangeResponseType } from '~src/auth/types';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import WalletButtons from '~src/components/Login/WalletButtons';
import { APPNAME } from '~src/global/appName';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import getEncodedAddress from '~src/util/getEncodedAddress';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import classNames from 'classnames';
import { dmSans } from 'pages/_app';
import Alert from '~src/basic-components/Alert';
import AddressInput from '~src/ui-components/AddressInput';

interface Props {
	open?: boolean;
	dismissModal?: () => void;
}

const Proxy: FC<Props> = ({ dismissModal, open }) => {
	const [form] = Form.useForm();

	const currentUser = useUserDetailsSelector();
	const { network } = useNetworkSelector();

	const [selectedWallet, setSelectedWallet] = useState<Wallet>();
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [extensionNotFound, setExtensionNotFound] = useState(false);
	const [accountsNotFound, setAccountsNotFound] = useState(false);

	const [proxyAddress, setProxyAddress] = useState<string>('');
	const [proxiedAddress, setProxiedAddress] = useState<string>('');

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const dispatch = useDispatch();

	const onProxiedAccountChange = (address: string) => {
		setProxiedAddress(address);
	};

	const handleSelectWallet = async (wallet: Wallet) => {
		const injectedWindow = window as Window & InjectedWindow;
		const injectedWallet = injectedWindow?.injectedWeb3?.[String(wallet)];

		if (!injectedWallet) {
			setExtensionNotFound?.(true);
			setLoading?.(false);
			return;
		}

		setExtensionNotFound?.(false);
		setSelectedWallet(wallet);

		let injected: Injected | null = null;
		try {
			injected = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('Wallet Timeout'));
				}, 60000); // wait 60 sec

				if (injectedWallet && injectedWallet.enable) {
					injectedWallet
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
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			setLoading?.(false);

			// eslint-disable-next-line no-console
			console.error('Error in getting injected: ', err?.message);

			if (err?.message === 'Rejected') {
				setError('');
			} else if (err?.message === 'Pending authorisation request already exists for this site. Please accept or reject the request.') {
				setError('Pending authorisation request already exists. Please accept or reject the request on the wallet extension and try again.');
			} else if (err?.message === 'Wallet Timeout') {
				setError('Wallet authorisation timed out. Please accept or reject the request on the wallet extension and try again.');
			}
		}

		if (!injected) return;
		setLoading(false);

		const injectedAccounts = await injected.accounts.get();
		if (injectedAccounts.length === 0) {
			setAccountsNotFound?.(true);
			setLoading(false);
			return;
		}

		const accountsLocal = injectedAccounts;

		accountsLocal.forEach((account, i) => {
			accountsLocal[Number(i)].address = getEncodedAddress(account.address, network) || account.address;
		});

		setAccounts?.(accountsLocal);
		setLoading(false);
	};

	const handleSign = async () => {
		if (!accounts.length) return;

		const injectedWindow = window as Window & InjectedWindow;
		const injectedWallet = injectedWindow?.injectedWeb3?.[String(selectedWallet)];

		if (!injectedWallet || !proxyAddress || !proxiedAddress || proxyAddress === proxiedAddress) {
			setError('Please select valid addresses to continue.');
			return;
		}

		const substrateProxiedAddress = getSubstrateAddress(proxiedAddress) || proxiedAddress;

		if (!currentUser.addresses?.includes(substrateProxiedAddress)) {
			setError('Please select a linked address or link an address before linking a proxy for it.');
			return;
		}

		setLoading(true);

		const injected = injectedWallet && injectedWallet.enable && (await injectedWallet.enable(APPNAME));
		const signRaw = injected && injected.signer && injected.signer.signRaw;
		if (!signRaw) return console.error('Signer not available. Please refresh and try again.');

		const substrateProxyAddress = getSubstrateAddress(proxyAddress) || proxyAddress;

		const message = `<Bytes>I am linking proxy address ${proxyAddress}</Bytes>`;

		const { signature } = await signRaw({
			address: proxyAddress,
			data: stringToHex(message || ''),
			type: 'bytes'
		});

		setLoading(true);

		const { data, error } = await nextApiClientFetch<ChangeResponseType>('api/v1/auth/actions/linkProxyAddress', {
			message,
			proxied: substrateProxiedAddress || proxiedAddress,
			proxy: substrateProxyAddress,
			signature
		});

		if (error || !data) {
			setError(error || 'Something went wrong');
			console.error(error);
		}

		if (data?.token) {
			handleTokenChange(data?.token, currentUser, dispatch);
		}

		setLoading(false);
	};

	return (
		<Modal
			wrapClassName='dark:bg-modalOverlayDark'
			closable={false}
			title={
				<div className='ml-[-24px] mr-[-24px] text-blue-light-high dark:bg-section-dark-overlay dark:text-blue-dark-high'>
					<span className='mb-0 ml-[24px] text-lg font-medium tracking-wide text-sidebarBlue dark:text-white'>Link Proxy address</span>
					<Divider className='border-b-1 dark:border-separatorDark' />
				</div>
			}
			open={open}
			className={classNames(dmSans.className, dmSans.variable, 'mb-8 md:min-w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay')}
			footer={
				<div className='flex items-center justify-end'>
					{[
						<CustomButton
							disabled={accountsNotFound}
							key='sign'
							htmlType='submit'
							onClick={() => {
								form.submit();
							}}
							loading={loading}
							type='primary'
							fontSize='lg'
							className={`px-7 py-3 ${accountsNotFound ? 'bg-gray-300' : ''}`}
							text='Sign'
						/>,
						<CustomButton
							key='cancel'
							onClick={dismissModal}
							type='default'
							fontSize='lg'
							className={`px-7 py-3 ${accountsNotFound ? 'bg-gray-300' : ''}`}
							text='Cancel'
						/>
					]}
				</div>
			}
		>
			{!currentUser.id ? (
				<Alert
					type='warning'
					message={
						<span className='dark:text-blue-dark-high'>
							<p>Please login to continue.</p>
						</span>
					}
				/>
			) : (
				<>
					<Form
						form={form}
						onFinish={handleSign}
						className='mb-6 flex flex-col gap-y-8'
					>
						<p className='my-0 text-center text-base text-lightBlue dark:text-white'>Please Select a wallet</p>
						<div>
							<WalletButtons
								disabled={loading}
								onWalletSelect={handleSelectWallet}
								showPolkasafe={false}
								isLoginFlow={false}
								noHeader={true}
							/>
						</div>

						{selectedWallet && (extensionNotFound || accountsNotFound) && (
							<Alert
								type='warning'
								message={
									extensionNotFound ? (
										<span className='dark:text-blue-dark-high'>
											<p>Extension not found.</p>
											<p>Please install the {selectedWallet} extension or switch to a different wallet.</p>
										</span>
									) : (
										<span className='dark:text-blue-dark-high'>
											<p>No accounts found.</p>
											<p>Please add an account to your {selectedWallet} extension or switch to a different wallet.</p>
										</span>
									)
								}
							/>
						)}

						{!selectedWallet ? (
							<Alert
								type='warning'
								message={
									<span className='dark:text-blue-dark-high'>
										<p>Please select a wallet to continue.</p>
									</span>
								}
							/>
						) : (
							<>
								<section>
									<label className='mb-[2px] text-sm text-lightBlue dark:text-blue-dark-medium'>Select proxied account:</label>
									<AddressInput
										defaultAddress={proxiedAddress}
										onChange={onProxiedAccountChange}
										inputClassName={' font-normal text-sm h-[40px] text-lightBlue dark:text-blue-dark-medium dark:bg-[#1D1D1D]'}
										className='-mt-6 text-sm font-normal text-bodyBlue dark:bg-[#1D1D1D] dark:text-blue-dark-high'
										disabled={loading}
										size='large'
										identiconSize={30}
										skipFormatCheck={true}
									/>
								</section>
								<section>
									<AccountSelectionForm
										isDisabled={loading}
										title='Select proxy account'
										accounts={accounts}
										address={proxyAddress}
										onAccountChange={(address) => setProxyAddress(address)}
									/>
								</section>
							</>
						)}
						{error && <FilteredError text={error} />}
					</Form>

					<div className='ml-[-24px] mr-[-24px]'>
						<Divider className='my-4 mt-0' />
					</div>
				</>
			)}
		</Modal>
	);
};

export default Proxy;
