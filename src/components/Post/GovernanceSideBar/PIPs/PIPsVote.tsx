// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined  } from '@ant-design/icons';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Alert, Button, Form, Modal, Segmented, Select, Spin } from 'antd';
import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
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
import CloseCross from '~assets/icons/close-cross-icon.svg';
import checkWalletForSubstrateNetwork from '~src/util/checkWalletForSubstrateNetwork';
import dayjs from 'dayjs';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import blockToDays from '~src/util/blockToDays';
import { ApiPromise } from '@polkadot/api';
import SuccessIcon from '~assets/delegation-tracks/success-delegate.svg';
import { network as AllNetworks } from '~src/global/networkConstants';
import executeTx from '~src/util/executeTx';
import VoteInitiatedModal from '../Referenda/Modal/VoteSuccessModal';

const ZERO_BN = new BN(0);

interface Props {
	className?: string;
	referendumId?: number | null | undefined;
	onAccountChange: (address: string) => void;
	lastVote: ILastVote | undefined;
	setLastVote: (pre: ILastVote) => void;
	proposalType: ProposalType;
	address: string;
	hash: string;
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

const PIPsVote = ({ className, referendumId, onAccountChange, lastVote, setLastVote, proposalType, address, hash }: Props) => {
	const userDetails = useUserDetailsContext();
	const { isLoggedOut, loginAddress } = userDetails;
	const [showModal, setShowModal] = useState<boolean>(false);
	const [lockedBalance, setLockedBalance] = useState<BN>(ZERO_BN);
	const { api, apiReady } = useApiContext();
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const { network } = useNetworkContext();
	const [wallet,setWallet] = useState<Wallet>();
	const [availableWallets, setAvailableWallets] = useState<any>({});
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [loginWallet, setLoginWallet] = useState<Wallet>();
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [balanceErr, setBalanceErr] = useState('');
	const [successModal,setSuccessModal] = useState<boolean>(false);
	const [isPolymeshCommitteeMember, setIsPolymeshCommitteeMember] = useState<boolean>(false);
	const [ayeNayForm] = Form.useForm();

	const [walletErr, setWalletErr] = useState<INetworkWalletErr>({ description: '', error: 0, message: '' });
	const [vote, setVote] = useState< EVoteDecisionType>(EVoteDecisionType.AYE);

	const getPolymeshCommitteeMembers = async() => {
		const members = await api?.query?.polymeshCommittee?.members().then((members) => members.toJSON());
		if((members as string[]).includes(address)){
			setIsPolymeshCommitteeMember(true);
		}
	};

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
		getPolymeshCommitteeMembers();
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
		if(!api || !apiReady){
			return;
		}
		let balance = ZERO_BN;

		try{
			balance = new BN(balanceStr);
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
		await getAccounts(wallet);
		setLoadingStatus({ ...loadingStatus, isLoading: false });
	};

	const onBalanceChange = (balance: BN) => {
		if(!balance) return;
		else if(availableBalance.lte(balance)){
			setBalanceErr('Insufficient balance.');
		}else{
			setBalanceErr('');
			setLockedBalance(balance);
		}
	};

	if (isLoggedOut()) {
		return <LoginToVote />;
	}

	const handleOnVoteChange = (value:any) => {
		setVote(value as EVoteDecisionType);
		ayeNayForm.setFieldValue('balance', '');
		onBalanceChange(ZERO_BN);
	};

	const handleSubmit = async () => {

		if (!referendumId) {
			console.error('referendumId not set');
			return;
		}

		let voteTx = null;
		if (!api ||!apiReady) return;

		if([ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS].includes(proposalType)){

			voteTx = api.tx.polymeshCommittee.vote(hash, referendumId, vote === EVoteDecisionType.AYE );

		}else{
			if(!lockedBalance) return;
			if(availableBalance.lte(lockedBalance)) return;

			if(lockedBalance && availableBalance.lte(lockedBalance)) {
				setBalanceErr('Insufficient balance.');
				return;
			}
			voteTx = api.tx.pips.vote(referendumId, vote, lockedBalance);
		}

		setLoadingStatus({ isLoading: true, message: '' });

		const onSuccess = () => {
			setLoadingStatus({ isLoading: false, message: '' });
			queueNotification({
				header: 'Success!',
				message: `Vote on referendum #${referendumId} successful.`,
				status: NotificationStatus.SUCCESS
			});

			const lastVote = {
				decision: vote,
				time: new Date()
			};

			if(ProposalType.COMMUNITY_PIPS){
				setLastVote(lastVote);
			}else{
				const balance = new BN(ayeNayForm.getFieldValue('balance') || 0);
				setLastVote({
					...lastVote,
					balance
				});
			}

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
			onFailed,
			onSuccess,
			tx: voteTx
		});

	};

