// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import { Alert, Button, Divider, Form, Input, Modal } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import ExtensionNotDetected from 'src/components/ExtensionNotDetected';
import { useNetworkContext, useUserDetailsContext } from 'src/context';
import { APPNAME } from 'src/global/appName';
import { handleTokenChange } from 'src/services/auth.service';
import { NotificationStatus } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import FilteredError from 'src/ui-components/FilteredError';
import queueNotification from 'src/ui-components/QueueNotification';
import cleanError from 'src/util/cleanError';
import getEncodedAddress from 'src/util/getEncodedAddress';

import { ChangeResponseType } from '~src/auth/types';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface Props {
	open?: boolean;
	dismissModal?: () => void;
	theme?: string;
}

const Proxy: FC<Props> = ({ dismissModal, open, theme }) => {
	const [form] = Form.useForm();

	const { network } = useNetworkContext();

	const currentUser = useUserDetailsContext();
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [proxyAddress, setProxyAddress] = useState<string>('');
	const [extensionNotFound, setExtensionNotFound] = useState(false);
	const [accountsNotFound, setAccountsNotFound] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const onProxyAddressChange = (address: string) => {
		setProxyAddress(address);
	};

	//open modal and fetch and populate addressOptions (dropdown);
	const fetchAddressOptions = async () => {
		const extensions = await web3Enable(APPNAME);

		if (extensions.length === 0) {
			setExtensionNotFound(true);
			return;
		} else {
			setExtensionNotFound(false);
		}

		const availableAccounts = await web3Accounts();

		availableAccounts.forEach((account) => {
			account.address = getEncodedAddress(account.address, network) || account.address;
		});

		const accounts = availableAccounts;

		if (accounts.length === 0) {
			setAccountsNotFound(true);
			return;
		} else {
			setAccountsNotFound(false);
		}

		setAccounts(accounts);
		if (accounts.length > 0) {
			setProxyAddress(accounts[0]?.address);
		}
	};

	useEffect(() => {
		fetchAddressOptions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSign = async (formData: any) => {
		if (!accounts.length) return;

		const injected = await web3FromSource(accounts[0].meta.source);
		const signRaw = injected && injected.signer && injected.signer.signRaw;
		if (!signRaw) return console.error('Signer not available');

		const proxied = formData?.proxiedAccount;

		let substrate_address: string | null;
		if (!proxied.startsWith('0x')) {
			substrate_address = getSubstrateAddress(proxied);
			if (!substrate_address) return console.error('Invalid address');
		} else {
			substrate_address = proxied;
		}

		const message = `<Bytes>I am linking proxied address ${substrate_address}</Bytes>`;

		const { signature } = await signRaw({
			address: proxyAddress,
			data: stringToHex(message || ''),
			type: 'bytes'
		});

		setLoading(true);

		const { data, error } = await nextApiClientFetch<ChangeResponseType>('api/v1/auth/actions/linkProxyAddress', {
			message,
			proxied: substrate_address,
			proxy: proxyAddress,
			signature
		});

		if (error || !data) {
			setError(error || 'Something went wrong');
			console.error(error);
			queueNotification({
				header: 'Failed!',
				message: cleanError(error || ''),
				status: NotificationStatus.ERROR
			});
		}

		if (data?.token) {
			handleTokenChange(data?.token, currentUser);
		}

		setLoading(false);
	};
	return (
		<Modal
			closable={false}
			title={
<<<<<<< HEAD
				<div className='mr-[-24px] ml-[-24px] text-blue-light-high dark:text-blue-dark-high dark:bg-black'>
					<span className='ml-[24px] mb-0 font-medium text-lg tracking-wide text-sidebarBlue dark:text-blue-dark-high'>
					Link Proxy address
					</span>
					<Divider className='dark:bg-icon-dark-inactive'/>
=======
				<div className='ml-[-24px] mr-[-24px] text-[#243A57]'>
					<span className='mb-0 ml-[24px] text-lg font-medium tracking-wide text-sidebarBlue'>Link Proxy address</span>
					<Divider />
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
				</div>
			}
			wrapClassName='dark:bg-modalOverlayDark'
			open={open}
			className={`${theme === 'dark'? '[&>.ant-modal-content]:bg-section-dark-overlay' : ''} mb-8 md:min-w-[600px]`}
			footer={
				<div className='flex items-center justify-end'>
<<<<<<< HEAD
					{

						[
							<Button
								disabled={accountsNotFound}
								key="sign"
								htmlType='submit'
								onClick={() => {
									form.submit();
								}}
								loading={loading}
								className={`bg-pink_primary text-white outline-none border border-pink_primary border-solid rounded-md py-3 px-7 font-medium text-lg leading-none flex items-center justify-center ${accountsNotFound? 'bg-gray-300': ''}`}
							>
						Sign
							</Button>,
							<Button
								key="cancel"
								onClick={dismissModal}
								className='bg-white dark:bg-section-dark-overlay text-pink_primary outline-none border border-pink_primary border-solid rounded-md py-3 px-7 font-medium text-lg leading-none flex items-center justify-center'
							>
						Cancel
							</Button>
						]
					}
				</div>
			}
		>
			{
				extensionNotFound
					? <div className='max-w-[600px]'><ExtensionNotDetected /></div>
					: <Form
						form={form}
						onFinish={handleSign}
						className='flex flex-col gap-y-8 mb-6'
					>
						{
							accountsNotFound
								? <Alert
									type='warning'
									message={<>
										<p>At least one proxy account should be in your polkadot js extension.</p>
										<p>Please reload this page after adding accounts.</p>
									</>}
								/>

								: <>
									<section>
										<label
											className='flex items-center gap-x-3 text-sm text-sidebarBlue font-normal tracking-wide leading-6 dark:text-blue-dark-medium'
											htmlFor='proxiedAccount'
										>
                                            Proxied Address
										</label>
										<Form.Item
											name="proxiedAccount"
											className='m-0 mt-2.5'
										>
											<Input
												placeholder='Enter a valid proxy address'
												className="rounded-md py-3 px-4 border-grey_border dark:bg-black dark:text-blue-dark-high"
												id="proxiedAccount"
											/>
										</Form.Item>
									</section>
									<section>
										<AccountSelectionForm
											title='Select proxy account'
											accounts={accounts}
											address={proxyAddress}
											onAccountChange={onProxyAddressChange}
										/>
									</section>
=======
					{[
						<Button
							disabled={accountsNotFound}
							key='sign'
							htmlType='submit'
							onClick={() => {
								form.submit();
							}}
							loading={loading}
							className={`flex items-center justify-center rounded-md border border-solid border-pink_primary bg-pink_primary px-7 py-3 text-lg font-medium leading-none text-white outline-none ${
								accountsNotFound ? 'bg-gray-300' : ''
							}`}
						>
							Sign
						</Button>,
						<Button
							key='cancel'
							onClick={dismissModal}
							className='flex items-center justify-center rounded-md border border-solid border-pink_primary bg-white px-7 py-3 text-lg font-medium leading-none text-pink_primary outline-none'
						>
							Cancel
						</Button>
					]}
				</div>
			}
		>
			{extensionNotFound ? (
				<div className='max-w-[600px]'>
					<ExtensionNotDetected />
				</div>
			) : (
				<Form
					form={form}
					onFinish={handleSign}
					className='mb-6 flex flex-col gap-y-8'
				>
					{accountsNotFound ? (
						<Alert
							type='warning'
							message={
								<>
									<p>At least one proxy account should be in your polkadot js extension.</p>
									<p>Please reload this page after adding accounts.</p>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
								</>
							}
						/>
					) : (
						<>
							<section>
								<label
									className='flex items-center gap-x-3 text-sm font-normal leading-6 tracking-wide text-sidebarBlue'
									htmlFor='proxiedAccount'
								>
									Proxied Address
								</label>
								<Form.Item
									name='proxiedAccount'
									className='m-0 mt-2.5'
								>
									<Input
										placeholder='Enter a valid proxy address'
										className='rounded-md border-grey_border px-4 py-3'
										id='proxiedAccount'
									/>
								</Form.Item>
							</section>
							<section>
								<AccountSelectionForm
									title='Select proxy account'
									accounts={accounts}
									address={proxyAddress}
									onAccountChange={onProxyAddressChange}
								/>
							</section>
						</>
					)}
					{error && <FilteredError text={error} />}
				</Form>
			)}
			<div className='ml-[-24px] mr-[-24px]'>
				<Divider className='my-4 mt-0' />
			</div>
		</Modal>
	);
};

export default Proxy;
