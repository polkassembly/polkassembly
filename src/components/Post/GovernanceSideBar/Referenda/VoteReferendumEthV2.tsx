// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined, StopOutlined } from '@ant-design/icons';
import { InjectedAccountWithMeta, InjectedWindow } from '@polkadot/extension-inject/types';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Button, Form, Modal, Segmented, Spin, Alert } from 'antd';
import BN from 'bn.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { chainProperties } from 'src/global/networkConstants';
import { EVoteDecisionType, ILastVote, LoadingStatusType, NotificationStatus, Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import Web3 from 'web3';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
import WalletButton from '~src/components/WalletButton';
import { useApiContext, useNetworkContext, usePostDataContext, useUserDetailsContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import LoginToVote from '../LoginToVoteOrEndorse';
import { poppins } from 'pages/_app';
import DelegationSuccessPopup from '~src/components/Listing/Tracks/DelegationSuccessPopup';
import dayjs from 'dayjs';
import { getConvictionVoteOptions } from './VoteReferendum';
import VotingForm, { EFormType } from './VotingFrom';
import getMetamaskAccounts from '~src/util/getMetamaskAccounts';
import CastVoteIcon from '~assets/icons/cast-vote-icon.svg';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import LikeGray from '~assets/icons/like-gray.svg';
import DislikeWhite from '~assets/icons/dislike-white.svg';
import DislikeGray from '~assets/icons/dislike-gray.svg';
import SplitWhite from '~assets/icons/split-white.svg';
import SplitGray from '~assets/icons/split-gray.svg';
import CloseCross from '~assets/icons/close-cross-icon.svg';
import LikeWhite from '~assets/icons/like-white.svg';

const ZERO_BN = new BN(0);

interface Props {
	className?: string;
	referendumId?: number | null | undefined;
	onAccountChange: (address: string) => void;
	lastVote: ILastVote | undefined;
	setLastVote: (pre: ILastVote) => void;
}

const abi = require('../../../../moonbeamConvictionVoting.json');

const contractAddress = process.env.NEXT_PUBLIC_CONVICTION_VOTING_PRECOMPILE;

const VoteReferendumEthV2 = ({ className, referendumId, onAccountChange, lastVote, setLastVote }: Props) => {
	const [showModal, setShowModal] = useState<boolean>(false);
	const { walletConnectProvider, setWalletConnectProvider, isLoggedOut, loginAddress, loginWallet } = useUserDetailsContext();
	const [lockedBalance, setLockedBalance] = useState<BN>(ZERO_BN);
	const { apiReady, api } = useApiContext();
	const [address, setAddress] = useState<string>('');
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [isAccountLoading, setIsAccountLoading] = useState(false);
	const { network } = useNetworkContext();
	const {
		setPostData,
		postData: { postType: proposalType }
	} = usePostDataContext();
	const [wallet, setWallet] = useState<Wallet>();
	const [availableWallets, setAvailableWallets] = useState<any>({});
	const [isMetamaskWallet, setIsMetamaskWallet] = useState<boolean>(false);
	const [isTalismanEthereum, setIsTalismanEthereum] = useState<boolean>(true);
	const [voteValues, setVoteValues] = useState({ abstainVoteValue: ZERO_BN, ayeVoteValue: ZERO_BN, nayVoteValue: ZERO_BN, totalVoteValue: ZERO_BN });

	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const CONVICTIONS: [number, number][] = [1, 2, 4, 8, 16, 32].map((lock, index) => [index + 1, lock]);

	const convictionOpts = useMemo(() => {
		return getConvictionVoteOptions(CONVICTIONS, proposalType, api, apiReady, network);
	}, [CONVICTIONS, proposalType, api, apiReady, network]);

	const [conviction, setConviction] = useState<number>(0);
	const [splitForm] = Form.useForm();
	const [abstainFrom] = Form.useForm();
	const [ayeNayForm] = Form.useForm();
	const [abstainVoteValue, setAbstainVoteValue] = useState<BN>(ZERO_BN);
	const [ayeVoteValue, setAyeVoteValue] = useState<BN>(ZERO_BN);
	const [nayVoteValue, setNayVoteValue] = useState<BN>(ZERO_BN);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [vote, setVote] = useState<EVoteDecisionType>(EVoteDecisionType.AYE);
	const [successModal, setSuccessModal] = useState(false);
	const [isBalanceErr, setIsBalanceErr] = useState<boolean>(false);

	const getWallet = () => {
		const injectedWindow = window as Window & InjectedWindow;
		setAvailableWallets(injectedWindow.injectedWeb3);
		setIsMetamaskWallet((injectedWindow as any)?.ethereum?.isMetaMask);
	};

	const handleBalanceErr = useCallback(() => {
		switch (vote) {
			case EVoteDecisionType.AYE:
				lockedBalance && setIsBalanceErr(availableBalance?.lte(lockedBalance));
				break;
			case EVoteDecisionType.NAY:
				lockedBalance && setIsBalanceErr(availableBalance?.lte(lockedBalance));
				break;
			case EVoteDecisionType.SPLIT:
				setIsBalanceErr(availableBalance?.lte(nayVoteValue.add(ayeVoteValue)));
				break;
			case EVoteDecisionType.ABSTAIN:
				setIsBalanceErr(availableBalance?.lte(nayVoteValue.add(ayeVoteValue).add(abstainVoteValue)));
				break;
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [availableBalance, lockedBalance, nayVoteValue, ayeVoteValue, abstainVoteValue]);

	const handleDefaultWallet = async (wallet: Wallet) => {
		setWallet(wallet);
		setLoadingStatus({ isLoading: true, message: 'Getting accounts' });
		const accountsData = await getMetamaskAccounts({ chosenWallet: wallet, loginAddress, network });
		if (accountsData) {
			setAccounts(accountsData?.accounts || []);
			onAccountChange(accountsData?.account || '');
			setAddress(accountsData.account);
			setIsTalismanEthereum(accountsData?.isTalismanEthereum);
			setLoadingStatus({ isLoading: false, message: 'Getting accounts' });
		}
		if (walletConnectProvider) {
			await getWalletConnectAccounts();
		}
	};

	useEffect(() => {
		getWallet();
		const wallet = loginWallet || (localStorage.getItem('loginWallet') as Wallet);
		if ([Wallet.TALISMAN, Wallet.METAMASK].includes(wallet)) {
			if (!window) return;
			setWallet(wallet);
			handleDefaultWallet(wallet);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiReady, loginWallet]);

	useEffect(() => {
		handleBalanceErr();
	}, [handleBalanceErr]);

	useEffect(() => {
		setPostData((prev) => {
			return {
				...prev,
				postType: ProposalType.REFERENDUM_V2
			};
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleModalReset = () => {
		setAbstainVoteValue(ZERO_BN);
		setAyeVoteValue(ZERO_BN);
		setNayVoteValue(ZERO_BN);
		setLockedBalance(ZERO_BN);
		ayeNayForm.setFieldValue('balance', '');
		splitForm.setFieldValue('ayeVote', '');
		splitForm.setFieldValue('nayVote', '');
		abstainFrom.setFieldValue('ayeVote', '');
		abstainFrom.setFieldValue('nayVote', '');
		abstainFrom.setFieldValue('abstainVote', '');
		setLoadingStatus({ isLoading: false, message: '' });
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

	const handleLastVoteSave = (vote: EVoteDecisionType, totalVoteValue: BN) => {
		switch (vote) {
			case EVoteDecisionType.AYE:
				setLastVote({
					balance: totalVoteValue,
					conviction: conviction,
					decision: vote,
					time: new Date()
				});
				break;
			case EVoteDecisionType.NAY:
				setLastVote({
					balance: totalVoteValue,
					conviction: conviction,
					decision: vote,
					time: new Date()
				});
				break;
			case EVoteDecisionType.SPLIT:
				setVoteValues((prevState) => ({
					...prevState,
					ayeVoteValue: ayeVoteValue,
					nayVoteValue: nayVoteValue
				}));
				setLastVote({
					balance: totalVoteValue,
					conviction: conviction,
					decision: vote,
					time: new Date()
				});
				break;
			case EVoteDecisionType.ABSTAIN:
				setVoteValues((prevState) => ({
					...prevState,
					abstainVoteValue: abstainVoteValue,
					ayeVoteValue: ayeVoteValue,
					nayVoteValue: nayVoteValue
				}));
				setLastVote({
					balance: totalVoteValue,
					conviction: conviction,
					decision: vote,
					time: new Date()
				});
				break;
		}
	};

	const handleSubmit = async () => {
		if (!isTalismanEthereum) {
			console.error('Please use Ethereum account via Talisman wallet.');
			return;
		}

		const totalVoteValue = new BN(ayeVoteValue || ZERO_BN)
			.add(nayVoteValue || ZERO_BN)
			?.add(abstainVoteValue || ZERO_BN)
			.add(lockedBalance || ZERO_BN);
		setVoteValues((prevState) => ({
			...prevState,
			totalVoteValue
		}));

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

		let tx;
		if (vote === EVoteDecisionType.AYE) {
			tx = voteContract.methods.voteYes(referendumId, lockedBalance.toString(), conviction);
		} else if (vote === EVoteDecisionType.NAY) {
			tx = voteContract.methods.voteNo(referendumId, lockedBalance.toString(), conviction);
		} else if (vote === EVoteDecisionType.SPLIT) {
			tx = voteContract.methods.voteSplit(referendumId, ayeVoteValue?.toString(), nayVoteValue?.toString());
		} else if (vote === EVoteDecisionType.ABSTAIN) {
			tx = voteContract.methods.voteSplitAbstain(referendumId, ayeVoteValue?.toString(), nayVoteValue?.toString(), abstainVoteValue?.toString());
		}

		tx.send({
			from: address,
			to: contractAddress
		})
			.on('transactionHash', (hash: string) => {
				setLoadingStatus({ isLoading: true, message: `Transaction hash ${hash.slice(0, 10)}...` });
				console.log('transactionHash', hash);
			})
			.then(() => {
				setLoadingStatus({ isLoading: false, message: 'Transaction is in progress!' });
				handleLastVoteSave(vote, totalVoteValue);
				setShowModal(false);
				setSuccessModal(true);
				queueNotification({
					header: 'Success!',
					message: `Vote on referendum #${referendumId} successful.`,
					status: NotificationStatus.SUCCESS
				});
			})
			.catch((error: any) => {
				setLoadingStatus({ isLoading: false, message: 'Transaction failed!' });
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

	const handleWalletClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) => {
		setLoadingStatus({ ...loadingStatus, isLoading: true });
		event.preventDefault();
		setWallet(wallet);
		setAccounts([]);
		setAddress('');
		const accountsData = await getMetamaskAccounts({ chosenWallet: wallet, loginAddress, network });
		if (accountsData) {
			setAccounts(accountsData?.accounts || []);
			setAddress(accountsData.account);
			onAccountChange(accountsData?.account || '');
			setIsTalismanEthereum(accountsData?.isTalismanEthereum);
		}
		if (walletConnectProvider) {
			await getWalletConnectAccounts();
		}
		setLoadingStatus({ ...loadingStatus, isLoading: false });
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

	const ayeNayVotesArr = [
		{
			label: (
				<div
					className={`ml-1 mr-1 flex h-[32px] w-full items-center justify-center rounded-[4px] text-[#576D8B] ${vote === EVoteDecisionType.AYE ? 'bg-[#2ED47A] text-white' : ''}`}
				>
					{vote === EVoteDecisionType.AYE ? <LikeWhite className='mb-[3px] mr-2' /> : <LikeGray className='mb-[3px] mr-2' />}
					<span className='text-base font-medium'>Aye</span>
				</div>
			),
			value: 'aye'
		},
		{
			label: (
				<div
					className={`ml-1 mr-1 flex h-[32px] w-full items-center justify-center rounded-[4px] text-[#576D8B] ${vote === EVoteDecisionType.NAY ? 'bg-[#F53C3C] text-white' : ''}`}
				>
					{vote === EVoteDecisionType.NAY ? <DislikeWhite className='mr-2  ' /> : <DislikeGray className='mr-2' />} <span className='text-base font-medium'>Nay</span>
				</div>
			),
			value: 'nay'
		}
	];

	const decisionOptions = isOpenGovSupported(network)
		? [
				...ayeNayVotesArr,
				{
					label: (
						<div
							className={`flex h-[32px] w-[126px] items-center  justify-center rounded-[4px] text-[#576D8B] ${vote === EVoteDecisionType.SPLIT ? 'bg-[#FFBF60] text-white' : ''}`}
						>
							{' '}
							{vote === EVoteDecisionType.SPLIT ? <SplitWhite className='mr-2  ' /> : <SplitGray className='mr-2' />} <span className='text-base font-medium'>Split</span>{' '}
						</div>
					),
					value: 'split'
				},
				{
					label: (
						<div
							className={` ml-2 flex h-[32px] w-[126px] items-center  justify-center rounded-[4px] text-[#576D8B] ${
								vote === EVoteDecisionType.ABSTAIN ? 'bg-[#407BFF] text-white' : ''
							}`}
						>
							<StopOutlined className='mb-[3px] mr-2' /> <span className='text-base font-medium'>Abstain</span>
						</div>
					),
					value: 'abstain'
				}
		  ]
		: ayeNayVotesArr;

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
				onCancel={() => {
					setShowModal(false);
					handleModalReset();
				}}
				footer={false}
				className={`alignment-close max-h-[675px] w-[550px] rounded-[6px] max-md:w-full ${poppins.className} ${poppins.variable}`}
				closeIcon={<CloseCross />}
				wrapClassName={className}
				title={
					<div className='-mt-5 ml-[-24px] mr-[-24px] flex h-[65px] items-center justify-center gap-2 rounded-t-[6px] border-0 border-b-[1.2px] border-solid border-[#D2D8E0]'>
						<CastVoteIcon className='mt-1' />
						<span className='text-xl font-semibold tracking-[0.0015em] text-bodyBlue'>Cast Your Vote</span>
					</div>
				}
			>
				{' '}
				<>
					<Spin
						spinning={loadingStatus.isLoading || isAccountLoading}
						indicator={<LoadingOutlined />}
						tip={loadingStatus.message}
					>
						<div className='text-light mt-3 flex items-center justify-center text-sm font-normal'>Select a wallet</div>

						<div className='mb-[24px] mt-1 flex items-center justify-center gap-x-5'>
							{availableWallets[Wallet.TALISMAN] && (
								<WalletButton
									className={`${wallet === Wallet.TALISMAN ? 'h-[48px] w-[64px] border  border-solid border-pink_primary' : 'h-[48px] w-[64px]'}`}
									disabled={!apiReady || !api}
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
									disabled={!apiReady || !api}
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
								className='-mt-2 mb-2'
								showIcon
							/>
						)}

						{isBalanceErr && !loadingStatus.isLoading && wallet && (
							<Alert
								type='info'
								message='Insufficient balance.'
								showIcon
								className='mb-4 rounded-[4px]'
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
								isTruncateUsername={false}
								title='Vote with Account'
								accounts={accounts}
								address={address}
								withBalance
								onAccountChange={onAccountChange}
								onBalanceChange={handleOnBalanceChange}
								className={`${poppins.variable} ${poppins.className} text-light text-sm font-normal`}
								inputClassName='rounded-[4px] px-3 py-1 h-[40px]'
								withoutInfo={true}
							/>
						) : !wallet ? (
							<Alert
								type='info'
								message='Please select a wallet.'
								className='rounded-[4px]'
								showIcon
							/>
						) : null}

						<h3 className='inner-headings mb-[2px] mt-6'>Choose your vote</h3>
						<Segmented
							block
							className={`${className}  mb-6 w-full rounded-[4px] border-[1px] border-solid border-[#D2D8E0] bg-white px-0 py-0 hover:bg-white`}
							size='large'
							value={vote}
							onChange={(value) => {
								setVote(value as EVoteDecisionType);
								handleModalReset();
							}}
							options={decisionOptions}
							disabled={!apiReady || !api}
						/>
						{vote !== EVoteDecisionType.SPLIT && vote !== EVoteDecisionType.ABSTAIN && (
							<VotingForm
								form={ayeNayForm}
								formName={EFormType.AYE_NAY_FORM}
								onBalanceChange={(balance: BN) => setLockedBalance(balance)}
								convictionClassName={className}
								handleSubmit={async () => await handleSubmit()}
								disabled={!wallet || !lockedBalance || isBalanceErr || lockedBalance.lte(ZERO_BN)}
								conviction={conviction}
								setConviction={setConviction}
								convictionOpts={convictionOpts}
							/>
						)}

						{vote === EVoteDecisionType.SPLIT && (
							<VotingForm
								form={splitForm}
								formName={EFormType.SPLIT_FORM}
								onBalanceChange={(balance: BN) => setLockedBalance(balance)}
								onAyeValueChange={(balance: BN) => setAyeVoteValue(balance)}
								onNayValueChange={(balance: BN) => setNayVoteValue(balance)}
								convictionClassName={className}
								handleSubmit={async () => await handleSubmit()}
								disabled={!wallet || ayeVoteValue.lte(ZERO_BN) || nayVoteValue.lte(ZERO_BN) || isBalanceErr}
								conviction={conviction}
								setConviction={setConviction}
								convictionOpts={convictionOpts}
							/>
						)}

						{vote === EVoteDecisionType.ABSTAIN && (
							<VotingForm
								form={abstainFrom}
								formName={EFormType.ABSTAIN_FORM}
								onBalanceChange={(balance: BN) => setLockedBalance(balance)}
								onAyeValueChange={(balance: BN) => setAyeVoteValue(balance)}
								onNayValueChange={(balance: BN) => setNayVoteValue(balance)}
								onAbstainValueChange={(balance: BN) => setAbstainVoteValue(balance)}
								convictionClassName={className}
								handleSubmit={async () => await handleSubmit()}
								disabled={!wallet || ayeVoteValue.lte(ZERO_BN) || nayVoteValue.lte(ZERO_BN) || abstainVoteValue.lte(ZERO_BN) || isBalanceErr}
								conviction={conviction}
								setConviction={setConviction}
								convictionOpts={convictionOpts}
							/>
						)}
					</Spin>
				</>
			</Modal>
			<DelegationSuccessPopup
				title='Voted Successfully'
				vote={vote}
				isVote={true}
				balance={voteValues.totalVoteValue}
				open={successModal}
				setOpen={setSuccessModal}
				address={address}
				isDelegate={true}
				conviction={conviction}
				votedAt={dayjs().format('HH:mm, Do MMMM YYYY')}
				ayeVoteValue={voteValues.ayeVoteValue}
				nayVoteValue={voteValues.nayVoteValue}
				abstainVoteValue={voteValues.abstainVoteValue}
			/>
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
	alignment-close .ant-input-number-in-from-item {
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
