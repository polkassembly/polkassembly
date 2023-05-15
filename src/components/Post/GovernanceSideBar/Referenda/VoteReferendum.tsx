// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Button, Form, Modal, Select, Spin } from 'antd';
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
		<Select.Option key={0} value={0}>{'0.1x voting balance, no lockup period'}</Select.Option>,
		...CONVICTIONS.map(([value, lock]) =>
			<Select.Option key={value} value={value}>{`${value}x voting balance, locked for ${lock} enactment period(s)`}</Select.Option>
		)
	],[CONVICTIONS]);

	const [conviction, setConviction] = useState<number>(0);

	const onConvictionChange = (value: any) => {
		setConviction(Number(value));
	};

	const onBalanceChange = (balance: BN) => {
		setLockedBalance(balance);
		if(lockedBalance && lockedBalance.eq(ZERO_BN)) {
			setBalanceErr('');
		}
		else if(lockedBalance && availableBalance.lt(balance)){
			setBalanceErr('Insufficient balance.');
		}else{
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

		if(lockedBalance && availableBalance.lt(lockedBalance)) {
			setBalanceErr('Insufficient balance.');
			return;
		}

		setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });

		let voteTx = null;

		if(proposalType === ProposalType.OPEN_GOV){
			voteTx = api.tx.convictionVoting.vote(referendumId, { Standard: { balance: lockedBalance, vote: { aye, conviction } } });
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
			<label  className=' flex items-center text-sm font-normal text-[#485F7D] '>
				Vote lock
				<HelperTooltip className='ml-2' text='You can multiply your votes by locking your tokens for longer periods of time.' />
			</label>

			<Select onChange={onConvictionChange} size='large' className='rounded-md text-sm text-[#243A57] p-1 w-full' defaultValue={conviction}>
				{convictionOpts}
			</Select>
		</Form.Item>;

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
						<h4 className='dashboard-heading mb-7'>Cast Your Vote</h4>
						<div className='flex items-center justify-center gap-x-5 mt-5 mb-6'>
							{availableWallets[Wallet.POLKADOT] && <WalletButton className={`${wallet === Wallet.POLKADOT? 'border border-solid border-pink_primary': ''}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.POLKADOT)} name="Polkadot" icon={<WalletIcon which={Wallet.POLKADOT} className='h-6 w-6'  />} />}
							{availableWallets[Wallet.TALISMAN] && <WalletButton className={`${wallet === Wallet.TALISMAN? 'border border-solid border-pink_primary': ''}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.TALISMAN)} name="Talisman" icon={<WalletIcon which={Wallet.TALISMAN} className='h-6 w-6'  />} />}
							{availableWallets[Wallet.SUBWALLET] && <WalletButton className={`${wallet === Wallet.SUBWALLET? 'border border-solid border-pink_primary': ''}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.SUBWALLET)} name="Subwallet" icon={<WalletIcon which={Wallet.SUBWALLET} className='h-6 w-6' />} />}
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
						{
							proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS &&
						<BalanceInput
							label={'Lock balance'}
							helpText={'Amount of you are willing to lock for this vote.'}
							placeholder={'123'}
							onChange={onBalanceChange}
							className='mt-6 text-sm font-normal text-[#485F7D]'
							inputClassName='text-[#7c899b] text-sm text-red-100'
						/>
						}
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
									className={`${poppins.variable} ${poppins.className} text-sm font-normal text-[#485F7D]`}
								/>
								: !wallet? <FilteredError text='Please select a wallet.' />: null
						}
						{accounts.length===0 && wallet && <FilteredError text='No addresses found in the address selection tab.' />}

						{
							proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && <VoteLock className='mt-6' />
						}

						<AyeNayButtons
							className='mt-6 max-w-[156px]'
							size='large'
							disabled={!apiReady}
							onClickAye={() => voteReferendum(true)}
							onClickNay={() => voteReferendum(false)}
						/>

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

	return VoteUI;
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
`;