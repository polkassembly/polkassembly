// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Button, Form, InputNumber, Modal, Segmented, Select, Spin } from 'antd';
import BN from 'bn.js';
import React, { useEffect, useMemo,useState } from 'react';
import { LoadingStatusType,NotificationStatus, Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import BalanceInput from 'src/ui-components/BalanceInput';
import HelperTooltip from 'src/ui-components/HelperTooltip';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
import WalletButton from '~src/components/WalletButton';
import { useApiContext, useNetworkContext, useUserDetailsContext } from '~src/context';
import { APPNAME } from '~src/global/appName';
import { ProposalType } from '~src/global/proposalType';
import AyeNayButtons from '~src/ui-components/AyeNayButtons';
import FilteredError from '~src/ui-components/FilteredError';
import getEncodedAddress from '~src/util/getEncodedAddress';
import LoginToVote from '../LoginToVoteOrEndorse';
import { poppins } from 'pages/_app';
import NewPolkaDotIcon from '~assets/icons/polka-dot-new-icon.svg';
import NewSubwalletIcon from '~assets/icons/new-sub-wallet-icon.svg';
import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import SplitIcon from '~assets/icons/split-icon.svg';
import AbstainIcon from '~assets/icons/abstain-icon.svg';
import { size } from 'lodash';
import { chainProperties } from '~src/global/networkConstants';

interface Props {
	className?: string
	referendumId?: number | null | undefined
	onAccountChange: (address: string) => void
	lastVote: string | null | undefined
	setLastVote: React.Dispatch<React.SetStateAction<string | null | undefined>>
	proposalType: ProposalType;
}

const VoteReferendum = ({ className, referendumId, onAccountChange, lastVote, setLastVote, proposalType }: Props) => {
	const { addresses, isLoggedOut ,loginWallet } = useUserDetailsContext();
	const [showModal, setShowModal] = useState<boolean>(false);
	const [lockedBalance, setLockedBalance] = useState<BN | undefined>(undefined);
	const { api, apiReady } = useApiContext();
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const [isFellowshipMember, setIsFellowshipMember] = useState<boolean>(false);
	const [fetchingFellowship, setFetchingFellowship] = useState(true);
	const { network } = useNetworkContext();
	const [wallet,setWallet]=useState<Wallet>();
	const [defaultWallets,setDefaultWallets]=useState<any>({});
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [address, setAddress] = useState<string>('');
	const CONVICTIONS: [number, number][] = [1, 2, 4, 8, 16, 32].map((lock, index) => [index + 1, lock]);
	const [splitForm] = Form.useForm();
	const [abstainFrom] = Form.useForm();
	const[ayeNayForm] = Form.useForm();

	enum EVoteDecisionType {
		AYE = 'aye',
		NAY = 'nay',
		ABSTAIN = 'abstain',
		SPLIT = 'split'
	}
	const [vote,setVote] = useState< EVoteDecisionType>(EVoteDecisionType.AYE);

	const getWallet=() => {
		const injectedWindow = window as Window & InjectedWindow;
		setDefaultWallets(injectedWindow.injectedWeb3);
	};

	const getAccounts = async (chosenWallet: Wallet): Promise<undefined> => {
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

			setAddress(accounts[0].address);
		}
		return;
	};

	useEffect(() => {
		getWallet();
		loginWallet!==null && getAccounts(loginWallet);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[]);

	const handleWalletClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) => {
		setAccounts([]);
		setAddress('');
		event.preventDefault();
		setWallet(wallet);
		await getAccounts(wallet);
	};
	const convictionOpts = useMemo(() => [
		<Select.Option key={0} value={0}>{'0.1x voting balance, no lockup period'}</Select.Option>,
		...CONVICTIONS.map(([value, lock]) =>
			<Select.Option key={value} value={value}>{`${value}x voting balance, locked for ${lock} enactment period(s)`}</Select.Option>
		)
	],[CONVICTIONS]);

	const [conviction, setConviction] = useState<number>(0);

	const onConvictionChange = (value: any) => {
		setConviction(Number(value));
	};

	const onBalanceChange = (balance: BN) => setLockedBalance(balance);

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

	const voteReferendum = async (aye: boolean) => {
		if (!referendumId && referendumId !== 0) {
			console.error('referendumId not set');
			return;
		}

		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });

		let voteTx = null;

		if(proposalType === ProposalType.OPEN_GOV){
			voteTx = api.tx.convictionVoting.vote(referendumId, { Standard: { balance: lockedBalance, vote: { aye, conviction } } });
			//voteTx = api.tx.convictionVoting.vote(referendumId, { Split: { aye:'vote value',nay:'vote value' } }); split
			//voteTx = api.tx.convictionVoting.vote(referendumId, { SplitAbstain: { aye:'vote value',nay:'vote value',abstain:'' } }); split
		} else if(proposalType === ProposalType.FELLOWSHIP_REFERENDUMS) {
			voteTx = api.tx.fellowshipCollective.vote(referendumId, aye);
		} else{
			voteTx = api.tx.democracy.vote(referendumId, { Standard: { balance: lockedBalance, vote: { aye, conviction } } });
		}

		if(network == 'equilibrium'){
			voteTx.signAndSend(address, { nonce: -1 }, ({ status }) => {
				if (status.isInBlock) {
					setLoadingStatus({ isLoading: false, message: '' });
					queueNotification({
						header: 'Success!',
						message: `Vote on referendum #${referendumId} successful.`,
						status: NotificationStatus.SUCCESS
					});
					setLastVote(aye ? 'aye' : 'nay');
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
			voteTx.signAndSend(address, ({ status }) => {
				if (status.isInBlock) {
					setLoadingStatus({ isLoading: false, message: '' });
					queueNotification({
						header: 'Success!',
						message: `Vote on referendum #${referendumId} successful.`,
						status: NotificationStatus.SUCCESS
					});
					setLastVote(aye ? 'aye' : 'nay');
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
				<HelperTooltip className='ml-2' text='You can multiply your votes by locking your tokens for longer periods of time.' />
			</label>

			<Select onChange={onConvictionChange} size='large' className='' defaultValue={conviction}>
				{convictionOpts}
			</Select>
		</Form.Item>;

	const getData = async (values: any) => {

		if (!referendumId && referendumId !== 0) {
			console.error('referendumId not set');
			return;
		}

		if (!api ||!apiReady) {
			return;
		}

		setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });

		let voteTx = null;

		if(proposalType === ProposalType.OPEN_GOV){

			voteTx = api.tx.convictionVoting.vote(referendumId, { Standard: { balance: lockedBalance, vote: { aye, conviction } } });

		} else if(proposalType === ProposalType.FELLOWSHIP_REFERENDUMS) {
			voteTx = api.tx.fellowshipCollective.vote(referendumId, aye);
		}
		else{
			if(vote === EVoteDecisionType.AYE ) {
				console.log('AYE NAY form');
				try {
					voteTx = api.tx.convictionVoting.vote(referendumId, { Standard: { balance: lockedBalance, vote: { aye:true, conviction } } });
				} catch (e) {
					console.log(e);
				}
			}
			else if(vote === EVoteDecisionType.NAY ) {
				console.log(' NAY form');
				try {
					voteTx = api.tx.convictionVoting.vote(referendumId, { Standard: { balance: lockedBalance, vote: { aye:false, conviction } } });
				} catch (e) {
					console.log(e);
				}
			}

			else if(vote === EVoteDecisionType.SPLIT) {
				console.log('split form');
				try {
					await splitForm.validateFields();

					// if form is valid
					const  ayeVote = values.ayeVote;
					const  nayVote = values.nayVote;
					console.log(ayeVote , nayVote);
					voteTx = api.tx.convictionVoting.vote(referendumId, { Split: { aye:`${ayeVote}`,nay:`${nayVote}` } });
				} catch (e) {
					console.log(e);
				}
			}

			else if(vote === EVoteDecisionType.ABSTAIN) {
				console.log('abstain form');
				try {
					await splitForm.validateFields();

					// if form is valid
					const  abstainVote = values.abstainVote;
					const  ayeVote = values.ayeVote;
					const  nayVote = values.nayVote;
					console.log( abstainVote,ayeVote , nayVote);
					voteTx = api.tx.convictionVoting.vote(referendumId, { SplitAbstain: { aye:`${ayeVote}`,nay:`${nayVote}`,abstain:`${abstainVote}` } });
				} catch (e) {
					console.log(e);
				}
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
			label: <div className={`flex items-center justify-center w-[82px] h-[32px] rounded-[7px] ${vote === 'aye'? 'bg-[#2ED47A] text-white' : ''}`}><LikeFilled className='mr-1' /><span>Aye</span></div>,
			value: 'aye'
		},
		{
			label: <div className={`flex items-center justify-center w-[82px] h-[32px] rounded-[7px] ${vote === 'nay'? 'bg-[#F53C3C] text-white' : ''}`}><DislikeFilled className='mr-1' /> <span>Nay</span></div>,
			value: 'nay'
		},
		{
			label: <div className={`flex items-center justify-center  w-[82px] h-[32px] rounded-[7px] ${vote === 'split'? 'bg-[#FFBF60] text-white' : ''}`}> <SplitIcon className='mr-1 ' /> <span>Split</span> </div>,
			value: 'split'
		},
		{
			label: <div className={`flex items-center justify-center  w-[108px] h-[32px] rounded-[7px] ${vote === 'abstain'? 'bg-[#407BFF] text-white' : ''}`}><AbstainIcon className='mr-1' /> <span>Abstain</span></div>,
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
				className={`${poppins.variable} ${poppins.className}`}
			><>
					<Spin spinning={loadingStatus.isLoading } indicator={<LoadingOutlined />}>

						<div>
							<h4 className='cast-vote-heading'>Cast Your Vote</h4>
							<div className='flex items-center gap-x-5 mt-5 mb-6'>
								{defaultWallets[Wallet.POLKADOT] && <WalletButton className={`${wallet === Wallet.POLKADOT? ' w-[69.29px] h-[44.39px] hover:border-pink_primary': ''}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.POLKADOT)} name="Polkadot" icon={<NewPolkaDotIcon />} />}
								{defaultWallets[Wallet.TALISMAN] && <WalletButton className={`${wallet === Wallet.TALISMAN? 'w-[69.29px] h-[44.39px] hover:border-pink_primary': ''}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.TALISMAN)} name="Talisman" icon={<WalletIcon which={Wallet.TALISMAN} className='h-6 w-6'  />} />}
								{defaultWallets[Wallet.SUBWALLET] &&  <WalletButton className={`${wallet === Wallet.SUBWALLET? 'w-[69.29px] h-[44.39px] hover:border-pink_primary': ''}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.SUBWALLET)} name="Subwallet" icon={<NewSubwalletIcon/>} />}
								{
									(window as any).walletExtension?.isNovaWallet && defaultWallets[Wallet.NOVAWALLET] &&
                    <WalletButton disabled={!apiReady} className={`${wallet === Wallet.POLYWALLET? 'border border-solid border-pink_primary': ''}`} onClick={(event) => handleWalletClick((event as any), Wallet.NOVAWALLET)} name="Nova Wallet" icon={<WalletIcon which={Wallet.NOVAWALLET} className='h-6 w-6' />} />
								}
								{
									['polymesh'].includes(network) && defaultWallets[Wallet.POLYWALLET]?
										<WalletButton disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.POLYWALLET)} name="PolyWallet" icon={<WalletIcon which={Wallet.POLYWALLET} className='h-6 w-6'  />} />
										: null
								}
							</div>

							{
								accounts.length > 0?
									<AccountSelectionForm
										title='Vote with Account'
										accounts={accounts}
										address={address}
										withBalance
										onAccountChange={onAccountChange}
										className={`${poppins.variable} ${poppins.className} text-sidebarBlue`}
									/>
									: !wallet? <FilteredError text='Please select a wallet.' />: null
							}
							{accounts.length===0 && wallet && <FilteredError text='No addresses found in the address selection tab.' />}

							{/* <AyeNayButtons
								className='mt-6 max-w-[156px]'
								size='large'
								disabled={!apiReady}
								onClickAye={() => onAye() }
								onClickNay={() => onNye() }
								onClickAbstain={() => onAbstain()}
								onClickSplit={() => onSplit()}
							/> */}

							{/* aye nye split abstain buttons */}
							<Segmented
								block
								className={`${className} mt-[24px] mb-[27px] border-solid border-[1px] bg-white hover:bg-white border-[#F8E3EE] rounded-md w-full`}
								size="large"
								value={vote}
								onChange={(value) => {
									setVote(value as EVoteDecisionType);
									console.log('value==>', value);
								}}
								options={decisionOptions}

							/>

							{
								proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote !== EVoteDecisionType.SPLIT && vote !== EVoteDecisionType.ABSTAIN &&
								<Form
									form={ayeNayForm}
									name="aye-nay-form"
									onFinish={getData}
									style={{ maxWidth: 600 }}
							 	>
									<BalanceInput
										label={'Lock balance'}
										helpText={'Amount of you are willing to lock for this vote.'}
										placeholder={'123'}
										onChange={onBalanceChange}
										className='text-sm font-medium'
									/>

									<VoteLock className={`${className} mt-6`} />
									<div className='flex justify-end'><Button className='w-[90px] h-[40px] rounded-[4px] text-[white] bg-[#E5007A]' htmlType='submit'>Confirm</Button></div>
								</Form>
							}

							{
								proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote === 'split' &&
								<Form
									form={splitForm}
									name="split-form"
									onFinish={getData}
									style={{ maxWidth: 600 }}
							 	>
									{/* <Form.Item name='ayeVote'
										rules={[
											{
												message: 'Aye vote value is required.',
												required: true
											},
											{
												message: 'Aye vote value must be greater than 0.',
												validator(rule, value, callback) {
													if (callback && value <= 0){
														callback(rule?.message?.toString());
													}else {
														callback();
													}
												}
											}
										]}
									>
										<label className='inner-headings' >Aye vote value</label>
										<InputNumber
											addonAfter={chainProperties[network]?.tokenSymbol}
											className={`${className} text-sm text-sidebarBlue w-full border-1 border-[#F8E3EE]`}
											onChange={(value) => splitForm.setFieldValue('ayeVote',value)}
											placeholder={`${'123'} ${chainProperties[network]?.tokenSymbol}`}
											size={'large'}
										/>
									</Form.Item> */}
									<BalanceInput
										label={'Aye vote value'}
										helpText={'Amount of you are willing to lock for this vote.'}
										placeholder={'123'}
										onChange={()=>{}}
										className='text-sm font-medium'
										formItemName={'ayeVote'}
									/>

									<Form.Item name='nayVote'
										rules={[
											{
												message: 'Nay vote value is required.',
												required: true
											},
											{
												message: 'Nay vote value must be greater than 0.',
												validator(rule, value, callback) {
													if (callback && value <= 0){
														callback(rule?.message?.toString());
													}else {
														callback();
													}
												}
											}
										]} >
										<label className='inner-headings' >Nye vote value</label>
										<InputNumber
											addonAfter={chainProperties[network]?.tokenSymbol}
											className={`${className} text-sm text-sidebarBlue w-full border-1 border-[#F8E3EE] `}
											onChange={(value) => splitForm.setFieldValue('nayVote',value)}
											placeholder={`${'123'} ${chainProperties[network]?.tokenSymbol}`}
											size={'large'}
										/>
									</Form.Item>
									<div className='flex justify-end'><Button className='w-[90px] h-[40px] rounded-[4px] text-[white] bg-[#E5007A]' htmlType='submit' >Confirm</Button></div>
								</Form>
							}

							{
								proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote === 'abstain' &&
								<Form
									form={abstainFrom}
									name="abstain-form"
									onFinish={getData}
									style={{ maxWidth: 600  }}
								>
									<Form.Item name={'abstainVote'}
										rules={[
											{
												message: 'Abstain vote value is required.',
												required: true
											},
											{
												message: 'Abstain vote value must be greater than 0.',
												validator(rule, value, callback) {
													if (callback && value <= 0){
														callback(rule?.message?.toString());
													}else {
														callback();
													}
												}
											}
										]}>
										<label className='inner-headings' >Abstain vote value</label>
										<InputNumber
											addonAfter={chainProperties[network]?.tokenSymbol}
											className={`${className} text-sm text-sidebarBlue w-full border-1 border-[#F8E3EE]  `}
											onChange={(value) => abstainFrom.setFieldValue('abstainVote',value)}
											placeholder={`${'123'} ${chainProperties[network]?.tokenSymbol}`}
											size={'large'}
										/>
									</Form.Item>

									<Form.Item name={'ayeVote'}
										rules={[
											{
												message: 'Aye vote value is required.',
												required: true
											},
											{
												message: 'Aye vote value must be greater than 0.',
												validator(rule, value, callback) {
													if (callback && value <= 0){
														callback(rule?.message?.toString());
													}else {
														callback();
													}
												}
											}
										]}
									>
										<label className='inner-headings' >Aye vote value</label>
										<InputNumber
											addonAfter={chainProperties[network]?.tokenSymbol}
											className={`${className} text-sm text-sidebarBlue w-full border-1 border-[#F8E3EE] `}
											onChange={(value) => abstainFrom.setFieldValue('ayeVote',value)}
											placeholder={`${'123'} ${chainProperties[network]?.tokenSymbol}`}
											size={'large'}
										/>
									</Form.Item>

									<Form.Item name={'nayVote'}
										rules={[
											{
												message: 'Nay vote value is required.',
												required: true
											},
											{
												message: 'Nay vote value must be greater than 0.',
												validator(rule, value, callback) {
													if (callback && value <= 0){
														callback(rule?.message?.toString());
													}else {
														callback();
													}
												}
											}
										]}>
										<label className='inner-headings' >Nye vote value</label>
										<InputNumber
											addonAfter={chainProperties[network]?.tokenSymbol}
											className={`${className} text-sm text-sidebarBlue w-full border-1 border-[#F8E3EE] `}
											onChange={(value) => abstainFrom.setFieldValue('nayVote',value)}
											placeholder={`${'123'} ${chainProperties[network]?.tokenSymbol}`}
											size={'large'}
										/>
									</Form.Item>
									<div className='flex justify-end'><Button className='w-[90px] h-[40px] rounded-[4px] text-[white] bg-[#E5007A]' htmlType='submit' >Confirm</Button></div>
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
		border-color:#F8E3EE !important;
		height: 39.85px;
	 }
	 .ant-select-arrow{
		color:#E5007A !important;
	 }
	.ant-select-selection-item{

		font-family: 'Poppins' !important;
		font-style: normal !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		color: #90A0B7 !important;
		margin-top: 8px !important;

	}

	.ant-input-number-in-from-item{
		height: 39.85px !important;
		
	}

	.ant-input-number-handler-up{
		display:none !important;
	}
	.ant-input-number-handler-down{
		display:none !important;
	}
	
	.ant-input-number-input{
	font-family: 'Poppins' !important;
	font-style: normal !important;
	font-weight: 500 !important;
	font-size: 14px !important;
	line-height: 21px !important;
	color: #90A0B7 !important;
	border-radius: 7px 0 7px 7px !important;
	border-right: none !important; 
	
	}
	.ant-input-number-group-addon{
	font-family: 'Poppins' !important;
	font-style: normal !important;
	font-weight: 500 !important;
	font-size: 14px !important;
	line-height: 21px !important;
	color: #243A57 !important;
	border: 1px solid #F8E3EE !important;
	background: white !important;
	border-radius: 0 7px 7px 0 !important;
	border-left: none !important; 
	}

	.abc .ant-segmented-group {
		gap:20px !important;
	}
	
	.ant-segmented-item-label{
		display:flex ;
		justify-content: center;
		align-items:center;
		height:32px !important;
		border-radius:7px !important;
	}
	.ant-segmented-group .ant-segmented-item {
		padding:0px !important;
		width:82px !important;
	}
`;