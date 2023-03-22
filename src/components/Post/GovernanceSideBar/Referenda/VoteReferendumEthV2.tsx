// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Button, Form, Modal, Select, Spin } from 'antd';
import BN from 'bn.js';
import React, { useEffect, useMemo,useState } from 'react';
import { chainProperties } from 'src/global/networkConstants';
import { LoadingStatusType,NotificationStatus, Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import BalanceInput from 'src/ui-components/BalanceInput';
import HelperTooltip from 'src/ui-components/HelperTooltip';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import Web3 from 'web3';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
import WalletButton from '~src/components/WalletButton';
import { useApiContext, useNetworkContext, usePostDataContext, useUserDetailsContext } from '~src/context';

import { ProposalType } from '~src/global/proposalType';
import FilteredError from '~src/ui-components/FilteredError';
import addEthereumChain from '~src/util/addEthereumChain';
import { oneEnactmentPeriodInDays } from '~src/util/oneEnactmentPeriodInDays';

import AyeNayButtons from '../../../../ui-components/AyeNayButtons';
import LoginToVote from '../LoginToVoteOrEndorse';

interface Props {
	className?: string
	referendumId?: number | null | undefined
	onAccountChange: (address: string) => void
	lastVote: string | null | undefined
	setLastVote: React.Dispatch<React.SetStateAction<string | null | undefined>>
}

const abi = require('../../../../moonbeamConvictionVoting.json');

const contractAddress = process.env.NEXT_PUBLIC_CONVICTION_VOTING_PRECOMPILE;

const VoteReferendumEthV2 = ({ className, referendumId, onAccountChange, lastVote, setLastVote }: Props) => {
	const [showModal, setShowModal] = useState<boolean>(false);
	const { walletConnectProvider, setWalletConnectProvider, isLoggedOut } = useUserDetailsContext();
	const [lockedBalance, setLockedBalance] = useState<BN | undefined>(undefined);
	const { apiReady } = useApiContext();
	const [address, setAddress] = useState<string>('');
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [isAccountLoading, setIsAccountLoading] = useState(false);
	const { network } = useNetworkContext();
	const { setPostData } = usePostDataContext();
	const [fetchAccountsInfo, setFetchAccountsInfo] = useState(true);
	const [wallet, setWallet] = useState<Wallet>();
	const [isAye, setIsAye] = useState(false);

	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const CONVICTIONS: [number, number][] = [1, 2, 4, 8, 16, 32].map((lock, index) => [index + 1, lock]);

	const convictionOpts = useMemo(() => [
		<Select.Option key={0} value={0}>{'0.1x voting balance, no lockup period'}</Select.Option>,
		...CONVICTIONS.map(([value, lock]) =>
			<Select.Option key={value} value={value}>{`${value}x voting balance, locked for ${lock * oneEnactmentPeriodInDays[network]} days`}</Select.Option>
		)
	],[CONVICTIONS, network]);

	const [conviction, setConviction] = useState<number>(0);

	useEffect(() => {
		setPostData((prev) => {
			return {
				...prev,
				postType: ProposalType.REFERENDUMS
			};
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const getAccounts = async (wallet: Wallet) => {
		setAccounts([]);
		setAddress('');
		setIsAccountLoading(true);
		const ethereum = wallet === Wallet.TALISMAN? (window as any).talismanEth : (window as any).ethereum;

		if (!ethereum) {
			return;
		}

		if (wallet === Wallet.METAMASK) {
			try {
				await addEthereumChain({
					ethereum,
					network
				});
			} catch (error) {
				return;
			}
		}

		const addresses = await ethereum.request({ method: 'eth_requestAccounts' });

		if (addresses.length === 0) {
			setIsAccountLoading(false);
			return;
		}

		setAccounts(addresses.map((address: string): InjectedAccountWithMeta => {
			const account = {
				address,
				meta: {
					genesisHash: null,
					name: 'metamask',
					source: 'metamask'
				}
			};

			return account;
		}));

		if (addresses.length > 0) {
			setAddress(addresses[0]);
		}

		setIsAccountLoading(false);
	};

	const connect = async () => {
		setIsAccountLoading(true);

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

	const getAccountsHandler = async (addresses: string[], chainId: number) => {

		if(chainId !== chainProperties[network].chainId) {
			// setErr(new Error(`Please login using the ${NETWORK} network`));
			// setAccountsNotFound(true);
			setIsAccountLoading(false);
			return;
		}

		const checksumAddresses = addresses.map((address: string) => address);

		if (checksumAddresses.length === 0) {
			// setAccountsNotFound(true);
			setIsAccountLoading(false);
			return;
		}

		setAccounts(checksumAddresses.map((address: string): InjectedAccountWithMeta => {
			const account = {
				address: address.toLowerCase(),
				meta: {
					genesisHash: null,
					name: 'walletConnect',
					source: 'walletConnect'
				}
			};

			return account;
		}));

		if (checksumAddresses.length > 0) {
			setAddress(checksumAddresses[0]);
		}

		setIsAccountLoading(false);
	};

	const getWalletConnectAccounts = async () => {
		if(!walletConnectProvider?.wc.connected) {
			await connect();
			if(!walletConnectProvider?.connected) return;
		}

		getAccountsHandler(walletConnectProvider.wc.accounts, walletConnectProvider.wc.chainId);

		setIsAccountLoading(false);

		walletConnectProvider.wc.on('session_update', (error, payload) => {
			if (error) {
				console.error(error);
				return;
			}

			// updated accounts and chainId
			const { accounts:addresses, chainId } = payload.params[0];
			getAccountsHandler(addresses, Number(chainId));
		});
	};

	const onConvictionChange = (value: any) => {
		setConviction(Number(value));
	};

	const onBalanceChange = (balance: BN) => setLockedBalance(balance);

	const voteReferendum = async (aye: boolean) => {
		if (!referendumId && referendumId !== 0) {
			console.error('referendumId not set');
			return;
		}

		if (!lockedBalance) {
			console.error('lockedBalance not set');
			return;
		}

		// const web3 = new Web3(process.env.REACT_APP_WS_PROVIDER || 'wss://wss.testnet.moonbeam.network');
		let web3 = null;
		let chainId = null;

		if(walletConnectProvider?.wc.connected) {
			await walletConnectProvider.enable();
			web3 = new Web3((walletConnectProvider as any));
			chainId = walletConnectProvider.wc.chainId;
		}else {
			web3 = new Web3(wallet === Wallet.TALISMAN? (window as any).talismanEth : (window as any).ethereum);
			chainId = await web3.eth.net.getId();
		}

		if (chainId !== chainProperties[network].chainId) {
			queueNotification({
				header: 'Wrong Network!',
				message: `Please change to ${network} network`,
				status: NotificationStatus.ERROR
			});
			return;
		}

		setLoadingStatus({ isLoading: true, message: 'Waiting for confirmation' });

		const voteContract = new web3.eth.Contract(abi, contractAddress);

		// estimate gas.
		//https://docs.moonbeam.network/builders/interact/eth-libraries/deploy-contract/#interacting-with-the-contract-send-methods

		if(aye){
			voteContract.methods
				.voteYes(
					referendumId,
					lockedBalance.toString(),
					conviction
				)
				.send({
					from: address,
					to: contractAddress
				})
				.then(() => {
					setLoadingStatus({ isLoading: false, message: '' });
					setLastVote('aye');
					queueNotification({
						header: 'Success!',
						message: `Vote on referendum #${referendumId} successful.`,
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
		}
		else{
			voteContract.methods
				.voteNo(
					referendumId,
					lockedBalance.toString(),
					conviction
				)
				.send({
					from: address,
					to: contractAddress
				})
				.then(() => {
					setLoadingStatus({ isLoading: false, message: '' });
					setLastVote('nay');
					queueNotification({
						header: 'Success!',
						message: `Vote on referendum #${referendumId} successful.`,
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
		}

	};

	if (isLoggedOut()) {
		return <LoginToVote />;
	}
	const openModal = () => {
		setShowModal(true);
	};

	const VoteLock = ({ className }: { className?:string }) =>
		<Form.Item className={className}>
			<label  className='mb-3 flex items-center text-sm text-sidebarBlue'>
				Vote lock
				<HelperTooltip className='ml-2' text='You can multiply your votes by locking your tokens for longer periods of time.' />
			</label>

			<Select onChange={onConvictionChange} size='large' className='rounded-md text-sm text-sidebarBlue p-1 w-full' defaultValue={conviction}>
				{convictionOpts}
			</Select>
		</Form.Item>;

	const handleWalletClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) => {
		event.preventDefault();
		setWallet(wallet);
		await getAccounts(wallet);
		if (walletConnectProvider) {
			await getWalletConnectAccounts();
		}
	};

	return (
		<div className={className}>
			<Button
				className='bg-pink_primary hover:bg-pink_secondary text-lg mb-3 text-white border-pink_primary hover:border-pink_primary rounded-lg flex items-center justify-center p-7 w-[95%]'
				onClick={openModal}
			>
				{lastVote == null || lastVote == undefined  ? 'Cast Vote Now' : 'Cast Vote Again' }
			</Button>
			<Modal
				open={showModal}
				onCancel={() => setShowModal(false)}
				closable={!fetchAccountsInfo}
				footer={
					fetchAccountsInfo?
						<div className='flex items-center justify-end'>
							{
								[
									<Button
										key='got-it'
										icon={<CheckOutlined />}
										className='bg-pink_primary text-white outline-none border border-pink_primary border-solid rounded-md py-3 px-7 font-medium text-lg leading-none flex items-center justify-center'
										onClick={() => {
											setFetchAccountsInfo(false);
										}}
									>
										Got it!
									</Button>,
									<Button
										key="cancel"
										onClick={() => setShowModal(false)}
										className='bg-white text-pink_primary outline-none border border-pink_primary border-solid rounded-md py-3 px-7 font-medium text-lg leading-none flex items-center justify-center'
									>
										Cancel
									</Button>
								]
							}
						</div>
						: null
				}
			>
				{
					fetchAccountsInfo?
						<div className='max-w-[600px]'>
							<p>
						For fetching your addresses, Polkassembly needs access to your wallet extensions. Please authorize this transaction.
							</p>
						</div>
						: <>
							<Spin spinning={loadingStatus.isLoading || isAccountLoading} indicator={<LoadingOutlined />}>
								<Form onFinish={async () => {
									await voteReferendum(isAye);
								}}>
									<h4 className='dashboard-heading mb-7'>Cast Your Vote</h4>
									<BalanceInput
										label={'Lock balance'}
										helpText={'Amount of you are willing to lock for this vote.'}
										placeholder={'123'}
										onChange={onBalanceChange}
									/>

									{
										accounts.length > 0?
											<AccountSelectionForm
												title='Vote with Account'
												accounts={accounts}
												address={address}
												withBalance
												onAccountChange={onAccountChange}
											/>
											: !wallet? <FilteredError text='Please select a wallet.' />: null
									}
									<div className='flex items-center justify-center gap-x-5 mt-5'>
										<WalletButton className={`${wallet === Wallet.TALISMAN? 'border border-solid border-pink_primary': ''}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.TALISMAN)} name="Talisman" icon={<WalletIcon which={Wallet.TALISMAN} className='h-6 w-6'  />} />
										<WalletButton className={`${wallet === Wallet.METAMASK? 'border border-solid border-pink_primary': ''}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.METAMASK)} name="MetaMask" icon={<WalletIcon which={Wallet.METAMASK} className='h-6 w-6' />} />
									</div>

									<VoteLock className='mt-6' />

									<AyeNayButtons
										className='mt-6 max-w-[156px]'
										size='large'
										disabled={!apiReady}
										onClickAye={() => setIsAye(true)}
										onClickNay={() => setIsAye(false)}
									/>
								</Form>
							</Spin>
						</>
				}
			</Modal>
		</div>
	);
};

export default styled(VoteReferendumEthV2)`
	.LoaderWrapper {
		height: 40rem;
		position: absolute;
		width: 100%;
	}

	.vote-form-cont {
		padding: 12px;
	}
`;
