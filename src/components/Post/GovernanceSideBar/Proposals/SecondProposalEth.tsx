// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import WalletConnectProvider from '@walletconnect/web3-provider';
import styled from 'styled-components';
import { Modal, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { chainProperties } from 'src/global/networkConstants';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import queueNotification from 'src/ui-components/QueueNotification';
import getNetwork from 'src/util/getNetwork';
import { BrowserProvider, Contract, formatUnits, getAddress } from 'ethers';

import { LoadingStatusType, NotificationStatus } from 'src/types';
import addEthereumChain from '~src/util/addEthereumChain';
import { useApiContext } from '~src/context';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { setWalletConnectProvider } from '~src/redux/userDetails';
import { useDispatch } from 'react-redux';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import BN from 'bn.js';
import { useTranslation } from 'next-i18next';

export interface SecondProposalProps {
	className?: string;
	proposalId?: number | null | undefined;
	seconds: number;
}

const contractAddress = process.env.NEXT_PUBLIC_DEMOCRACY_PRECOMPILE || '';

const currentNetwork = getNetwork();

const abi = require('src/moonbeamAbi.json');

const SecondProposalEth = ({ className, proposalId, seconds }: SecondProposalProps) => {
	const { walletConnectProvider, id, loginAddress } = useUserDetailsSelector();
	const dispatch = useDispatch();
	const [showModal, setShowModal] = useState<boolean>(false);
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [address, setAddress] = useState<string>('');
	const [modalOpen, setModalOpen] = useState(false);
	const { t } = useTranslation('common');

	let web3 = new BrowserProvider((window as any).ethereum);

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

	const connect = async () => {
		setLoadingStatus({
			isLoading: true,
			message: t('connecting_to_walletconnect')
		});

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

	const getWalletConnectAccounts = async () => {
		if (!walletConnectProvider?.wc.connected) {
			await connect();
			if (!walletConnectProvider?.connected) return;
		}

		getAccountsHandler(walletConnectProvider.wc.accounts, walletConnectProvider.wc.chainId);

		setLoadingStatus({
			isLoading: false,
			message: ''
		});

		walletConnectProvider.wc.on('session_update', (error, payload) => {
			if (error) {
				setLoadingStatus({
					isLoading: true,
					message: 'Fetching Account'
				});
				return;
			}

			// updated accounts and chainId
			const { accounts: addresses, chainId } = payload.params[0];
			getAccountsHandler(addresses, Number(chainId));
		});
	};

	const getAccountsHandler = async (addresses: string[], chainId: number) => {
		if (chainId !== chainProperties[currentNetwork].chainId) {
			// setErr(new Error(`Please login using the ${NETWORK} network`));
			// setAccountsNotFound(true);
			setLoadingStatus({
				isLoading: false,
				message: t('connecting_to_walletconnect')
			});
			return;
		}

		const checksumAddresses = addresses.map((address: string) => getAddress(address));

		if (checksumAddresses.length === 0) {
			// setAccountsNotFound(true);
			setLoadingStatus({
				isLoading: false,
				message: ''
			});
			return;
		}

		setAccounts(
			checksumAddresses.map((address: string): InjectedAccountWithMeta => {
				const account = {
					address: getAddress(address),
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

		setLoadingStatus({
			isLoading: false,
			message: ''
		});
	};

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
			return;
		}

		const addresses = await ethereum.request({ method: 'eth_requestAccounts' });

		if (addresses.length === 0) {
			return;
		}

		const accounts = addresses.map((address: string): InjectedAccountWithMeta => {
			const account = {
				address,
				meta: {
					genesisHash: null,
					name: 'metamask',
					source: 'metamask'
				}
			};
			return account;
		});

		if (accounts && Array.isArray(accounts)) {
			const substrate_address = getSubstrateAddress(loginAddress);
			const index = accounts.findIndex((account) => (getSubstrateAddress(account?.address) || '').toLowerCase() === (substrate_address || '').toLowerCase());
			if (index >= 0) {
				const account = accounts[index];
				accounts.splice(index, 1);
				accounts.unshift(account);
			}
		}

		setAccounts(accounts);
		if (addresses.length > 0) {
			setAddress(addresses[0]);
		}
	};

	const secondProposal = async () => {
		if (!proposalId && proposalId !== 0) {
			console.error('proposalId not set');
			return;
		}

		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		setLoadingStatus({ isLoading: true, message: 'Waiting for confirmation' });

		if (walletConnectProvider?.wc.connected) {
			await walletConnectProvider.enable();
			web3 = new BrowserProvider(walletConnectProvider as any);

			if (walletConnectProvider.wc.chainId !== chainProperties[currentNetwork].chainId) {
				queueNotification({
					header: 'Wrong Network!',
					message: `Please change to ${currentNetwork} network`,
					status: NotificationStatus.ERROR
				});
				return;
			}
		}

		const voteContract = new Contract(contractAddress, abi, await web3.getSigner());

		const gasPrice = await voteContract.second.estimateGas(proposalId, seconds);
		const estimatedGasPriceInWei = new BN(formatUnits(gasPrice, 'wei'));

		// increase gas by 15%
		const gasLimit = estimatedGasPriceInWei.div(new BN(100)).mul(new BN(15)).add(estimatedGasPriceInWei).toString();

		await voteContract
			.second(proposalId, seconds, {
				gasLimit
			})
			.then(() => {
				setLoadingStatus({ isLoading: false, message: '' });
				queueNotification({
					header: 'Success!',
					message: `Vote on proposal #${proposalId} successful.`,
					status: NotificationStatus.SUCCESS
				});
			})
			.catch((error: any) => {
				setLoadingStatus({ isLoading: false, message: '' });
				console.error('ERROR:', error);
				queueNotification({
					header: 'Failed!',
					message: error.message,
					status: NotificationStatus.ERROR
				});
			});
	};

	const onAccountChange = (address: string) => {
		setAddress(address);
	};

	const openModal = () => {
		if (!id) {
			setModalOpen(true);
		} else if (accounts.length === 0) {
			getAccounts();
		} else if (id && accounts.length > 0) {
			setShowModal(true);
		}
	};

	return (
		<div className={className}>
			<CustomButton
				variant='primary'
				text={t('second')}
				onClick={openModal}
				className='mx-auto mb-10 flex w-[90%]'
			/>
			<Modal
				className='dark:[&>.ant-modal-content]:bg-section-dark-overlay'
				wrapClassName='dark:bg-modalOverlayDark'
				title={t('second_proposal')}
				open={showModal}
				onCancel={() => setShowModal(false)}
				footer={[
					<CustomButton
						variant='primary'
						text='Second'
						key='second'
						loading={loadingStatus.isLoading}
						disabled={!apiReady}
						onClick={secondProposal}
						className='my-1'
					/>
				]}
			>
				<Spin
					spinning={loadingStatus.isLoading}
					indicator={<LoadingOutlined />}
				>
					<AccountSelectionForm
						title='Endorse with account'
						accounts={accounts}
						address={address}
						withBalance
						onAccountChange={onAccountChange}
					/>
				</Spin>
			</Modal>
			{
				<ReferendaLoginPrompts
					modalOpen={modalOpen}
					setModalOpen={setModalOpen}
					image='/assets/Gifs/login-endorse.gif'
					title={t('join_polkassembly_to_endorse_this_proposal')}
					subtitle={t('discuss_contribute_and_get_regular_updates_from_polkassembly')}
				/>
			}
		</div>
	);
};

export default styled(SecondProposalEth)`
	.LoaderWrapper {
		height: 15rem;
		position: absolute;
		width: 100%;
	}
`;
