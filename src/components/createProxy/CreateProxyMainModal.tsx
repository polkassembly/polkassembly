// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { Divider, Modal, Checkbox, Input, Radio, Form, Spin, AutoComplete } from 'antd';
import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { CloseIcon, ProxyIcon } from '~src/ui-components/CustomIcons';
import BN from 'bn.js';
import DownArrow from '~assets/icons/down-icon.svg';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { EEnactment, IEnactment } from '../OpenGovTreasuryProposal';
import { IAdvancedDetails } from '../OpenGovTreasuryProposal/CreatePreimage';
import { BN_HUNDRED, BN_ONE } from '@polkadot/util';
import { useCurrentBlock } from '~src/hooks';
import { formatedBalance } from '~src/util/formatedBalance';
import Alert from '~src/basic-components/Alert';
import { chainProperties } from '~src/global/networkConstants';
import { useApiContext } from '~src/context';
import { LoadingStatusType, NotificationStatus, Wallet } from '~src/types';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import { useTheme } from 'next-themes';
import Select from '~src/basic-components/Select';
import queueNotification from '~src/ui-components/QueueNotification';
import executeTx from '~src/util/executeTx';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { dmSans } from 'pages/_app';
import Address from '~src/ui-components/Address';

export enum ProxyTypeEnum {
	Any = 'Any',
	NonTransfer = 'NonTransfer',
	Governance = 'Governance',
	Staking = 'Staking',
	CancelProxy = 'CancelProxy',
	Auction = 'Auction',
	NominationPools = 'NominationPools'
}

interface Props {
	openModal: boolean;
	setOpenModal: (pre: boolean) => void;
	setIsPureProxyCreated: (pre: boolean) => void;
	setOpenProxySuccessModal: (pre: boolean) => void;
	setProxiedAddress: (pre: string) => void;
	setAddress: (pre: string) => void;
	address: string;
	className: string;
}

const ZERO_BN = new BN(0);

