// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { CheckOutlined, LinkOutlined } from '@ant-design/icons';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import { Divider, Modal, Spin } from 'antd';
import React, { FC, useState } from 'react';
import ExtensionNotDetected from 'src/components/ExtensionNotDetected';
import { useApiContext } from 'src/context';
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
import { dmSans } from 'pages/_app';
import { LoadingOutlined } from '@ant-design/icons';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Tooltip from '~src/basic-components/Tooltip';

interface Props {
	open?: boolean;
	dismissModal?: () => void;
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

const Address: FC<Props> = ({ dismissModal, open }) => {
	const currentUser = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const [fetchAccountsInfo, setFetchAccountsInfo] = useState(true);

	const [accountsInfo, setAccountsInfo] = useState(initResponse);
	const { accounts, accountsMap, noExtension, signersMap } = accountsInfo;
	const [loading, setLoading] = useState<boolean>(false);
	const dispatch = useDispatch();

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
			handleTokenChange(data.token, currentUser, dispatch);
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
			const ethereum = (window as any)?.ethereum;

			ethereum?.sendAsync(
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
						handleTokenChange(confirmData.token, currentUser, dispatch);
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
					handleTokenChange(confirmData.token, currentUser, dispatch);
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
			handleTokenChange(data.token, currentUser, dispatch);
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
				<CustomButton
					disabled={withClickHandler ? false : true}
					onClick={() => (withClickHandler ? handleUnlink(address) : null)}
					variant='default'
					className={`m-0 border-none p-0 text-red_primary ${!withClickHandler ? 'opacity-50' : ''}`}
					text='Unlink'
					height={40}
				/>
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

	const SetDefaultAddress: FC<{ address: string }> = ({ address }) => {
		return currentUser.defaultAddress !== address ? (
			<CustomButton
				onClick={() => handleDefault(address)}
				variant='default'
				className='m-0 border-none p-0 text-grey_primary'
				text='Set default'
				height={40}
			/>
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
				<label className='text-sm font-medium tracking-wide text-sidebarBlue dark:text-white'>{title}</label>
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
																		<CustomButton
																			onClick={() => handleLink(address, key as Wallet)}
																			icon={<LinkOutlined />}
																			variant='default'
																			className='m-0 border-none p-0 text-grey_primary'
																			text='Link'
																			height={40}
																			buttonsize='xs'
																		/>
																	</div>
																</>
															)}
														</div>
													)
												);
											})}
										</div>
										{arr.length - 1 > index ? <Divider className='border-b-1 dark:border-separatorDark' /> : null}
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
			wrapClassName='dark:bg-modalOverlayDark'
			closable={false}
			title={
				<div className='ml-[-24px] mr-[-24px] text-blue-light-high dark:bg-section-dark-overlay dark:text-blue-dark-high'>
					<span className='mb-0 ml-[24px] text-lg font-medium tracking-wide text-sidebarBlue dark:text-white'>Link Address</span>
					<Divider className='border-b-1 dark:border-separatorDark' />
				</div>
			}
			open={open}
			className={`mb-8 md:min-w-[600px] ${dmSans.variable} ${dmSans.className} dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			footer={
				<div className='flex items-center justify-end'>
					{[
						fetchAccountsInfo ? (
							<CustomButton
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
								key='got-it'
								icon={<CheckOutlined />}
								variant='primary'
								className='m-0 border-none text-grey_primary'
								text='Got it!'
								height={40}
								buttonsize='sm'
							/>
						) : null,
						<CustomButton
							onClick={dismissModal}
							text='Cancel'
							variant='default'
							key='cancel'
							buttonsize='sm'
						/>
					]}
				</div>
			}
		>
			<Spin
				spinning={loading}
				indicator={<LoadingOutlined />}
			>
				{fetchAccountsInfo ? (
					<div className='max-w-[600px] dark:text-white'>
						<p>For fetching your addresses, Polkassembly needs access to your wallet extensions. Please authorize this transaction.</p>
					</div>
				) : noExtension ? (
					<div className='max-w-[600px]'>
						<ExtensionNotDetected />
					</div>
				) : (
					<section className='flex flex-col gap-y-8 text-bodyBlue dark:text-blue-dark-high'>
						{currentUser?.addresses &&
							currentUser?.addresses?.length > 0 &&
							addressList({
								accounts:
									[...(currentUser?.addresses || [])]?.sort().map(
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
					<Divider className='border-b-1 my-4 mt-0 dark:border-separatorDark' />
				</div>
			</Spin>
		</Modal>
	);
};

export default Address;
