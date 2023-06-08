// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined , StopOutlined } from '@ant-design/icons';
import { InjectedAccountWithMeta, InjectedWindow } from '@polkadot/extension-inject/types';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Button, Form, Modal, Segmented, Select, Spin, Alert } from 'antd';
import BN from 'bn.js';
import React, { useEffect, useMemo,useState } from 'react';
import { chainProperties } from 'src/global/networkConstants';
import { EVoteDecisionType, LoadingStatusType,NotificationStatus, Wallet } from 'src/types';
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
import { oneEnactmentPeriodInDays } from '~src/util/oneEnactmentPeriodInDays';
import LoginToVote from '../LoginToVoteOrEndorse';
import { poppins } from 'pages/_app';
import CastVoteIcon from '~assets/icons/cast-vote-icon.svg';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import LikeGray from '~assets/icons/like-gray.svg';
import DislikeWhite from '~assets/icons/dislike-white.svg';
import DislikeGray from '~assets/icons/dislike-gray.svg';
import SplitWhite from '~assets/icons/split-white.svg';
import SplitGray from '~assets/icons/split-gray.svg';
import CloseCross from '~assets/icons/close-cross-icon.svg';
import DownIcon from '~assets/icons/down-icon.svg';
import LikeWhite from '~assets/icons/like-white.svg';
import DelegationSuccessPopup from '~src/components/Listing/Tracks/DelegationSuccessPopup';
import dayjs from 'dayjs';
const ZERO_BN = new BN(0);

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
	const [wallet, setWallet] = useState<Wallet>();
	const [loginWallet, setLoginWallet] = useState<Wallet>();
	const [availableWallets, setAvailableWallets] = useState<any>({});
	const [isMetamaskWallet, setIsMetamaskWallet] = useState<boolean>(false);
	const [isTalismanEthereum, setIsTalismanEthereum] = useState<boolean>(true);
	const [voteValues, setVoteValues] = useState({ abstainVoteValue:ZERO_BN,ayeVoteValue:ZERO_BN , nayVoteValue:ZERO_BN ,totalVoteValue:ZERO_BN });

	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const CONVICTIONS: [number, number][] = [1, 2, 4, 8, 16, 32].map((lock, index) => [index + 1, lock]);

	const convictionOpts = useMemo(() => [
		<Select.Option className={`text-[#243A57] ${poppins.className} ${poppins.variable}`} key={0} value={0}>{'0.1x voting balance, no lockup period'}</Select.Option>,
		...CONVICTIONS.map(([value, lock]) =>
			<Select.Option className={`text-[#243A57] ${poppins.className} ${poppins.variable}`} key={value} value={value}>{`${value}x voting balance, locked for ${lock * oneEnactmentPeriodInDays[network]} days`}</Select.Option>
		)
	],[CONVICTIONS, network]);

	const [conviction, setConviction] = useState<number>(0);

	const [splitForm] = Form.useForm();
	const [abstainFrom] = Form.useForm();
	const[ayeNayForm] = Form.useForm();
	const [abstainVoteValue, setAbstainVoteValue] = useState<BN>(ZERO_BN);
	const [ayeVoteValue, setAyeVoteValue] = useState<BN>(ZERO_BN);
	const [nayVoteValue, setNayVoteValue] = useState<BN>(ZERO_BN);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [balanceErr, setBalanceErr] = useState('');
	const [vote,setVote] = useState< EVoteDecisionType>(EVoteDecisionType.AYE);
	const [successModal,setSuccessModal] = useState(false);

	const getWallet=() => {
		const injectedWindow = window as Window & InjectedWindow ;
		setAvailableWallets(injectedWindow.injectedWeb3);
		setIsMetamaskWallet((injectedWindow as any)?.ethereum?.isMetaMask);
	};

	const handleDefaultWallet=async(wallet:Wallet) => {
		setWallet(wallet);
		await getAccounts(wallet);
		if (walletConnectProvider) {
			await getWalletConnectAccounts();
		}
	};

	useEffect(() => {
		if(!window) return;
		const defaultWallet = localStorage.getItem('loginWallet') as Wallet ;
		if(defaultWallet){
			if(defaultWallet === Wallet.METAMASK){setWallet(Wallet.METAMASK);handleDefaultWallet(Wallet.METAMASK);}
			else if(defaultWallet === Wallet.TALISMAN){setWallet(Wallet.TALISMAN);handleDefaultWallet(Wallet.TALISMAN);}
			setLoginWallet(defaultWallet as  Wallet);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiReady]);

	useEffect(() => {
		setPostData((prev) => {
			return {
				...prev,
				postType: ProposalType.REFERENDUM_V2
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

		wallet === Wallet.TALISMAN && addresses.filter((address: string) => address.slice(0,2) === '0x').length === 0 ? setIsTalismanEthereum(false) : setIsTalismanEthereum(true);

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

	const onBalanceChange = (balance: BN) => {

		if(!balance) return;
		if(availableBalance.lte(balance)){
			setBalanceErr('Insufficient balance.');
		}else{
			setBalanceErr('');
			setLockedBalance(balance);
		}

	};

	const onAyeValueChange = (balance: BN) => {
		if(!balance) return;
		if(availableBalance.lte(balance)){
			setBalanceErr('Insufficient balance.');
		}else{
			setBalanceErr('');
			setAyeVoteValue(balance);
		}
	};

	const onNayValueChange = (balance: BN) => {
		if(!balance) return;
		if(availableBalance.lte(balance)){
			setBalanceErr('Insufficient balance.');
		}else{
			setBalanceErr('');
			setNayVoteValue(balance);
		}

	};

	const onAbstainValueChange = (balance: BN) => {
		if(!balance) return;
		if(availableBalance.lte(balance)){
			setBalanceErr('Insufficient balance.');
		}else{
			setBalanceErr('');
			setAbstainVoteValue(balance);
		}
	};

	const voteReferendum = async () => {
		if (!referendumId && referendumId !== 0) {
			console.error('referendumId not set');
			return;
		}

		if(!isTalismanEthereum){
			console.error('Please use Ethereum account via Talisman wallet.');
			return;
		}

		if (!lockedBalance) {
			console.error('lockedBalance not set');
			return;
		}
		if(lockedBalance && availableBalance.lte(lockedBalance)) {
			setBalanceErr('Insufficient balance.');
			return;
		}
		if(ayeVoteValue && availableBalance.lte(ayeVoteValue) || nayVoteValue && availableBalance.lte(nayVoteValue) || abstainVoteValue && availableBalance.lte(abstainVoteValue) ) {
			setBalanceErr('Insufficient balance.');
			return;
		}

		const totalVoteValue = new BN(ayeVoteValue || ZERO_BN).add(nayVoteValue || ZERO_BN)?.add(abstainVoteValue || ZERO_BN).add(lockedBalance || ZERO_BN);
		setVoteValues((prevState) => ({
			...prevState,
			totalVoteValue:totalVoteValue
		}));
		if (totalVoteValue?.gte(availableBalance)) {
			setBalanceErr('Insufficient balance.');
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

		if(vote === EVoteDecisionType.AYE){
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
					setLastVote(vote);
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
		}
		else if (vote === EVoteDecisionType.NAY){
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
					setLastVote(vote);
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
		}

		else if (vote === EVoteDecisionType.SPLIT){
			setVoteValues((prevState) => ({
				...prevState,
				ayeVoteValue:ayeVoteValue,
				nayVoteValue:nayVoteValue
			}));
			voteContract.methods
				.voteSplit(
					referendumId,
					ayeVoteValue?.toString(),
					nayVoteValue?.toString()
				)
				.send({
					from: address,
					to: contractAddress
				})
				.then(() => {
					setLoadingStatus({ isLoading: false, message: '' });
					setLastVote(vote);
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
		}

		else if (vote === EVoteDecisionType.ABSTAIN){
			setVoteValues((prevState) => ({
				...prevState,
				abstainVoteValue:abstainVoteValue,
				ayeVoteValue:ayeVoteValue,
				nayVoteValue:nayVoteValue
			}));
			voteContract.methods
				.voteSplitAbstain(
					referendumId,
					ayeVoteValue?.toString(),
					nayVoteValue?.toString(),
					abstainVoteValue?.toString()
				)
				.send({
					from: address,
					to: contractAddress
				})
				.then(() => {
					setLoadingStatus({ isLoading: false, message: '' });
					setLastVote(vote);
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
		}

	};

	if (isLoggedOut()) {
		return <LoginToVote />;
	}
	const openModal = () => {
		setShowModal(true);
	};

	const ConvictionSelect = ({ className }: { className?:string }) =>
		<Form.Item className={className}>
			<label  className='inner-headings'>
				Vote lock
			</label>

			<Select onChange={(key) => setConviction(Number(key)) } size='large' className='' defaultValue={conviction} suffixIcon ={<DownIcon/>}>
				{convictionOpts}
			</Select>
		</Form.Item>;

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

	const handleOnBalanceChange = (balanceStr: string) => {
		let balance = ZERO_BN;

		try{
			balance = new BN(balanceStr);
		}
		catch(err){
			console.log(err);
		}

		setAvailableBalance(balance);
	};

	// eslint-disable-next-line react-hooks/rules-of-hooks
	useEffect(() => {
		getWallet();
		if(!loginWallet) return;
		if(loginWallet === Wallet.METAMASK){setWallet(Wallet.METAMASK);handleDefaultWallet(Wallet.METAMASK);}
		else if(loginWallet === Wallet.TALISMAN){setWallet(Wallet.TALISMAN);handleDefaultWallet(Wallet.TALISMAN);}
	}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	,[loginWallet]);

	const decisionOptions = isOpenGovSupported(network) ? [
		{
			label: <div className={`flex items-center justify-center text-[#576D8B] w-[131px] h-[32px] rounded-[4px] ${vote === 'aye'? 'bg-[#2ED47A] text-white' : ''}`}>{vote === EVoteDecisionType.AYE ? <LikeWhite className='mr-2 mb-[3px]' /> : <LikeGray className='mr-2 mb-[3px]' /> }<span className='font-medium'>Aye</span></div>,
			value: 'aye'
		},
		{
			label: <div className={`flex items-center justify-center text-[#576D8B] w-[126px] h-[32px] rounded-[4px] ${vote === 'nay'? 'bg-[#F53C3C] text-white' : ''}`}>{vote === EVoteDecisionType.NAY ? <DislikeWhite className='mr-2  ' /> : <DislikeGray className='mr-2' /> } <span className='font-medium'>Nay</span></div>,
			value: 'nay'
		},
		{
			label: <div className={`flex items-center justify-center text-[#576D8B]  w-[126px] h-[32px] rounded-[4px] ${vote === 'split'? 'bg-[#FFBF60] text-white' : ''}`}> {vote === EVoteDecisionType.SPLIT ? <SplitWhite className='mr-2  ' /> : <SplitGray className='mr-2' /> } <span className='font-medium'>Split</span> </div>,
			value: 'split'
		},
		{
			label: <div className={` flex items-center justify-center text-[#576D8B] ml-2  w-[126px] h-[32px] rounded-[4px] ${vote === 'abstain'? 'bg-[#407BFF] text-white' : ''}`}><StopOutlined className='mr-2 mb-[3px]'/> <span className='font-medium'>Abstain</span></div>,
			value: 'abstain'
		}
	] : [
		{
			label: <div className={`flex items-center justify-center text-[#576D8B] w-[131px] h-[32px] rounded-[4px] ${vote === 'aye'? 'bg-[#2ED47A] text-white' : ''}`}>{vote === EVoteDecisionType.AYE ? <LikeWhite className='mr-2 mb-[3px]' /> : <LikeGray className='mr-2 mb-[3px]' /> }<span className='font-medium'>Aye</span></div>,
			value: 'aye'
		},
		{
			label: <div className={`flex items-center justify-center text-[#576D8B] w-[126px] h-[32px] rounded-[4px] ${vote === 'nay'? 'bg-[#F53C3C] text-white' : ''}`}>{vote === EVoteDecisionType.NAY ? <DislikeWhite className='mr-2  ' /> : <DislikeGray className='mr-2' /> } <span className='font-medium'>Nay</span></div>,
			value: 'nay'
		}];

	return (
		<div className={className}>
			<Button
				className='bg-pink_primary hover:bg-pink_secondary text-lg mb-3 text-white border-pink_primary hover:border-pink_primary rounded-lg flex items-center justify-center p-7 w-[100%]'
				onClick={openModal}
			>
				{lastVote == null || lastVote == undefined  ? 'Cast Vote Now' : 'Cast Vote Again' }
			</Button>
			<Modal
				open={showModal}
				onCancel={() => setShowModal(false)}
				footer={false}
				className={`w-[550px] max-md:w-full max-h-[675px] rounded-[6px] alignment-close ${poppins.className} ${poppins.variable}`}
				closeIcon={<CloseCross/>}
				wrapClassName={className}
				title={<div className='h-[65px] -mt-5 border-0 border-solid border-b-[1.2px] border-[#D2D8E0] mr-[-24px] ml-[-24px] rounded-t-[6px] flex items-center justify-center gap-2'>
					<CastVoteIcon className='mt-1'/>
					<span className='text-[#243A57] font-semibold tracking-[0.0015em] text-xl'>Cast Your Vote</span>
				</div>}
			> <>
					<Spin spinning={loadingStatus.isLoading || isAccountLoading} indicator={<LoadingOutlined />}>
						<div className='text-sm font-normal flex items-center justify-center text-[#485F7D] mt-3'>Select a wallet</div>

						<div className='flex items-center gap-x-5 mt-1 mb-[24px] justify-center'>
							{availableWallets[Wallet.TALISMAN] && <WalletButton className={`${wallet === Wallet.TALISMAN? 'border border-solid border-pink_primary  w-[64px] h-[48px]': 'w-[64px] h-[48px]'}`}  disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.TALISMAN)} name="Talisman" icon={<WalletIcon which={Wallet.TALISMAN} className='h-6 w-6'  />} />}
							{isMetamaskWallet && <WalletButton className={`${wallet === Wallet.METAMASK? 'border border-solid border-pink_primary  w-[64px] h-[48px]': 'w-[64px] h-[48px]'}`}  disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.METAMASK)} name="MetaMask" icon={<WalletIcon which={Wallet.METAMASK} className='h-6 w-6' />} />}
						</div>
						{!isTalismanEthereum && <Alert message='Please use Ethereum account via Talisman wallet.' type='info' className='mb-2 -mt-2' showIcon/>}

						{balanceErr.length > 0 && wallet && <Alert type='info' message={balanceErr} showIcon className='mb-4'/>}
						{accounts.length === 0  && wallet && !loadingStatus.isLoading && <Alert message='No addresses found in the address selection tab.' showIcon type='info' />}

						{
							accounts.length > 0?
								<AccountSelectionForm
									title='Vote with Account'
									accounts={accounts}
									address={address}
									withBalance
									onAccountChange={onAccountChange}
									onBalanceChange={handleOnBalanceChange}
									className={`${poppins.variable} ${poppins.className} text-sm font-normal text-[#485F7D]`}
									inputClassName='rounded-[4px] px-3 py-1 h-[40px]'
									withoutInfo = {true}
								/>
								: !wallet? <Alert type='info'  message='Please select a wallet.' showIcon />: null
						}

						<h3 className='inner-headings mt-[24px] mb-[2px]'>Choose your vote</h3>
						<Segmented
							block
							className={`${className}  mb-[24px] border-solid border-[1px] bg-white hover:bg-white border-[#D2D8E0] rounded-[4px] w-full py-0 px-0`}
							size="large"
							value={vote}
							onChange={(value) => {
								setVote(value as EVoteDecisionType);
								ayeNayForm.setFieldValue('balance', ZERO_BN);
								splitForm.setFieldValue('nayVote', ZERO_BN);
								splitForm.setFieldValue('ayeVote', ZERO_BN);
								abstainFrom.setFieldValue('abstainVote', ZERO_BN);
								abstainFrom.setFieldValue('ayeVote', ZERO_BN);
								abstainFrom.setFieldValue('nayVote', ZERO_BN);
								setLockedBalance(ZERO_BN);
							}}
							options={decisionOptions}
							disabled={ !apiReady}
						/>
						{
							vote !== EVoteDecisionType.SPLIT && vote !== EVoteDecisionType.ABSTAIN &&
							<Form onFinish={async () => {
								await voteReferendum();
							}}
							form={ayeNayForm}
							name="aye-nay-form"
							className={`${balanceErr.length > 0 && 'mt-4'}`}>

								<BalanceInput
									label={'Lock balance'}
									helpText={'Amount of you are willing to lock for this vote.'}
									placeholder={'Add balance'}
									onChange={onBalanceChange}
									className='mt-6 text-sm font-normal text-[#485F7D]'
									inputClassName='text-[#7c899b] text-sm text-red-100'
								/>

								<ConvictionSelect className={`${className}`} />

								<div className='flex justify-end mt-[-1px] pt-5 mr-[-24px] ml-[-24px] border-0 border-solid border-t-[1.5px] border-[#D2D8E0]'>
									<Button className='w-[134px] h-[40px] rounded-[4px] text-[#E5007A] bg-[white] mr-[15px] font-semibold border-[#E5007A]' onClick={() => setShowModal(false)}>Cancel</Button>
									<Button className={`w-[134px] h-[40px] rounded-[4px] text-[white] bg-[#E5007A] mr-[24px] font-semibold border-0 ${(!wallet || !lockedBalance) && 'opacity-50'}`} htmlType='submit' disabled={!wallet || !lockedBalance}>Confirm</Button>
								</div>
							</Form>
						}

						{
							vote === EVoteDecisionType.SPLIT &&
								<Form
									form={splitForm}
									name="split-form"
									className={`${balanceErr.length > 0 && 'mt-4'}`}
									onFinish={async () => {
										await voteReferendum();
									}}
									style={{ maxWidth: 600 }}
								>
									<BalanceInput
										label={'Aye vote value'}
										helpText={'Amount of you are willing to lock for this vote.'}
										placeholder={'Add balance'}
										onChange={onAyeValueChange}
										className='text-sm font-medium'
										formItemName={'ayeVote'}
									/>

									<BalanceInput
										label={'Nay vote value'}
										placeholder={'Add balance'}
										onChange={onNayValueChange}
										className='text-sm font-medium'
										formItemName={'nayVote'}
									/>

									<div className='flex justify-end mt-[-1px] pt-5 mr-[-24px] ml-[-24px] border-0 border-solid border-t-[1.5px] border-[#D2D8E0]'>
										<Button className='w-[134px] h-[40px] rounded-[4px] text-[#E5007A] bg-[white] mr-[15px] font-semibold border-[#E5007A]' onClick={() => setShowModal(false)}>Cancel</Button>
										<Button className={`w-[134px] h-[40px] rounded-[4px] text-[white] bg-[#E5007A] mr-[24px] font-semibold border-0 ${(!wallet || !lockedBalance) && 'opacity-50'}`} htmlType='submit' disabled={!wallet || !lockedBalance}>Confirm</Button>
									</div>
								</Form>
						}

						{
							vote === EVoteDecisionType.ABSTAIN &&
								<Form
									form={abstainFrom}
									name="abstain-form"
									onFinish={async () => {
										await voteReferendum();
									}}
									style={{ maxWidth: 600  }}
								>
									<BalanceInput
										label={'Abstain vote value'}
										placeholder={'Add balance'}
										onChange={onAbstainValueChange}
										className='text-sm font-medium'
										formItemName={'abstainVote'}
									/>

									<BalanceInput
										label={'Aye vote value'}
										placeholder={'Add balance'}
										onChange={onAyeValueChange}
										className='text-sm font-medium'
										formItemName={'ayeVote'}
									/>

									<BalanceInput
										label={'Nay vote value'}
										placeholder={'Add balance'}
										onChange={onNayValueChange}
										className='text-sm font-medium'
										formItemName={'nayVote'}
									/>

									<div className='flex justify-end mt-[-1px] pt-5 mr-[-24px] ml-[-24px] border-0 border-solid border-t-[1.5px] border-[#D2D8E0]'>
										<Button className='w-[134px] h-[40px] rounded-[4px] text-[#E5007A] bg-[white] mr-[15px] font-semibold border-[#E5007A]' onClick={() => setShowModal(false)}>Cancel</Button>
										<Button className={`w-[134px] h-[40px] rounded-[4px] text-[white] bg-[#E5007A] mr-[24px] font-semibold border-0 ${(!wallet || !lockedBalance) && 'opacity-50'}`} htmlType='submit' disabled={!wallet || !lockedBalance}>Confirm</Button>
									</div>
								</Form>
						}
					</Spin>
				</>
			</Modal>
			<DelegationSuccessPopup title='Voted' vote={vote} isVote={true}  balance={voteValues.totalVoteValue} open={successModal} setOpen={setSuccessModal}  address={address} isDelegate={true}  conviction={conviction}  votedAt={dayjs().format('HH:mm, Do MMMM YYYY')} ayeVoteValue={voteValues.ayeVoteValue} nayVoteValue={voteValues.nayVoteValue} abstainVoteValue={voteValues.abstainVoteValue} />
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

.alignment-close .ant-select-selector{
		border:1px soild !important;
		border-color:#D2D8E0 !important;
		height: 40px;
		border-radius:4px !important;
	}
	
.alignment-close .ant-select-selection-item{
		font-style: normal !important;
		font-weight: 400 !important;
		font-size: 14px !important;
		display: flex;
		align-items: center;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
		color: #243A57 !important;
	}
	
	alignment-close .ant-input-number-in-from-item{
		height: 39.85px !important;
	
	}
	
	
	.alignment-close .ant-segmented-item-label{
		display:flex ;
		justify-content: center;
		align-items:center;
		height:32px !important;
		border-radius:4px !important;
		padding-right:0px !important;
		padding-left:0px !important;
	}
	.alignment-close .ant-segmented {
		padding :0px !important;
	}
	
	.alignment-close .ant-select-selection-item{
		color: #243A57 !important;
	}
	.alignment-close .ant-select-focused{
		border: 1px solid #E5007A !important;
		border-radius:4px !important;
	}
	.alignment-close .ant-segmented-item-selected{
		box-shadow: none !important;
		padding-right:0px !important;
	}
	.alignment-close .ant-segmented-item{
		padding: 0px !important;
	}
	
	.alignment-close .ant-modal-close{
		margin-top: 4px;
	}
	.alignment-close .ant-modal-close:hover{
		margin-top: 4px;
	}
`;