const CreateProxyMainModal = ({ openModal, setOpenProxySuccessModal, className, setOpenModal, setAddress, address, setIsPureProxyCreated, setProxiedAddress }: Props) => {
	const { network } = useNetworkSelector();
	const userDetails = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();
	const { api, apiReady } = useApiContext();
	const { loginAddress, loginWallet } = userDetails;
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [form] = Form.useForm();
	const [openAdvanced, setOpenAdvanced] = useState<boolean>(true);
	const [advancedDetails, setAdvancedDetails] = useState<IAdvancedDetails>({ afterNoOfBlocks: BN_HUNDRED, atBlockNo: BN_ONE });
	const [gasFee, setGasFee] = useState<BN>(ZERO_BN);
	const [baseDepositValue, setBaseDepositValue] = useState<BN>(ZERO_BN);
	const [enactment, setEnactment] = useState<IEnactment>({ key: EEnactment.After_No_Of_Blocks, value: BN_HUNDRED });
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [depositFactor, setDepositFactor] = useState<BN>(ZERO_BN);
	const [showBalanceAlert, setShowBalanceAlert] = useState<boolean>(false);
	const [showError, setShowError] = useState(false);
	const onAccountChange = (address: string) => setAddress(address);
	const currentBlock = useCurrentBlock();
	const [isPureProxy, setIsPureProxy] = useState(false);

	useEffect(() => {
		if (!api || !apiReady) return;

		const loadAccountsAndFetchFees = async () => {
			try {
				setLoadingStatus({ isLoading: true, message: 'Fetching accounts' });

				// Get All accounts
				const accountsData = await getAccountsFromWallet({
					api,
					apiReady,
					chosenWallet: loginWallet || (localStorage.getItem('loginWallet') as Wallet),
					loginAddress,
					network
				});
				setAccounts(accountsData?.accounts || []);
				onAccountChange(accountsData?.account || '');

				// For fetching fees
				const values = form.getFieldsValue();
				if (!values.proxyType) return;

				const proxyTx = values.createPureProxy
					? api?.tx?.proxy?.createPure(values.proxyType, 0, 0)
					: values.proxyAddress
					? api?.tx?.proxy?.addProxy(values.proxyAddress, values.proxyType, 0)
					: null;

				if (proxyTx) {
					const accountData = await api?.query?.system?.account(address);
					const availableBalance = new BN(accountData?.data?.free.toString() || '0');
					setAvailableBalance(availableBalance);

					const gasFee = (await proxyTx?.paymentInfo(address || values.proxyAddress))?.partialFee.toString();
					setGasFee(new BN(gasFee));
				}
			} catch (error) {
				console.error('Failed to fetch accounts and fees:', error);
			} finally {
				setLoadingStatus({ isLoading: false, message: '' });
			}
		};

		loadAccountsAndFetchFees();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, loginWallet, address, userDetails]);

	const calculateGasFee = async () => {
		if (!api || !apiReady) return;
		try {
			const values = form.getFieldsValue();
			if (!values.proxyType) return;

			const proxyTx = values.createPureProxy
				? api?.tx?.proxy?.createPure(values.proxyType, 0, 0)
				: values.proxyAddress
				? api?.tx?.proxy?.addProxy(values.proxyAddress, values.proxyType, 0)
				: null;

			if (proxyTx) {
				const gasFee = (await proxyTx?.paymentInfo(address || values.proxyAddress))?.partialFee.toString();
				setGasFee(new BN(gasFee));
			}
		} catch (error) {
			console.error('Gas fee calculation failed:', error);
		}
	};

	const fetchBaseDeposit = async () => {
		try {
			const baseDeposit = api?.consts?.proxy?.proxyDepositBase || ZERO_BN;
			const depositFactor = api?.consts?.proxy?.proxyDepositFactor || ZERO_BN;
			setBaseDepositValue(new BN(baseDeposit.toString()));
			setDepositFactor(new BN(depositFactor.toString()));
		} catch (error) {
			console.error('Failed to fetch base deposit or deposit factor value:', error);
		}
	};

	useEffect(() => {
		if (!api || !apiReady) return;
		fetchBaseDeposit();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	const fetchInitialBalance = async () => {
		try {
			const accountData = await api?.query?.system?.account(address || loginAddress);
			if (accountData) {
				const balance = new BN(accountData.data.free.toString() || '0');
				setAvailableBalance(balance);

				if (balance.lt(gasFee.add(baseDepositValue).add(depositFactor))) {
					queueNotification({
						header: 'Insufficient Balance',
						message: `Your balance (${formatedBalance(balance.toString(), unit)} ${unit}) is insufficient to cover the gas fees and deposit .`,
						status: NotificationStatus.ERROR
					});
					setShowBalanceAlert(true);
				}
				setShowBalanceAlert(false);
			}
		} catch (error) {
			console.error('Failed to fetch initial balance:', error);
		}
	};

	useEffect(() => {
		if (!api || !apiReady) return;

		openModal && fetchInitialBalance();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, address, loginAddress]);

	useEffect(() => {
		if (availableBalance.lt(gasFee.add(baseDepositValue).add(depositFactor))) {
			setShowBalanceAlert(true);
		} else {
			setShowBalanceAlert(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [availableBalance, gasFee, baseDepositValue]);

	useEffect(() => {
		if (!api || !apiReady) return;
		if (form.getFieldValue('proxyType') && apiReady) {
			calculateGasFee();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.getFieldValue('proxyType'), form.getFieldValue('proxyAddress'), form.getFieldValue('createPureProxy')]);

	useEffect(() => {
		if (form.getFieldValue('createPureProxy')) {
			form.setFieldsValue({ proxyType: ProxyTypeEnum.Any });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.getFieldValue('createPureProxy')]);

	const handleAdvanceDetailsChange = (key: EEnactment, value: string) => {
		if (!value || value.includes('-')) return;
		try {
			const bnValue = new BN(value || '0');
			if (!bnValue) return;
			switch (key) {
				case EEnactment.At_Block_No:
					setAdvancedDetails({ afterNoOfBlocks: null, atBlockNo: bnValue });
					break;
				case EEnactment.After_No_Of_Blocks:
					setAdvancedDetails({ afterNoOfBlocks: bnValue, atBlockNo: null });
					break;
			}
			setEnactment({ ...enactment, value: bnValue });
		} catch (error) {
			console.log(error);
		}
	};

	const handleSubmit = async () => {
		if (!api || !apiReady) {
			return;
		}

		setLoadingStatus({ isLoading: true, message: 'Awaiting Transaction' });
		const values = form.getFieldsValue();

		const hasValidationErrors =
			(!form.getFieldValue('createPureProxy') && !form.getFieldValue('proxyAddress')) ||
			getSubstrateAddress(address || loginAddress) === getSubstrateAddress(form.getFieldValue('proxyAddress')) ||
			availableBalance.lt(gasFee.add(baseDepositValue).add(depositFactor));

		if (hasValidationErrors) {
			setShowError(true);
			return;
		}

		setShowError(false);

		if (!values.proxyType) {
			return;
		}

		let txn;
		if (values.createPureProxy) {
			txn = api?.tx?.proxy?.createPure(values.proxyType as any, 0, 0);
			setIsPureProxyCreated(true);
			setProxiedAddress('');
		}
		if (values.proxyAddress && !values.createPureProxy) {
			txn = api?.tx?.proxy?.addProxy(values.proxyAddress, values.proxyType as any, 0);
			setIsPureProxyCreated(false);
			setProxiedAddress(values.proxyAddress);
		}
		if (!txn) {
			console.log('NO TXN');
			return;
		}
		const paymentInfo = await txn?.paymentInfo(address || loginAddress);
		setGasFee(new BN(String(paymentInfo?.partialFee?.toString())));

		const onFailed = (message: string) => {
			queueNotification({
				header: 'Failed!',
				message,
				status: NotificationStatus.ERROR
			});
			setLoadingStatus({ isLoading: false, message: 'Awaiting accounts' });
		};

		const onSuccess = async () => {
			queueNotification({
				header: 'Success!',
				message: 'Proxy created successfully.',
				status: NotificationStatus.SUCCESS
			});
			setLoadingStatus({ isLoading: false, message: 'Awaiting accounts' });
			setOpenModal(false);
			setOpenProxySuccessModal(true);
		};

		await executeTx({
			address: address || loginAddress,
			api,
			apiReady,
			errorMessageFallback: 'Transaction failed.',
			network,
			onBroadcast: () => setLoadingStatus({ isLoading: true, message: '' }),
			onFailed,
			onSuccess,
			tx: txn
		});
	};

	const handleOnBalanceChange = async (balanceStr: string) => {
		if (!api || !apiReady) {
			return;
		}
		let balance = ZERO_BN;
		try {
			balance = new BN(balanceStr);
			setAvailableBalance(balance);
		} catch (err) {
			console.log(err);
		}
	};

	const proxyTypeDescriptions = {
		[ProxyTypeEnum.Any]: 'Allows all transactions, including balance transfers',
		[ProxyTypeEnum.NonTransfer]: 'Allows all transactions except balance transfers',
		[ProxyTypeEnum.Governance]: 'For governance-related actions (e.g., Democracy, Treasury',
		[ProxyTypeEnum.Staking]: 'For staking-related transactions, replacing controller accounts',
		[ProxyTypeEnum.CancelProxy]: 'For registrars to make identity judgments',
		[ProxyTypeEnum.Auction]: 'For transactions related to auctions and crowdloans',
		[ProxyTypeEnum.NominationPools]: 'For transactions involving nomination pools'
	};

	const isCreateProxyDisabled =
		loadingStatus.isLoading ||
		form.getFieldsError().some((field) => field.errors.length > 0) ||
		(!form.getFieldValue('createPureProxy') && !form.getFieldValue('proxyAddress')) ||
		getSubstrateAddress(address || loginAddress) === getSubstrateAddress(form.getFieldValue('proxyAddress')) ||
		availableBalance.lt(gasFee.add(baseDepositValue).add(depositFactor));

	return (
		<Modal
			title={
				<div>
					<div
						className={`${dmSans.className} ${dmSans.variable} flex items-center px-[18px] py-4 text-sm font-semibold text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high`}
					>
						<span className='flex items-center gap-x-2 text-xl font-semibold text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary'>
							<ProxyIcon className='userdropdown-icon text-2xl' />
							<span>Proxy</span>
						</span>
					</div>
					<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
				</div>
			}
			open={openModal}
			footer={
				<div className='mb-6 mt-3 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 py-4 dark:border-[#3B444F] dark:border-separatorDark'>
					<CustomButton
						onClick={() => setOpenModal(false)}
						buttonsize='sm'
						text='Cancel'
						height={40}
						width={145}
						variant='default'
					/>
					<CustomButton
						onClick={handleSubmit}
						disabled={isCreateProxyDisabled}
						height={40}
						width={145}
						text='Create Proxy'
						variant='primary'
						className={isCreateProxyDisabled ? 'opacity-50' : ''}
					/>
				</div>
			}
			zIndex={1008}
			wrapClassName={' dark:bg-modalOverlayDark rounded-[14px]'}
			className={`${className} ${dmSans.className} ${dmSans.variable} w-[605px] rounded-[14px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			onCancel={() => setOpenModal(false)}
			closeIcon={<CloseIcon className=' text-lightBlue dark:text-icon-dark-inactive' />}
		>
			<Spin spinning={loadingStatus.isLoading}>
				<div className='px-6 py-3'>
					<Form
						form={form}
						initialValues={{
							loginAddress,
							proxyType: ProxyTypeEnum.Any,
							createPureProxy: false,
							proxyAddress: '',
							after_blocks: advancedDetails.afterNoOfBlocks ? advancedDetails.afterNoOfBlocks.toString() : BN_HUNDRED.toString(),
							at_block:
								advancedDetails.atBlockNo && currentBlock && advancedDetails.atBlockNo.lt(currentBlock)
									? currentBlock.toString()
									: advancedDetails.atBlockNo
									? advancedDetails.atBlockNo.toString()
									: BN_ONE.toString(),
							enactment: enactment.key
						}}
						disabled={loadingStatus.isLoading}
						onFinish={handleSubmit}
						className=''
					>
						{/* Address */}
						<Form.Item
							name='loginAddress'
							className='mb-2'
							rules={[
								{ required: true, message: 'Address is required' },
								{
									validator: async (_, value) => {
										if (!value) {
											return Promise.reject(new Error('Please enter a valid address'));
										}
										try {
											await calculateGasFee();
											return Promise.resolve();
										} catch (error) {
											return Promise.reject(new Error('Failed to calculate gas fee or base deposit'));
										}
									}
								}
							]}
						>
							<AccountSelectionForm
								title='Your Address'
								isTruncateUsername={false}
								accounts={accounts}
								address={form.getFieldValue('loginAddress') || address || loginAddress}
								withBalance={true}
								onAccountChange={(address) => {
									setAddress(address);
									form.setFieldsValue({ loginAddress: address });
								}}
								onBalanceChange={handleOnBalanceChange}
								className={`${dmSans.className} ${dmSans.variable} rounded-[4px] border text-sm font-normal text-lightBlue dark:text-blue-dark-medium`}
								inputClassName='rounded-[4px] h-10 px-3 py-1 border'
								withoutInfo={true}
								isBalanceUpdated={true}
								linkAddressTextDisabled
								theme={theme}
								isVoting
								isUsedInProxy={true}
							/>
						</Form.Item>

						{/* Proxy Address */}
						<span className={`${dmSans.className} ${dmSans.variable} text-sm tracking-tight text-blue-light-medium dark:text-blue-dark-medium`}>
							{' '}
							Proxy Address <span className='text-lg font-medium text-red-light-medium'>*</span>
						</span>
						<Form.Item
							name='proxyAddress'
							className={`mb-0 ${!form.getFieldValue('proxyAddress') ? 'proxy-address' : ''}`}
							rules={[
								{ required: !form.getFieldValue('createPureProxy'), message: 'Proxy Address is required' },
								{
									validator: async (_, value) => {
										if (form.getFieldValue('createPureProxy')) return Promise.resolve();

										if (!value) {
											return Promise.reject(new Error('Please enter a valid proxy address'));
										}
										try {
											await calculateGasFee();
											return Promise.resolve();
										} catch (error) {
											return Promise.reject(new Error('Failed to calculate gas fee or base deposit'));
										}
									}
								}
							]}
						>
							{!form.getFieldValue('proxyAddress') ? (
								<AutoComplete
									options={accounts
										?.filter((account) => getSubstrateAddress(account.address) !== getSubstrateAddress(form.getFieldValue('proxyAddress') || loginAddress))
										.map((account) => ({
											value: account?.address,
											label: (
												<div className='flex items-center gap-2'>
													<Address
														address={account?.address}
														className='flex items-center dark:text-blue-dark-high'
														usernameClassName='font-medium'
														disableTooltip
														isTruncateUsername
													/>
												</div>
											)
										}))}
									style={{
										width: '100%',
										height: '40px',
										borderRadius: '4px'
									}}
									placeholder='Select an address for proxy'
									onChange={(value) => {
										form.setFieldsValue({ proxyAddress: value });
									}}
									className='h-10 rounded-[6px] text-blue-light-high dark:text-blue-dark-high'
									disabled={isPureProxy}
									popupClassName='dark:bg-section-dark-garyBackground'
									filterOption={(inputValue, option) => option?.value.toLowerCase().includes(inputValue.toLowerCase()) ?? false}
								/>
							) : (
								<div
									onClick={() => form.setFieldsValue({ proxyAddress: null })}
									className='flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-[6px] border border-solid border-section-light-container p-[14px]'
								>
									<Address
										address={form.getFieldValue('proxyAddress')}
										className='ml-1 flex items-center'
										displayInline
										isTruncateUsername
										iconSize={32}
										usernameClassName='font-semibold'
										disableAddressClick={true}
									/>
								</div>
							)}
						</Form.Item>

						<Form.Item
							className='mb-3 pt-0'
							name='createPureProxy'
							valuePropName='checked'
							rules={[
								{
									validator: async () => {
										try {
											await calculateGasFee();
											return Promise.resolve();
										} catch (error) {
											return Promise.reject(new Error('Failed to calculate gas fee or base deposit'));
										}
									}
								}
							]}
						>
							<Checkbox
								onChange={(e) => {
									setIsPureProxy(e.target.checked);
									form.setFieldsValue({
										proxyAddress: e.target.checked ? '' : undefined
									});
								}}
							>
								<span className='text-sm text-blue-light-medium dark:text-blue-dark-medium'>Create Pure Proxy</span>
								<HelperTooltip
									className='ml-[6px]'
									text='Spawn a fresh new account that is guaranteed to be otherwise inaccessible'
								/>
							</Checkbox>
						</Form.Item>

						{/* Proxy Type Selection */}
						<span className='text-sm tracking-tight text-blue-light-medium dark:text-blue-dark-medium'> Proxy Type</span>
						<Form.Item
							name='proxyType'
							rules={[
								{
									required: true,
									message: 'Proxy Type is required'
								},
								{
									validator: async (_, value) => {
										if (!value) {
											return Promise.reject(new Error('Please select a Proxy Type'));
										}
										try {
											await calculateGasFee();
											return Promise.resolve();
										} catch (error) {
											return Promise.reject(new Error('Failed to calculate gas fee'));
										}
									}
								}
							]}
							className='mb-0 mt-[2px] rounded-[4px]'
						>
							<Select
								className='custom-select'
								style={{ width: '100%', textAlign: 'center' }}
								value={form.getFieldValue('proxyType')}
								size='large'
								suffixIcon={<DownArrow className='down-icon absolute right-2 top-[5px]' />}
								onChange={(value) => form.setFieldsValue({ proxyType: value })}
								options={Object.entries(proxyTypeDescriptions).map(([key, description], index) => ({
									label: (
										<div className={`${index === 0 ? 'mt-2' : ''} mt-2 items-center gap-1 sm:flex`}>
											<span className='text-sm text-blue-light-high dark:text-blue-dark-high'>{key}</span>
											<span className='text-sm italic text-blue-light-medium dark:text-blue-dark-medium'>({description})</span>
										</div>
									),
									value: key
								}))}
								disabled={isPureProxy}
								popupClassName='custom-select-dropdown'
							/>
						</Form.Item>

						{/* Advanced Details */}
						<div
							className='mt-4 flex cursor-pointer items-center gap-2'
							onClick={() => setOpenAdvanced(!openAdvanced)}
						>
							<span className='text-sm font-medium text-pink_primary dark:text-[#FF4098] '>Advanced Details</span>
							<DownArrow className='down-icon' />
						</div>

						{openAdvanced && (
							<div className='preimage mt-3 flex flex-col'>
								{/* Enactment */}
								<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>
									Enactment{' '}
									<HelperTooltip
										text='A custom delay can be set for enactment of approved proposals.'
										className='ml-1'
									/>
								</label>
								<Form.Item
									name='enactment'
									className='mb-0'
								>
									<Radio.Group
										className='enactment mt-1 flex flex-col'
										value={enactment.key}
										onChange={(e) => setEnactment({ ...enactment, key: e.target.value })}
									>
										<Radio
											value={EEnactment.At_Block_No}
											className='py-0 text-sm font-normal text-bodyBlue dark:text-blue-dark-high'
										>
											<div className='flex h-10 items-center '>
												<span>
													At Block no.
													<HelperTooltip
														className='ml-1'
														text='Allows you to choose a custom block number for enactment.'
													/>
												</span>
												{enactment.key === EEnactment.At_Block_No && (
													<Form.Item
														name='at_block'
														className='mt-2 pl-3 pt-1'
														rules={[{ required: true, message: 'Invalid Block no.' }]}
													>
														<Input
															className='mt-0 w-[100px] rounded-[4px] dark:border-section-dark-container dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
															onChange={(e) => handleAdvanceDetailsChange(EEnactment.At_Block_No, e.target.value)}
														/>
													</Form.Item>
												)}
											</div>
										</Radio>

										<Radio
											value={EEnactment.After_No_Of_Blocks}
											className='mb-0 text-sm font-normal text-bodyBlue dark:text-blue-dark-high'
										>
											<div className='flex h-[30px] items-center gap-2'>
												<span className='w-[150px]'>
													After no. of Blocks
													<HelperTooltip
														text='Allows you to choose a custom delay in terms of blocks for enactment.'
														className='ml-1'
													/>
												</span>
												{enactment.key === EEnactment.After_No_Of_Blocks && (
													<Form.Item
														name='after_blocks'
														rules={[{ required: true, message: 'Invalid no. of Blocks' }]}
													>
														<Input
															className='mt-3 w-[100px] rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
															onChange={(e) => handleAdvanceDetailsChange(EEnactment.After_No_Of_Blocks, e.target.value)}
														/>
													</Form.Item>
												)}
											</div>
										</Radio>
									</Radio.Group>
								</Form.Item>
							</div>
						)}

						{/* Fee display */}
						{gasFee && gasFee != ZERO_BN && (
							<Alert
								type='info'
								className='mt-6 rounded-[4px] px-4 py-2 text-bodyBlue'
								showIcon
								description={
									<div className='mt-1 p-0 text-xs dark:text-blue-dark-high'>
										Gas Fees: {formatedBalance(String(gasFee.toString()), unit)} {unit} <br />
										Base Deposit: {formatedBalance(String(baseDepositValue.toString()), unit, 3)} {unit} <br />
										Deposit Factor: {formatedBalance(String(depositFactor.toString()), unit)} {unit}
									</div>
								}
							/>
						)}

						{/* Insufficient balance check */}
						{availableBalance.lt(gasFee.add(baseDepositValue)) && showBalanceAlert && (
							<Alert
								type='info'
								className='mt-6 rounded-[4px] px-4 py-2 text-bodyBlue'
								showIcon
								description={<div className='mt-1 flex flex-col p-0 text-xs dark:text-blue-dark-high'>Insufficient Balance</div>}
							/>
						)}

						{showError && (
							<Alert
								type='error'
								className='mt-4 rounded-[4px] px-4 py-2 text-bodyBlue'
								showIcon
								description={
									<div className='mt-1 flex flex-col p-0 text-xs dark:text-blue-dark-high'>
										{!form.getFieldValue('createPureProxy') && !form.getFieldValue('proxyAddress') && <span>Provide a Proxy address or enable Create Pure Proxy.</span>}
										{getSubstrateAddress(address || loginAddress) === getSubstrateAddress(form.getFieldValue('proxyAddress')) && (
											<span>The proxy address must be different from the selected account address.</span>
										)}
										{availableBalance.lt(gasFee.add(baseDepositValue)) && <span>Insufficient balance to cover gas fees and deposit.</span>}
									</div>
								}
							/>
						)}
					</Form>
				</div>
			</Spin>
		</Modal>
	);
};

export default styled(CreateProxyMainModal)`
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px;
	}

	.custom-select .ant-select-selector {
		border-radius: 4px !important;
	}

	.custom-select .ant-select {
		border-radius: 4px !important;
	}

	.custom-select-dropdown .ant-select-item {
		border-radius: 4px !important;
	}

	.custom-select .ant-select-arrow {
		margin-top: -9px;
	}

	.proxy-address {
		.ant-form-item-control-input-content {
			display: flex;
			align-items: center;
			height: 40px !important;
		}

		.ant-select-selector {
			height: 40px !important;
			border-radius: 4px !important;
			padding: 0 12px !important;
			display: flex;
			align-items: center;
		}

		.ant-select-selection-search-input {
			height: 40px !important;
			line-height: 40px !important;
			border-radius: 6px !important;
		}

		.ant-select-selection-item {
			display: flex;
			align-items: center;
		}

		.flex {
			display: flex;
			align-items: center;
			height: 40px !important;
			justify-content: space-between;
			border: 1px solid var(--border-color, #d9d9d9);
			border-radius: 6px;
			padding: 0 14px;
			cursor: pointer;
		}
	}

	.proxy-dropdown {
		background-color: #d2d8e0;
		background-color: #1c1d1f;
		border-radius: 4px;
		padding: 4px;
	}

	.proxy-dropdown .ant-select-item {
		background-color: transparent;
		padding: 8px 12px;
		border-radius: 4px;
		transition: background-color 0.2s ease;

		&:hover {
			background-color: var(--bg-hover-light);
			background-color: var(--bg-hover-dark);
		}
	}
`;
