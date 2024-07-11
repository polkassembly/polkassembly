// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StopOutlined } from '@ant-design/icons';
import { InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Form, Segmented } from 'antd';
import BN from 'bn.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ETrackDelegationStatus, EVoteDecisionType, ILastVote, LoadingStatusType, Wallet } from 'src/types';
import styled from 'styled-components';
import { useApiContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import LoginToVote from '../LoginToVoteOrEndorse';
import { poppins } from 'pages/_app';
import LikeWhite from '~assets/icons/like-white.svg';
import LikeGray from '~assets/icons/like-gray.svg';
import DarkLikeGray from '~assets/icons/like-gray-dark.svg';
import DislikeWhite from '~assets/icons/dislike-white.svg';
import DislikeGray from '~assets/icons/dislike-gray.svg';
import DarkDislikeGray from '~assets/icons/dislike-gray-dark.svg';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import checkWalletForSubstrateNetwork from '~src/util/checkWalletForSubstrateNetwork';
import blockToDays from '~src/util/blockToDays';
import { ApiPromise } from '@polkadot/api';
import { network as AllNetworks } from '~src/global/networkConstants';
import formatBnBalance from '~src/util/formatBnBalance';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { trackEvent } from 'analytics';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ITrackDelegation } from 'pages/api/v1/delegations';
import Alert from '~src/basic-components/Alert';
import SelectOption from '~src/basic-components/Select/SelectOption';
import getEncodedAddress from '~src/util/getEncodedAddress';
import VotingFormCard, { EFormType } from './VotingFormCard';
import ImageIcon from '~src/ui-components/ImageIcon';
const ZERO_BN = new BN(0);

interface Props {
	className?: string;
	referendumId?: number | null | undefined;
	onAccountChange: (address: string) => void;
	lastVote: ILastVote | undefined;
	setLastVote: (pre: ILastVote) => void;
	proposalType: ProposalType;
	address: string;
	theme?: string;
	trackNumber?: number;
	setUpdateTally?: (pre: boolean) => void;
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
					<SelectOption
						className={`text-bodyBlue  ${poppins.variable}`}
						key={0}
						value={0}
					>
						{'0.1x voting balance, no lockup period'}
					</SelectOption>,
					...CONVICTIONS.map(([value, lock]) => (
						<SelectOption
							className={`text-bodyBlue ${poppins.variable}`}
							key={value}
							value={value}
						>{`${value}x voting balance, locked for ${lock}x duration (${Number(lock) * Number(days)} days)`}</SelectOption>
					))
				];
			}
		}
	}
	return [
		<SelectOption
			className={`text-bodyBlue ${poppins.variable}`}
			key={0}
			value={0}
		>
			{'0.1x voting balance, no lockup period'}
		</SelectOption>,
		...CONVICTIONS.map(([value, lock]) => (
			<SelectOption
				className={`text-bodyBlue ${poppins.variable}`}
				key={value}
				value={value}
			>{`${value}x voting balance, locked for ${lock} enactment period(s)`}</SelectOption>
		))
	];
};

