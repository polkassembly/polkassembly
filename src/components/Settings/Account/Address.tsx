// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { CheckOutlined, LinkOutlined } from '@ant-design/icons';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import { Button, Divider, Modal, Spin, Tooltip } from 'antd';
import React, { FC, useState } from 'react';
import ExtensionNotDetected from 'src/components/ExtensionNotDetected';
import { useApiContext, useNetworkContext, useUserDetailsContext } from 'src/context';
import { handleTokenChange } from 'src/services/auth.service';
import { NotificationStatus, Wallet } from 'src/types';
import AddressComponent from 'src/ui-components/Address';
import queueNotification from 'src/ui-components/QueueNotification';
import cleanError from 'src/util/cleanError';
import getEncodedAddress from 'src/util/getEncodedAddress';
import { ChallengeMessage, ChangeResponseType } from '~src/auth/types';
import getAllAccounts, { initResponse } from '~src/util/getAllAccounts';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
import { poppins } from 'pages/_app';
import { LoadingOutlined } from '@ant-design/icons';

interface Props {
	open?: boolean;
	dismissModal?: () => void;
	theme?: string;
}

const WalletIconAndTitle: FC<{
	which: Wallet;
}> = ({ which }) => {
	if (!which) return null;
	return (
		<div className='flex items-center gap-x-2'>
			<span className='flex h-6 w-6 items-center justify-center'>
				<WalletIcon
					which={which}
					className='h-6 w-6'
				/>
			</span>
			<h4 className='m-0 capitalize'>{which.replace('-', ' ')}</h4>
		</div>
	);
};

