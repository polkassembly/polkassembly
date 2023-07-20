// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import WalletConnectProvider from '@walletconnect/web3-provider';
import styled from 'styled-components';
import { Button, Modal, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { chainProperties } from 'src/global/networkConstants';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import queueNotification from 'src/ui-components/QueueNotification';
import getNetwork from 'src/util/getNetwork';
import Web3 from 'web3';

import { LoadingStatusType, NotificationStatus } from 'src/types';
import addEthereumChain from '~src/util/addEthereumChain';
import {
	useApiContext,
	useNetworkContext,
	useUserDetailsContext
} from '~src/context';
import ReferendaLoginPrompts from '~src/ui-components/RefendaLoginPrompts';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

export interface SecondProposalProps {
	className?: string;
	proposalId?: number | null | undefined;
	seconds: number;
}

const contractAddress = process.env.NEXT_PUBLIC_DEMOCRACY_PRECOMPILE;

const currentNetwork = getNetwork();

const abi = require('src/moonbeamAbi.json');

const SecondProposalEth = ({
	className,
	proposalId,
	seconds
}: SecondProposalProps) => {
	const {
		walletConnectProvider,
		setWalletConnectProvider,
		id,
		loginAddress
	} = useUserDetailsContext();
	const [showModal, setShowModal] = useState<boolean>(false);
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({
		isLoading: false,
		message: ''
	});
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkContext();
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [address, setAddress] = useState<string>('');
	const [modalOpen, setModalOpen] = useState(false);

	let web3 = new Web3((window as any).ethereum);

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
			message: 'Connecting to WalletConnect'
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
		setWalletConnectProvider(wcPprovider);
	};

	const getWalletConnectAccounts = async () => {
		if (!walletConnectProvider?.wc.connected) {
			await connect();
			if (!walletConnectProvider?.connected) return;
		}

		getAccountsHandler(
			walletConnectProvider.wc.accounts,
			walletConnectProvider.wc.chainId
		);

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
				message: 'Connecting to WalletConnect'
			});
			return;
		}

		const web3 = new Web3(walletConnectProvider as any);
		const checksumAddresses = addresses.map((address: string) =>
			web3.utils.toChecksumAddress(address)
		);

		if (checksumAddresses.length === 0) {
			// setAccountsNotFound(true);
			setLoadingStatus({
				isLoading: false,
				message: ''
			});
			return;
		}

		setAccounts(
			checksumAddresses.map(
				(address: string): InjectedAccountWithMeta => {
					const account = {
						address: web3.utils.toChecksumAddress(address),
						meta: {
							genesisHash: null,
							name: 'walletConnect',
							source: 'walletConnect'
						}
					};

					return account;
				}
			)
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
		const ethereum = (window as any).ethereum;

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

		const addresses = await ethereum.request({
			method: 'eth_requestAccounts'
		});

		if (addresses.length === 0) {
			return;
		}

		const accounts = addresses.map(
			(address: string): InjectedAccountWithMeta => {
				const account = {
					address,
					meta: {
						genesisHash: null,
						name: 'metamask',
						source: 'metamask'
					}
				};
				return account;
			}
		);

		if (accounts && Array.isArray(accounts)) {
			const substrate_address = getSubstrateAddress(loginAddress);
			const index = accounts.findIndex(
				(account) =>
					(
						getSubstrateAddress(account?.address) || ''
					).toLowerCase() === (substrate_address || '').toLowerCase()
			);
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

		setLoadingStatus({
			isLoading: true,
			message: 'Waiting for confirmation'
		});

		if (walletConnectProvider?.wc.connected) {
			await walletConnectProvider.enable();
			web3 = new Web3(walletConnectProvider as any);

			if (
				walletConnectProvider.wc.chainId !==
				chainProperties[currentNetwork].chainId
			) {
				queueNotification({
					header: 'Wrong Network!',
					message: `Please change to ${currentNetwork} network`,
					status: NotificationStatus.ERROR
				});
				return;
			}
		}

		const voteContract = new web3.eth.Contract(abi, contractAddress);

		voteContract.methods
			.second(proposalId, seconds)
			.send({
				from: address,
				to: contractAddress
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
			<Button
				className="bg-pink_primary hover:bg-pink_secondary mb-10 text-lg text-white border-pink_primary hover:border-pink_primary rounded-lg flex items-center justify-center p-7 w-[90%] mx-auto"
				onClick={openModal}
			>
				Second
			</Button>
			<Modal
				title="Second Proposal"
				open={showModal}
				onCancel={() => setShowModal(false)}
				footer={[
					<Button
						className="bg-pink_primary text-white border-pink_primary hover:bg-pink_secondary my-1"
						key="second"
						loading={loadingStatus.isLoading}
						disabled={!apiReady}
						onClick={secondProposal}
					>
						Second
					</Button>
				]}
			>
				<Spin
					spinning={loadingStatus.isLoading}
					indicator={<LoadingOutlined />}
				>
					<AccountSelectionForm
						title="Endorse with account"
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
					image="/assets/referenda-endorse.png"
					title="Join Polkassembly to Endorse this proposal."
					subtitle="Discuss, contribute and get regular updates from Polkassembly."
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