// const VoteReferendumCard = ({ className, referendumId, onAccountChange, lastVote, setLastVote, proposalType, address, trackNumber, setUpdateTally }: Props) => {
const VoteReferendumCard = ({ className, referendumId, onAccountChange, proposalType, address, trackNumber }: Props) => {
	const userDetails = useUserDetailsSelector();
	const { addresses, id, loginAddress, loginWallet } = userDetails;
	const [lockedBalance, setLockedBalance] = useState<BN>(ZERO_BN);
	const { api, apiReady } = useApiContext();
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const [isFellowshipMember, setIsFellowshipMember] = useState<boolean>(false);
	const [fetchingFellowship, setFetchingFellowship] = useState(true);
	const { network } = useNetworkSelector();
	const [wallet, setWallet] = useState<Wallet>();
	const [availableWallets, setAvailableWallets] = useState<any>({});
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const CONVICTIONS: [number, number][] = [1, 2, 4, 8, 16, 32].map((lock, index) => [index + 1, lock]);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [splitForm] = Form.useForm();
	const [abstainFrom] = Form.useForm();
	const [ayeNayForm] = Form.useForm();
	const [abstainVoteValue, setAbstainVoteValue] = useState<BN>(ZERO_BN);
	const [ayeVoteValue, setAyeVoteValue] = useState<BN>(ZERO_BN);
	const [nayVoteValue, setNayVoteValue] = useState<BN>(ZERO_BN);
	const [walletErr, setWalletErr] = useState<INetworkWalletErr>({ description: '', error: 0, message: '' });
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [multisig, setMultisig] = useState<string>('');
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [showMultisig, setShowMultisig] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	const currentUser = useUserDetailsSelector();
	const [isBalanceErr, setIsBalanceErr] = useState<boolean>(false);
	const [vote, setVote] = useState<EVoteDecisionType>(EVoteDecisionType.AYE);
	const [totalDeposit, setTotalDeposit] = useState<BN>(new BN(0));
	const [initiatorBalance, setInitiatorBalance] = useState<BN>(ZERO_BN);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [multisigBalance, setMultisigBalance] = useState<BN>(ZERO_BN);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [delegatedTo, setDelegatedTo] = useState<string | null>(null);

	const getData = async (address: any) => {
		if (!address) return;
		const { data, error } = await nextApiClientFetch<ITrackDelegation[]>('api/v1/delegations', {
			address: address,
			track: trackNumber
		});
		if (data && data?.filter((item) => item?.status.includes(ETrackDelegationStatus.DELEGATED))?.length) {
			const delegated = data?.filter((item) => item?.status.includes(ETrackDelegationStatus.DELEGATED))[0];
			delegated?.delegations.map((item) => {
				if (getEncodedAddress(item.from, network) === getEncodedAddress(loginAddress, network)) {
					setDelegatedTo(item?.to);
				} else {
					setDelegatedTo(null);
				}
			});
		} else if (error) {
			console.log(error);
			setDelegatedTo(null);
		}
	};

	useEffect(() => {
		if (typeof trackNumber !== 'number') return;
		getData(address);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackNumber, address]);

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

	useEffect(() => {
		if (!address || !wallet || !api || !apiReady) return;
		(async () => {
			const accountsData = await getAccountsFromWallet({ api, apiReady, chosenAddress: address, chosenWallet: wallet, loginAddress, network });
			setAccounts(accountsData?.accounts || []);
			onAccountChange(accountsData?.account || '');
		})();
		handleInitiatorBalance();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, wallet, handleInitiatorBalance]);

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

	if (!id) {
		return <LoginToVote />;
	}
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

	const handleOnVoteChange = (value: any) => {
		if (availableBalance.gte(ZERO_BN)) {
			setIsBalanceErr(false);
		}
		setVote(value as EVoteDecisionType);
		handleModalReset();
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
	};

	const ayeNayVotesArr = [
		{
			label: (
				<div
					className={`ml-1 mr-1 flex h-[32px] w-full items-center justify-center rounded-[4px] text-textGreyColor ${
						vote === EVoteDecisionType.AYE ? 'bg-ayeGreenColor text-white dark:bg-ayeDarkGreenColor' : ''
					}`}
				>
					{vote === EVoteDecisionType.AYE ? (
						<LikeWhite className='mb-[3px] mr-1' />
					) : theme === 'dark' ? (
						<DarkLikeGray className='mb-[3px] mr-1' />
					) : (
						<LikeGray className='mb-[3px] mr-1' />
					)}
					<span className={`${vote === EVoteDecisionType.AYE ? 'text-white' : 'dark:text-blue-dark-medium'} text-base font-medium`}>Aye</span>
				</div>
			),
			value: 'aye'
		},
		{
			label: (
				<div
					className={`ml-1 mr-1 flex h-[32px] w-full items-center justify-center rounded-[4px] text-textGreyColor ${
						vote === EVoteDecisionType.NAY ? 'bg-nayRedColor text-white dark:bg-nayDarkRedColor' : ''
					}`}
				>
					{vote === EVoteDecisionType.NAY ? (
						<DislikeWhite className='-mb-[3px] mr-1' />
					) : theme === 'dark' ? (
						<DarkDislikeGray className='-mb-[3px] mr-1' />
					) : (
						<DislikeGray className='-mb-[3px] mr-1' />
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
							className={` ml-2 flex h-[32px] w-full items-center  justify-center rounded-[4px] text-textGreyColor ${
								vote === EVoteDecisionType.ABSTAIN ? 'bg-abstainBlueColor text-white dark:bg-abstainDarkBlueColor' : ''
							}`}
						>
							<StopOutlined className={`mr-1 ${vote === EVoteDecisionType.ABSTAIN ? 'dark:text-white' : 'dark:text-[#909090]'}`} />
							<span className={`${vote === EVoteDecisionType.ABSTAIN ? 'text-white' : 'dark:text-blue-dark-medium'} text-base font-medium`}>Abstain</span>
						</div>
					),
					value: 'abstain'
				}
		  ]
		: ayeNayVotesArr;

	const VoteUI = (
		<>
			{showMultisig && initiatorBalance.lte(totalDeposit) && multisig && (
				<Alert
					message={`The Free Balance in your selected account is less than the Minimum Deposit ${formatBnBalance(
						totalDeposit,
						{ numberAfterComma: 3, withUnit: true },
						network
					)} required to create a Transaction.`}
					showIcon
					className='mb-6'
					type='info'
				/>
			)}
			{walletErr.error === 1 && !loadingStatus.isLoading && (
				<Alert
					message={walletErr.message}
					description={walletErr.description}
					showIcon
					type='warning'
				/>
			)}
			{accounts.length === 0 && wallet && !loadingStatus.isLoading && (
				<Alert
					message={<span className='dark:text-blue-dark-high'>No addresses found in the address selection tab.</span>}
					showIcon
					type='info'
				/>
			)}
			{/* aye nye split abstain buttons */}
			<h3 className='inner-headings mb-[2px] mt-[24px] dark:text-blue-dark-medium'>Choose your vote</h3>
			<Segmented
				block
				className={`${className} mb-6 w-full rounded-[4px] border-[1px] border-solid border-section-light-container bg-white dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay`}
				size='large'
				value={vote}
				onChange={(value) => {
					handleOnVoteChange(value);
				}}
				options={decisionOptions}
				disabled={!api || !apiReady}
			/>
			{proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote !== EVoteDecisionType.SPLIT && vote !== EVoteDecisionType.ABSTAIN && (
				<VotingFormCard
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
					showMultisig={showMultisig}
					initiatorBalance={initiatorBalance.gte(totalDeposit)}
					multisig={multisig}
					isBalanceErr={isBalanceErr}
					loadingStatus={loadingStatus.isLoading}
					wallet={wallet}
					ayeVoteValue={ayeVoteValue
						.add(nayVoteValue)
						.add(abstainVoteValue)
						.add(lockedBalance)
						.gte(showMultisig ? multisigBalance : availableBalance)}
				/>
			)}

			{proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote === EVoteDecisionType.SPLIT && (
				<VotingFormCard
					form={splitForm}
					formName={EFormType.SPLIT_FORM}
					onBalanceChange={(balance: BN) => setLockedBalance(balance)}
					onAyeValueChange={(balance: BN) => setAyeVoteValue(balance)}
					onNayValueChange={(balance: BN) => setNayVoteValue(balance)}
					convictionClassName={className}
					handleSubmit={handleSubmit}
					disabled={
						!wallet ||
						ayeVoteValue.add(nayVoteValue).lte(ZERO_BN) ||
						(showMultisig && !multisig) ||
						(showMultisig && initiatorBalance.lte(totalDeposit)) ||
						isBalanceErr ||
						(showMultisig && multisigBalance.lte(ayeVoteValue.add(nayVoteValue).add(abstainVoteValue).add(lockedBalance)))
					}
					conviction={conviction}
					setConviction={setConviction}
					convictionOpts={convictionOpts}
					showMultisig={showMultisig}
					initiatorBalance={initiatorBalance.gte(totalDeposit)}
					multisig={multisig}
					isBalanceErr={isBalanceErr}
					loadingStatus={loadingStatus.isLoading}
					wallet={wallet}
					ayeVoteValue={ayeVoteValue
						.add(nayVoteValue)
						.add(abstainVoteValue)
						.add(lockedBalance)
						.gte(showMultisig ? multisigBalance : availableBalance)}
				/>
			)}

			{proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote === 'abstain' && (
				<VotingFormCard
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
						ayeVoteValue.add(nayVoteValue).add(abstainVoteValue).lte(ZERO_BN) ||
						(showMultisig && !multisig) ||
						isBalanceErr ||
						(showMultisig && multisigBalance.lte(ayeVoteValue.add(nayVoteValue).add(abstainVoteValue).add(lockedBalance)))
					}
					conviction={conviction}
					setConviction={setConviction}
					convictionOpts={convictionOpts}
					showMultisig={showMultisig}
					initiatorBalance={initiatorBalance.gte(totalDeposit)}
					multisig={multisig}
					isBalanceErr={isBalanceErr}
					loadingStatus={loadingStatus.isLoading}
					wallet={wallet}
					ayeVoteValue={ayeVoteValue
						.add(nayVoteValue)
						.add(abstainVoteValue)
						.add(lockedBalance)
						.gte(showMultisig ? multisigBalance : availableBalance)}
				/>
			)}
			<div className='mt-[40px] flex h-[46px] items-center justify-between rounded-md bg-[#F6F7F9] p-3'>
				<div className='flex items-center gap-x-1'>
					<ImageIcon
						src='/assets/icons/lock-icon.svg'
						alt='lock-icon'
					/>
					<p className='m-0 p-0 text-sm text-lightBlue'>Locking period</p>
				</div>
				<p className='m-0 p-0 text-sm text-lightBlue'>No lockup period</p>
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

export default React.memo(styled(VoteReferendumCard)`
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
	.dark .ant-segmented-group label {
		background-color: transparent !important;
	}
	.ant-checkbox .ant-checkbox-inner {
		background-color: transparent !important;
	}
	.ant-checkbox-checked .ant-checkbox-inner {
		background-color: #e5007a !important;
		border-color: #e5007a !important;
	}
	.ant-segmented .ant-segmented-group {
		margin-top: 4px !important;
	}
	.ant-segmented .ant-segmented-item-label {
		padding: 0 !important;
	}
	.ant-segmented .ant-segmented-lg .ant-segmented-item-label {
		padding: 0 !important;
	}
`);
