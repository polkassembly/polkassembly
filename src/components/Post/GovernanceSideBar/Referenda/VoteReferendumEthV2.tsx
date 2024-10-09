// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined, StopOutlined } from '@ant-design/icons';
import { InjectedAccountWithMeta, InjectedWindow } from '@polkadot/extension-inject/types';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Form, Modal, Segmented, Spin } from 'antd';
import BN from 'bn.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { chainProperties } from 'src/global/networkConstants';
import { EVoteDecisionType, ILastVote, LoadingStatusType, NotificationStatus, Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import { BrowserProvider, Contract } from 'ethers';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
import WalletButton from '~src/components/WalletButton';
import { useApiContext, usePostDataContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import LoginToVote from '../LoginToVoteOrEndorse';
import { poppins } from 'pages/_app';
import DelegationSuccessPopup from '~src/components/Listing/Tracks/DelegationSuccessPopup';
import dayjs from 'dayjs';
import { getConvictionVoteOptions } from './VoteReferendumModal';
import VotingForm, { EFormType } from './VotingFrom';
import getMetamaskAccounts from '~src/util/getMetamaskAccounts';
import CastVoteIcon from '~assets/icons/cast-vote-icon.svg';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import LikeGray from '~assets/icons/like-gray.svg';
import DislikeWhite from '~assets/icons/dislike-white.svg';
import DislikeGray from '~assets/icons/dislike-gray.svg';
import SplitWhite from '~assets/icons/split-white.svg';
import SplitGray from '~assets/icons/split-gray.svg';
import LikeWhite from '~assets/icons/like-white.svg';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { setWalletConnectProvider } from '~src/redux/userDetails';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { trackEvent } from 'analytics';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Alert from '~src/basic-components/Alert';
import { useTheme } from 'next-themes';
import DarkLikeGray from '~assets/icons/like-gray-dark.svg';
import DarkDislikeGray from '~assets/icons/dislike-gray-dark.svg';
import DarkSplitGray from '~assets/icons/split-gray-dark.svg';
import DarkCastVoteIcon from '~assets/icons/cast-vote-icon-white.svg';

const ZERO_BN = new BN(0);

interface Props {
	className?: string;
	address: string;
	referendumId?: number | null | undefined;
	onAccountChange: (address: string) => void;
	lastVote: ILastVote | null;
	setLastVote: (pre: ILastVote) => void;
}

const abi = require('../../../../moonbeamConvictionVoting.json');

const contractAddress = process.env.NEXT_PUBLIC_CONVICTION_VOTING_PRECOMPILE || '';

const VoteReferendumEthV2 = ({ className, referendumId, onAccountChange, lastVote, setLastVote, address }: Props) => {
	const [showModal, setShowModal] = useState<boolean>(false);
	const { walletConnectProvider, id, loginAddress, loginWallet } = useUserDetailsSelector();
	const dispatch = useDispatch();
	const [lockedBalance, setLockedBalance] = useState<BN>(ZERO_BN);
	const { apiReady, api } = useApiContext();
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [isAccountLoading, setIsAccountLoading] = useState(false);
	const { network } = useNetworkSelector();
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
	const currentUser = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();

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
		dispatch(setWalletConnectProvider(wcPprovider));
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
			onAccountChange(checksumAddresses[0]);
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
					conviction,
					decision: vote,
					time: new Date()
				});
				break;
			case EVoteDecisionType.NAY:
				setLastVote({
					balance: totalVoteValue,
					conviction,
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
					conviction,
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
					conviction,
					decision: vote,
					time: new Date()
				});
				break;
		}
	};

	const handleSubmit = async () => {
		// GAEvent for proposal voting
		trackEvent('proposal_voting', 'voted_proposal', {
			balance: lockedBalance,
			conviction: conviction,
			decision: vote,
			isWeb3Login: currentUser?.web3signup,
			postId: referendumId,
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});
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
			web3 = new BrowserProvider(walletConnectProvider as any);
			chainId = walletConnectProvider.wc.chainId;
		} else {
			web3 = new BrowserProvider(wallet === Wallet.TALISMAN ? (window as any).talismanEth : wallet === Wallet.SUBWALLET ? (window as any).SubWallet : (window as any).ethereum);
			const { chainId: id } = await web3.getNetwork();
			chainId = Number(id.toString());
		}

		if (chainId !== chainProperties[network].chainId) {
			queueNotification({
				header: 'Wrong Network!',
				message: `Please change to ${network} network`,
				status: NotificationStatus.ERROR
			});
			return;
		}
		setLoadingStatus({ isLoading: true, message: 'Awaiting Confirmation' });

		const voteContract = new Contract(contractAddress, abi, await web3.getSigner());

		// estimate gas.
		//https://docs.moonbeam.network/builders/interact/eth-libraries/deploy-contract/#interacting-with-the-contract-send-methods

		let tx;
		if (vote === EVoteDecisionType.AYE) {
			tx = () => voteContract.voteYes(referendumId, lockedBalance.toString(), conviction);
		} else if (vote === EVoteDecisionType.NAY) {
			tx = () => voteContract.voteNo(referendumId, lockedBalance.toString(), conviction);
		} else if (vote === EVoteDecisionType.SPLIT) {
			tx = () => voteContract.voteSplit(referendumId, ayeVoteValue?.toString(), nayVoteValue?.toString());
		} else if (vote === EVoteDecisionType.ABSTAIN) {
			tx = () => voteContract.voteSplitAbstain(referendumId, ayeVoteValue?.toString(), nayVoteValue?.toString(), abstainVoteValue?.toString());
		}

		await tx?.()
			.then((res) => {
				setLoadingStatus({ isLoading: true, message: `Transaction hash ${res.hash.slice(0, 10)}...` });
				console.log('transactionHash', res.hash);
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

	if (!id) {
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
		onAccountChange('');
		const accountsData = await getMetamaskAccounts({ chosenWallet: wallet, loginAddress, network });
		if (accountsData) {
			setAccounts(accountsData?.accounts || []);
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
					className={`ml-1 mr-1 flex h-8 w-full items-center justify-center rounded-[4px] text-textGreyColor ${
						vote === EVoteDecisionType.AYE ? 'bg-ayeGreenColor text-white dark:bg-ayeDarkGreenColor' : ''
					}`}
				>
					{vote === EVoteDecisionType.AYE ? <LikeWhite className='mb-1 mr-2' /> : theme === 'dark' ? <DarkLikeGray className='mb-1 mr-2' /> : <LikeGray className='mb-1 mr-2' />}
					<span className={`${vote === EVoteDecisionType.AYE ? 'text-white' : 'dark:text-blue-dark-medium'} text-base font-medium`}>Aye</span>
				</div>
			),
			value: 'aye'
		},
		{
			label: (
				<div
					className={`ml-1 mr-1 flex h-8 w-full items-center justify-center rounded-[4px] text-textGreyColor ${
						vote === EVoteDecisionType.NAY ? 'bg-nayRedColor text-white dark:bg-nayDarkRedColor' : ''
					}`}
				>
					{vote === EVoteDecisionType.NAY ? (
						<DislikeWhite className='-mb-1 mr-2' />
					) : theme === 'dark' ? (
						<DarkDislikeGray className='-mb-1 mr-2' />
					) : (
						<DislikeGray className='-mb-1 mr-2' />
					)}
					<span className={`${vote === EVoteDecisionType.NAY ? 'text-white' : 'dark:text-blue-dark-medium'} text-base font-medium`}>Nay</span>
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
							className={`flex h-8 w-32 items-center  justify-center rounded-[4px] text-textGreyColor ${
								vote === EVoteDecisionType.SPLIT ? 'bg-yellowColor text-white dark:bg-darkOrangeColor' : ''
							}`}
						>
							{' '}
							{vote === EVoteDecisionType.SPLIT ? <SplitWhite className='mr-2  ' /> : theme === 'dark' ? <DarkSplitGray className='mr-2' /> : <SplitGray className='mr-2' />}
							<span className={`${vote === EVoteDecisionType.SPLIT ? 'text-white' : 'dark:text-blue-dark-medium'} text-base font-medium`}>Split</span>
						</div>
					),
					value: 'split'
				},
				{
					label: (
						<div
							className={` ml-2 flex h-8 w-32 items-center  justify-center rounded-[4px] text-textGreyColor ${
								vote === EVoteDecisionType.ABSTAIN ? 'bg-abstainBlueColor text-white dark:bg-abstainDarkBlueColor' : ''
							}`}
						>
							<StopOutlined className={`mb-1 mr-2 ${vote === EVoteDecisionType.ABSTAIN ? 'dark:text-white' : 'dark:text-[#909090]'}`} />
							<span className={`${vote === EVoteDecisionType.ABSTAIN ? 'text-white' : 'dark:text-blue-dark-medium'} text-base font-medium`}>Abstain</span>
						</div>
					),
					value: 'abstain'
				}
		  ]
		: ayeNayVotesArr;

	return (
		<div className={className}>
			<CustomButton
				variant='primary'
				fontSize='lg'
				className='mx-auto mb-8 w-full rounded-xxl p-7 font-semibold lg:w-[480px] xl:w-full'
				onClick={openModal}
			>
				{!lastVote ? 'Cast Your Vote' : 'Cast Vote Again'}
			</CustomButton>
			<Modal
				open={showModal}
				onCancel={() => {
					setShowModal(false);
					handleModalReset();
				}}
				footer={false}
				className={`alignment-close max-h-[675px] w-[550px] rounded-sm max-md:w-full ${poppins.className} ${poppins.variable} dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				title={
					<div className='-ml-6 -mr-6 -mt-5 flex h-[65px] items-center justify-center gap-2 rounded-t-sm border-0 border-b-[1.2px] border-solid border-section-light-container dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
						{theme === 'dark' ? <DarkCastVoteIcon className='ml-6' /> : <CastVoteIcon className='ml-6' />}
						<span className='text-xl font-semibold tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>Cast Your Vote</span>
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
							{availableWallets[Wallet.SUBWALLET] && (
								<WalletButton
									className={`${wallet === Wallet.SUBWALLET ? 'h-12 w-16 border border-solid border-pink_primary hover:border-pink_primary' : 'h-12 w-16'}`}
									disabled={!apiReady}
									onClick={(event) => handleWalletClick(event as any, Wallet.SUBWALLET)}
									name='Subwallet'
									icon={
										<WalletIcon
											which={Wallet.SUBWALLET}
											className='h-6 w-6'
										/>
									}
								/>
							)}
							{(window as any)?.walletExtension?.isNovaWallet && (
								<WalletButton
									disabled={!apiReady}
									className={`${wallet === Wallet.NOVAWALLET ? 'h-[48px] w-[64px] border  border-solid border-pink_primary' : 'h-[48px] w-[64px]'}`}
									onClick={(event) => handleWalletClick(event as any, Wallet.NOVAWALLET)}
									name='Nova Wallet'
									icon={
										<WalletIcon
											which={Wallet.NOVAWALLET}
											className='h-6 w-6'
										/>
									}
								/>
							)}
						</div>
						{!isTalismanEthereum && (
							<Alert
								message={<span className='dark:text-blue-dark-high'>Please use Ethereum account via Talisman wallet.</span>}
								type='info'
								className='-mt-2 mb-2'
								showIcon
							/>
						)}

						{isBalanceErr && !loadingStatus.isLoading && wallet && (
							<Alert
								type='info'
								message={<span className='dark:text-blue-dark-high'>Insufficient balance.</span>}
								showIcon
								className='mb-4 rounded-[4px]'
							/>
						)}
						{accounts.length === 0 && wallet && !loadingStatus.isLoading && (
							<Alert
								message={<span className='dark:text-blue-dark-high'>No addresses found in the address selection tab.</span>}
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
								isVoting={true}
								theme={theme}
							/>
						) : !wallet ? (
							<Alert
								type='info'
								message={<span className='dark:text-blue-dark-high'>Please select a wallet.</span>}
								className='rounded-[4px]'
								showIcon
							/>
						) : null}

						<h3 className='inner-headings mb-[2px] mt-6 dark:text-blue-dark-medium'>Choose your vote</h3>
						<Segmented
							block
							className={`${className}  mb-6 w-full rounded-[4px] border-[1px] border-solid border-section-light-container bg-white px-0 py-0 hover:bg-white dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay`}
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
				conviction={conviction}
				address={address}
				isDelegate={true}
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
