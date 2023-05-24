// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Button, Form, Modal, Segmented, Select, Spin } from 'antd';
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
import FilteredError from '~src/ui-components/FilteredError';
import addEthereumChain from '~src/util/addEthereumChain';
import LoginToVote from '../LoginToVoteOrEndorse';
import CastVoteIcon from '~assets/icons/cast-vote-icon.svg';
import LikeWhite from '~assets/icons/like-white.svg';
import LikeGray from '~assets/icons/like-gray.svg';
import DislikeWhite from '~assets/icons/dislike-white.svg';
import DislikeGray from '~assets/icons/dislike-gray.svg';

import CloseCross from '~assets/icons/close-cross-icon.svg';
import DownIcon from '~assets/icons/down-icon.svg';
const ZERO_BN = new BN(0);

interface Props {
	className?: string
	referendumId?: number | null | undefined
	onAccountChange: (address: string) => void
	lastVote: string | null | undefined
	setLastVote: React.Dispatch<React.SetStateAction<string | null | undefined>>
}

const abi = require('../../../../moonbeamAbi.json');

const contractAddress = process.env.NEXT_PUBLIC_DEMOCRACY_PRECOMPILE;

const VoteReferendum = ({ className, referendumId, onAccountChange, lastVote, setLastVote }: Props) => {
	const [showModal, setShowModal] = useState<boolean>(false);
	const { walletConnectProvider, setWalletConnectProvider, isLoggedOut } = useUserDetailsContext();
	const [lockedBalance, setLockedBalance] = useState<BN | undefined>(undefined);
	const { apiReady } = useApiContext();
	const [address, setAddress] = useState<string>('');
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [isAccountLoading, setIsAccountLoading] = useState(false);
	const { setPostData } = usePostDataContext();
	const { network } = useNetworkContext();
	const [wallet, setWallet] = useState<Wallet>();
	const [loginWallet, setLoginWallet] = useState<Wallet>();

	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const CONVICTIONS: [number, number][] = [1, 2, 4, 8, 16, 32].map((lock, index) => [index + 1, lock]);
	const [balanceErr, setBalanceErr] = useState('');
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);

	const [vote,setVote] = useState< EVoteDecisionType>(EVoteDecisionType.AYE);

	const convictionOpts = useMemo(() => [
		<Select.Option key={0} value={0}>{'0.1x voting balance, no lockup period'}</Select.Option>,
		...CONVICTIONS.map(([value, lock]) =>
			<Select.Option key={value} value={value}>{`${value}x voting balance, locked for ${lock} enactment period(s)`}</Select.Option>
		)
	],[CONVICTIONS]);

	const [conviction, setConviction] = useState<number>(0);

	useEffect(() => {
		if(!window) return;
		const Wallet = localStorage.getItem('loginWallet') ;
		Wallet && setLoginWallet(Wallet as  Wallet);
	}, [apiReady]);

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

	//const onBalanceChange = (balance: BN) => setLockedBalance(balance);

	const onBalanceChange = (balance: BN) => {
		if(balance && balance.eq(ZERO_BN)) {
			setBalanceErr('');
		}
		else if(balance && availableBalance.lt(balance)){
			setBalanceErr('Insufficient balance.');
		}else{
			setBalanceErr('');
		}
		setLockedBalance(balance);
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

		voteContract.methods
			.standard_vote(
				referendumId,
				aye,
				lockedBalance.toString(),
				conviction
			)
			.send({
				from: address,
				to: contractAddress
			})
			.then(() => {
				setLoadingStatus({ isLoading: false, message: '' });
				setLastVote(aye ? 'aye' : 'nay');
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

	const VoteLock = ({ className }: { className?:string }) =>
		<Form.Item className={className}>
			<label  className='inner-headings'>
				Vote lock
			</label>

			<Select onChange={onConvictionChange} size='large' className='rounded-[4px]' defaultValue={conviction} suffixIcon ={<DownIcon/>} >
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

	const handleDefaultWallet=async(wallet:Wallet) => {
		setWallet(wallet);
		await getAccounts(wallet);
		if (walletConnectProvider) {
			await getWalletConnectAccounts();
		}
	};
	// eslint-disable-next-line react-hooks/rules-of-hooks
	useEffect(() => {
		if(!loginWallet) return ;
		setWallet(loginWallet);
		handleDefaultWallet(loginWallet);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[loginWallet]);

	const decisionOptions = [
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
				className='bg-pink_primary hover:bg-pink_secondary text-lg mb-3 text-white border-pink_primary hover:border-pink_primary rounded-lg flex items-center justify-center p-7 w-[95%]'
				onClick={openModal}
			>
				{lastVote == null || lastVote == undefined  ? 'Cast Vote Now' : 'Cast Vote Again' }
			</Button>
			<Modal
				open={showModal}
				onCancel={() => setShowModal(false)}
				footer={false}
				className={' w-[604px] max-h-[675px] rounded-[6px] alignment-close'}
				closeIcon={<CloseCross/>}
			>
				<>
					<Spin spinning={loadingStatus.isLoading || isAccountLoading} indicator={<LoadingOutlined />}>

						<div className='h-[72px] mt-[-20px] flex align-middle  border-0 border-solid border-b-[1.5px] border-[#D2D8E0] mr-[-24px] ml-[-24px] rounded-t-[6px]'>
							<CastVoteIcon className='mt-[24px] mr-[11px] ml-[24px]'/>
							<h4 className='cast-vote-heading mt-[22px]'>Cast Your Vote</h4>
						</div>

						<div className='flex items-center gap-x-5 mt-[22px] mb-[24px]'>
							<WalletButton className={`${wallet === Wallet.TALISMAN? 'border border-solid border-pink_primary': ''}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.TALISMAN)} name="Talisman" icon={<WalletIcon which={Wallet.TALISMAN} className='h-6 w-6'  />} />
							<WalletButton className={`${wallet === Wallet.METAMASK? 'border border-solid border-pink_primary': ''}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.METAMASK)} name="MetaMask" icon={<WalletIcon which={Wallet.METAMASK} className='h-6 w-6' />} />
						</div>

						{
							accounts.length > 0?
								<AccountSelectionForm
									title='Vote with Account'
									accounts={accounts}
									address={address}
									withBalance
									onAccountChange={onAccountChange}
									onBalanceChange={handleOnBalanceChange}
									className={'text-sidebarBlue mb-[21px]'}
									inputClassName='bg-[#F6F7F9] h-[40px] rounded-[4px]'
								/>
								: !wallet? <FilteredError text='Please select a wallet.' />: null
						}
						{balanceErr.length > 0 && <div className='-mt-2 -mb-3 text-sm text-red-500'>{balanceErr}</div>}

						<h3 className='inner-headings mt-[24px] mb-0'>Choose your vote</h3>
						<Segmented
							block
							className={`${className}  mb-[24px] border-solid border-[1px] bg-white hover:bg-white border-[#D2D8E0] rounded-[4px] w-full py-0 px-0`}
							size="large"
							value={vote}
							onChange={(value) => {
								setVote(value as EVoteDecisionType);
							}}
							options={decisionOptions}
							disabled={!apiReady}
						/>
						{
							<Form onFinish={async () => {
								vote === EVoteDecisionType.AYE && await voteReferendum(true);
								vote === EVoteDecisionType.AYE && await voteReferendum(false);
							}}>

								<BalanceInput
									label={'Lock balance'}
									helpText={'Amount of you are willing to lock for this vote.'}
									placeholder={'Add Balance'}
									onChange={onBalanceChange}
									inputClassName='text-[#7c899b] text-sm'
								/>
								<VoteLock className={`${className}`} />

								<div className='flex justify-end mt-[-1px] pt-5 mr-[-24px] ml-[-24px] border-0 border-solid border-t-[1.5px] border-[#D2D8E0]'>
									<Button className='w-[134px] h-[40px] rounded-[4px] text-[#E5007A] bg-[white] mr-[15px] font-semibold border-[#E5007A]' onClick={() => setShowModal(false)}>Cancel</Button>
									<Button className='w-[134px] h-[40px] rounded-[4px] text-[white] bg-[#E5007A] mr-[24px] font-semibold border-0' htmlType='submit'>Confirm</Button>
								</div>
							</Form>
						}

					</Spin>
				</>
			</Modal>
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
	
	.alignment-close .ant-input-number-in-from-item{
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
		margin-top: 6px;
	}
	.alignment-close .ant-modal-close:hover{
		margin-top: 6px;
	}
`;
