// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Alert, Button, Form, Modal, Segmented, Select, Spin } from 'antd';
import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
import { EVoteDecisionType, ILastVote, LoadingStatusType, NotificationStatus, Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import BalanceInput from 'src/ui-components/BalanceInput';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
import WalletButton from '~src/components/WalletButton';
import { useApiContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import LoginToVote from '../LoginToVoteOrEndorse';
import { poppins } from 'pages/_app';
import CastVoteIcon from '~assets/icons/cast-vote-icon.svg';
import LikeWhite from '~assets/icons/like-white.svg';
import LikeGray from '~assets/icons/like-gray.svg';
import DislikeWhite from '~assets/icons/dislike-white.svg';
import DislikeGray from '~assets/icons/dislike-gray.svg';
import checkWalletForSubstrateNetwork from '~src/util/checkWalletForSubstrateNetwork';
import dayjs from 'dayjs';
import blockToDays from '~src/util/blockToDays';
import { ApiPromise } from '@polkadot/api';
import SuccessIcon from '~assets/delegation-tracks/success-delegate.svg';
import { network as AllNetworks } from '~src/global/networkConstants';
import executeTx from '~src/util/executeTx';
import VoteInitiatedModal from '../Referenda/Modal/VoteSuccessModal';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { useTheme } from 'next-themes';

const ZERO_BN = new BN(0);

interface Props {
	className?: string;
	referendumId?: number | null | undefined;
	onAccountChange: (address: string) => void;
	lastVote: ILastVote | null;
	setLastVote: (pre: ILastVote) => void;
	proposalType: ProposalType;
	address: string;
	hash: string;
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
						className={`text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high ${poppins.variable}`}
						key={0}
						value={0}
					>
						{'0.1x voting balance, no lockup period'}
					</Select.Option>,
					...CONVICTIONS.map(([value, lock]) => (
						<Select.Option
							className={`text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high ${poppins.variable}`}
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
			className={`text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high ${poppins.variable}`}
			key={0}
			value={0}
		>
			{'0.1x voting balance, no lockup period'}
		</Select.Option>,
		...CONVICTIONS.map(([value, lock]) => (
			<Select.Option
				className={`text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high ${poppins.variable}`}
				key={value}
				value={value}
			>{`${value}x voting balance, locked for ${lock} enactment period(s)`}</Select.Option>
		))
	];
};

const PIPsVote = ({ className, referendumId, onAccountChange, lastVote, setLastVote, proposalType, address, hash }: Props) => {
	const userDetails = useUserDetailsSelector();
	const { id, loginAddress } = userDetails;
	const [showModal, setShowModal] = useState<boolean>(false);
	const [lockedBalance, setLockedBalance] = useState<BN>(ZERO_BN);
	const { api, apiReady } = useApiContext();
	const { resolvedTheme: theme } = useTheme();
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const { network } = useNetworkSelector();
	const [wallet, setWallet] = useState<Wallet>();
	const [availableWallets, setAvailableWallets] = useState<any>({});
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [loginWallet, setLoginWallet] = useState<Wallet>();
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [balanceErr, setBalanceErr] = useState('');
	const [successModal, setSuccessModal] = useState<boolean>(false);
	const [isPolymeshCommitteeMember, setIsPolymeshCommitteeMember] = useState<boolean>(false);
	const [ayeNayForm] = Form.useForm();

	const [walletErr, setWalletErr] = useState<INetworkWalletErr>({ description: '', error: 0, message: '' });
	const [vote, setVote] = useState<EVoteDecisionType>(EVoteDecisionType.AYE);

	const getPolymeshCommitteeMembers = async () => {
		const members = await api?.query?.polymeshCommittee?.members().then((members) => members.toJSON());
		if ((members as string[]).includes(address)) {
			setIsPolymeshCommitteeMember(true);
		}
	};

	useEffect(() => {
		if (userDetails.loginWallet) {
			setLoginWallet(userDetails.loginWallet);
			setWallet(userDetails.loginWallet);
		} else {
			if (!window) return;
			const wallet = localStorage.getItem('loginWallet');
			if (Wallet) {
				setLoginWallet(wallet as Wallet);
				setWallet(wallet as Wallet);
			}
		}
		getPolymeshCommitteeMembers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userDetails]);

	const getWallet = () => {
		const injectedWindow = window as Window & InjectedWindow;
		setAvailableWallets(injectedWindow.injectedWeb3);
	};

	useEffect(() => {
		getWallet();
		if (!loginWallet || !api || !apiReady) return;
		(async () => {
			const accountData = await getAccountsFromWallet({ api, apiReady, chosenWallet: loginWallet, loginAddress, network });
			setAccounts(accountData?.accounts || []);
			onAccountChange(accountData?.account || '');
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginWallet]);

	useEffect(() => {
		if (!address || !wallet || !api || !apiReady) return;
		(async () => {
			const accountData = await getAccountsFromWallet({ api, apiReady, chosenAddress: address, chosenWallet: wallet, loginAddress, network });
			setAccounts(accountData?.accounts || []);
			onAccountChange(accountData?.account || '');
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, wallet]);

	useEffect(() => {
		setWalletErr(checkWalletForSubstrateNetwork(network) as INetworkWalletErr);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [availableWallets, network]);

	const handleOnBalanceChange = async (balanceStr: string) => {
		if (!api || !apiReady) {
			return;
		}
		let balance = ZERO_BN;

		try {
			balance = new BN(balanceStr);
			setAvailableBalance(balance);
		} catch (err) {
			console.log(err);
		}
	};
	const handleWalletClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) => {
		if (!api || !apiReady) return;
		localStorage.setItem('selectedWallet', wallet);
		setLoadingStatus({ ...loadingStatus, isLoading: true });
		setAccounts([]);
		onAccountChange('');
		event.preventDefault();
		setWallet(wallet);
		(async () => {
			const accountData = await getAccountsFromWallet({ api, apiReady, chosenWallet: wallet, loginAddress, network });
			setAccounts(accountData?.accounts || []);
			onAccountChange(accountData?.account || '');
		})();
		setLoadingStatus({ ...loadingStatus, isLoading: false });
	};

	const onBalanceChange = (balance: BN) => {
		if (!balance) return;
		else if (availableBalance.lte(balance)) {
			setBalanceErr('Insufficient balance.');
		} else {
			setBalanceErr('');
			setLockedBalance(balance);
		}
	};

	if (!id) {
		return <LoginToVote />;
	}

	const handleOnVoteChange = (value: any) => {
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
		if (!api || !apiReady) return;

		if ([ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS].includes(proposalType)) {
			voteTx = api.tx.polymeshCommittee.vote(hash, referendumId, vote === EVoteDecisionType.AYE);
		} else {
			if (!lockedBalance) return;
			if (availableBalance.lte(lockedBalance)) return;

			if (lockedBalance && availableBalance.lte(lockedBalance)) {
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

			if (ProposalType.COMMUNITY_PIPS) {
				setLastVote(lastVote);
			} else {
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
		if (!voteTx) return;

		await executeTx({ address, api, apiReady, errorMessageFallback: 'Transaction failed.', network, onFailed, onSuccess, tx: voteTx });
	};

	const decisionOptions = [
		{
			label: (
				<div className={`ml-1 mr-1 flex h-[32px] w-full items-center justify-center rounded-[4px] text-[#576D8B] ${vote === 'aye' ? 'bg-[#2ED47A] text-white' : ''}`}>
					{vote === EVoteDecisionType.AYE ? <LikeWhite className='mb-[3px] mr-2' /> : <LikeGray className='mb-[3px] mr-2' />}
					<span className='text-base font-medium'>Aye</span>
				</div>
			),
			value: 'aye'
		},
		{
			label: (
				<div className={`ml-1 mr-1 flex h-[32px] w-full items-center justify-center rounded-[4px] text-[#576D8B] ${vote === 'nay' ? 'bg-[#F53C3C] text-white' : ''}`}>
					{vote === EVoteDecisionType.NAY ? <DislikeWhite className='mr-2  ' /> : <DislikeGray className='mr-2' />} <span className='text-base font-medium'>Nay</span>
				</div>
			),
			value: 'nay'
		}
	];

	const VoteUI = (
		<>
			<div className={className}>
				<Button
					className='mb-3 flex w-[100%] items-center justify-center rounded-lg border-pink_primary bg-pink_primary p-7 text-lg text-white hover:border-pink_primary hover:bg-pink_secondary'
					onClick={() => setShowModal(true)}
				>
					{lastVote === null || lastVote === undefined ? 'Cast Vote Now' : 'Cast Vote Again'}
				</Button>
				<Modal
					open={showModal}
					onCancel={() => setShowModal(false)}
					footer={false}
					className={`w-[500px] ${poppins.variable} ${poppins.className} alignment-close vote-referendum max-h-[605px] rounded-[6px] max-md:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
					closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
					wrapClassName={`${className} dark:bg-modalOverlayDark`}
					title={
						<div className='-mt-5 ml-[-24px] mr-[-24px] flex h-[65px] items-center gap-2 rounded-t-[6px] border-0 border-b-[1.5px] border-solid border-[#D2D8E0] dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
							<CastVoteIcon className='ml-6' />
							<span className='text-xl font-semibold tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>Cast Your Vote</span>
						</div>
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
									<div className='mt-3 flex items-center justify-center text-sm font-normal text-[#485F7D] dark:text-blue-dark-medium'>Select a wallet</div>
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
								</div>

								{balanceErr.length > 0 && ![ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS].includes(proposalType) && wallet && (
									<Alert
										type='error'
										message={balanceErr}
										showIcon
										className='mb-4 h-10 rounded-[4px]'
									/>
								)}
								{walletErr.error === 1 && !loadingStatus.isLoading && (
									<Alert
										message={walletErr.message}
										description={walletErr.description}
										showIcon
									/>
								)}
								{accounts.length === 0 && wallet && !loadingStatus.isLoading && (
									<Alert
										message={<span className='dark:text-blue-dark-high'>No addresses found in the address selection tab.</span>}
										showIcon
										type='info'
										className='dark:border-[#91CAFF] dark:bg-[rgba(145_202_255_0.2)]'
									/>
								)}
								{accounts.length > 0 ? (
									<AccountSelectionForm
										title='Vote with Account'
										accounts={accounts}
										address={address}
										withBalance
										onAccountChange={onAccountChange}
										onBalanceChange={handleOnBalanceChange}
										className={`${poppins.variable} ${poppins.className} text-sm font-normal text-lightBlue dark:text-blue-dark-medium`}
										inputClassName='rounded-[4px] px-3 py-1'
										withoutInfo={true}
									/>
								) : walletErr.message.length === 0 && !wallet && !loadingStatus.isLoading ? (
									<Alert
										message={<span className='dark:text-blue-dark-high'>Please select a wallet.</span>}
										showIcon
										type='info'
										className='dark:border-[#91CAFF] dark:bg-[rgba(145_202_255_0.2)]'
									/>
								) : null}

								{/* aye nye split abstain buttons */}
								<h3 className='inner-headings mb-[2px] mt-[24px] dark:text-blue-dark-medium'>Choose your vote</h3>
								<Segmented
									block
									className={`${className} mb-6 w-full rounded-[4px] border-[1px] border-solid border-[#D2D8E0] bg-white dark:border-[#3B444F] dark:bg-section-dark-overlay`}
									size='large'
									value={vote}
									onChange={(value) => {
										handleOnVoteChange(value);
									}}
									options={decisionOptions}
									disabled={!api || !apiReady}
								/>
								{proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote !== EVoteDecisionType.SPLIT && vote !== EVoteDecisionType.ABSTAIN && (
									<Form
										form={ayeNayForm}
										name='aye-nay-form'
										onFinish={handleSubmit}
										style={{ maxWidth: 600 }}
									>
										{![ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS].includes(proposalType) && (
											<BalanceInput
												label={'Lock balance'}
												helpText={'Amount of you are willing to lock for this vote.'}
												placeholder={'Add balance'}
												onChange={onBalanceChange}
												className='border-[#D2D8E0] text-sm font-medium dark:border-[#3B444F]'
												theme={theme}
											/>
										)}

										<div className='ml-[-24px] mr-[-24px] mt-[-3px] flex justify-end border-0 border-t-[1px] border-solid border-[#D2D8E0] pt-5 dark:border-[#3B444F]'>
											<Button
												className='mr-[15px] h-[40px] w-[134px] rounded-[4px] border-[#E5007A] bg-[white] font-semibold text-[#E5007A]'
												onClick={() => setShowModal(false)}
											>
												Cancel
											</Button>
											<Button
												className={`mr-[24px] h-[40px] w-[134px] rounded-[4px] border-0 bg-[#E5007A] font-semibold text-[white] ${(!wallet || !lockedBalance) && 'opacity-50'}`}
												htmlType='submit'
												disabled={!wallet || !lockedBalance}
											>
												Confirm
											</Button>
										</div>
									</Form>
								)}
							</>
						</Spin>
					</>
				</Modal>
				<VoteInitiatedModal
					title={'Voting'}
					vote={vote}
					balance={ZERO_BN}
					open={successModal}
					setOpen={setSuccessModal}
					address={address}
					votedAt={dayjs().format('HH:mm, Do MMMM YYYY')}
					icon={<SuccessIcon />}
				/>
			</div>
		</>
	);

	if ([ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS].includes(proposalType)) {
		if (isPolymeshCommitteeMember) return VoteUI;

		return <div className={className}>Only Polymesh Committee members may vote.</div>;
	}

	return VoteUI;
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
		color: #243a57;
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
		color: #243a57;
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
`;
