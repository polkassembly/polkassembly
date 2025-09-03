// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { PlusOutlined } from '@ant-design/icons';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Form, Modal, Spin } from 'antd';
import BN from 'bn.js';
import { useTheme } from 'next-themes';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ApiContext } from 'src/context/ApiContext';
import { NotificationStatus } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import AddressInput from 'src/ui-components/AddressInput';
import BalanceInput from 'src/ui-components/BalanceInput';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import queueNotification from 'src/ui-components/QueueNotification';
import { inputToBn } from 'src/util/inputToBn';
import { BrowserProvider, Contract, formatUnits } from 'ethers';
import Select from '~src/basic-components/Select';
import SelectOption from '~src/basic-components/Select/SelectOption';
import CustomButton from '~src/basic-components/buttons/CustomButton';

import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { setWalletConnectProvider } from '~src/redux/userDetails';
import addEthereumChain from '~src/util/addEthereumChain';
import { oneEnactmentPeriodInDays } from '~src/util/oneEnactmentPeriodInDays';

const abi = require('../../../moonbeamConvictionVoting.json');

const contractAddress = process.env.NEXT_PUBLIC_CONVICTION_VOTING_PRECOMPILE || '';

const ZERO_BN = new BN(0);

const DelegateModalEthV2 = ({ trackNum }: { trackNum: number }) => {
	const { api, apiReady } = useContext(ApiContext);
	const { network } = useNetworkSelector();

	const [form] = Form.useForm();
	const { resolvedTheme: theme } = useTheme();

	const [showModal, setShowModal] = useState<boolean>(false);
	const { walletConnectProvider } = useUserDetailsSelector();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [target, setTarget] = useState<string>('');
	const [bnBalance, setBnBalance] = useState<BN>(ZERO_BN);
	const [conviction, setConviction] = useState<number>(0);
	const [errorArr, setErrorArr] = useState<string[]>([]);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);

	const CONVICTIONS: [number, number][] = [1, 2, 4, 8, 16, 32].map((lock, index) => [index + 1, lock]);
	const convictionOpts = useMemo(
		() => [
			<SelectOption
				key={0}
				value={0}
			>
				{'0.1x voting balance, no lockup period'}
			</SelectOption>,
			...CONVICTIONS.map(([value, lock]) => (
				<SelectOption
					key={value}
					value={value}
				>{`${value}x voting balance, locked for ${lock * oneEnactmentPeriodInDays[network]} days`}</SelectOption>
			))
		],
		[CONVICTIONS, network]
	);

	useEffect(() => {
		if (!accounts.length) {
			if (walletConnectProvider) {
				getWalletConnectAccounts();
			} else {
				getAccounts();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accounts.length, walletConnectProvider]);

	const getAccounts = async () => {
		const ethereum = (window as any)?.ethereum;

		if (!ethereum) {
			return;
		}
		try {
			await addEthereumChain({
				ethereum,
				network
			});
		} catch (error) {
			setErrorArr((prev) => [...prev, error?.message || 'Something went wrong']);
			return;
		}

		const addresses = await ethereum.request({ method: 'eth_requestAccounts' });

		if (addresses.length === 0) {
			setLoading(false);
			return;
		}

		setAccounts(
			addresses.map((address: string): InjectedAccountWithMeta => {
				const account = {
					address,
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

		setLoading(false);
	};

	const connect = async () => {
		setLoading(true);

		//  Create new WalletConnect Provider
		window.localStorage.removeItem('walletconnect');
		const wcPprovider = new WalletConnectProvider({
			rpc: {
				1284: 'https://rpc.api.moonbeam.network',
				1285: 'https://rpc.api.moonriver.moonbeam.network',
				1287: 'https://rpc.api.moonbase.moonbeam.network'
			}
		});
		await wcPprovider.wc.createSession();
		dispatch(setWalletConnectProvider(wcPprovider));
	};

	const getAccountsHandler = async (addresses: string[], chainId: number) => {
		if (chainId !== chainProperties[network].chainId) {
			// setErr(new Error(`Please login using the ${NETWORK} network`));
			// setAccountsNotFound(true);
			setLoading(false);
			return;
		}

		const checksumAddresses = addresses.map((address: string) => address);

		if (checksumAddresses.length === 0) {
			// setAccountsNotFound(true);
			setLoading(false);
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

		setLoading(false);
	};

	const getWalletConnectAccounts = async () => {
		if (!walletConnectProvider?.wc.connected) {
			await connect();
			if (!walletConnectProvider?.connected) return;
		}

		getAccountsHandler(walletConnectProvider.wc.accounts, walletConnectProvider.wc.chainId);

		setLoading(false);

		walletConnectProvider.wc.on('session_update', (error, payload) => {
			if (error) {
				console.error(error);
				return;
			}

			// updated accounts and chainId
			const { accounts: addresses, chainId } = payload.params[0];
			getAccountsHandler(addresses, Number(chainId));
		});
	};

	const validateForm = (): boolean => {
		const errors = [];

		if (!address) {
			errors.push('Please select an address.');
		}

		if (!target) {
			errors.push('Please provide a valid target address.');
		}

		if (address == target) {
			errors.push('Please provide a different target address.');
		}

		if (bnBalance.lte(ZERO_BN)) {
			errors.push('Please provide a valid balance.');
		}

		if (availableBalance.lt(bnBalance)) {
			errors.push('Insufficient balance.');
		}

		setErrorArr(errors);

		return errors.length === 0;
	};

	const handleSubmit = async () => {
		setLoading(true);

		if (!validateForm()) {
			setLoading(false);
			return;
		}

		if (!api || !apiReady) {
			return;
		}

		let web3 = null;
		let chainId = null;

		if (walletConnectProvider?.wc.connected) {
			await walletConnectProvider.enable();
			web3 = new BrowserProvider(walletConnectProvider as any);
			chainId = walletConnectProvider.wc.chainId;
		} else {
			web3 = new BrowserProvider((window as any).ethereum);
			const { chainId: id } = await web3.getNetwork();
			chainId = Number(id.toString());
		}

		if (chainId !== chainProperties[network].chainId) {
			queueNotification({
				header: 'Wrong Network!',
				message: `Please change to ${network} network`,
				status: NotificationStatus.ERROR
			});
			return;
		}

		const voteContract = new Contract(contractAddress, abi, await web3.getSigner());

		const gasPrice = await voteContract.delegate.estimateGas(trackNum, target, conviction, bnBalance);
		const estimatedGasPriceInWei = new BN(formatUnits(gasPrice, 'wei'));

		// increase gas by 15%
		const gasLimit = estimatedGasPriceInWei.div(new BN(100)).mul(new BN(15)).add(estimatedGasPriceInWei).toString();

		await voteContract
			.delegate(trackNum, target, conviction, bnBalance, {
				gasLimit
			})
			.then((result: any) => {
				console.log(result, 'result');

				queueNotification({
					header: 'Success!',
					message: 'Delegation successful.',
					status: NotificationStatus.SUCCESS
				});
				setLoading(false);
			})
			.catch((error: any) => {
				setLoading(false);
				console.error('ERROR:', error);
				queueNotification({
					header: 'Failed!',
					message: error.message,
					status: NotificationStatus.ERROR
				});
			});
	};

	const handleOnBalanceChange = (balanceStr: string) => {
		const [balance, isValid] = inputToBn(balanceStr, network, false);
		isValid ? setAvailableBalance(balance) : setAvailableBalance(ZERO_BN);
	};

	return (
		<>
			<button
				type='button'
				className='ml-auto flex items-center rounded border border-pink_primary bg-white px-5 py-1 text-xs font-medium uppercase leading-tight text-pink_primary transition duration-150 ease-in-out hover:bg-pink_secondary hover:bg-opacity-5 hover:text-white focus:outline-none focus:ring-0 dark:bg-section-dark-overlay'
				onClick={() => setShowModal(true)}
			>
				<PlusOutlined />

				<span className='ml-1'> Delegate </span>
			</button>

			<Modal
				className='dark:[&>.ant-modal-content]:bg-section-dark-overlay'
				wrapClassName='dark:bg-modalOverlayDark'
				title={
					<div className='flex items-center dark:bg-section-dark-overlay'>
						Delegate
						<span className='ml-2 rounded-md border border-pink_secondary px-2 py-0.5 text-xs text-pink_secondary'>Delegation dashboard coming soon 🚀</span>
					</div>
				}
				open={showModal}
				onOk={handleSubmit}
				confirmLoading={loading}
				onCancel={() => setShowModal(false)}
				footer={[
					<div
						key='footer'
						className='flex items-center justify-end gap-x-2'
					>
						<CustomButton
							key='back'
							text='Cancel'
							buttonsize='sm'
							type='default'
							onClick={() => setShowModal(false)}
						/>
						<CustomButton
							key='confirm'
							text='Confirm'
							htmlType='submit'
							disabled={loading}
							buttonsize='sm'
							type='primary'
							onClick={handleSubmit}
						/>
					</div>
				]}
			>
				<Spin
					spinning={loading}
					indicator={<LoadingOutlined />}
				>
					<div className='flex flex-col gap-y-3'>
						{/* {noAccounts && <ErrorAlert errorMsg='You need at least one account in your wallet extenstion to use this feature.' />}
						{noExtension && <ExtensionNotDetected />} */}

						{errorArr.length > 0 &&
							errorArr.map((errorMsg) => (
								<ErrorAlert
									key={errorMsg}
									errorMsg={errorMsg}
								/>
							))}

						{
							// !noAccounts && !noExtension &&
							<Form
								form={form}
								disabled={loading}
							>
								<AccountSelectionForm
									title='Address'
									accounts={accounts}
									address={address}
									withBalance
									onAccountChange={(address) => setAddress(address)}
									onBalanceChange={handleOnBalanceChange}
								/>

								<AddressInput
									defaultAddress={target}
									label={'Target Address'}
									placeholder='Target Account Address'
									className='mb-7 mt-4'
									onChange={(address) => setTarget(address)}
									size='large'
								/>

								<BalanceInput
									label={'Balance'}
									placeholder={'0'}
									className='mt-4'
									onChange={(balance) => setBnBalance(balance)}
									size='large'
									theme={theme}
								/>

								<div className='-mt-2'>
									<label className='mb-2 ml-1 flex items-center text-sm text-sidebarBlue'>Conviction</label>

									<Select
										onChange={(value: any) => setConviction(Number(value))}
										size='large'
										className='w-full rounded-md p-1 text-sm text-sidebarBlue'
										defaultValue={conviction}
										popupClassName='z-[1060]'
									>
										{convictionOpts}
									</Select>
								</div>
							</Form>
						}
					</div>
				</Spin>
			</Modal>
		</>
	);
};

export default DelegateModalEthV2;
