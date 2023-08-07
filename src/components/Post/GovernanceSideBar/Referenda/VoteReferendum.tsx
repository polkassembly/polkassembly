// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined , StopOutlined } from '@ant-design/icons';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Alert, Button, Divider, Form, Modal, Segmented, Select, Spin } from 'antd';
import BN from 'bn.js';
import React, { useCallback, useEffect, useMemo,useState } from 'react';
import { EVoteDecisionType, ILastVote, LoadingStatusType,NotificationStatus, Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import BalanceInput from 'src/ui-components/BalanceInput';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
import WalletButton from '~src/components/WalletButton';
import { useApiContext, useNetworkContext, useUserDetailsContext } from '~src/context';
import { APPNAME } from '~src/global/appName';
import { ProposalType } from '~src/global/proposalType';
import getEncodedAddress from '~src/util/getEncodedAddress';
import LoginToVote from '../LoginToVoteOrEndorse';
import { poppins } from 'pages/_app';
import CastVoteIcon from '~assets/icons/cast-vote-icon.svg';
import LikeWhite from '~assets/icons/like-white.svg';
import LikeGray from '~assets/icons/like-gray.svg';
import DislikeWhite from '~assets/icons/dislike-white.svg';
import DislikeGray from '~assets/icons/dislike-gray.svg';
import SplitWhite from '~assets/icons/split-white.svg';
import SplitGray from '~assets/icons/split-gray.svg';
import CloseCross from '~assets/icons/close-cross-icon.svg';
import DownIcon from '~assets/icons/down-icon.svg';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import checkWalletForSubstrateNetwork from '~src/util/checkWalletForSubstrateNetwork';
import dayjs from 'dayjs';
import MultisigAccountSelectionForm from '~src/ui-components/MultisigAccountSelectionForm';
import ArrowLeft from '~assets/icons/arrow-left.svg';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { canUsePolkasafe } from '~src/util/canUsePolkasafe';
import usePolkasafe from '~src/hooks/usePolkasafe';
import blockToDays from '~src/util/blockToDays';
import { ApiPromise } from '@polkadot/api';
import VoteInitiatedModal from './Modal/VoteSuccessModal';
import SuccessIcon from '~assets/delegation-tracks/success-delegate.svg';
import MultisigSuccessIcon from '~assets/multi-vote-initiated.svg';
import executeTx from '~src/util/executeTx';
import { network as AllNetworks } from '~src/global/networkConstants';
import PolkasafeIcon from '~assets/polkasafe-logo.svg';
import formatBnBalance from '~src/util/formatBnBalance';

const ZERO_BN = new BN(0);

interface Props {
	className?: string;
	referendumId?: number | null | undefined;
	onAccountChange: (address: string) => void;
	lastVote: ILastVote | undefined;
	setLastVote: (pre: ILastVote) => void;
	proposalType: ProposalType;
  address: string;
}
export interface INetworkWalletErr{
message: string;
 description: string;
 error: number
}

export const getConvictionVoteOptions = (CONVICTIONS: [number, number][], proposalType: ProposalType, api: ApiPromise | undefined, apiReady: boolean, network: string) => {
	if ([ProposalType.REFERENDUM_V2, ProposalType.FELLOWSHIP_REFERENDUMS].includes(proposalType) && ![AllNetworks.COLLECTIVES, AllNetworks.WESTENDCOLLECTIVES].includes(network)) {
		if (api && apiReady) {
			const res = api.consts.convictionVoting.voteLockingPeriod;
			const num = res.toJSON();
			const days = blockToDays(num, network);
			if (days && !isNaN(Number(days))) {
				return [
					<Select.Option className={`text-bodyBlue ${poppins.variable}`} key={0} value={0}>{'0.1x voting balance, no lockup period'}</Select.Option>,
					...CONVICTIONS.map(([value, lock]) =>
						<Select.Option className={`text-bodyBlue ${poppins.variable}`} key={value} value={value}>{`${value}x voting balance, locked for ${lock}x duration (${Number(lock) * Number(days)} days)`}</Select.Option>
					)
				];
			}
		}
	}
	return [
		<Select.Option className={`text-bodyBlue ${poppins.variable}`} key={0} value={0}>{'0.1x voting balance, no lockup period'}</Select.Option>,
		...CONVICTIONS.map(([value, lock]) =>
			<Select.Option className={`text-bodyBlue ${poppins.variable}`} key={value} value={value}>{`${value}x voting balance, locked for ${lock} enactment period(s)`}</Select.Option>
		)
	];
};

const VoteReferendum = ({ className, referendumId, onAccountChange, lastVote, setLastVote, proposalType, address }: Props) => {
	const userDetails = useUserDetailsContext();
	const { addresses, isLoggedOut, loginAddress } = userDetails;
	const [showModal, setShowModal] = useState<boolean>(false);
	const [lockedBalance, setLockedBalance] = useState<BN>(ZERO_BN);
	const { api, apiReady } = useApiContext();
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const [isFellowshipMember, setIsFellowshipMember] = useState<boolean>(false);
	const [fetchingFellowship, setFetchingFellowship] = useState(true);
	const { network } = useNetworkContext();
	const [wallet,setWallet] = useState<Wallet>();
	const [availableWallets, setAvailableWallets] = useState<any>({});
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const CONVICTIONS: [number, number][] = [1, 2, 4, 8, 16, 32].map((lock, index) => [index + 1, lock]);
	const [loginWallet, setLoginWallet] = useState<Wallet>();
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [balanceErr, setBalanceErr] = useState('');
	const [successModal,setSuccessModal] = useState<boolean>(false);
	const [splitForm] = Form.useForm();
	const [abstainFrom] = Form.useForm();
	const [ayeNayForm] = Form.useForm();
	const [abstainVoteValue, setAbstainVoteValue] = useState<BN>(ZERO_BN);
	const [ayeVoteValue, setAyeVoteValue] = useState<BN>(ZERO_BN);
	const [nayVoteValue, setNayVoteValue] = useState<BN>(ZERO_BN);
	const [walletErr, setWalletErr] = useState<INetworkWalletErr>({ description: '', error: 0, message: '' });
	const [voteValues, setVoteValues] = useState({ abstainVoteValue:ZERO_BN,ayeVoteValue:ZERO_BN , nayVoteValue:ZERO_BN ,totalVoteValue:ZERO_BN });
	const [multisig, setMultisig] = useState<string>('');
	const [showMultisig, setShowMultisig] = useState<boolean>(false);

	const { client, connect } = usePolkasafe(address);

	const [vote, setVote] = useState< EVoteDecisionType>(EVoteDecisionType.AYE);
	const [totalDeposit, setTotalDeposit] = useState<BN>(new BN(0));
	const [initiatorBalance, setInitiatorBalance] = useState<BN>(new BN(0));

	useEffect(() => {
		if (userDetails.loginWallet) {
			setLoginWallet(userDetails.loginWallet);
			setWallet(userDetails.loginWallet);
		} else {
			if(!window) return;
			const wallet = localStorage.getItem('loginWallet') ;
			if(Wallet){
				setLoginWallet(wallet as  Wallet);
				setWallet(wallet as Wallet);
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userDetails]);

	const getWallet=() => {
		const injectedWindow = window as Window & InjectedWindow;
		setAvailableWallets(injectedWindow.injectedWeb3);
	};

	const getAccounts = async (chosenWallet: Wallet, chosenAddress?:string): Promise<undefined> => {

		const injectedWindow = window as Window & InjectedWindow;

		const wallet = isWeb3Injected
			? injectedWindow.injectedWeb3[chosenWallet]
			: null;

		if (!wallet) {
			return;
		}

		let injected: Injected | undefined;
		try {
			injected = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('Wallet Timeout'));
				}, 60000); // wait 60 sec

				if(wallet && wallet.enable) {
					wallet.enable(APPNAME)
						.then((value) => { clearTimeout(timeoutId); resolve(value); })
						.catch((error) => { reject(error); });
				}
			});
		} catch (err) {
			console.log(err?.message);
		}
		if (!injected) {
			return;
		}

		const accounts = await injected.accounts.get();
		if (accounts.length === 0) {
			return;
		}

		accounts.forEach((account) => {
			account.address = getEncodedAddress(account.address, network) || account.address;
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
		if (accounts.length > 0) {
			if(api && apiReady) {
				api.setSigner(injected.signer);
			}

			onAccountChange(chosenAddress || accounts[0].address);
		}

		return;
	};

	useEffect(() => {
		getWallet();
		if(!loginWallet) return ;
		getAccounts(loginWallet);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[loginWallet]);

	const handleInitiatorBalance = useCallback(
		async () => {
			if (!api || !apiReady) {
				return;
			}
			//deposit balance
			const depositBase = api.consts.multisig.depositBase.toString();
			const depositFactor = api.consts.multisig.depositFactor.toString();
			setTotalDeposit(new BN(depositBase).add(new BN(depositFactor)));
			//initiator balance
			const initiatorBalance = await api.query.system.account(address);
			setInitiatorBalance(new BN(initiatorBalance.data.free.toString()));
		},
		[address, api, apiReady]
	);

	useEffect(() => {
		handleInitiatorBalance();
	}, [address, handleInitiatorBalance]);

	useEffect(() => {
		if(!address || !wallet) return;
		getAccounts(wallet, address);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, wallet]);

	useEffect(() => {
		setWalletErr(checkWalletForSubstrateNetwork(network) as INetworkWalletErr );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [availableWallets, network]);

	const handleOnBalanceChange = async (balanceStr: string) => {
		if(!api){
			return;
		}
		let balance = ZERO_BN;

		try{
			balance = new BN(balanceStr);
			if(multisig){
				const multisigBalance = (await api.query.system.account(multisig)).data.free.toString();
				balance = new BN(multisigBalance);
			}
			setAvailableBalance(balance);
		}
		catch(err){
			console.log(err);
		}
	};
	const handleWalletClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) => {
		localStorage.setItem('selectedWallet', wallet);
		setLoadingStatus({ ...loadingStatus, isLoading: true });
		setAccounts([]);
		onAccountChange('');
		event.preventDefault();
		setWallet(wallet);
		setMultisig('');
		await getAccounts(wallet);
		setLoadingStatus({ ...loadingStatus, isLoading: false });
	};
	const convictionOpts = useMemo(() => {
		return getConvictionVoteOptions(CONVICTIONS, proposalType, api, apiReady, network);
	},[CONVICTIONS, proposalType, api, apiReady, network]);

	const [conviction, setConviction] = useState<number>(0);

	const onBalanceChange = (balance: BN) => {
		if(!balance) return;
		else if(availableBalance.lte(balance)){
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
			setAbstainVoteValue(balance);
			setBalanceErr('');
		}
	};

	const checkIfFellowshipMember = async () => {
		if (!api || !apiReady) {
			return;
		}

		if (!api?.query?.fellowshipCollective?.members?.entries) {
			return;
		}

		// using any because it returns some Codec types
		api.query.fellowshipCollective.members.entries().then((entries: any) => {
			const members: string[] = [];

			for (let i = 0; i < entries.length; i++) {
				// key split into args part to extract
				const [{ args: [accountId] }, optInfo] = entries[i];
				if (optInfo.isSome) {
					members.push(accountId.toString());
				}
			}

			addresses && addresses.some(address => {
				if (members.includes(address)) {
					setIsFellowshipMember(true);
					// this breaks the loop as soon as we find a matching address
					return true;
				}
				return false;
			});

			setFetchingFellowship(false);

		});
	};

	useEffect(() => {
		if (!api || !apiReady) {
			return;
		}

		checkIfFellowshipMember();

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	if (isLoggedOut()) {
		return <LoginToVote />;
	}

	const ConvictionSelect = ({ className }: { className?:string }) =>

		<Form.Item className={className}>
			<label  className='inner-headings'>
				Vote lock
			</label>
			<Select onChange={(key) => setConviction(Number(key))} size='large' className='' defaultValue={conviction} suffixIcon ={<DownIcon/>}>
				{convictionOpts}
			</Select>

		</Form.Item>;

	const handleOnVoteChange = (value:any) => {
		setVote(value as EVoteDecisionType);
		ayeNayForm.setFieldValue('balance', '');
		splitForm.setFieldValue('nayVote','');
		splitForm.setFieldValue('ayeVote','');
		abstainFrom.setFieldValue('abstainVote', '');
		abstainFrom.setFieldValue('ayeVote', '');
		abstainFrom.setFieldValue('nayVote', '');
		onBalanceChange(ZERO_BN);
	};

	const handleSubmit = async () => {

		if (!referendumId && referendumId !== 0) {
			console.error('referendumId not set');
			return;
		}

		if (!api ||!apiReady) {
			return;
		}

		if(!lockedBalance) return;
		if(availableBalance.lte(lockedBalance)) return;

		if(lockedBalance && availableBalance.lte(lockedBalance)) {
			setBalanceErr('Insufficient balance.');
			return;
		}
		if(ayeVoteValue && availableBalance.lte(ayeVoteValue) || nayVoteValue && availableBalance.lte(nayVoteValue) || abstainVoteValue && availableBalance.lte(abstainVoteValue) ) {
			setBalanceErr('Insufficient balance.');
			return;
		}

		const totalVoteValue = (ayeVoteValue || ZERO_BN).add(nayVoteValue || ZERO_BN)?.add(abstainVoteValue || ZERO_BN).add(lockedBalance || ZERO_BN);
		setVoteValues((prevState) => ({
			...prevState,
			totalVoteValue:totalVoteValue
		}));
		if (totalVoteValue?.gte(availableBalance)) {
			setBalanceErr('Insufficient balance.');
			return;
		}

		setLoadingStatus({ isLoading: true, message: '' });

		let voteTx = null;

		if(proposalType === ProposalType.OPEN_GOV){

			if(vote === EVoteDecisionType.AYE ) {

				voteTx = api.tx.convictionVoting.vote(referendumId, { Standard: { balance: lockedBalance, vote: { aye:true, conviction } } });

			}
			else if(vote === EVoteDecisionType.NAY ) {

				voteTx = api.tx.convictionVoting.vote(referendumId, { Standard: { balance: lockedBalance, vote: { aye:false, conviction } } });

			}

			else if(vote === EVoteDecisionType.SPLIT) {
				try {
					await splitForm.validateFields();

					// if form is valid
					const  ayeVote = ayeVoteValue?.toString();
					const  nayVote = nayVoteValue?.toString();
					setVoteValues((prevState) => ({
						...prevState,
						ayeVoteValue:ayeVoteValue,
						nayVoteValue:nayVoteValue
					}));
					voteTx = api.tx.convictionVoting.vote(referendumId, { Split: { aye:`${ayeVote}`,nay:`${nayVote}` } });
				} catch (e) {
					console.log(e);
				}
				finally{
					setAyeVoteValue(ZERO_BN);
					setNayVoteValue(ZERO_BN);
				}
			}

			else if(vote === EVoteDecisionType.ABSTAIN && ayeVoteValue && nayVoteValue) {
				try {
					await abstainFrom.validateFields();
					// if form is valid
					const  abstainVote = abstainVoteValue?.toString();
					const  ayeVote = ayeVoteValue?.toString();
					const  nayVote = nayVoteValue?.toString();
					setVoteValues((prevState) => ({
						...prevState,
						abstainVoteValue:abstainVoteValue,
						ayeVoteValue:ayeVoteValue,
						nayVoteValue:nayVoteValue
					}));
					voteTx = api.tx.convictionVoting.vote(referendumId, { SplitAbstain: {  abstain:`${abstainVote}`,aye:`${ayeVote}`, nay:`${nayVote}` } });
				} catch (e) {
					console.log(e);
				}
				finally{
					setAbstainVoteValue(ZERO_BN);
					setNayVoteValue(ZERO_BN);
					setAyeVoteValue(ZERO_BN);
				}
			}
		} else if(proposalType === ProposalType.FELLOWSHIP_REFERENDUMS) {
			if(vote === EVoteDecisionType.AYE){
				voteTx = api.tx.fellowshipCollective.vote(referendumId, true);
			}else{
				voteTx = api.tx.fellowshipCollective.vote(referendumId, false);
			}
		}
		else{
			if(vote === EVoteDecisionType.AYE){
				voteTx = api.tx.democracy.vote(referendumId, { Standard: { balance: lockedBalance, vote: { aye:true, conviction } } });
			}
			else{
				voteTx = api.tx.democracy.vote(referendumId, { Standard: { balance: lockedBalance, vote: { aye:false , conviction } } });
			}
		}

		if(multisig){
			const voteReferendumByMultisig = async (tx:any) => {
				try{
					await connect();
					setLoadingStatus({ isLoading: true, message: 'Creating a multisig transaction' });
					const { error } = await client.customTransactionAsMulti(multisig, tx);
					if(error){
						throw new Error(error.error);
					}
					setShowModal(false);
					setSuccessModal(true);
					queueNotification({
						header: 'Success!',
						message: `Your vote on Referendum #${referendumId} will be successful once approved by other signatories.`,
						status: NotificationStatus.SUCCESS
					});
				}catch(error){
					console.log(':( transaction failed');
					console.error('ERROR:', error);
					queueNotification({
						header: 'Failed!',
						message: error.message,
						status: NotificationStatus.ERROR
					});
				}finally{
					setLoadingStatus({ isLoading: false, message: '' });
				}
			};
			setLoadingStatus({ isLoading: true, message: 'Please login to polkasafe' });
			await voteReferendumByMultisig(voteTx);
			return;
		}

		const onSuccess = () => {
			setLoadingStatus({ isLoading: false, message: '' });
			queueNotification({
				header: 'Success!',
				message: `Vote on referendum #${referendumId} successful.`,
				status: NotificationStatus.SUCCESS
			});
			setLastVote({
				balance: totalVoteValue,
				conviction: conviction,
				decision: vote,
				time: new Date()
			});
			setShowModal(false);
			setSuccessModal(true);
		};
		const onFailed = (message: string) => {
			setLoadingStatus({ isLoading: false, message: '' });
			console.log(':( transaction failed');
			queueNotification({
				header: 'Failed!',
				message,
				status: NotificationStatus.ERROR
			});
		};
		if(!voteTx) return;

		await executeTx({ address,
			api,
			errorMessageFallback: 'Transaction failed.',
			network,
			onBroadcast:() => setLoadingStatus({ isLoading: true, message: '' }),
			onFailed,
			onSuccess,
			params: network === 'equilibrium' ? { nonce: -1 } : {},
			tx: voteTx
		});

	};

	const decisionOptions = isOpenGovSupported(network) ? [
		{
			label: <div className={`flex items-center justify-center text-[#576D8B] w-[131px] h-[32px] rounded-[4px] ${vote === 'aye'? 'bg-[#2ED47A] text-white' : ''}`}>{vote === EVoteDecisionType.AYE ? <LikeWhite className='mr-2 mb-[3px]' /> : <LikeGray className='mr-2 mb-[3px]' /> }<span className='font-medium text-base'>Aye</span></div>,
			value: 'aye'
		},
		{
			label: <div className={`flex items-center justify-center text-[#576D8B] w-[126px] h-[32px] rounded-[4px] ${vote === 'nay'? 'bg-[#F53C3C] text-white' : ''}`}>{vote === EVoteDecisionType.NAY ? <DislikeWhite className='mr-2  ' /> : <DislikeGray className='mr-2' /> } <span className='font-medium text-base'>Nay</span></div>,
			value: 'nay'
		},
		{
			label: <div className={`flex items-center justify-center text-[#576D8B]  w-[126px] h-[32px] rounded-[4px] ${vote === 'split'? 'bg-[#FFBF60] text-white' : ''}`}> {vote === EVoteDecisionType.SPLIT ? <SplitWhite className='mr-2  ' /> : <SplitGray className='mr-2' /> } <span className='font-medium text-base'>Split</span> </div>,
			value: 'split'
		},
		{
			label: <div className={` flex items-center justify-center text-[#576D8B] ml-2  w-[126px] h-[32px] rounded-[4px] ${vote === 'abstain'? 'bg-[#407BFF] text-white' : ''}`}><StopOutlined className='mr-2 mb-[3px]'/> <span className='font-medium text-base'>Abstain</span></div>,
			value: 'abstain'
		}
	] : [
		{
			label: <div className={`flex items-center justify-center text-[#576D8B] w-full h-[32px] ml-1 mr-1 rounded-[4px] ${vote === 'aye'? 'bg-[#2ED47A] text-white' : ''}`}>{vote === EVoteDecisionType.AYE ? <LikeWhite className='mr-2 mb-[3px]' /> : <LikeGray className='mr-2 mb-[3px]' /> }<span className='font-medium text-base'>Aye</span></div>,
			value: 'aye'
		},
		{
			label: <div className={`flex items-center justify-center text-[#576D8B] w-full h-[32px] ml-1 mr-1 rounded-[4px] ${vote === 'nay'? 'bg-[#F53C3C] text-white' : ''}`}>{vote === EVoteDecisionType.NAY ? <DislikeWhite className='mr-2  ' /> : <DislikeGray className='mr-2' /> } <span className='font-medium text-base'>Nay</span></div>,
			value: 'nay'
		}];

	const VoteUI = <>
		<div className={className}>
			<Button
				className='bg-pink_primary hover:bg-pink_secondary text-lg mb-3 text-white border-pink_primary hover:border-pink_primary rounded-lg flex items-center justify-center p-7 w-[100%]'
				onClick={() => setShowModal(true)}
			>
				{lastVote === null || lastVote === undefined  ? 'Cast Vote Now' : 'Cast Vote Again' }
			</Button>
			<Modal
				open={showModal}
				onCancel={() => setShowModal(false)}
				footer={false}
				className={`w-[600px] ${poppins.variable} ${poppins.className} max-md:w-full max-h-[675px] rounded-[6px] alignment-close vote-referendum `}
				closeIcon={<CloseCross/>}
				wrapClassName={className}
				title={
					showMultisig ?
						<div className='h-[65px] -mt-5 border-0 border-solid border-b-[1.5px] border-[#D2D8E0] mr-[-24px] ml-[-24px] rounded-t-[6px] flex items-center gap-2 '>
							<ArrowLeft onClick={() => {setShowMultisig(false); setMultisig('');}} className='cursor-pointer absolute left-[24px] mt-1'/>
							<div className='flex gap-[8px] items-center'>
								<PolkasafeIcon className='ml-14'/>
								<span className='text-bodyBlue font-semibold tracking-[0.0015em] text-xl'>Cast Vote with Polkasafe Multisig</span>
							</div>

						</div>
						:
						<div className='h-[65px] -mt-5 border-0 border-solid border-b-[1.5px] border-[#D2D8E0] mr-[-24px] ml-[-24px] rounded-t-[6px] flex items-center gap-2'>
							<CastVoteIcon className='ml-6'/>
							<span className='text-bodyBlue font-semibold tracking-[0.0015em] text-xl'>Cast Your Vote</span>
						</div>
				}
			><>
					<Spin spinning={loadingStatus.isLoading } indicator={<LoadingOutlined />} tip={loadingStatus.message}>
						<>
							<div className='mb-6'>
								<div className='text-sm font-normal flex items-center justify-center text-[#485F7D] mt-3'>Select a wallet</div>
								<div className='flex items-center gap-x-5 mt-1 justify-center'>
									{availableWallets[Wallet.POLKADOT] && <WalletButton className={`${wallet === Wallet.POLKADOT? ' w-[64px] h-[48px] hover:border-pink_primary border border-solid border-pink_primary': 'w-[64px] h-[48px]'}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.POLKADOT)} name="Polkadot" icon={<WalletIcon which={Wallet.POLKADOT} className='h-6 w-6'  />} />}
									{availableWallets[Wallet.TALISMAN] && <WalletButton className={`${wallet === Wallet.TALISMAN? 'w-[64px] h-[48px] hover:border-pink_primary border border-solid border-pink_primary': 'w-[64px] h-[48px]'}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.TALISMAN)} name="Talisman" icon={<WalletIcon which={Wallet.TALISMAN} className='h-6 w-6'  />} />}
									{availableWallets[Wallet.SUBWALLET] &&  <WalletButton className={`${wallet === Wallet.SUBWALLET? 'w-[64px] h-[48px] hover:border-pink_primary border border-solid border-pink_primary': 'w-[64px] h-[48px]'}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.SUBWALLET)} name="Subwallet" icon={<WalletIcon which={Wallet.SUBWALLET} className='h-6 w-6' />} />}
									{
										(window as any).walletExtension?.isNovaWallet && availableWallets[Wallet.NOVAWALLET] &&
				<WalletButton disabled={!apiReady} className={`${wallet === Wallet.NOVAWALLET? 'border border-solid border-pink_primary  w-[64px] h-[48px]': 'w-[64px] h-[48px]'}`} onClick={(event) => handleWalletClick((event as any), Wallet.NOVAWALLET)} name="Nova Wallet" icon={<WalletIcon which={Wallet.NOVAWALLET} className='h-6 w-6' />} />
									}
									{
										['polymesh'].includes(network) && availableWallets[Wallet.POLYWALLET]?
											<WalletButton disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.POLYWALLET)} className={`${wallet === Wallet.POLYWALLET? 'border border-solid border-pink_primary  w-[64px] h-[48px]': 'w-[64px] h-[48px]'}`}  name="PolyWallet" icon={<WalletIcon which={Wallet.POLYWALLET} className='h-6 w-6'  />} />
											: null
									}
								</div>
								{ canUsePolkasafe(network) && !showMultisig &&
							<div className='w-[50%] flex flex-col m-auto mt-3 gap-3'>
								<Divider className='m-0'>OR</Divider>
								<div className='w-full flex justify-center'>
									<WalletButton
										className='text-sm text-bodyBlue font-semibold !border-[#D2D8E0]'
										onClick={() => {
											setShowMultisig(!showMultisig);
										}}
										name="Polkasafe"
										icon={<WalletIcon which={Wallet.POLKASAFE} className='w-6 h-6'/> }
										text={'Cast Vote with Multisig'} />
								</div>
							</div>
								}
							</div>
							{showMultisig && initiatorBalance.lte(totalDeposit) && multisig &&
								<Alert
									message={`The Free Balance in your selected account is less than the Minimum Deposit ${formatBnBalance(totalDeposit, { numberAfterComma: 3, withUnit: true }, network)} required to create a Transaction.`}
									showIcon
									className='mb-6'
								/>
							}
							{balanceErr.length > 0 && wallet && <Alert type='info' message={balanceErr} showIcon className='mb-4'/>}
							{walletErr.error === 1 && !loadingStatus.isLoading && <Alert message={walletErr.message} description={walletErr.description} showIcon/>}
							{accounts.length === 0  && wallet && !loadingStatus.isLoading && <Alert message='No addresses found in the address selection tab.' showIcon type='info' />}
							{
								accounts.length > 0 ?
									showMultisig ?
										<MultisigAccountSelectionForm
											title='Select Address'
											accounts={accounts}
											address={address}
											withBalance
											onAccountChange={onAccountChange}
											onBalanceChange={handleOnBalanceChange}
											className={`${poppins.variable} ${poppins.className} text-sm font-normal text-[#485F7D]`}
											walletAddress={multisig}
											setWalletAddress={setMultisig}
											containerClassName='gap-[20px]'
											showMultisigBalance={true}
											canMakeTransaction={!initiatorBalance.lte(totalDeposit)}
										/> :
										<AccountSelectionForm
											title='Vote with Account'
											accounts={accounts}
											address={address}
											withBalance
											onAccountChange={onAccountChange}
											onBalanceChange={handleOnBalanceChange}
											className={`${poppins.variable} ${poppins.className} text-sm font-normal text-[#485F7D]`}
											inputClassName='rounded-[4px] px-3 py-1'
											withoutInfo={true}
										/>
									: walletErr.message.length === 0 && !wallet && !loadingStatus.isLoading ? <Alert message='Please select a wallet.' showIcon type='info' />: null
							}

							{/* aye nye split abstain buttons */}
							<h3 className='inner-headings mt-[24px] mb-[2px]'>Choose your vote</h3>
							<Segmented
								block
								className={`${className} mb-6 border-solid border-[1px] bg-white border-[#D2D8E0] rounded-[4px] w-full`}
								size="large"
								value={vote}
								onChange={(value) => {
									handleOnVoteChange(value);
								}}
								options={decisionOptions}
								disabled={!api || !apiReady}
							/>
							{
								proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote !== EVoteDecisionType.SPLIT && vote !== EVoteDecisionType.ABSTAIN &&
							<Form
								form={ayeNayForm}
								name="aye-nay-form"
								onFinish={handleSubmit}
								style={{ maxWidth: 600 }}
							>
								<BalanceInput
									label={'Lock balance'}
									helpText={'Amount of you are willing to lock for this vote.'}
									placeholder={'Add balance'}
									onChange={onBalanceChange}
									className='text-sm font-medium border-[#D2D8E0]'
								/>

								<ConvictionSelect className={`${className}`} />

								<div className='flex justify-end mt-[-3px] pt-5 mr-[-24px] ml-[-24px] border-0 border-solid border-t-[1px] border-[#D2D8E0]'>
									<Button className='w-[134px] h-[40px] rounded-[4px] text-[#E5007A] bg-[white] mr-[15px] font-semibold border-[#E5007A]' onClick={() => setShowModal(false)}>Cancel</Button>
									<Button className={`w-[134px] h-[40px] rounded-[4px] text-[white] bg-[#E5007A] mr-[24px] font-semibold border-0 ${(!wallet || !lockedBalance) && 'opacity-50'}`} htmlType='submit' disabled={!wallet || !lockedBalance || (showMultisig && !multisig) || (showMultisig && initiatorBalance.lte(totalDeposit))}>Confirm</Button>
								</div>
							</Form>
							}

							{
								proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote === EVoteDecisionType.SPLIT &&
							<Form
								form={splitForm}
								name="split-form"
								onFinish={handleSubmit}
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

								<div className='flex justify-end mt-[-1px] pt-5 mr-[-24px] ml-[-24px] border-0 border-solid border-t-[1px] border-[#D2D8E0]'>
									<Button className='w-[134px] h-[40px] rounded-[4px] text-[#E5007A] bg-[white] mr-[15px] font-semibold border-[#E5007A]' onClick={() => setShowModal(false)}>Cancel</Button>
									<Button className={`w-[134px] h-[40px] rounded-[4px] text-[white] bg-[#E5007A] mr-[24px] font-semibold border-0 ${(!wallet || !lockedBalance) && 'opacity-50'}`} htmlType='submit' disabled={!wallet || !lockedBalance || (showMultisig && !multisig)}>Confirm</Button>
								</div>
							</Form>
							}

							{
								proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote === 'abstain' &&
							<Form
								form={abstainFrom}
								name="abstain-form"
								onFinish={handleSubmit}
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

								<div className='flex justify-end mt-[-1px] pt-5 mr-[-24px] ml-[-24px] border-0 border-solid border-t-[1px] border-[#D2D8E0]'>
									<Button className='w-[134px] h-[40px] rounded-[4px] text-[#E5007A] bg-[white] mr-[15px] font-semibold border-[#E5007A]' onClick={() => setShowModal(false)}>Cancel</Button>
									<Button className={`w-[134px] h-[40px] rounded-[4px] text-[white] bg-[#E5007A] mr-[24px] font-semibold border-0 ${(!wallet || !lockedBalance) && 'opacity-50'}`} htmlType='submit' disabled={!wallet || !lockedBalance || (showMultisig && !multisig)}>Confirm</Button>
								</div>
							</Form>
							}

						</>

					</Spin>
				</>
			</Modal>
			<VoteInitiatedModal title={multisig ? 'Voting with Polkasafe Multisig initiated':'Voting' }  vote={vote} balance={voteValues.totalVoteValue} open={successModal} setOpen={setSuccessModal}  address={address} multisig={multisig ? multisig : ''} conviction={conviction}  votedAt={ dayjs().format('HH:mm, Do MMMM YYYY')} ayeVoteValue={voteValues.ayeVoteValue} nayVoteValue={voteValues.nayVoteValue} abstainVoteValue={voteValues.abstainVoteValue} icon={multisig ? <MultisigSuccessIcon/>: <SuccessIcon/>}/>
		</div>
	</>;

	if(proposalType === ProposalType.FELLOWSHIP_REFERENDUMS) {
		if(!fetchingFellowship) {
			if(isFellowshipMember) return VoteUI;

			return <div className={className}>Only fellowship members may vote.</div>;

		} else {
			return <div className={className}>Fetching fellowship members...</div>;
		}
	}

	return VoteUI ;
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
.vote-referendum  .ant-modal-close{
  margin-top: 4px;
}
.vote-referendum  .ant-modal-close:hover{
  margin-top: 4px;
}
.vote-referendum .ant-select-selector{
	border:1px soild !important;
	border-color:#D2D8E0 !important;
	height: 40px;
	border-radius:4px !important;
}
.vote-referendum .ant-select-selection-item{
	font-style: normal !important;
	font-weight: 400 !important;
	font-size: 14px !important;
	display: flex;
	align-items: center;
	line-height: 21px !important;
	letter-spacing: 0.0025em !important;
	color: #243A57 !important;
}

.vote-referendum .ant-input-number-in-from-item{
	height: 39.85px !important;
}
.vote-referendum .ant-segmented-item-label{
	display:flex ;
	justify-content: center;
	align-items:center;
	height:32px !important;
	border-radius:4px !important;
	padding-right:0px !important;
	padding-left:0px !important;
}
.vote-referendum .ant-segmented {
	padding :0px !important;
}

.vote-referendum .ant-select-selection-item{
	color: #243A57 !important;
}
.vote-referendum .ant-select-focused{
	border: 1px solid #E5007A !important;
	border-radius:4px !important;
}
.vote-referendum.ant-segmented-item-selected{
	box-shadow: none !important;
	padding-right:0px !important;
}
.vote-referendum .ant-segmented-item{
	padding: 0px !important;
}

`;