<<<<<<< HEAD
const Address: FC<Props> = ({ dismissModal ,open, theme }) => {
=======
const Address: FC<Props> = ({ dismissModal, open }) => {
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
	const currentUser = useUserDetailsContext();
	const { network } = useNetworkContext();
	const { api, apiReady } = useApiContext();
	const [fetchAccountsInfo, setFetchAccountsInfo] = useState(true);

	const [accountsInfo, setAccountsInfo] = useState(initResponse);
	const { accounts, accountsMap, noExtension, signersMap } = accountsInfo;
	const [loading, setLoading] = useState<boolean>(false);

	interface AccountsDetails {
		accounts: InjectedAccount[];
		title: string;
	}

	const handleDefault = async (address: InjectedAccount['address']) => {
		setLoading(true);
		let substrate_address;
		if (!address.startsWith('0x')) {
			substrate_address = getSubstrateAddress(address);
			if (!substrate_address) {
				setLoading(false);
				console.error('Invalid address');
				return;
			}
		} else {
			substrate_address = address;
		}

		const { data, error } = await nextApiClientFetch<ChangeResponseType>('api/v1/auth/actions/setDefaultAddress', { address: substrate_address, network });
		if (error) {
			console.error(error);
			queueNotification({
				header: 'Failed!',
				message: cleanError(error),
				status: NotificationStatus.ERROR
			});
			setLoading(false);
			dismissModal && dismissModal();
		}

		if (data?.message) {
			queueNotification({
				header: 'Success!',
				message: data.message || '',
				status: NotificationStatus.SUCCESS
			});
			handleTokenChange(data.token, currentUser);
			setLoading(false);
			dismissModal && dismissModal();
		}
	};

	const handleLink = async (address: InjectedAccount['address'], wallet: Wallet) => {
		setLoading(true);
		const signRaw = !address.startsWith('0x') && signersMap[accountsMap[address]].signRaw;
		if (!address.startsWith('0x') && !signRaw) return console.error('Signer not available');

		let substrate_address: string | null;
		if (!address.startsWith('0x')) {
			substrate_address = getSubstrateAddress(address);
			if (!substrate_address) {
				console.error('Invalid address');
				setLoading(false);
				dismissModal && dismissModal();
				return;
			}
		} else {
			substrate_address = address;
		}

		const { data, error } = await nextApiClientFetch<ChallengeMessage>('api/v1/auth/actions/addressLinkStart', { address: substrate_address });
		if (error || !data?.signMessage) {
			queueNotification({
				header: 'Failed!',
				message: cleanError(error || 'Something went wrong'),
				status: NotificationStatus.ERROR
			});
			setLoading(false);
			dismissModal && dismissModal();
			return;
		}

		let signature = '';

		if (substrate_address.startsWith('0x')) {
			const msg = stringToHex(data?.signMessage || '');
			const from = address;

			const params = [msg, from];
			const method = 'personal_sign';

			(window as any).ethereum.sendAsync(
				{
					from,
					method,
					params
				},
				async (err: any, result: any) => {
					if (result) {
						signature = result.result;
					}

					const { data: confirmData, error: confirmError } = await nextApiClientFetch<ChangeResponseType>('api/v1/auth/actions/addressLinkConfirm', {
						address: substrate_address,
						signature,
						wallet
					});

					if (confirmError) {
						console.error(confirmError);
						queueNotification({
							header: 'Failed!',
							message: cleanError(confirmError),
							status: NotificationStatus.ERROR
						});
						setLoading(false);
						dismissModal && dismissModal();
					}

					if (confirmData?.token) {
						handleTokenChange(confirmData.token, currentUser);
						queueNotification({
							header: 'Success!',
							message: confirmData.message || '',
							status: NotificationStatus.SUCCESS
						});
						setLoading(false);
						dismissModal && dismissModal();
					}
				}
			);
		} else {
			if (signRaw) {
				const { signature: substrate_signature } = await signRaw({
					address: substrate_address,
					data: stringToHex(data?.signMessage || ''),
					type: 'bytes'
				});
				signature = substrate_signature;

				const { data: confirmData, error: confirmError } = await nextApiClientFetch<ChangeResponseType>('api/v1/auth/actions/addressLinkConfirm', {
					address: substrate_address,
					signature,
					wallet
				});

				if (confirmError) {
					console.error(confirmError);
					queueNotification({
						header: 'Failed!',
						message: cleanError(confirmError),
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					dismissModal && dismissModal();
				}

				if (confirmData?.token) {
					handleTokenChange(confirmData.token, currentUser);
					queueNotification({
						header: 'Success!',
						message: confirmData.message || '',
						status: NotificationStatus.SUCCESS
					});
					setLoading(false);
					dismissModal && dismissModal();
				}
			}
		}
	};

	const handleUnlink = async (address: InjectedAccount['address']) => {
		setLoading(true);
		let substrate_address;
		if (!address.startsWith('0x')) {
			substrate_address = getSubstrateAddress(address);
			if (!substrate_address) return console.error('Invalid address');
		} else {
			substrate_address = address;
		}

		const { data, error } = await nextApiClientFetch<ChangeResponseType>('api/v1/auth/actions/addressUnlink', { address: substrate_address });

		if (error) {
			console.error(error);
			queueNotification({
				header: 'Failed!',
				message: cleanError(error),
				status: NotificationStatus.ERROR
			});
			setLoading(false);
			dismissModal && dismissModal();
		}
		if (data?.token) {
			handleTokenChange(data.token, currentUser);
			queueNotification({
				header: 'Success!',
				message: data.message || '',
				status: NotificationStatus.SUCCESS
			});
			setLoading(false);
			dismissModal && dismissModal();
		}
	};

	const UnlinkButton: FC<{ address: string }> = ({ address }) => {
		const StyledUnlinkButton: FC<{ withClickHandler?: boolean }> = ({ withClickHandler = false }) => {
			return (
				<Button
<<<<<<< HEAD
					className={`font-medium text-sm m-0 p-0 outline-none border-none flex items-center justify-center text-red_primary dark:bg-black ${!withClickHandler? 'opacity-50': ''}`}
=======
					className={`m-0 flex items-center justify-center border-none p-0 text-sm font-medium text-red_primary outline-none ${!withClickHandler ? 'opacity-50' : ''}`}
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
					disabled={withClickHandler ? false : true}
					onClick={() => (withClickHandler ? handleUnlink(address) : null)}
				>
					Unlink
				</Button>
			);
		};

		return currentUser.defaultAddress === address ? (
			<Tooltip
				color='#E5007A'
				title="You can't unlink your default address"
			>
				<StyledUnlinkButton />
			</Tooltip>
		) : (
			<StyledUnlinkButton withClickHandler />
		);
	};

<<<<<<< HEAD
	const SetDefaultAddress: FC<{ address : string }> = ({ address }) => {
		return currentUser.defaultAddress !== address
			? <Button
				className='font-medium text-sm m-0 p-0 text-grey_primary outline-none border-none flex items-center dark:bg-black justify-center'
=======
	const SetDefaultAddress: FC<{ address: string }> = ({ address }) => {
		return currentUser.defaultAddress !== address ? (
			<Button
				className='m-0 flex items-center justify-center border-none p-0 text-sm font-medium text-grey_primary outline-none'
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
				onClick={() => handleDefault(address)}
			>
				Set default
			</Button>
		) : (
			<span className='flex items-center gap-x-2 text-sm font-medium text-green_primary'>
				<CheckOutlined />
				Default address
			</span>
		);
	};

	const addressList = ({ accounts, title }: AccountsDetails) => {
		const accountsObj = accounts.reduce(
			(prev, account) => {
				const address = getEncodedAddress(account.address, network);
				const encodedUserAddresses = currentUser.addresses?.map((address) => getEncodedAddress(address, network));
				const isLinked = address && encodedUserAddresses?.includes(address);
				if (isLinked && title.startsWith('Available')) {
					return prev;
				}
				if (address && accountsMap[address]) {
					const walletName = accountsMap[address];
					if (walletName) {
						const obj = {
							account: account,
							address: address,
							isLinked: isLinked as boolean
						};
						if (prev[walletName]) {
							prev[walletName].push(obj);
						} else {
							prev[walletName] = [obj];
						}
						return prev;
					}
				}
				if (account.address && accountsMap[account.address]) {
					const walletName = accountsMap[account.address];
					if (walletName) {
						const obj = {
							account: account,
							address: account.address,
							isLinked: isLinked as boolean
						};
						if (prev[walletName]) {
							prev[walletName].push(obj);
						} else {
							prev[walletName] = [obj];
						}
						return prev;
					}
				}
				const obj = {
					account: account,
					address: account.address,
					isLinked: isLinked as boolean
				};
				if (prev['other']) {
					prev['other'].push(obj);
				} else {
					prev['other'] = [obj];
				}
				return prev;
			},
			{} as {
				[key: string]: {
					account: InjectedAccount;
					isLinked: boolean;
					address: string;
				}[];
			}
		);

		return (
			<article className='flex flex-col gap-y-2'>
<<<<<<< HEAD
				<label className='font-medium text-sm tracking-wide text-sidebarBlue dark:text-blue-dark-medium'>{title}</label>
				<div className='flex flex-col'>
					{
						accountsObj && Object.entries(accountsObj).map(([key, value], index, arr) => {
							return value && Array.isArray(value) && value.length > 0 && <div className='flex flex-col'>
								<WalletIconAndTitle which={key as any} />
								<div className='flex flex-col gap-y-2 mt-4'>
									{
										value.map((v) => {
											if (!v) return null;
											const { account, isLinked, address } = v;
											return address &&
										<div key={address} className='grid grid-cols-6 gap-x-2 items-center'>
											<AddressComponent
												className='col-span-3'
												address={address}
												// extensionName={account.meta.name}
												extensionName={account.name}
												displayInline={true}
											/>
											{ isLinked
												? <>
													<div className='col-span-1'>
														<UnlinkButton address={address} />
													</div>
													<div className="col-span-2">
														<SetDefaultAddress address={address} />
													</div>
												</>
												: <>
													<div className="col-span-1">
														<Button
															className='font-medium text-sm m-0 p-0 text-grey_primary outline-none border-none flex items-center justify-center dark:bg-black dark:text-blue-dark-high'
															onClick={() => handleLink(address, key as Wallet)}
															icon={
																<LinkOutlined />
															}
=======
				<label className='text-sm font-medium tracking-wide text-sidebarBlue'>{title}</label>
				<div className='flex flex-col'>
					{accountsObj &&
						Object.entries(accountsObj).map(([key, value], index, arr) => {
							return (
								value &&
								Array.isArray(value) &&
								value.length > 0 && (
									<div className='flex flex-col'>
										<WalletIconAndTitle which={key as any} />
										<div className='mt-4 flex flex-col gap-y-2'>
											{value.map((v) => {
												if (!v) return null;
												const { account, isLinked, address } = v;
												return (
													address && (
														<div
															key={address}
															className='grid grid-cols-6 items-center gap-x-2'
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
														>
															<AddressComponent
																className='col-span-3'
																address={address}
																// extensionName={account.meta.name}
																extensionName={account.name}
																displayInline={true}
															/>
															{isLinked ? (
																<>
																	<div className='col-span-1'>
																		<UnlinkButton address={address} />
																	</div>
																	<div className='col-span-2'>
																		<SetDefaultAddress address={address} />
																	</div>
																</>
															) : (
																<>
																	<div className='col-span-1'>
																		<Button
																			className='m-0 flex items-center justify-center border-none p-0 text-sm font-medium text-grey_primary outline-none'
																			onClick={() => handleLink(address, key as Wallet)}
																			icon={<LinkOutlined />}
																		>
																			Link
																		</Button>
																	</div>
																</>
															)}
														</div>
													)
												);
											})}
										</div>
										{arr.length - 1 > index ? <Divider /> : null}
									</div>
								)
							);
						})}
				</div>
			</article>
		);
	};

	return (
		<Modal
			closable={false}
			title={
<<<<<<< HEAD
				<div className='mr-[-24px] ml-[-24px] text-blue-light-high dark:text-blue-dark-high dark:bg-section-dark-overlay'>
					<span className='ml-[24px] mb-0 font-medium text-lg tracking-wide text-sidebarBlue dark:text-blue-dark-high'>
					Link Address
					</span>
					<Divider className='dark:bg-icon-dark-inactive' />
=======
				<div className='ml-[-24px] mr-[-24px] text-[#243A57]'>
					<span className='mb-0 ml-[24px] text-lg font-medium tracking-wide text-sidebarBlue'>Link Address</span>
					<Divider />
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
				</div>
			}
			wrapClassName='dark:bg-modalOverlayDark'
			open={open}
			className={`${theme === 'dark'? '[&>.ant-modal-content]:bg-section-dark-overlay' : ''} mb-8 md:min-w-[600px] ${poppins.variable} ${poppins.className}`}
			footer={
				<div className='flex items-center justify-end'>
					{[
						fetchAccountsInfo ? (
							<Button
<<<<<<< HEAD
								key="cancel"
								onClick={dismissModal}
								className='bg-white dark:bg-transparent text-pink_primary outline-none border border-pink_primary border-solid rounded-[4px] py-3 px-7 font-medium flex items-center justify-center tracking-wide text-sm'
=======
								key='got-it'
								icon={<CheckOutlined />}
								className='flex items-center justify-center rounded-[4px] border border-solid border-pink_primary bg-pink_primary px-7 py-4 text-sm font-medium tracking-wide text-white outline-none'
								onClick={() => {
									getAllAccounts({
										api,
										apiReady,
										get_erc20: ['moonbase', 'moonriver', 'moonbeam'].includes(network),
										network
									})
										.then((res) => {
											setAccountsInfo(res);
											setFetchAccountsInfo(false);
										})
										.catch((err) => {
											console.error(err);
										});
								}}
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
							>
								Got it!
							</Button>
						) : null,
						<Button
							key='cancel'
							onClick={dismissModal}
							className='flex items-center justify-center rounded-[4px] border border-solid border-pink_primary bg-white px-7 py-3 text-sm font-medium tracking-wide text-pink_primary outline-none'
						>
							Cancel
						</Button>
					]}
				</div>
			}
		>
<<<<<<< HEAD
			<Spin spinning={loading} indicator={<LoadingOutlined />}>
				{
					fetchAccountsInfo?
						<div className='max-w-[600px]'>
							<p className='dark:text-blue-dark-high dark:font-light'>
							For fetching your addresses, Polkassembly needs access to your wallet extensions. Please authorize this transaction.
							</p>
						</div>
						: noExtension
							? <div className='max-w-[600px]'><ExtensionNotDetected /></div>
							: <section className='flex flex-col gap-y-8 text-blue-light-high dark:text-blue-dark-high'>
								{currentUser?.addresses && currentUser?.addresses?.length > 0 &&  addressList({
									accounts: currentUser?.addresses?.sort().map((address): InjectedAccount => ({
										address: address
										// meta: { source: '' }
									})) || [],
									title: 'Linked addresses'
								})}
								{accounts.length && addressList({
									accounts,
									title: 'Available addresses'
								})}
							</section>
				}
				<div className='mr-[-24px] ml-[-24px]'>
					<Divider className='my-4 mt-0 dark:bg-icon-dark-inactive' />
=======
			<Spin
				spinning={loading}
				indicator={<LoadingOutlined />}
			>
				{fetchAccountsInfo ? (
					<div className='max-w-[600px]'>
						<p>For fetching your addresses, Polkassembly needs access to your wallet extensions. Please authorize this transaction.</p>
					</div>
				) : noExtension ? (
					<div className='max-w-[600px]'>
						<ExtensionNotDetected />
					</div>
				) : (
					<section className='flex flex-col gap-y-8 text-bodyBlue'>
						{currentUser?.addresses &&
							currentUser?.addresses?.length > 0 &&
							addressList({
								accounts:
									currentUser?.addresses?.sort().map(
										(address): InjectedAccount => ({
											address: address
											// meta: { source: '' }
										})
									) || [],
								title: 'Linked addresses'
							})}
						{accounts.length &&
							addressList({
								accounts,
								title: 'Available addresses'
							})}
					</section>
				)}
				<div className='ml-[-24px] mr-[-24px]'>
					<Divider className='my-4 mt-0' />
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
				</div>
			</Spin>
		</Modal>
	);
};

export default Address;
