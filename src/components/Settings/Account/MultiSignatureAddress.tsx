// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { DownOutlined, PlusOutlined, UpOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { web3Enable as snapEnable } from '@polkagate/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import { Checkbox, Divider, Form, InputNumber, Modal } from 'antd';
import React, { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useApiContext } from 'src/context';
import { APPNAME } from 'src/global/appName';
import { chainProperties } from 'src/global/networkConstants';
import { handleTokenChange } from 'src/services/auth.service';
import { NotificationStatus } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import AddressComponent from 'src/ui-components/Address';
import FilteredError from 'src/ui-components/FilteredError';
import HelperTooltip from 'src/ui-components/HelperTooltip';
import queueNotification from 'src/ui-components/QueueNotification';
import cleanError from 'src/util/cleanError';
import getEncodedAddress from 'src/util/getEncodedAddress';
import styled from 'styled-components';
import { ChallengeMessage, ChangeResponseType } from '~src/auth/types';
import Input from '~src/basic-components/Input';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import Alert from '~src/basic-components/Alert';

interface Props {
	open?: boolean;
	dismissModal?: () => void;
}

const MultiSignatureAddress: FC<Props> = ({ open, dismissModal }) => {
	const { network } = useNetworkSelector();

	const [form] = Form.useForm();
	const currentUser = useUserDetailsSelector();
	const dispatch = useDispatch();
	const [linkStarted, setLinkStarted] = useState(false);
	const [signatories, setSignatories] = useState<{ [key: number | string]: string }>({ 0: '' });
	const [signatoryAccounts, setSignatoryAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [showSignatoryAccounts, setShowSignatoryAccounts] = useState(false);
	const [extensionNotAvailable, setExtensionNotAvailable] = useState(false);
	const [, setAccountsNotFound] = useState(false);
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [signatory, setSignatory] = useState<string>('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const onAccountChange = (address: string) => setSignatory(address);

	const { api, apiReady } = useApiContext();

	const handleDetect = async () => {
		const extensions = await web3Enable(APPNAME);

		/** to enable metamask snap */
		const metamaskSnap = await snapEnable('onlysnap');
		metamaskSnap && extensions.push(...metamaskSnap);

		if (extensions.length === 0) {
			setExtensionNotAvailable(true);
			return;
		} else {
			setExtensionNotAvailable(false);
		}

		const allAccounts = await web3Accounts();
		setSignatoryAccounts(allAccounts);
		setShowSignatoryAccounts(!showSignatoryAccounts);
	};

	const isSelected = (address: string) => {
		let isSelected = false;
		Object.keys(signatories).forEach((key) => {
			if (signatories[key] === address) {
				isSelected = true;
			}
		});
		return isSelected;
	};

	const handleAddSignatories = (isAdd: boolean, address = '') => {
		if (isAdd) {
			if (!isSelected(address)) {
				setSignatories({ ...signatories, [Object.keys(signatories).length]: address });
			}
		} else {
			setSignatories((prev) => {
				const key = Object.keys(signatories).find((key) => signatories[key] === address);
				const newSignatories = { ...prev };
				if (key) {
					delete newSignatories[key];
				}
				return newSignatories;
			});
		}
	};

	const getSignatoryAccounts = () => {
		return (
			<>
				{signatoryAccounts.map((account) => {
					const address = getEncodedAddress(account.address, network);

					return (
						address && (
							<div
								key={address}
								className='flex items-center gap-x-2'
							>
								<Checkbox
									checked={isSelected(address)}
									onChange={(e) => {
										handleAddSignatories(e.target.checked, address);
									}}
								/>
								<AddressComponent
									className='item'
									address={address}
									extensionName={account.meta.name}
								/>
							</div>
						)
					);
				})}
			</>
		);
	};

	const getSignatoriesArray = () => {
		const signatoriesArray: any[] = [];
		Object.keys(signatories).forEach((key) => {
			if (signatories[key] !== '') {
				signatoriesArray.push(signatories[key]);
			}
		});
		return signatoriesArray;
	};

	const handleLink = async (): Promise<undefined> => {
		if (!api || !apiReady) return;

		const extensions = await web3Enable(APPNAME);

		/** to enable metamask snap */
		const metamaskSnap = await snapEnable('onlysnap');
		metamaskSnap && extensions.push(...metamaskSnap);

		if (extensions.length === 0) {
			setExtensionNotAvailable(true);
			return;
		} else {
			setExtensionNotAvailable(false);
		}

		const availableAccounts = await web3Accounts();

		availableAccounts.forEach((account) => {
			account.address = getEncodedAddress(account.address, network) || account.address;
		});

		const accounts = availableAccounts.filter((account) => {
			return getSignatoriesArray()
				.map((address) => address.trim())
				.filter((address) => !!address)
				.includes(account.address);
		});

		if (accounts.length === 0) {
			setAccountsNotFound(true);
			return;
		} else {
			setAccountsNotFound(false);
		}

		setAccounts(accounts);
		if (accounts.length > 0) {
			setSignatory(accounts[0]?.address);

			const injected = await web3FromSource(accounts[0].meta.source);

			api.setSigner(injected.signer);
		}

		setLinkStarted(true);
		return;
	};

	const handleSign = async (multisigAddress: string, signatory: string, threshold: number) => {
		if (!accounts.length) return;
		const injected = await web3FromSource(accounts[0].meta.source);
		const signRaw = injected && injected.signer && injected.signer.signRaw;
		if (!signRaw) return console.error('Signer not available');

		let substrate_address: string | null;
		if (!multisigAddress.startsWith('0x')) {
			substrate_address = getSubstrateAddress(multisigAddress);
			if (!substrate_address) return console.error('Invalid address');
		} else {
			substrate_address = multisigAddress;
		}

		setLoading(true);

		const { data, error } = await nextApiClientFetch<ChallengeMessage>('api/v1/auth/actions/multisigLinkStart', { address: substrate_address });
		if (error || !data) {
			setLoading(false);
			setError(error || 'Error in linking');
			console.error('Multisig link start query failed');
			return;
		}

		const { signature } = await signRaw({
			address: signatory,
			data: stringToHex(data.signMessage || ''),
			type: 'bytes'
		});

		const { data: confirmData, error: confirmError } = await nextApiClientFetch<ChangeResponseType>('api/v1/auth/actions/multisigLinkConfirm', {
			address: substrate_address,
			addresses: getSignatoriesArray().join(','),
			signatory,
			signature,
			ss58Prefix: chainProperties?.[network]?.ss58Format,
			threshold
		});

		if (confirmError || !confirmData) {
			console.error(confirmError);
			setError(confirmError || 'Error in linking');
			queueNotification({
				header: 'Failed!',
				message: cleanError(confirmError || ''),
				status: NotificationStatus.ERROR
			});
		}

		if (confirmData?.token) {
			handleTokenChange(confirmData?.token, currentUser, dispatch);
			queueNotification({
				header: 'Success!',
				message: confirmData?.message || '',
				status: NotificationStatus.SUCCESS
			});
			dismissModal && dismissModal();
		}
		setLoading(false);
	};

	const handleFinish = (data: any) => {
		if (linkStarted) {
			handleSign(data?.multisigAddress, signatory, Number(data?.threshold));
		} else {
			handleLink();
		}
	};

	const onSignatoriesAddressRemove = (e: any) => {
		const oldSignatories = { ...signatories };
		delete oldSignatories[e.currentTarget.id];
		let i = 0;
		const newSignatories = {};
		Object.keys(oldSignatories).forEach((key) => {
			// @ts-ignore
			newSignatories[i] = oldSignatories[key];
			i++;
		});
		setSignatories(newSignatories);
	};

	const onSignatoriesAddressChange = (e: any) => {
		setSignatories((prev) => ({ ...prev, [e.target.id]: e.target.value }));
	};

	return (
		<Modal
			wrapClassName='dark:bg-modalOverlayDark'
			closable={false}
			title={
				<div className='ml-[-24px] mr-[-24px] text-blue-light-high dark:bg-section-dark-overlay dark:text-blue-dark-high'>
					<span className='mb-0 ml-[24px] text-lg font-medium tracking-wide text-sidebarBlue dark:text-white'>Link Multisig address</span>
					<Divider className='border-b-1 dark:border-separatorDark' />
				</div>
			}
			open={open}
			className={classNames(poppins.className, poppins.variable, 'mb-8 md:min-w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay')}
			footer={
				<div className='flex items-center justify-end'>
					{[
						<CustomButton
							key='link'
							htmlType='submit'
							onClick={() => {
								form.submit();
							}}
							loading={loading}
							variant='primary'
							height={40}
						>
							{linkStarted ? 'Sign' : 'Link'}
						</CustomButton>,
						<CustomButton
							key='cancel'
							onClick={dismissModal}
							variant='default'
							height={40}
							text='Cancel'
						/>
					]}
				</div>
			}
		>
			{(error || extensionNotAvailable) && (
				<div className='mb-5 flex flex-col gap-y-2'>
					{error && <FilteredError text={error} />}
					{extensionNotAvailable && (
						<Alert
							message={<span className='dark:text-blue-dark-high'>Please install polkadot.js extension</span>}
							type='error'
						/>
					)}
				</div>
			)}
			<Form
				form={form}
				onFinish={handleFinish}
				className='mb-4 flex flex-col gap-y-6'
			>
				<section className='flex w-full flex-col gap-y-4'>
					<label className='flex items-center gap-x-3 text-sm font-normal leading-6 tracking-wide text-sidebarBlue dark:text-white'>
						Signatory Addresses
						<HelperTooltip
							placement='right'
							text='The signatories (aka co-owners) have the ability to create transactions using the multisig and approve transactions sent by others. But, only once the threshold (set while creating a multisig account) is reached with approvals, the multisig transaction is enacted on-chain.'
						/>
					</label>
					<div className='flex flex-col gap-y-2'>
						{Object.keys(signatories).map((i) => (
							<div
								className='relative flex items-center'
								key={i}
							>
								<Input
									id={i}
									value={signatories[i]}
									onChange={onSignatoriesAddressChange}
									placeholder='Enter signatory addresses'
									className='rounded-md border-grey_border px-4 py-3 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								/>
								<button
									type='button'
									id={i}
									className='absolute right-2 flex items-center justify-center border-none outline-none'
									onClick={onSignatoriesAddressRemove}
								>
									<MinusCircleOutlined />
								</button>
							</div>
						))}
					</div>
					{!extensionNotAvailable && (
						<div className='flex items-center justify-between'>
							<CustomButton
								onClick={handleDetect}
								variant='default'
								height={40}
								className='m-0 border-none p-0'
							>
								<span>Choose from available account</span>
								{showSignatoryAccounts ? <UpOutlined /> : <DownOutlined />}
							</CustomButton>
							<CustomButton
								onClick={() => handleAddSignatories(true, '')}
								variant='default'
								height={40}
								className='m-0 border-none p-0'
							>
								<PlusOutlined />
								<span>Add Account</span>
							</CustomButton>
						</div>
					)}
					{showSignatoryAccounts && signatoryAccounts.length > 0 && <article className='flex flex-col gap-y-3'>{getSignatoryAccounts()}</article>}
				</section>
				<section>
					<label
						className='flex items-center gap-x-3 text-sm font-normal leading-6 tracking-wide text-sidebarBlue dark:text-white'
						htmlFor='multisigAddress'
					>
						Multisig Address
						<HelperTooltip text='This is the address of the multisig account with the above signatories.' />
					</label>
					<Form.Item
						name='multisigAddress'
						className='m-0 mt-2.5'
						rules={[
							{
								message: 'Multisig Address is required',
								required: true
							}
						]}
					>
						<Input
							placeholder='Enter a valid multisig address'
							className='rounded-md border-grey_border px-4 py-3 dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-blue-dark-high dark:focus:border-[#91054F]'
							id='multisigAddress'
						/>
					</Form.Item>
				</section>
				<section>
					<label
						className='flex items-center gap-x-3 text-sm font-normal leading-6 tracking-wide text-sidebarBlue dark:text-white'
						htmlFor='threshold'
					>
						Threshold
						<HelperTooltip text='The number of signatories should be greater than or equal to the threshold for approving a transaction from this multisig' />
					</label>
					<Form.Item
						name='threshold'
						className='m-0 mt-2.5 w-full'
						rules={[
							{
								message: 'Threshold is required',
								required: true
							}
						]}
					>
						<InputNumber
							type='number'
							min={1}
							max={100}
							placeholder='Enter threshold'
							className='w-full rounded-md border-grey_border px-3 py-2 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
							id='threshold'
						/>
					</Form.Item>
				</section>
				{accounts.length > 0 && (
					<section>
						<AccountSelectionForm
							title='Sign with account'
							accounts={accounts}
							address={signatory}
							onAccountChange={onAccountChange}
						/>
					</section>
				)}
			</Form>
			<div className='ml-[-24px] mr-[-24px]'>
				<Divider className='my-4 mt-0' />
			</div>
		</Modal>
	);
};

export default styled(MultiSignatureAddress)`
	input::placeholder {
		color: #909090 !important;
	}
`;
