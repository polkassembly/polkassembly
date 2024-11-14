// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { Divider, Modal, Checkbox, Input, Radio, Form, Spin } from 'antd';
import { poppins } from 'pages/_app';
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

export enum ProxyTypeEnum {
	Any = 'Any',
	Auction = 'Auction',
	CancelProxy = 'CancelProxy',
	Governance = 'Governance',
	IdentityJudgement = 'IdentityJudgement',
	NonTransfer = 'NonTransfer',
	OnDemandOrdering = 'OnDemandOrdering',
	Society = 'Society'
}

interface Props {
	openModal: boolean;
	setOpenModal: (pre: boolean) => void;
	setOpenProxySuccessModal: (pre: boolean) => void;
	setAddress: (pre: string) => void;
	address: string;
	className: string;
}

const ZERO_BN = new BN(0);

const CreateProxyMainModal = ({ openModal, setOpenProxySuccessModal, className, setOpenModal, setAddress, address }: Props) => {
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
	const onAccountChange = (address: string) => setAddress(address);
	const currentBlock = useCurrentBlock();

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

					const gasFee = (await proxyTx.paymentInfo(address || values.proxyAddress))?.partialFee.toString();
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
			const baseDeposit = api?.consts?.proxy?.proxyDepositBase;
			setBaseDepositValue(new BN(baseDeposit));
			const gasFee = (await proxyTx.paymentInfo(address || values.proxyAddress))?.partialFee.toString();
			setGasFee(new BN(gasFee));
		}
	};

	useEffect(() => {
		if (!api || !apiReady) return;
		calculateGasFee();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, form.getFieldValue('proxyAddress'), form.getFieldValue('createPureProxy')]);

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
			console.log('NO API READY');
			return;
		}
		setLoadingStatus({ isLoading: true, message: 'Awaiting Transaction' });
		const values = form.getFieldsValue();
		if (!values.proxyType) {
			return;
		}

		let txn;
		if (values.createPureProxy) {
			txn = api?.tx?.proxy?.createPure(values.proxyType as any, 0, 0);
		}
		if (values.proxyAddress && !values.createPureProxy) {
			txn = api?.tx?.proxy?.addProxy(values.proxyAddress, values.proxyType as any, 0);
		}
		if (!txn) {
			console.log('NO TXN');
			return;
		}
		const { partialFee: txGasFee } = (await txn.paymentInfo(address || loginAddress)).toJSON();
		setGasFee(new BN(String(txGasFee)));

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

	return (
		<Modal
			title={
				<div>
					<div
						className={`${poppins.variable} ${poppins.className} flex items-center px-[18px] py-4 text-sm font-semibold text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high`}
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
				<div className='my-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 py-4 dark:border-[#3B444F] dark:border-separatorDark'>
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
						disabled={
							form.getFieldsError().some((field) => field.errors.length > 0) ||
							getSubstrateAddress(address || loginAddress) === getSubstrateAddress(form.getFieldValue('proxyAddress')) ||
							availableBalance.lt(gasFee.add(baseDepositValue))
						}
						height={40}
						width={145}
						text='Create Proxy'
						variant='primary'
						className={
							form.getFieldsError().some((field) => field.errors.length > 0) ||
							getSubstrateAddress(address || loginAddress) === getSubstrateAddress(form.getFieldValue('proxyAddress')) ||
							availableBalance.lt(gasFee.add(baseDepositValue))
								? 'opacity-50'
								: ''
						}
					/>
				</div>
			}
			zIndex={1008}
			wrapClassName={' dark:bg-modalOverlayDark rounded-[14px]'}
			className={`${className} ${poppins.variable} ${poppins.className} w-[605px] rounded-[14px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
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
					>
						{/* Address */}
						<Form.Item
							name='loginAddress'
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
								address={loginAddress}
								withBalance={false}
								onAccountChange={(address) => form.setFieldsValue({ loginAddress: address })}
								className={`${poppins.variable} ${poppins.className} text-sm font-normal text-lightBlue dark:text-blue-dark-medium`}
								inputClassName='rounded-[4px] px-3 py-1'
								withoutInfo={true}
								linkAddressTextDisabled
								theme={theme}
								isVoting
							/>
						</Form.Item>

						{/* Proxy Address */}
						<Form.Item
							name='proxyAddress'
							className=' mb-0'
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
							<AccountSelectionForm
								title='Proxy Address'
								isTruncateUsername={false}
								accounts={accounts}
								address={form.getFieldValue('proxyAddress') || loginAddress}
								withBalance={false}
								onAccountChange={(address) => form.setFieldsValue({ proxyAddress: address })}
								className={`${poppins.variable} ${poppins.className} text-sm font-normal text-lightBlue dark:text-blue-dark-medium`}
								inputClassName='rounded-[4px] px-3 py-1'
								withoutInfo={true}
								linkAddressTextDisabled
								theme={theme}
								isDisabled={form.getFieldValue('createPureProxy')}
								isVoting
							/>
						</Form.Item>

						<Form.Item
							className='mt-0 pt-0'
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
									form.setFieldsValue({ createPureProxy: e.target.checked });
									if (e.target.checked) {
										form.setFieldsValue({ proxyAddress: '' });
									}
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

										// Call calculateGasFee when a valid proxy type is selected
										try {
											await calculateGasFee();
											return Promise.resolve();
										} catch (error) {
											return Promise.reject(new Error('Failed to calculate gas fee'));
										}
									}
								}
							]}
						>
							<span className='text-sm text-blue-light-medium dark:text-blue-dark-medium'>Proxy Type</span>
							<Select
								className='w-full rounded-[4px] py-1'
								style={{ width: '100%' }}
								value={form.getFieldValue('proxyType')}
								size='large'
								suffixIcon={<DownArrow className='down-icon absolute right-2 top-[5px]' />}
								onChange={(value) => form.setFieldsValue({ proxyType: value })}
								options={Object.values(ProxyTypeEnum).map((type) => ({
									label: type,
									value: type
								}))}
							/>
						</Form.Item>

						{/* Advanced Details */}
						<div
							className='mt-6 flex cursor-pointer items-center gap-2'
							onClick={() => setOpenAdvanced(!openAdvanced)}
						>
							<span className='text-sm font-medium text-pink_primary'>Advanced Details</span>
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
								<Form.Item name='enactment'>
									<Radio.Group
										className='enactment mt-1 flex flex-col gap-2'
										value={enactment.key}
										onChange={(e) => setEnactment({ ...enactment, key: e.target.value })}
									>
										<Radio
											value={EEnactment.At_Block_No}
											className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'
										>
											<div className='flex h-10 items-center gap-4'>
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
														rules={[{ required: true, message: 'Invalid Block no.' }]}
													>
														<Input
															className='mt-3 w-[100px] rounded-[4px] dark:border-section-dark-container dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
															onChange={(e) => handleAdvanceDetailsChange(EEnactment.At_Block_No, e.target.value)}
														/>
													</Form.Item>
												)}
											</div>
										</Radio>

										<Radio
											value={EEnactment.After_No_Of_Blocks}
											className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'
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
															className='mt-3 w-[100px] rounded-[4px] dark:border-section-dark-container dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
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
										Gas Fees of {formatedBalance(String(gasFee.toString()), unit)} {unit} will be applied for this transaction.
									</div>
								}
							/>
						)}

						{/* Insufficient balance check */}
						{availableBalance.lt(gasFee) && (
							<Alert
								type='info'
								className='mt-6 rounded-[4px] px-4 py-2 text-bodyBlue'
								showIcon
								description={<div className='mt-1 flex flex-col p-0 text-xs dark:text-blue-dark-high'>Insufficient Balance</div>}
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
`;
