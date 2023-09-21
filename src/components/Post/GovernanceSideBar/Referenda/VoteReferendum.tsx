// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined, StopOutlined } from '@ant-design/icons';
import { InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Alert, Button, Divider, Form, Modal, Segmented, Select, Spin } from 'antd';
import BN from 'bn.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EVoteDecisionType, ILastVote, LoadingStatusType, NotificationStatus, Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
import WalletButton from '~src/components/WalletButton';
import { useApiContext, useNetworkContext, useUserDetailsContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
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
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import checkWalletForSubstrateNetwork from '~src/util/checkWalletForSubstrateNetwork';
import dayjs from 'dayjs';
import MultisigAccountSelectionForm from '~src/ui-components/MultisigAccountSelectionForm';
import ArrowLeft from '~assets/icons/arrow-left.svg';
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
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import VotingForm, { EFormType } from './VotingFrom';

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
export interface INetworkWalletErr {
	message: string;
	description: string;
	error: number;
}

export const getConvictionVoteOptions = (CONVICTIONS: [number, number][], proposalType: ProposalType, api: ApiPromise | undefined, apiReady: boolean, network: string) => {
	if ([ProposalType.REFERENDUM_V2, ProposalType.FELLOWSHIP_REFERENDUMS].includes(proposalType) && ![AllNetworks.COLLECTIVES, AllNetworks.WESTENDCOLLECTIVES].includes(network)) {
		if (api && apiReady) {
			const res = api.consts.convictionVoting.voteLockingPeriod;
			const num = res.toJSON();
			const days = blockToDays(num, network);
			if (days && !isNaN(Number(days))) {
				return [
					<Select.Option
						className={`text-bodyBlue ${poppins.variable}`}
						key={0}
						value={0}
					>
						{'0.1x voting balance, no lockup period'}
					</Select.Option>,
					...CONVICTIONS.map(([value, lock]) => (
						<Select.Option
							className={`text-bodyBlue ${poppins.variable}`}
							key={value}
							value={value}
						>{`${value}x voting balance, locked for ${lock}x duration (${Number(lock) * Number(days)} days)`}</Select.Option>
					))
				];
			}
		}
	}
	return [
		<Select.Option
			className={`text-bodyBlue ${poppins.variable}`}
			key={0}
			value={0}
		>
			{'0.1x voting balance, no lockup period'}
		</Select.Option>,
		...CONVICTIONS.map(([value, lock]) => (
			<Select.Option
				className={`text-bodyBlue ${poppins.variable}`}
				key={value}
				value={value}
			>{`${value}x voting balance, locked for ${lock} enactment period(s)`}</Select.Option>
		))
	];
};

const VoteReferendum = ({ className, referendumId, onAccountChange, lastVote, setLastVote, proposalType, address }: Props) => {
	const userDetails = useUserDetailsContext();
	const { addresses, isLoggedOut, loginAddress, loginWallet } = userDetails;
	const [showModal, setShowModal] = useState<boolean>(false);
	const [lockedBalance, setLockedBalance] = useState<BN>(ZERO_BN);
	const { api, apiReady } = useApiContext();
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const [isFellowshipMember, setIsFellowshipMember] = useState<boolean>(false);
	const [fetchingFellowship, setFetchingFellowship] = useState(true);
	const { network } = useNetworkContext();
	const [wallet, setWallet] = useState<Wallet>();
	const [availableWallets, setAvailableWallets] = useState<any>({});
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const CONVICTIONS: [number, number][] = [1, 2, 4, 8, 16, 32].map((lock, index) => [index + 1, lock]);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [successModal, setSuccessModal] = useState<boolean>(false);
	const [splitForm] = Form.useForm();
	const [abstainFrom] = Form.useForm();
	const [ayeNayForm] = Form.useForm();
	const [abstainVoteValue, setAbstainVoteValue] = useState<BN>(ZERO_BN);
	const [ayeVoteValue, setAyeVoteValue] = useState<BN>(ZERO_BN);
	const [nayVoteValue, setNayVoteValue] = useState<BN>(ZERO_BN);
	const [walletErr, setWalletErr] = useState<INetworkWalletErr>({ description: '', error: 0, message: '' });
	const [voteValues, setVoteValues] = useState({ abstainVoteValue: ZERO_BN, ayeVoteValue: ZERO_BN, nayVoteValue: ZERO_BN, totalVoteValue: ZERO_BN });
	const [multisig, setMultisig] = useState<string>('');
	const [showMultisig, setShowMultisig] = useState<boolean>(false);

	const { client, connect } = usePolkasafe(address);
	const [isBalanceErr, setIsBalanceErr] = useState<boolean>(false);

	const [vote, setVote] = useState<EVoteDecisionType>(EVoteDecisionType.AYE);
	const [totalDeposit, setTotalDeposit] = useState<BN>(new BN(0));
	const [initiatorBalance, setInitiatorBalance] = useState<BN>(ZERO_BN);
	const [multisigBalance, setMultisigBalance] = useState<BN>(ZERO_BN);

	useEffect(() => {
		getWallet();
		if (!api || !apiReady) return;
		if (loginWallet) {
			setWallet(loginWallet);
			(async () => {
				setLoadingStatus({ isLoading: true, message: 'Awaiting accounts' });
				const accountsData = await getAccountsFromWallet({ api, apiReady, chosenWallet: loginWallet, loginAddress, network });
				setAccounts(accountsData?.accounts || []);
				onAccountChange(accountsData?.account || '');
				setLoadingStatus({ isLoading: false, message: '' });
			})();
		} else {
			if (!window) return;
			const loginWallet = localStorage.getItem('loginWallet');
			if (loginWallet) {
				setWallet(loginWallet as Wallet);
				(async () => {
					const accountsData = await getAccountsFromWallet({ api, apiReady, chosenWallet: loginWallet as Wallet, loginAddress, network });
					setAccounts(accountsData?.accounts || []);
					onAccountChange(accountsData?.account || '');
				})();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userDetails]);

	const getWallet = () => {
		const injectedWindow = window as Window & InjectedWindow;
		setAvailableWallets(injectedWindow.injectedWeb3);
	};

	const handleInitiatorBalance = useCallback(async () => {
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
	}, [address, api, apiReady]);

	const handleBalanceErr = useCallback(() => {
		switch (vote) {
			case EVoteDecisionType.AYE:
				setIsBalanceErr((showMultisig ? multisigBalance : availableBalance)?.lte(lockedBalance));
				break;
			case EVoteDecisionType.NAY:
				setIsBalanceErr((showMultisig ? multisigBalance : availableBalance)?.lte(lockedBalance));
				break;
			case EVoteDecisionType.SPLIT:
				setIsBalanceErr((showMultisig ? multisigBalance : availableBalance)?.lte(nayVoteValue.add(ayeVoteValue)));
				break;
			case EVoteDecisionType.ABSTAIN:
				setIsBalanceErr((showMultisig ? multisigBalance : availableBalance)?.lte(nayVoteValue.add(ayeVoteValue).add(abstainVoteValue)));
				break;
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [availableBalance, lockedBalance, nayVoteValue, ayeVoteValue, abstainVoteValue]);

	useEffect(() => {
		if (!address || !wallet || !api || !apiReady) return;
		(async () => {
			const accountsData = await getAccountsFromWallet({ api, apiReady, chosenAddress: address, chosenWallet: wallet, loginAddress, network });
			setAccounts(accountsData?.accounts || []);
			onAccountChange(accountsData?.account || '');
		})();
		handleInitiatorBalance();
		handleBalanceErr();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, wallet, handleInitiatorBalance, handleBalanceErr]);

	const handleOnBalanceChange = async (balanceStr: string) => {
		if (!api || !apiReady) {
			return;
		}
		let balance = ZERO_BN;
		try {
			balance = new BN(balanceStr);
			if (multisig) {
				const multisigBalance = (await api.query.system.account(multisig)).data.free.toString();
				const multisigBalanceBn = new BN(multisigBalance);
				setMultisigBalance(multisigBalanceBn);
			}
			setAvailableBalance(balance);
		} catch (err) {
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
		if (!api || !apiReady) return;
		(async () => {
			const accountsData = await getAccountsFromWallet({ api, apiReady, chosenWallet: wallet, loginAddress, network });
			setAccounts(accountsData?.accounts || []);
			onAccountChange(accountsData?.account || '');
		})();

		setLoadingStatus({ ...loadingStatus, isLoading: false });
	};
	const convictionOpts = useMemo(() => {
		return getConvictionVoteOptions(CONVICTIONS, proposalType, api, apiReady, network);
	}, [CONVICTIONS, proposalType, api, apiReady, network]);

	const [conviction, setConviction] = useState<number>(0);

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
				const [
					{
						args: [accountId]
					},
					optInfo
				] = entries[i];
				if (optInfo.isSome) {
					members.push(accountId.toString());
				}
			}

			addresses &&
				addresses.some((address) => {
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
		if (!api || !apiReady) return;
		checkIfFellowshipMember();
		setWalletErr(checkWalletForSubstrateNetwork(network) as INetworkWalletErr);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, api, availableWallets]);

	if (isLoggedOut()) {
		return <LoginToVote />;
	}
	const handleModalReset = () => {
		setAbstainVoteValue(ZERO_BN);
		setAyeVoteValue(ZERO_BN);
		setNayVoteValue(ZERO_BN);
		setLockedBalance(ZERO_BN);
		ayeNayForm.setFieldValue('balance', ZERO_BN);
		splitForm.setFieldValue('ayeVote', ZERO_BN);
		splitForm.setFieldValue('nayVote', ZERO_BN);
		abstainFrom.setFieldValue('ayeVote', ZERO_BN);
		abstainFrom.setFieldValue('nayVote', ZERO_BN);
		abstainFrom.setFieldValue('abstainVote', ZERO_BN);
		setLoadingStatus({ isLoading: false, message: '' });
	};

	const handleOnVoteChange = (value: any) => {
		if (availableBalance.gte(ZERO_BN)) {
			setIsBalanceErr(false);
		}
		setVote(value as EVoteDecisionType);
		handleModalReset();
	};
	const handleSubmit = async () => {
		if (!referendumId && referendumId !== 0) {
			console.error('referendumId not set');
			return;
		}

		if (!api || !apiReady) {
			return;
		}

		if (!lockedBalance) return;
		if (availableBalance.lte(lockedBalance)) return;

		if (lockedBalance && availableBalance.lte(lockedBalance)) {
			return;
		}
		if (
			(ayeVoteValue && availableBalance.lte(ayeVoteValue)) ||
			(nayVoteValue && availableBalance.lte(nayVoteValue)) ||
			(abstainVoteValue && availableBalance.lte(abstainVoteValue))
		) {
			return;
		}

		const totalVoteValue = (ayeVoteValue || ZERO_BN)
			.add(nayVoteValue || ZERO_BN)
			?.add(abstainVoteValue || ZERO_BN)
			.add(lockedBalance || ZERO_BN);
		setVoteValues((prevState) => ({
			...prevState,
			totalVoteValue: totalVoteValue
		}));
		if (totalVoteValue?.gte(availableBalance)) {
			return;
		}

		setLoadingStatus({ isLoading: true, message: '' });

		let voteTx = null;

		if (proposalType === ProposalType.OPEN_GOV) {
			if ([EVoteDecisionType.AYE, EVoteDecisionType.NAY].includes(vote)) {
				voteTx = api.tx.convictionVoting.vote(referendumId, { Standard: { balance: lockedBalance, vote: { aye: vote === EVoteDecisionType.AYE, conviction } } });
			} else if (vote === EVoteDecisionType.SPLIT) {
				try {
					await splitForm.validateFields();
					// if form is valid
					setVoteValues((prevState) => ({
						...prevState,
						ayeVoteValue: ayeVoteValue,
						nayVoteValue: nayVoteValue
					}));
					voteTx = api.tx.convictionVoting.vote(referendumId, { Split: { aye: `${ayeVoteValue?.toString()}`, nay: `${nayVoteValue?.toString()}` } });
				} catch (e) {
					console.log(e);
				}
			} else if (vote === EVoteDecisionType.ABSTAIN && ayeVoteValue && nayVoteValue) {
				try {
					await abstainFrom.validateFields();
					setVoteValues((prevState) => ({
						...prevState,
						abstainVoteValue: abstainVoteValue,
						ayeVoteValue: ayeVoteValue,
						nayVoteValue: nayVoteValue
					}));
					voteTx = api.tx.convictionVoting.vote(referendumId, {
						SplitAbstain: { abstain: `${abstainVoteValue?.toString()}`, aye: `${ayeVoteValue?.toString()}`, nay: `${nayVoteValue?.toString()}` }
					});
				} catch (e) {
					console.log(e);
				}
			}
		} else if (proposalType === ProposalType.FELLOWSHIP_REFERENDUMS) {
			voteTx = api.tx.fellowshipCollective.vote(referendumId, vote === EVoteDecisionType.AYE);
		} else {
			voteTx = api.tx.democracy.vote(referendumId, { Standard: { balance: lockedBalance, vote: { aye: vote === EVoteDecisionType.AYE, conviction } } });
		}

		if (multisig) {
			const voteReferendumByMultisig = async (tx: any) => {
				try {
					await connect();
					setLoadingStatus({ isLoading: true, message: 'Creating a multisig transaction' });
					const { error } = await client.customTransactionAsMulti(multisig, tx);
					if (error) {
						setLoadingStatus({ isLoading: false, message: '' });
						throw new Error(error.error);
					}
					setShowModal(false);
					setSuccessModal(true);
					queueNotification({
						header: 'Success!',
						message: `Your vote on Referendum #${referendumId} will be successful once approved by other signatories.`,
						status: NotificationStatus.SUCCESS
					});
					setLoadingStatus({ isLoading: false, message: '' });
				} catch (error) {
					console.log(':( transaction failed');
					console.error('ERROR:', error);
					queueNotification({
						header: 'Failed!',
						message: error.message,
						status: NotificationStatus.ERROR
					});
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
			handleModalReset();
			setLoadingStatus({ isLoading: false, message: '' });
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
		if (!voteTx) return;

		await executeTx({
			address,
			api,
			apiReady,
			errorMessageFallback: 'Transaction failed.',
			network,
			onFailed,
			onSuccess,
			params: network === 'equilibrium' ? { nonce: -1 } : {},
			setStatus: (status: string) => setLoadingStatus({ isLoading: true, message: status }),
			tx: voteTx
		});
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

	const VoteUI = (
		<>
			<div className={className}>
				<Button
					className='mb-3 flex w-[100%] items-center justify-center rounded-lg border-pink_primary bg-pink_primary p-7 text-lg text-white hover:border-pink_primary hover:bg-pink_secondary'
					onClick={() => setShowModal(true)}
				>
					{!lastVote ? 'Cast Vote Now' : 'Cast Vote Again'}
				</Button>
				<Modal
					open={showModal}
					onCancel={() => {
						setShowModal(false);
						handleModalReset();
					}}
					footer={false}
					className={`w-[550px] ${poppins.variable} ${poppins.className} alignment-close vote-referendum max-h-[675px] rounded-[6px] max-md:w-full `}
					closeIcon={<CloseCross />}
					wrapClassName={className}
					title={
						showMultisig ? (
							<div className='-mt-5 ml-[-24px] mr-[-24px] flex h-[65px] items-center gap-2 rounded-t-[6px] border-0 border-b-[1.5px] border-solid border-[#D2D8E0] '>
								<ArrowLeft
									onClick={() => {
										setShowMultisig(false);
										setMultisig('');
									}}
									className='absolute left-[24px] mt-1 cursor-pointer'
								/>
								<div className='flex items-center gap-[8px]'>
									<PolkasafeIcon className='ml-14' />
									<span className='text-xl font-semibold tracking-[0.0015em] text-bodyBlue'>Cast Vote with Polkasafe Multisig</span>
								</div>
							</div>
						) : (
							<div className='-mt-5 ml-[-24px] mr-[-24px] flex h-[65px] items-center gap-2 rounded-t-[6px] border-0 border-b-[1.5px] border-solid border-[#D2D8E0]'>
								<CastVoteIcon className='ml-6' />
								<span className='text-xl font-semibold tracking-[0.0015em] text-bodyBlue'>Cast Your Vote</span>
							</div>
						)
					}
				>
					<>
						<Spin
							spinning={loadingStatus.isLoading}
							indicator={<LoadingOutlined />}
							tip={loadingStatus.message}
						>
							<>
								<div className='mb-6'>
									<div className='mt-3 flex items-center justify-center text-sm font-normal text-lightBlue'>Select a wallet</div>
									<div className='mt-1 flex items-center justify-center gap-x-5'>
										{availableWallets[Wallet.POLKADOT] && (
											<WalletButton
												className={`${wallet === Wallet.POLKADOT ? ' h-[48px] w-[64px] border border-solid border-pink_primary hover:border-pink_primary' : 'h-[48px] w-[64px]'}`}
												disabled={!apiReady}
												onClick={(event) => handleWalletClick(event as any, Wallet.POLKADOT)}
												name='Polkadot'
												icon={
													<WalletIcon
														which={Wallet.POLKADOT}
														className='h-6 w-6'
													/>
												}
											/>
										)}
										{availableWallets[Wallet.TALISMAN] && (
											<WalletButton
												className={`${wallet === Wallet.TALISMAN ? 'h-[48px] w-[64px] border border-solid border-pink_primary hover:border-pink_primary' : 'h-[48px] w-[64px]'}`}
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
										{availableWallets[Wallet.SUBWALLET] && (
											<WalletButton
												className={`${wallet === Wallet.SUBWALLET ? 'h-[48px] w-[64px] border border-solid border-pink_primary hover:border-pink_primary' : 'h-[48px] w-[64px]'}`}
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
										{availableWallets[Wallet.POLKAGATE] && (
											<WalletButton
												className={`${wallet === Wallet.POLKAGATE ? 'h-[48px] w-[64px] border border-solid border-pink_primary hover:border-pink_primary' : 'h-[48px] w-[64px]'}`}
												disabled={!apiReady}
												onClick={(event) => handleWalletClick(event as any, Wallet.POLKAGATE)}
												name='PolkaGate'
												icon={
													<WalletIcon
														which={Wallet.POLKAGATE}
														className='h-6 w-6'
													/>
												}
											/>
										)}
										{(window as any).walletExtension?.isNovaWallet && availableWallets[Wallet.NOVAWALLET] && (
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
										{['polymesh'].includes(network) && availableWallets[Wallet.POLYWALLET] ? (
											<WalletButton
												disabled={!apiReady}
												onClick={(event) => handleWalletClick(event as any, Wallet.POLYWALLET)}
												className={`${wallet === Wallet.POLYWALLET ? 'h-[48px] w-[64px] border  border-solid border-pink_primary' : 'h-[48px] w-[64px]'}`}
												name='PolyWallet'
												icon={
													<WalletIcon
														which={Wallet.POLYWALLET}
														className='h-6 w-6'
													/>
												}
											/>
										) : null}
									</div>
									{canUsePolkasafe(network) && !showMultisig && (
										<div className='m-auto mt-3 flex w-[50%] flex-col gap-3'>
											<Divider className='m-0'>OR</Divider>
											<div className='flex w-full justify-center'>
												<WalletButton
													className='!border-[#D2D8E0] text-sm font-semibold text-bodyBlue'
													onClick={() => {
														setShowMultisig(!showMultisig);
													}}
													name='Polkasafe'
													icon={
														<WalletIcon
															which={Wallet.POLKASAFE}
															className='h-6 w-6'
														/>
													}
													text={'Cast Vote with Multisig'}
												/>
											</div>
										</div>
									)}
								</div>
								{showMultisig && initiatorBalance.lte(totalDeposit) && multisig && (
									<Alert
										message={`The Free Balance in your selected account is less than the Minimum Deposit ${formatBnBalance(
											totalDeposit,
											{ numberAfterComma: 3, withUnit: true },
											network
										)} required to create a Transaction.`}
										showIcon
										className='mb-6'
									/>
								)}
								{((showMultisig || initiatorBalance.gte(totalDeposit)) && !multisig) ||
									(isBalanceErr &&
										!loadingStatus.isLoading &&
										wallet &&
										ayeVoteValue
											.add(nayVoteValue)
											.add(abstainVoteValue)
											.add(lockedBalance)
											.gte(showMultisig ? multisigBalance : availableBalance) && (
											<Alert
												type='info'
												message='Insufficient balance'
												showIcon
												className='mb-4 rounded-[4px]'
											/>
										))}
								{walletErr.error === 1 && !loadingStatus.isLoading && (
									<Alert
										message={walletErr.message}
										description={walletErr.description}
										showIcon
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
									showMultisig ? (
										<MultisigAccountSelectionForm
											title='Select Address'
											accounts={accounts}
											address={address}
											withBalance
											onAccountChange={onAccountChange}
											onBalanceChange={handleOnBalanceChange}
											className={`${poppins.variable} ${poppins.className} text-sm font-normal text-lightBlue`}
											walletAddress={multisig}
											setWalletAddress={setMultisig}
											containerClassName='gap-5'
											showMultisigBalance={true}
											canMakeTransaction={!initiatorBalance.lte(totalDeposit)}
											multisigBalance={multisigBalance}
											setMultisigBalance={setMultisigBalance}
										/>
									) : (
										<AccountSelectionForm
											title='Vote with Account'
											accounts={accounts}
											address={address}
											withBalance
											onAccountChange={onAccountChange}
											onBalanceChange={handleOnBalanceChange}
											className={`${poppins.variable} ${poppins.className} text-sm font-normal text-lightBlue`}
											inputClassName='rounded-[4px] px-3 py-1'
											withoutInfo={true}
										/>
									)
								) : walletErr.message.length === 0 && !wallet && !loadingStatus.isLoading ? (
									<Alert
										message='Please select a wallet.'
										showIcon
										type='info'
									/>
								) : null}

								{/* aye nye split abstain buttons */}
								<h3 className='inner-headings mb-[2px] mt-[24px]'>Choose your vote</h3>
								<Segmented
									block
									className={`${className} mb-6 w-full rounded-[4px] border-[1px] border-solid border-[#D2D8E0] bg-white`}
									size='large'
									value={vote}
									onChange={(value) => {
										handleOnVoteChange(value);
									}}
									options={decisionOptions}
									disabled={!api || !apiReady}
								/>
								{proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote !== EVoteDecisionType.SPLIT && vote !== EVoteDecisionType.ABSTAIN && (
									<VotingForm
										form={ayeNayForm}
										formName={EFormType.AYE_NAY_FORM}
										onBalanceChange={(balance: BN) => setLockedBalance(balance)}
										convictionClassName={className}
										handleSubmit={handleSubmit}
										disabled={
											!wallet ||
											!lockedBalance ||
											lockedBalance.lte(ZERO_BN) ||
											(showMultisig && !multisig) ||
											(showMultisig && initiatorBalance.lte(totalDeposit)) ||
											isBalanceErr ||
											(showMultisig && multisigBalance.lte(lockedBalance))
										}
										conviction={conviction}
										setConviction={setConviction}
										convictionOpts={convictionOpts}
									/>
								)}

								{proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote === EVoteDecisionType.SPLIT && (
									<VotingForm
										form={splitForm}
										formName={EFormType.SPLIT_FORM}
										onBalanceChange={(balance: BN) => setLockedBalance(balance)}
										onAyeValueChange={(balance: BN) => setAyeVoteValue(balance)}
										onNayValueChange={(balance: BN) => setNayVoteValue(balance)}
										convictionClassName={className}
										handleSubmit={handleSubmit}
										disabled={
											!wallet ||
											ayeVoteValue.lte(ZERO_BN) ||
											nayVoteValue.lte(ZERO_BN) ||
											(showMultisig && !multisig) ||
											(showMultisig && initiatorBalance.lte(totalDeposit)) ||
											isBalanceErr ||
											(showMultisig && multisigBalance.lte(ayeVoteValue.add(nayVoteValue).add(abstainVoteValue).add(lockedBalance)))
										}
										conviction={conviction}
										setConviction={setConviction}
										convictionOpts={convictionOpts}
									/>
								)}

								{proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote === 'abstain' && (
									<VotingForm
										form={abstainFrom}
										formName={EFormType.ABSTAIN_FORM}
										onBalanceChange={(balance: BN) => setLockedBalance(balance)}
										onAyeValueChange={(balance: BN) => setAyeVoteValue(balance)}
										onNayValueChange={(balance: BN) => setNayVoteValue(balance)}
										onAbstainValueChange={(balance: BN) => setAbstainVoteValue(balance)}
										convictionClassName={className}
										handleSubmit={handleSubmit}
										disabled={
											!wallet ||
											ayeVoteValue.lte(ZERO_BN) ||
											nayVoteValue.lte(ZERO_BN) ||
											abstainVoteValue.lte(ZERO_BN) ||
											(showMultisig && !multisig) ||
											(showMultisig && initiatorBalance.lte(totalDeposit)) ||
											isBalanceErr ||
											(showMultisig && multisigBalance.lte(ayeVoteValue.add(nayVoteValue).add(abstainVoteValue).add(lockedBalance)))
										}
										conviction={conviction}
										setConviction={setConviction}
										convictionOpts={convictionOpts}
									/>
								)}
							</>
						</Spin>
					</>
				</Modal>
				<VoteInitiatedModal
					title={multisig ? 'Voting with Polkasafe Multisig initiated' : 'Voted Successfully'}
					vote={vote}
					balance={voteValues.totalVoteValue}
					open={successModal}
					setOpen={setSuccessModal}
					address={address}
					multisig={multisig ? multisig : ''}
					conviction={conviction}
					votedAt={dayjs().format('HH:mm, Do MMMM YYYY')}
					ayeVoteValue={voteValues.ayeVoteValue}
					nayVoteValue={voteValues.nayVoteValue}
					abstainVoteValue={voteValues.abstainVoteValue}
					icon={multisig ? <MultisigSuccessIcon /> : <SuccessIcon />}
				/>
			</div>
		</>
	);

	if (proposalType === ProposalType.FELLOWSHIP_REFERENDUMS) {
		if (!fetchingFellowship) {
			if (isFellowshipMember) return VoteUI;

			return <div className={className}>Only fellowship members may vote.</div>;
		} else {
			return <div className={className}>Fetching fellowship members...</div>;
		}
	}
	return VoteUI;
};

export default React.memo(styled(VoteReferendum)`
	.LoaderWrapper {
		height: 40rem;
		position: absolute;
		width: 100%;
	}
	.vote-form-cont {
		padding: 12px;
	}
	.vote-referendum .ant-modal-close {
		margin-top: 4px;
	}
	.vote-referendum .ant-modal-close:hover {
		margin-top: 4px;
	}
	.vote-referendum .ant-select-selector {
		border: 1px soild !important;
		border-color: #d2d8e0 !important;
		height: 40px;
		border-radius: 4px !important;
	}
	.vote-referendum .ant-select-selection-item {
		font-style: normal !important;
		font-weight: 400 !important;
		font-size: 14px !important;
		display: flex;
		align-items: center;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
		color: #243a57 !important;
	}

	.vote-referendum .ant-input-number-in-from-item {
		height: 39.85px !important;
	}
	.vote-referendum .ant-segmented-item-label {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 32px !important;
		border-radius: 4px !important;
		padding-right: 0px !important;
		padding-left: 0px !important;
	}
	.vote-referendum .ant-segmented {
		padding: 0px !important;
	}

	.vote-referendum .ant-select-selection-item {
		color: #243a57 !important;
	}
	.vote-referendum .ant-select-focused {
		border: 1px solid #e5007a !important;
		border-radius: 4px !important;
	}
	.vote-referendum.ant-segmented-item-selected {
		box-shadow: none !important;
		padding-right: 0px !important;
	}
	.vote-referendum .ant-segmented-item {
		padding: 0px !important;
	}
`);
