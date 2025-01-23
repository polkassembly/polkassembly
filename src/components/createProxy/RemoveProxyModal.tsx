// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { AutoComplete, Divider, Form, Modal } from 'antd';
import { dmSans } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { ArrowDownIcon, CloseIcon } from '~src/ui-components/CustomIcons';
import Image from 'next/image';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import BN from 'bn.js';
import { useApiContext } from '~src/context';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { LoadingStatusType, Wallet } from '~src/types';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import Address from '~src/ui-components/Address';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import Input from '~src/basic-components/Input';
import Alert from '~src/basic-components/Alert';

interface Props {
	openModal: boolean;
	setOpenModal: (pre: boolean) => void;
	className: string;
	address: string;
	setAddress: (pre: string) => void;
}

const ZERO_BN = new BN(0);

const RemoveProxyModal = ({ openModal, setOpenModal, className, setAddress, address }: Props) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const { api, apiReady } = useApiContext();
	const [form] = Form.useForm();
	const userDetails = useUserDetailsSelector();
	const { loginAddress, loginWallet } = userDetails;
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [baseDeposit, setBaseDeposit] = useState<BN>(new BN(0));
	const [depositFactor, setDepositFactor] = useState<BN>(new BN(0));
	const [dropdownVisible, setDropdownVisible] = useState(false);
	const onAccountChange = (address: string) => setAddress(address);
	const unit = `${chainProperties[network]?.tokenSymbol}`;

	const loadAccountsAndFetchFees = async () => {
		if (!api || !apiReady) return;
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
		} catch (error) {
			console.error('Failed to fetch accounts and fees:', error);
		} finally {
			setLoadingStatus({ isLoading: false, message: '' });
		}
	};

	useEffect(() => {
		if (!api || !apiReady) return;

		loadAccountsAndFetchFees();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, loginWallet, address, userDetails]);

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

	return (
		<Modal
			title={
				<div>
					<div
						className={`${dmSans.className} ${dmSans.variable} flex items-center px-4 py-4 text-sm font-semibold text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high`}
					>
						<span className='flex items-center gap-x-2 text-xl font-semibold text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary'>
							<Image
								src={'/assets/icons/remove-proxy-icon.svg'}
								alt='proxy-icon'
								width={24}
								height={24}
								className={`${theme == 'dark' ? 'dark-icons' : ''}`}
							/>
							<span>Remove Proxy</span>
						</span>
					</div>
					<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
				</div>
			}
			open={openModal}
			footer={
				<div className=''>
					<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
					<div className='mb-6 mt-3 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 py-4 dark:border-[#3B444F] dark:border-separatorDark'>
						<CustomButton
							onClick={() => setOpenModal(false)}
							buttonsize='sm'
							text='Cancel'
							height={40}
							width={160}
							variant='default'
						/>
						<CustomButton
							// onClick={handleSubmit}
							// disabled={isCreateProxyDisabled}
							height={40}
							width={160}
							text='Confirm'
							variant='primary'
							className={''}
						/>
					</div>
				</div>
			}
			zIndex={1008}
			wrapClassName={' dark:bg-modalOverlayDark rounded-[14px]'}
			className={`${className} ${dmSans.className} ${dmSans.variable} w-[605px] rounded-[14px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			onCancel={() => setOpenModal(false)}
			closeIcon={<CloseIcon className=' text-lightBlue dark:text-icon-dark-inactive' />}
		>
			<div className=' p-4'>
				<Form.Item
					name='proxiedAddress'
					className='mb-4 w-full'
					rules={[
						{ required: true, message: 'Address is required' },
						{
							validator: async (_, value) => {
								if (!value) {
									return Promise.reject(new Error('Please enter a valid address'));
								}
								try {
									// await calculateGasFee();
									return Promise.resolve();
								} catch (error) {
									return Promise.reject(new Error('Failed to calculate gas fee or base deposit'));
								}
							}
						}
					]}
				>
					<AccountSelectionForm
						title='Proxied Account'
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
				<span className={`${dmSans.className} ${dmSans.variable} mt-4 text-sm tracking-tight text-blue-light-medium dark:text-blue-dark-medium`}> Proxy account(s)</span>
				<Form.Item
					name='proxyAddress'
					className={`mb-0 ${!form.getFieldValue('proxyAddress') ? 'proxy-address' : ''} w-full`}
					rules={[
						{ required: !form.getFieldValue('createPureProxy'), message: 'Proxy Address is required' },
						{
							validator: async (_, value) => {
								if (form.getFieldValue('createPureProxy')) return Promise.resolve();

								if (!value) {
									return Promise.reject(new Error('Please enter a valid proxy address'));
								}
								// try {
								// 	await calculateGasFee();
								// 	return Promise.resolve();
								// } catch (error) {
								// 	return Promise.reject(new Error('Failed to calculate gas fee or base deposit'));
								// }
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
							// disabled={isPureProxy}
							popupClassName='dark:bg-section-dark-garyBackground'
							filterOption={(inputValue, option) => option?.value.toLowerCase().includes(inputValue.toLowerCase()) ?? false}
						/>
					) : (
						<div
							onClick={() => form.setFieldsValue({ proxyAddress: null })}
							className='flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-[4px] border border-solid border-section-light-container p-[14px]'
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

				<div className={`${dmSans.className} ${dmSans.variable} mt-2 flex items-center justify-between text-sm tracking-tight text-blue-light-medium dark:text-blue-dark-medium`}>
					{' '}
					Reserved Balance <span className='text-xs text-pink_primary dark:text-pink-dark-primary'>0 USD</span>
				</div>
				<Form.Item
					tooltip='Amount reserved for the proxy'
					className='relative'
				>
					<Input
						value='0 DOT'
						disabled
						className='h-10 rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
					/>
				</Form.Item>

				<Alert
					type='info'
					className='mt-6 rounded-[4px] px-4 py-2 text-bodyBlue'
					showIcon
					description={
						<div className='mt-1 flex flex-col p-0 text-xs dark:text-blue-dark-high'>
							Gas Fees of 2.48 DOT will be applied to the transaction and the deposit X DOT locked to create proxy will be returned.
						</div>
					}
				/>
			</div>
		</Modal>
	);
};

export default styled(RemoveProxyModal)`
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px;
	}
`;
