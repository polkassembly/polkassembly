// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { InjectedAccountWithMeta, InjectedWindow } from '@polkadot/extension-inject/types';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Button, Form, Modal, Segmented, Select, Spin, Alert } from 'antd';
import BN from 'bn.js';
import React, { useEffect, useMemo, useState } from 'react';
import { chainProperties } from 'src/global/networkConstants';
import { EVoteDecisionType, ILastVote, LoadingStatusType, NotificationStatus, Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import BalanceInput from 'src/ui-components/BalanceInput';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import Web3 from 'web3';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
import WalletButton from '~src/components/WalletButton';
import { useApiContext, useNetworkContext, usePostDataContext, useUserDetailsContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import addEthereumChain from '~src/util/addEthereumChain';
import LoginToVote from '../LoginToVoteOrEndorse';
import CastVoteIcon from '~assets/icons/cast-vote-icon.svg';
import LikeWhite from '~assets/icons/like-white.svg';
import LikeGray from '~assets/icons/like-gray.svg';
import DislikeWhite from '~assets/icons/dislike-white.svg';
import DislikeGray from '~assets/icons/dislike-gray.svg';

import CloseCross from '~assets/icons/close-cross-icon.svg';
import DownIcon from '~assets/icons/down-icon.svg';
import { poppins } from 'pages/_app';
import DelegationSuccessPopup from '~src/components/Listing/Tracks/DelegationSuccessPopup';
import dayjs from 'dayjs';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { getConvictionVoteOptions } from './VoteReferendum';
const ZERO_BN = new BN(0);

interface Props {
	className?: string;
	referendumId?: number | null | undefined;
	onAccountChange: (address: string) => void;
	lastVote: ILastVote | undefined;
	setLastVote: (pre: ILastVote) => void;
}

const abi = require('../../../../moonbeamAbi.json');

const contractAddress = process.env.NEXT_PUBLIC_DEMOCRACY_PRECOMPILE;

const VoteReferendum = ({ className, referendumId, onAccountChange, lastVote, setLastVote }: Props) => {
	const [showModal, setShowModal] = useState<boolean>(false);
	const userDetails = useUserDetailsContext();
	const { walletConnectProvider, setWalletConnectProvider, isLoggedOut, loginAddress } = userDetails;
	const [lockedBalance, setLockedBalance] = useState<BN | undefined>(undefined);
	const { apiReady, api } = useApiContext();
	const [address, setAddress] = useState<string>('');
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [isAccountLoading, setIsAccountLoading] = useState(false);
	const {
		setPostData,
		postData: { postType: proposalType }
	} = usePostDataContext();
	const { network } = useNetworkContext();
	const [wallet, setWallet] = useState<Wallet>();
	const [loginWallet, setLoginWallet] = useState<Wallet>();
	const [availableWallets, setAvailableWallets] = useState<any>({});
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const CONVICTIONS: [number, number][] = [1, 2, 4, 8, 16, 32].map((lock, index) => [index + 1, lock]);
	const [balanceErr, setBalanceErr] = useState('');
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [ayeNayForm] = Form.useForm();

	const [vote, setVote] = useState<EVoteDecisionType>(EVoteDecisionType.AYE);
	const [isMetamaskWallet, setIsMetamaskWallet] = useState<boolean>(false);
	const [isTalismanEthereum, setIsTalismanEthereum] = useState<boolean>(true);
	const [successModal, setSuccessModal] = useState(false);

	const convictionOpts = useMemo(() => {
		return getConvictionVoteOptions(CONVICTIONS, proposalType, api, apiReady, network);
	}, [CONVICTIONS, proposalType, api, apiReady, network]);

	const [conviction, setConviction] = useState<number>(0);

	const getWallet = () => {
		const injectedWindow = window as Window & InjectedWindow;
		setAvailableWallets(injectedWindow.injectedWeb3);
		setIsMetamaskWallet((injectedWindow as any)?.ethereum?.isMetaMask);
	};
	const handleDefaultWallet = async (wallet: Wallet) => {
		setWallet(wallet);
		await getAccounts(wallet);
		if (walletConnectProvider) {
			await getWalletConnectAccounts();
		}
	};

	useEffect(() => {
		if (userDetails.loginWallet && [Wallet.TALISMAN, Wallet.METAMASK].includes(userDetails.loginWallet)) {
			setLoginWallet(userDetails.loginWallet);
			setWallet(userDetails.loginWallet);
		} else {
			if (!window) return;
			const defaultWallet = localStorage.getItem('loginWallet') as Wallet;
			if (defaultWallet) {
				if (defaultWallet === Wallet.METAMASK) {
					setWallet(Wallet.METAMASK);
					handleDefaultWallet(Wallet.METAMASK);
				} else if (defaultWallet === Wallet.TALISMAN) {
					setWallet(Wallet.TALISMAN);
					handleDefaultWallet(Wallet.TALISMAN);
				}
				setLoginWallet(defaultWallet as Wallet);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiReady, userDetails]);

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
		const ethereum = wallet === Wallet.TALISMAN ? (window as any).talismanEth : (window as any).ethereum;

		if (!ethereum) {
			setIsAccountLoading(false);
			return;
		}

		try {
			await addEthereumChain({
				ethereum,
				network
			});
		} catch (error) {
			setIsAccountLoading(false);
			return;
		}

		const addresses = await ethereum.request({ method: 'eth_requestAccounts' });

		if (addresses.length === 0) {
			setIsAccountLoading(false);
			return;
		}
		wallet === Wallet.TALISMAN && addresses.filter((address: string) => address.slice(0, 2) === '0x').length === 0 ? setIsTalismanEthereum(false) : setIsTalismanEthereum(true);

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
		if (chainId !== chainProperties[network].chainId) {
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

		setAccounts(
			checksumAddresses.map((address: string): InjectedAccountWithMeta => {
				const account = {
					address: address.toLowerCase(),
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

		setIsAccountLoading(false);
	};

	const getWalletConnectAccounts = async () => {
		if (!walletConnectProvider?.wc.connected) {
			await connect();
			if (!walletConnectProvider?.connected) return;
		}

		getAccountsHandler(walletConnectProvider.wc.accounts, walletConnectProvider.wc.chainId);

		setIsAccountLoading(false);

		walletConnectProvider.wc.on('session_update', (error, payload) => {
			if (error) {
				console.error(error);
				return;
			}

			// updated accounts and chainId
			const { accounts: addresses, chainId } = payload.params[0];
			getAccountsHandler(addresses, Number(chainId));
		});
	};

	//const onBalanceChange = (balance: BN) => setLockedBalance(balance);

	const onBalanceChange = (balance: BN) => {
		if (!balance) return;
		else if (availableBalance.lte(balance)) {
			setBalanceErr('Insufficient balance.');
		} else {
			setBalanceErr('');
			setLockedBalance(balance);
		}
	};

	const handleOnBalanceChange = (balanceStr: string) => {
		let balance = ZERO_BN;

		try {
			balance = new BN(balanceStr);
		} catch (err) {
			console.log(err);
		}

		setAvailableBalance(balance);
	};

	const voteReferendum = async (aye: boolean) => {
		if (!referendumId && referendumId !== 0) {
			console.error('referendumId not set');
			return;
		}

		if (!isTalismanEthereum) {
			console.error('Please use Ethereum account via Talisman wallet.');
			return;
		}

		if (!lockedBalance) {
			console.error('lockedBalance not set');
			return;
		}
		if (availableBalance.lte(lockedBalance)) return;

		// const web3 = new Web3(process.env.REACT_APP_WS_PROVIDER || 'wss://wss.testnet.moonbeam.network');
		let web3 = null;
		let chainId = null;

		if (walletConnectProvider?.wc.connected) {
			await walletConnectProvider.enable();
			web3 = new Web3(walletConnectProvider as any);
			chainId = walletConnectProvider.wc.chainId;
		} else {
			web3 = new Web3(wallet === Wallet.TALISMAN ? (window as any).talismanEth : (window as any).ethereum);
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

		voteContract.methods
			.standard_vote(referendumId, aye, lockedBalance.toString(), conviction)
			.send({
				from: address,
				to: contractAddress
			})
			.then(() => {
				setLoadingStatus({ isLoading: false, message: '' });
				setLastVote({
					balance: lockedBalance,
					conviction: conviction,
					decision: vote,
					time: new Date()
				});
				setShowModal(false);
				setSuccessModal(true);
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
	};

	if (isLoggedOut()) {
		return <LoginToVote />;
	}
	const openModal = () => {
		setShowModal(true);
	};

	const ConvictionSelect = ({ className }: { className?: string }) => (
		<Form.Item className={className}>
			<label className='inner-headings'>Vote lock</label>

			<Select
				onChange={(key) => setConviction(Number(key))}
				size='large'
				className='rounded-[4px]'
				defaultValue={conviction}
				suffixIcon={<DownIcon />}
			>
				{convictionOpts}
			</Select>
		</Form.Item>
	);

	const handleWalletClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) => {
		setLoadingStatus({ ...loadingStatus, isLoading: true });
		event.preventDefault();
		setWallet(wallet);
		await getAccounts(wallet);
		if (walletConnectProvider) {
			await getWalletConnectAccounts();
		}
		setLoadingStatus({ ...loadingStatus, isLoading: false });
	};

	// eslint-disable-next-line react-hooks/rules-of-hooks
	useEffect(() => {
		getWallet();
		if (!loginWallet) return;
		if (loginWallet === Wallet.METAMASK) {
			setWallet(Wallet.METAMASK);
			handleDefaultWallet(Wallet.METAMASK);
		} else if (loginWallet === Wallet.TALISMAN) {
			setWallet(Wallet.TALISMAN);
			handleDefaultWallet(Wallet.TALISMAN);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginWallet]);

	const decisionOptions = [
		{
			label: (
				<div className={`ml-1 mr-1 h-[32px] w-full rounded-[4px] text-[#576D8B] ${vote === 'aye' ? 'bg-[#2ED47A] text-white' : ''}`}>
					{vote === EVoteDecisionType.AYE ? <LikeWhite className='mb-[3px] mr-2' /> : <LikeGray className='mb-[3px] mr-2' />}
					<span className='font-medium'>Aye</span>
				</div>
			),
			value: 'aye'
		},
		{
			label: (
				<div className={` ml-1 mr-1 h-[32px] w-full rounded-[4px] text-[#576D8B] ${vote === 'nay' ? 'bg-[#F53C3C] text-white' : ''}`}>
					{vote === EVoteDecisionType.NAY ? <DislikeWhite className='mr-2  ' /> : <DislikeGray className='mr-2' />} <span className='font-medium'>Nay</span>
				</div>
			),
			value: 'nay'
		}
	];

	return (
		<div className={className}>
			<Button
				className='mb-3 flex w-[100%] items-center justify-center rounded-[4px] border-pink_primary bg-pink_primary p-6 text-lg text-white hover:border-pink_primary hover:bg-pink_secondary'
				onClick={openModal}
			>
				{lastVote === undefined ? 'Cast Vote Now' : 'Cast Vote Again'}
			</Button>
			<Modal
				open={showModal}
				onCancel={() => setShowModal(false)}
				footer={false}
				className={`alignment-close max-h-[675px] w-[550px] rounded-[6px] max-md:w-full ${poppins.className} ${poppins.variable}`}
				closeIcon={<CloseCross />}
				title={
					<div className='-mt-5 ml-[-24px] mr-[-24px] flex h-[65px] items-center justify-center gap-2 rounded-t-[6px] border-0 border-b-[1.2px] border-solid border-[#D2D8E0]'>
						<CastVoteIcon className='mt-1' />
						<span className='text-xl font-semibold tracking-[0.0015em] text-[#243A57]'>Cast Your Vote</span>
					</div>
				}
			>
				<>
					<Spin
						spinning={loadingStatus.isLoading || isAccountLoading}
						indicator={<LoadingOutlined />}
					>
						<div className='mt-3 flex items-center justify-center text-sm font-normal text-[#485F7D]'>Select a wallet</div>
						<div className='mb-[24px] mt-1 flex items-center justify-center gap-x-5'>
							{availableWallets[Wallet.TALISMAN] && (
								<WalletButton
									className={`${wallet === Wallet.TALISMAN ? 'h-[48px] w-[64px] border  border-solid border-pink_primary' : 'h-[48px] w-[64px]'}`}
									disabled={!apiReady}
									onClick={(event) => handleWalletClick(event as any, Wallet.TALISMAN)}
									name='Talisman'
									icon={
										<WalletIcon
											which={Wallet.TALISMAN}
											className='h-6 w-6'
										/>
									}
								/>
							)}
							{isMetamaskWallet && (
								<WalletButton
									className={`${wallet === Wallet.METAMASK ? 'h-[48px] w-[64px] border  border-solid border-pink_primary' : 'h-[48px] w-[64px]'}`}
									disabled={!apiReady}
									onClick={(event) => handleWalletClick(event as any, Wallet.METAMASK)}
									name='MetaMask'
									icon={
										<WalletIcon
											which={Wallet.METAMASK}
											className='h-6 w-6'
										/>
									}
								/>
							)}
						</div>

						{!isTalismanEthereum && (
							<Alert
								message='Please use Ethereum account via Talisman wallet.'
								type='info'
							/>
						)}
						{balanceErr.length > 0 && wallet && (
							<Alert
								type='error'
								message={balanceErr}
								showIcon
								className='mb-4 h-10 rounded-[4px]'
							/>
						)}
						{accounts.length === 0 && wallet && !loadingStatus.isLoading && (
							<Alert
								message='No addresses found in the address selection tab.'
								showIcon
								type='info'
							/>
						)}

						{accounts.length > 0 ? (
							<AccountSelectionForm
								title='Vote with Account'
								accounts={accounts}
								address={address}
								withBalance
								onAccountChange={onAccountChange}
								onBalanceChange={handleOnBalanceChange}
								className={'mb-[21px] text-sidebarBlue'}
								inputClassName='rounded-[4px] px-3 py-1 h-[40px]'
								withoutInfo={true}
							/>
						) : !wallet ? (
							<Alert
								message='Please select a wallet.'
								showIcon
								type='info'
							/>
						) : null}
						<h3 className='inner-headings mb-[2px] mt-6'>Choose your vote</h3>
						<Segmented
							block
							className={'mb-6 w-full rounded-[4px] border-[1px] border-solid border-[#D2D8E0] bg-white hover:bg-white'}
							size='large'
							value={vote}
							onChange={(value) => {
								setVote(value as EVoteDecisionType);
								ayeNayForm.setFieldValue('balance', ZERO_BN);
							}}
							options={decisionOptions}
							disabled={!apiReady}
						/>
						{
							<Form
								form={ayeNayForm}
								name='aye-nay-form'
								onFinish={async () => {
									vote === EVoteDecisionType.AYE && (await voteReferendum(true));
									vote === EVoteDecisionType.NAY && (await voteReferendum(false));
								}}
							>
								<BalanceInput
									label={'Lock balance'}
									helpText={'Amount of you are willing to lock for this vote.'}
									placeholder={'Add Balance'}
									onChange={onBalanceChange}
									inputClassName='text-[#7c899b] text-sm'
								/>
								<ConvictionSelect className={`${className}`} />

								<div className='ml-[-24px] mr-[-24px] mt-[-1px] flex justify-end border-0 border-t-[1.5px] border-solid border-[#D2D8E0] pt-5'>
									<Button
										className='mr-[15px] h-[40px] w-[134px] rounded-[4px] border-[#E5007A] bg-[white] font-semibold text-[#E5007A]'
										onClick={() => setShowModal(false)}
									>
										Cancel
									</Button>
									<Button
										className={`mr-[24px] h-[40px] w-[134px] rounded-[4px] border-0 bg-[#E5007A] font-semibold text-[white] ${(!lockedBalance || !wallet) && 'opacity-50'}`}
										htmlType='submit'
										disabled={!lockedBalance || !wallet}
									>
										Confirm
									</Button>
								</div>
							</Form>
						}
					</Spin>
				</>
			</Modal>
			<DelegationSuccessPopup
				title='Voted Successfully'
				vote={vote}
				isVote={true}
				balance={lockedBalance}
				open={successModal}
				setOpen={setSuccessModal}
				address={address}
				isDelegate={true}
				conviction={conviction}
				votedAt={dayjs().format('HH:mm, Do MMMM YYYY')}
			/>
		</div>
	);
};

export default styled(VoteReferendum)`
	.LoaderWrapper {
		height: 40rem;
		position: absolute;
		width: 100%;
	}

	.vote-form-cont {
		padding: 12px;
	}
	.alignment-close .ant-select-selector {
		border: 1px soild !important;
		border-color: #d2d8e0 !important;
		height: 40px;
		border-radius: 4px !important;
	}

	.alignment-close .ant-select-selection-item {
		font-style: normal !important;
		font-weight: 400 !important;
		font-size: 14px !important;
		display: flex;
		align-items: center;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
		color: #243a57 !important;
	}

	.alignment-close .ant-input-number-in-from-item {
		height: 39.85px !important;
	}

	.alignment-close .ant-segmented-item-label {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 32px !important;
		border-radius: 4px !important;
		padding-right: 0px !important;
		padding-left: 0px !important;
	}
	.alignment-close .ant-segmented {
		padding: 0px !important;
	}

	.alignment-close .ant-select-selection-item {
		color: #243a57 !important;
	}
	.alignment-close .ant-select-focused {
		border: 1px solid #e5007a !important;
		border-radius: 4px !important;
	}
	.alignment-close .ant-segmented-item-selected {
		box-shadow: none !important;
		padding-right: 0px !important;
	}
	.alignment-close .ant-segmented-item {
		padding: 0px !important;
	}

	.alignment-close .ant-modal-close {
		margin-top: 4px;
	}
	.alignment-close .ant-modal-close:hover {
		margin-top: 4px;
	}
`;