	const decisionOptions = [
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
				className={`w-[500px] ${poppins.variable} ${poppins.className} max-md:w-full max-h-[605px] rounded-[6px] alignment-close vote-referendum `}
				closeIcon={<CloseCross/>}
				wrapClassName={className}
				title={
					<div className='h-[65px] -mt-5 border-0 border-solid border-b-[1.5px] border-[#D2D8E0] mr-[-24px] ml-[-24px] rounded-t-[6px] flex items-center gap-2'>
						<CastVoteIcon className='ml-6'/>
						<span className='text-bodyBlue font-semibold tracking-[0.0015em] text-xl'>Cast Your Vote</span>
					</div>
				}
			>
				<>
					<Spin spinning={loadingStatus.isLoading } indicator={<LoadingOutlined />} tip={loadingStatus.message}>
						<>
							<div className='mb-6'>
								<div className='text-sm font-normal flex items-center justify-center text-[#485F7D] mt-3'>Select a wallet</div>
								<div className='flex items-center gap-x-5 mt-1 justify-center'>
									{availableWallets[Wallet.POLKADOT] && <WalletButton className={`${wallet === Wallet.POLKADOT? ' w-[64px] h-[48px] hover:border-pink_primary border border-solid border-pink_primary': 'w-[64px] h-[48px]'}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.POLKADOT)} name="Polkadot" icon={<WalletIcon which={Wallet.POLKADOT} className='h-6 w-6'  />} />}
									{availableWallets[Wallet.TALISMAN] && <WalletButton className={`${wallet === Wallet.TALISMAN? 'w-[64px] h-[48px] hover:border-pink_primary border border-solid border-pink_primary': 'w-[64px] h-[48px]'}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.TALISMAN)} name="Talisman" icon={<WalletIcon which={Wallet.TALISMAN} className='h-6 w-6'  />} />}
									{availableWallets[Wallet.SUBWALLET] &&  <WalletButton className={`${wallet === Wallet.SUBWALLET? 'w-[64px] h-[48px] hover:border-pink_primary border border-solid border-pink_primary': 'w-[64px] h-[48px]'}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.SUBWALLET)} name="Subwallet" icon={<WalletIcon which={Wallet.SUBWALLET} className='h-6 w-6' />} />}
									{availableWallets[Wallet.POLKAGATE] &&  <WalletButton className={`${wallet === Wallet.POLKAGATE? 'w-[64px] h-[48px] hover:border-pink_primary border border-solid border-pink_primary': 'w-[64px] h-[48px]'}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.POLKAGATE)} name="PolkaGate" icon={<WalletIcon which={Wallet.POLKAGATE} className='h-6 w-6' />} />}
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
							</div>

							{balanceErr.length > 0 && ![ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS].includes(proposalType) && wallet && <Alert type='error' message={balanceErr} showIcon className='mb-4 rounded-[4px] h-10'/>}
							{walletErr.error === 1 && !loadingStatus.isLoading && <Alert message={walletErr.message} description={walletErr.description} showIcon/>}
							{accounts.length === 0  && wallet && !loadingStatus.isLoading && <Alert message='No addresses found in the address selection tab.' showIcon type='info' />}
							{
								accounts.length > 0 ?
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
								{![ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS].includes(proposalType) && <BalanceInput
									label={'Lock balance'}
									helpText={'Amount of you are willing to lock for this vote.'}
									placeholder={'Add balance'}
									onChange={onBalanceChange}
									className='text-sm font-medium border-[#D2D8E0]'
								/>}

								<div className='flex justify-end mt-[-3px] pt-5 mr-[-24px] ml-[-24px] border-0 border-solid border-t-[1px] border-[#D2D8E0]'>
									<Button className='w-[134px] h-[40px] rounded-[4px] text-[#E5007A] bg-[white] mr-[15px] font-semibold border-[#E5007A]' onClick={() => setShowModal(false)}>Cancel</Button>
									<Button className={`w-[134px] h-[40px] rounded-[4px] text-[white] bg-[#E5007A] mr-[24px] font-semibold border-0 ${(!wallet || !lockedBalance) && 'opacity-50'}`} htmlType='submit' disabled={!wallet || !lockedBalance }>Confirm</Button>
								</div>
							</Form>
							}
						</>

					</Spin>
				</>
			</Modal>
			<VoteInitiatedModal title={'Voting' }  vote={vote} balance={ZERO_BN } open={successModal} setOpen={setSuccessModal}  address={address} votedAt={ dayjs().format('HH:mm, Do MMMM YYYY')} icon={<SuccessIcon/>}/>
		</div>
	</>;

	if([ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS].includes(proposalType)) {
		if(isPolymeshCommitteeMember) return VoteUI;

		return <div className={className}>Only Polymesh Committee members may vote.</div>;
	}

	return VoteUI ;
};

export default styled(PIPsVote)`
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

