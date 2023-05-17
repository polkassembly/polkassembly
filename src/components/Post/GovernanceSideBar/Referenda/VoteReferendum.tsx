// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined , StopOutlined } from '@ant-design/icons';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Button, Form, Modal, Segmented, Select, Spin } from 'antd';
import BN from 'bn.js';
import React, { useEffect, useMemo,useState } from 'react';
import { LoadingStatusType,NotificationStatus, Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import BalanceInput from 'src/ui-components/BalanceInput';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
import WalletButton from '~src/components/WalletButton';
import { useApiContext, useNetworkContext, useUserDetailsContext } from '~src/context';
import { APPNAME } from '~src/global/appName';
import { ProposalType } from '~src/global/proposalType';
import FilteredError from '~src/ui-components/FilteredError';
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
import CloseIcon from '~assets/icons/close.svg';

const ZERO_BN = new BN(0);

interface Props {
	className?: string
	referendumId?: number | null | undefined
	onAccountChange: (address: string) => void
	lastVote: string | null | undefined
	setLastVote: React.Dispatch<React.SetStateAction<string | null | undefined>>
	proposalType: ProposalType;
  address: string;
}

const VoteReferendum = ({ className, referendumId, onAccountChange, lastVote, setLastVote, proposalType, address }: Props) => {
	const { addresses, isLoggedOut } = useUserDetailsContext();
	const [showModal, setShowModal] = useState<boolean>(false);
	const [lockedBalance, setLockedBalance] = useState<BN | undefined>(undefined);
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

	useEffect(() => {
		if(!window) return;
		const Wallet = localStorage.getItem('loginWallet') ;
		if(Wallet){
			setLoginWallet(Wallet as  Wallet);
			setWallet(Wallet as Wallet);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const [splitForm] = Form.useForm();
	const [abstainFrom] = Form.useForm();
	const[ayeNayForm] = Form.useForm();
	const [abstainVoteValue, setAbstainVoteValue] = useState<BN | undefined>(undefined);
	const [ayeVoteValue, setAyeVoteValue] = useState<BN | undefined>(undefined);
	const [nayVoteValue, setNayVoteValue] = useState<BN | undefined>(undefined);

	enum EVoteDecisionType {
		AYE = 'aye',
		NAY = 'nay',
		ABSTAIN = 'abstain',
		SPLIT = 'split'
	}
	const [vote,setVote] = useState< EVoteDecisionType>(EVoteDecisionType.AYE);

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
	const handleWalletClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) => {
		setAccounts([]);
		onAccountChange('');
		event.preventDefault();
		setWallet(wallet);
		await getAccounts(wallet);
	};
	const convictionOpts = useMemo(() => [
		<Select.Option className='text-[#243A57]' key={0} value={0}>{'0.1x voting balance, no lockup period'}</Select.Option>,
		...CONVICTIONS.map(([value, lock]) =>
			<Select.Option className='text-[#243A57]' key={value} value={value}>{`${value}x voting balance, locked for ${lock} enactment period(s)`}</Select.Option>
		)
	],[CONVICTIONS]);

	const [conviction, setConviction] = useState<number>(0);

	const onConvictionChange = (value: any) => {
		setConviction(Number(value));
	};

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
	const openModal = () => {
		setShowModal(true);
	};
	const closeModal = () => {
		setShowModal(false);
	};

	const VoteLock = ({ className }: { className?:string }) =>

		<Form.Item className={className}>
			<label  className='inner-headings'>
				Vote lock
			</label>

			<Select onChange={onConvictionChange} size='large' className='' defaultValue={conviction}>
				{convictionOpts}
			</Select>

		</Form.Item>;

	const handleSubmit = async () => {

		if (!referendumId && referendumId !== 0) {
			console.error('referendumId not set');
			return;
		}

		if (!api ||!apiReady) {
			return;
		}

		if(lockedBalance && availableBalance.lt(lockedBalance)) {
			setBalanceErr('Insufficient balance.');
			return;
		}

		setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });

		let voteTx = null;

		if(proposalType === ProposalType.OPEN_GOV){

			if(vote === EVoteDecisionType.AYE ) {
				try {
					voteTx = api.tx.convictionVoting.vote(referendumId, { Standard: { balance: lockedBalance, vote: { aye:true, conviction } } });
				} catch (e) {
					console.log(e);
				}
			}
			else if(vote === EVoteDecisionType.NAY ) {
				try {
					voteTx = api.tx.convictionVoting.vote(referendumId, { Standard: { balance: lockedBalance, vote: { aye:false, conviction } } });
				} catch (e) {
					console.log(e);
				}
			}

			else if(vote === EVoteDecisionType.SPLIT) {
				try {
					await splitForm.validateFields();

					// if form is valid
					const  ayeVote = ayeVoteValue?.toString();
					const  nayVote = nayVoteValue?.toString();
					voteTx = api.tx.convictionVoting.vote(referendumId, { Split: { aye:`${ayeVote}`,nay:`${nayVote}` } });
				} catch (e) {
					console.log(e);
				}
				finally{
					setAyeVoteValue(undefined);
					setNayVoteValue(undefined);
				}
			}

			else if(vote === EVoteDecisionType.ABSTAIN && ayeVoteValue && nayVoteValue) {
				try {
					await abstainFrom.validateFields();
					// if form is valid
					const  abstainVote = abstainVoteValue?.toString();
					const  ayeVote = ayeVoteValue?.toString();
					const  nayVote = nayVoteValue?.toString();
					voteTx = api.tx.convictionVoting.vote(referendumId, { SplitAbstain: {  abstain:`${abstainVote}`,aye:`${ayeVote}`, nay:`${nayVote}` } });
				} catch (e) {
					console.log(e);
				}
				finally{
					setAbstainVoteValue(undefined);
					setNayVoteValue(undefined);
					setAyeVoteValue(undefined);
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
		if(network == 'equilibrium'){
			voteTx?.signAndSend(address, { nonce: -1 }, ({ status }) => {
				if (status.isInBlock) {
					setLoadingStatus({ isLoading: false, message: '' });
					queueNotification({
						header: 'Success!',
						message: `Vote on referendum #${referendumId} successful.`,
						status: NotificationStatus.SUCCESS
					});
					setLastVote(vote);
					console.log(`Completed at block hash #${status.asInBlock.toString()}`);
				} else {
					if (status.isBroadcast){
						setLoadingStatus({ isLoading: true, message: 'Broadcasting the vote' });
					}
					console.log(`Current status: ${status.type}`);
				}
			}).catch((error) => {
				setLoadingStatus({ isLoading: false, message: '' });
				console.log(':( transaction failed');
				console.error('ERROR:', error);
				queueNotification({
					header: 'Failed!',
					message: error.message,
					status: NotificationStatus.ERROR
				});
			});
		}else{
			voteTx?.signAndSend(address, ({ status }) => {
				if (status.isInBlock) {
					setLoadingStatus({ isLoading: false, message: '' });
					queueNotification({
						header: 'Success!',
						message: `Vote on referendum #${referendumId} successful.`,
						status: NotificationStatus.SUCCESS
					});
					setLastVote(vote);
					console.log(`Completed at block hash #${status.asInBlock.toString()}`);
				} else {
					if (status.isBroadcast){
						setLoadingStatus({ isLoading: true, message: 'Broadcasting the vote' });
					}
					console.log(`Current status: ${status.type}`);
				}
			}).catch((error) => {
				setLoadingStatus({ isLoading: false, message: '' });
				console.log(':( transaction failed');
				console.error('ERROR:', error);
				queueNotification({
					header: 'Failed!',
					message: error.message,
					status: NotificationStatus.ERROR
				});
			});

		}

	};

	const decisionOptions = [
		{
			label: <div className={`flex items-center justify-center text-[#576D8B] w-[131px] h-[32px] rounded-[4px] ${vote === 'aye'? 'bg-[#2ED47A] text-white' : ''}`}>{vote === EVoteDecisionType.AYE ? <LikeWhite className='mr-2 mb-[3px]' /> : <LikeGray className='mr-2 mb-[3px]' /> }<span className='font-semibold'>Aye</span></div>,
			value: 'aye'
		},
		{
			label: <div className={`flex items-center justify-center text-[#576D8B] w-[126px] h-[32px] rounded-[4px] ${vote === 'nay'? 'bg-[#F53C3C] text-white' : ''}`}>{vote === EVoteDecisionType.NAY ? <DislikeWhite className='mr-2  ' /> : <DislikeGray className='mr-2' /> } <span className='font-semibold'>Nay</span></div>,
			value: 'nay'
		},
		{
			label: <div className={`flex items-center justify-center text-[#576D8B]  w-[126px] h-[32px] rounded-[4px] ${vote === 'split'? 'bg-[#FFBF60] text-white' : ''}`}> {vote === EVoteDecisionType.SPLIT ? <SplitWhite className='mr-2  ' /> : <SplitGray className='mr-2' /> } <span className='font-semibold'>Split</span> </div>,
			value: 'split'
		},
		{
			label: <div className={`flex items-center justify-center text-[#576D8B]  w-[126px] h-[32px] rounded-[4px] ${vote === 'abstain'? 'bg-[#407BFF] text-white' : ''}`}><StopOutlined className='mr-2 mb-[3px]'/> <span className='font-semibold'>Abstain</span></div>,
			value: 'abstain'
		}
	];

	const VoteUI = <>
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
				className={`${poppins.variable} ${poppins.className} w-[604px] max-h-[675px] rounded-[6px] alignment-close`}
				closeIcon={<CloseIcon />}
				wrapClassName={className}
			><>
					<Spin spinning={loadingStatus.isLoading } indicator={<LoadingOutlined />}>

						<div className=''>
							<div className='h-[72px] mt-[-20px] flex align-middle  border-0 border-solid border-b-[1.5px] border-[#D2D8E0] mr-[-24px] ml-[-24px] rounded-t-[6px]'>
								<CastVoteIcon className='mt-[24px] mr-[11px] ml-[24px]'/>
								<h4 className='cast-vote-heading mt-[22px]'>Cast Your Vote</h4>
							</div>

							<div className='flex items-center gap-x-5 mt-[22px] mb-[24px]'>
								{availableWallets[Wallet.POLKADOT] && <WalletButton className={`${wallet === Wallet.POLKADOT? ' w-[69.29px] h-[44.39px] hover:border-pink_primary border border-solid border-pink_primary': ''}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.POLKADOT)} name="Polkadot" icon={<WalletIcon which={Wallet.POLKADOT} className='h-6 w-6'  />} />}
								{availableWallets[Wallet.TALISMAN] && <WalletButton className={`${wallet === Wallet.TALISMAN? 'w-[69.29px] h-[44.39px] hover:border-pink_primary border border-solid border-pink_primary': ''}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.TALISMAN)} name="Talisman" icon={<WalletIcon which={Wallet.TALISMAN} className='h-6 w-6'  />} />}
								{availableWallets[Wallet.SUBWALLET] &&  <WalletButton className={`${wallet === Wallet.SUBWALLET? 'w-[69.29px] h-[44.39px] hover:border-pink_primary border border-solid border-pink_primary': ''}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.SUBWALLET)} name="Subwallet" icon={<WalletIcon which={Wallet.SUBWALLET} className='h-6 w-6' />} />}
								{
									(window as any).walletExtension?.isNovaWallet && availableWallets[Wallet.NOVAWALLET] &&
                    <WalletButton disabled={!apiReady} className={`${wallet === Wallet.POLYWALLET? 'border border-solid border-pink_primary': ''}`} onClick={(event) => handleWalletClick((event as any), Wallet.NOVAWALLET)} name="Nova Wallet" icon={<WalletIcon which={Wallet.NOVAWALLET} className='h-6 w-6' />} />
								}
								{
									['polymesh'].includes(network) && availableWallets[Wallet.POLYWALLET]?
										<WalletButton disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.POLYWALLET)} name="PolyWallet" icon={<WalletIcon which={Wallet.POLYWALLET} className='h-6 w-6'  />} />
										: null
								}
							</div>

							{balanceErr.length > 0 && <div className='-mt-2 text-sm text-red-500'>{balanceErr}</div>}
							{
								accounts.length > 0 ?
									<AccountSelectionForm
										title='Vote with Account'
										accounts={accounts}
										address={address}
										withBalance
										onAccountChange={onAccountChange}
										onBalanceChange={handleOnBalanceChange}
										className={`${poppins.variable} ${poppins.className} text-sidebarBlue mb-[21px]`}
									/>
									: !wallet? <FilteredError text='Please select a wallet.' />: null
							}
							{accounts.length===0 && wallet && <FilteredError text='No addresses found in the address selection tab.' />}

							{/* aye nye split abstain buttons */}
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

									<VoteLock className={`${className}`} />

									<div className='flex justify-end mt-[-5px] pt-5 mr-[-24px] ml-[-24px] border-0 border-solid border-t-[1.5px] border-[#D2D8E0]'>
										<Button className='w-[134px] h-[40px] rounded-[4px] text-[#E5007A] bg-[white] mr-[15px] font-semibold border-[#E5007A]' onClick={closeModal}>Cancel</Button>
										<Button className='w-[134px] h-[40px] rounded-[4px] text-[white] bg-[#E5007A] mr-[24px] font-semibold border-0' htmlType='submit'>Confirm</Button>
									</div>
								</Form>
							}

							{
								proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote === 'split' &&
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
										onChange={(value) => {setAyeVoteValue(value);}}
										className='text-sm font-medium'
										formItemName={'ayeVote'}
									/>

									<BalanceInput
										label={'Nay vote value'}
										placeholder={'Add balance'}
										onChange={(value) => {setNayVoteValue(value);}}
										className='text-sm font-medium'
										formItemName={'nayVote'}
									/>

									<div className='flex justify-end mt-[-5px] pt-5 mr-[-24px] ml-[-24px] border-0 border-solid border-t-[1.5px] border-[#D2D8E0]'>
										<Button className='w-[134px] h-[40px] rounded-[4px] text-[#E5007A] bg-[white] mr-[15px] font-semibold border-[#E5007A]' onClick={closeModal}>Cancel</Button>
										<Button className='w-[134px] h-[40px] rounded-[4px] text-[white] bg-[#E5007A] mr-[24px] font-semibold border-0' htmlType='submit'>Confirm</Button>
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
										onChange={(value) => setAbstainVoteValue(value)}
										className='text-sm font-medium'
										formItemName={'abstainVote'}
									/>

									<BalanceInput
										label={'Aye vote value'}
										placeholder={'Add balance'}
										onChange={(value) => setAyeVoteValue(value) }
										className='text-sm font-medium'
										formItemName={'ayeVote'}
									/>

									<BalanceInput
										label={'Nay vote value'}
										placeholder={'Add balance'}
										onChange={(value) => setNayVoteValue(value)}
										className='text-sm font-medium'
										formItemName={'nayVote'}
									/>

									<div className='flex justify-end mt-[-5px] pt-5 mr-[-24px] ml-[-24px] border-0 border-solid border-t-[1.5px] border-[#D2D8E0]'>
										<Button className='w-[134px] h-[40px] rounded-[4px] text-[#E5007A] bg-[white] mr-[15px] font-semibold border-[#E5007A]' onClick={closeModal}>Cancel</Button>
										<Button className='w-[134px] h-[40px] rounded-[4px] text-[white] bg-[#E5007A] mr-[24px] font-semibold border-0' htmlType='submit'>Confirm</Button>
									</div>
								</Form>
							}

						</div>

					</Spin>
				</>
			</Modal>
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
	
	
	.ant-select-selector{
		border:1px soild !important;
		border-color:#D2D8E0 !important;
		height: 40px;
		border-radius:4px !important;
	}
	.ant-select-arrow{
		color:#96A4B6 !important;
		scale: .75 !important;
		
	 }
	.ant-select-selection-item{
		font-family: 'Poppins' !important;
		font-style: normal !important;
		font-weight: 400 !important;
		font-size: 14px !important;
		display: flex;
		align-items: center;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
		color: #243A57 !important;
	}

	.ant-input-number-in-from-item{
		height: 39.85px !important;
		
	}
	 .ant-segmented-group {
		gap:10px !important;
	 }
	
	.ant-segmented-item-label{
		display:flex ;
		justify-content: center;
		align-items:center;
		height:32px !important;
		border-radius:4px !important;
	}
	.ant-segmented {
		padding-right:0px !important;
		
	}
	.ant-modal-close{
		scale:1.5 !important;
		
	}

	
	.ant-select-selection-item{
		color: #243A57 !important;
	}
	.ant-select-focused{
		border: 1px solid #E5007A !important;
		border-radius:4px !important;
	}
	.ant-segmented-item-selected{
		box-shadow: none !important;
	}
	
	.alignment-close .ant-modal-close{
		margin-top: 6px;
	  }
	  .alignment-close .ant-modal-close:hover{
		margin-top: 6px;
	  }
`;