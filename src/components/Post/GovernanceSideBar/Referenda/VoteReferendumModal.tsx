// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined, StopOutlined } from '@ant-design/icons';
import { InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Checkbox, Form, Modal, Segmented, Spin } from 'antd';
import BN from 'bn.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ETrackDelegationStatus, EVoteDecisionType, ILastVote, INetworkWalletErr, LoadingStatusType, NotificationStatus, Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
import WalletButton from '~src/components/WalletButton';
import { useApiContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import LoginToVote from '../LoginToVoteOrEndorse';
import { dmSans } from 'pages/_app';
import CastVoteIcon from '~assets/icons/cast-vote-icon.svg';
import DarkCastVoteIcon from '~assets/icons/cast-vote-icon-white.svg';
import LikeWhite from '~assets/icons/like-white.svg';
import LikeGray from '~assets/icons/like-gray.svg';
import DarkLikeGray from '~assets/icons/like-gray-dark.svg';
import DislikeWhite from '~assets/icons/dislike-white.svg';
import DislikeGray from '~assets/icons/dislike-gray.svg';
import DarkDislikeGray from '~assets/icons/dislike-gray-dark.svg';
import SplitWhite from '~assets/icons/split-white.svg';
import SplitGray from '~assets/icons/split-gray.svg';
import DarkSplitGray from '~assets/icons/split-gray-dark.svg';
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
import executeTx from '~src/util/executeTx';
import { network as AllNetworks, chainProperties } from '~src/global/networkConstants';
import PolkasafeIcon from '~assets/polkasafe-logo.svg';
import formatBnBalance from '~src/util/formatBnBalance';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import VotingForm, { EFormType } from './VotingFrom';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { trackEvent } from 'analytics';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ITrackDelegation } from 'pages/api/v1/delegations';
import Address from '~src/ui-components/Address';
import Alert from '~src/basic-components/Alert';
import InfoIcon from '~assets/icons/red-info-alert.svg';
import ProxyAccountSelectionForm from '~src/ui-components/ProxyAccountSelectionForm';
import SelectOption from '~src/basic-components/Select/SelectOption';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { IDelegateBalance } from '~src/components/UserProfile/TotalProfileBalances';
import Input from '~src/basic-components/Input';
import { formatedBalance } from '~src/util/formatedBalance';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import useImagePreloader from '~src/hooks/useImagePreloader';
const ZERO_BN = new BN(0);

interface Props {
	className?: string;
	referendumId?: number | null | undefined;
	onAccountChange: (address: string) => void;
	setLastVote: (pre: ILastVote) => void;
	proposalType: ProposalType;
	address: string;
	theme?: string;
	trackNumber?: number;
	setUpdateTally?: (pre: boolean) => void;
	updateTally?: boolean;
	showModal: boolean;
	setShowModal: (pre: boolean) => void;
}

export const getConvictionVoteOptions = (CONVICTIONS: [number, number][], proposalType: ProposalType, api: ApiPromise | undefined, apiReady: boolean, network: string) => {
	if ([ProposalType.REFERENDUM_V2, ProposalType.FELLOWSHIP_REFERENDUMS].includes(proposalType) && ![AllNetworks.COLLECTIVES, AllNetworks.WESTENDCOLLECTIVES].includes(network)) {
		if (api && apiReady) {
			const res = api?.consts?.convictionVoting?.voteLockingPeriod;
			if (res) {
				const num = res?.toJSON();
				const days = blockToDays(num, network);
				if (days && !Number.isNaN(Number(days))) {
					return [
						<SelectOption
							className={`text-bodyBlue  ${dmSans.variable}`}
							key={0}
							value={0}
						>
							{'0.1x voting balance, no lockup period'}
						</SelectOption>,
						...CONVICTIONS.map(([value, lock]) => (
							<SelectOption
								className={`text-bodyBlue ${dmSans.variable}`}
								key={value}
								value={value}
							>{`${value}x voting balance, locked for ${lock}x duration (${Number(lock) * Number(days)} days)`}</SelectOption>
						))
					];
				}
			}
		}
	}
	return [
		<SelectOption
			className={`text-bodyBlue ${dmSans.variable}`}
			key={0}
			value={0}
		>
			{'0.1x voting balance, no lockup period'}
		</SelectOption>,
		...CONVICTIONS.map(([value, lock]) => (
			<SelectOption
				className={`text-bodyBlue ${dmSans.variable}`}
				key={value}
				value={value}
			>{`${value}x voting balance, locked for ${lock} enactment period(s)`}</SelectOption>
		))
	];
};

const VoteReferendumModal = ({
	className,
	referendumId,
	onAccountChange,
	setLastVote,
	proposalType,
	address,
	trackNumber,
	setUpdateTally,
	updateTally,
	setShowModal,
	showModal
}: Props) => {
	const userDetails = useUserDetailsSelector();
	const { id, loginAddress, loginWallet } = userDetails;
	const [lockedBalance, setLockedBalance] = useState<BN>(ZERO_BN);
	const { api, apiReady } = useApiContext();
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const { network } = useNetworkSelector();
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
	const { resolvedTheme: theme } = useTheme();
	const currentUser = useUserDetailsSelector();
	const { client, connect } = usePolkasafe(address);
	const [isBalanceErr, setIsBalanceErr] = useState<boolean>(false);
	const [showProxyDropdown, setShowProxyDropdown] = useState<boolean>(false);
	const [isProxyExistsOnWallet, setIsProxyExistsOnWallet] = useState<boolean>(true);
	const [vote, setVote] = useState<EVoteDecisionType>(EVoteDecisionType.AYE);
	const [totalDeposit, setTotalDeposit] = useState<BN>(new BN(0));
	const [initiatorBalance, setInitiatorBalance] = useState<BN>(ZERO_BN);
	const [multisigBalance, setMultisigBalance] = useState<BN>(ZERO_BN);
	const [delegatedTo, setDelegatedTo] = useState<string | null>(null);
	const [proxyAddresses, setProxyAddresses] = useState<string[]>([]);
	const [selectedProxyAddress, setSelectedProxyAddress] = useState(proxyAddresses[0] || '');
	const [proxyAddressBalance, setProxyAddressBalance] = useState<BN>(ZERO_BN);
	const [delegatedVotingPower, setDelegatedVotingPower] = useState<BN>(ZERO_BN);
	const [extensionNotFound, setExtensionNotFound] = useState<boolean>(false);

	const isGifLoaded = useImagePreloader('/assets/Gifs/voted.gif');

	const getDelegateData = async () => {
		if (!address.length || proposalType !== ProposalType.REFERENDUM_V2) return;
		const { data, error } = await nextApiClientFetch<IDelegateBalance>('/api/v1/delegations/total-delegate-balance', {
			addresses: [address],
			trackNo: trackNumber
		});
		if (data) {
			const bnVotingPower = new BN(data?.votingPower || '0');
			setDelegatedVotingPower(bnVotingPower);
		} else if (error) {
			console.log(error);
		}
	};

	const getProxies = async (address: any) => {
		const proxies: any = (await api?.query?.proxy?.proxies(address))?.toJSON();
		if (proxies) {
			const proxyAddr = proxies[0].map((proxy: any) => proxy.delegate);
			setProxyAddresses(proxyAddr);
			setSelectedProxyAddress(proxyAddr[0]);
		}
	};

	useEffect(() => {
		getProxies(address);

		getDelegateData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	const getData = async (address: any) => {
		if (!address) return;
		const { data, error } = await nextApiClientFetch<ITrackDelegation[]>('api/v1/delegations', {
			address: address,
			track: trackNumber
		});
		if (data?.filter((item) => item?.status?.includes(ETrackDelegationStatus.DELEGATED))?.length) {
			const delegated = data?.filter((item) => item?.status?.includes(ETrackDelegationStatus.DELEGATED))?.[0];
			delegated?.delegations?.map((item) => {
				if (getEncodedAddress(item.from, network) === getEncodedAddress(address, network)) {
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
		let defaultWallet: Wallet | null = loginWallet;
		if (!defaultWallet) {
			defaultWallet = (window.localStorage.getItem('loginWallet') as Wallet) || null;
		}

		if (!defaultWallet) return;

		setWallet(defaultWallet);

		const injectedWindow = window as Window & InjectedWindow;
		const extensionAvailable = isWeb3Injected ? injectedWindow.injectedWeb3[defaultWallet] : null;
		if (!extensionAvailable) {
			setExtensionNotFound(true);
		} else {
			setExtensionNotFound(false);
		}
		(async () => {
			setLoadingStatus({ isLoading: true, message: 'Awaiting accounts' });
			const accountsData = await getAccountsFromWallet({ api, apiReady, chosenWallet: defaultWallet || wallet, loginAddress, network });
			setAccounts(accountsData?.accounts || []);
			onAccountChange(accountsData?.account || '');
			setLoadingStatus({ isLoading: false, message: '' });
		})();

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
		if (api.consts.multisig) {
			const depositBase = api.consts.multisig.depositBase.toString();
			const depositFactor = api.consts.multisig.depositFactor.toString();
			setTotalDeposit(new BN(depositBase).add(new BN(depositFactor)));
		} else {
			console.error('Multisig constants are not available on this network.');
		}
		//initiator balance
		const initiatorBalance = await api.query.system.account(address);
		setInitiatorBalance(new BN(initiatorBalance.data.free.toString()));
	}, [address, api, apiReady]);

	const handleBalanceErr = useCallback(() => {
		switch (vote) {
			case EVoteDecisionType.AYE:
				setIsBalanceErr((showMultisig ? multisigBalance : showProxyDropdown ? proxyAddressBalance : availableBalance)?.lte(lockedBalance));
				break;
			case EVoteDecisionType.NAY:
				setIsBalanceErr((showMultisig ? multisigBalance : showProxyDropdown ? proxyAddressBalance : availableBalance)?.lte(lockedBalance));
				break;
			case EVoteDecisionType.SPLIT:
				setIsBalanceErr((showMultisig ? multisigBalance : showProxyDropdown ? proxyAddressBalance : availableBalance)?.lte(nayVoteValue.add(ayeVoteValue)));
				break;
			case EVoteDecisionType.ABSTAIN:
				setIsBalanceErr((showMultisig ? multisigBalance : showProxyDropdown ? proxyAddressBalance : availableBalance)?.lte(nayVoteValue.add(ayeVoteValue).add(abstainVoteValue)));
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

	const handleProxyAddressBalnceChange = (balanceStr: string) => {
		if (!api || !apiReady || !balanceStr) {
			return;
		}
		let balance = ZERO_BN;
		try {
			balance = new BN(balanceStr || '0');
			setProxyAddressBalance(balance);
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

	useEffect(() => {
		if (!api || !apiReady) return;
		setWalletErr(checkWalletForSubstrateNetwork(network) as INetworkWalletErr);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, api, availableWallets, apiReady]);

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

		if (!referendumId && referendumId !== 0) {
			console.error('referendumId not set');
			return;
		}

		if (!api || !apiReady) {
			return;
		}
		const totalVoteValue = (ayeVoteValue || ZERO_BN)
			.add(nayVoteValue || ZERO_BN)
			?.add(abstainVoteValue || ZERO_BN)
			.add(lockedBalance || ZERO_BN);

		if (!multisig) {
			if (showProxyDropdown) {
				if (proxyAddressBalance.lte(totalVoteValue)) return;
			} else {
				if (!lockedBalance || availableBalance.lte(lockedBalance)) return;

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
			}
		}

		setVoteValues((prevState) => ({
			...prevState,
			totalVoteValue: totalVoteValue
		}));

		setLoadingStatus({ isLoading: true, message: 'Awaiting Confirmation' });

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
			setUpdateTally?.(!updateTally);
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
			proxyAddress: showProxyDropdown ? selectedProxyAddress : '',
			setStatus: (status: string) => setLoadingStatus({ isLoading: true, message: status }),
			tx: voteTx
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
						<LikeWhite className='mb-[3px] mr-2 hidden msm:block ' />
					) : theme === 'dark' ? (
						<DarkLikeGray className='mb-[3px] mr-2 hidden msm:block ' />
					) : (
						<LikeGray className='mb-[3px] mr-2 hidden msm:block ' />
					)}
					<span className={`${vote === EVoteDecisionType.AYE ? 'text-white' : 'dark:text-blue-dark-medium'} text-sm font-medium sm:text-base`}>Aye</span>
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
						<DislikeWhite className='-mb-[3px] mr-2 hidden msm:block ' />
					) : theme === 'dark' ? (
						<DarkDislikeGray className='-mb-[3px] mr-2 hidden msm:block ' />
					) : (
						<DislikeGray className='-mb-[3px] mr-2 hidden msm:block ' />
					)}
					<span className={`${vote === EVoteDecisionType.NAY ? 'text-white' : 'dark:text-blue-dark-medium'} text-sm font-medium sm:text-base`}>Nay</span>
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
							className={`flex h-[32px] w-[126px] items-center  justify-center rounded-[4px] text-textGreyColor ${
								vote === EVoteDecisionType.SPLIT ? 'bg-yellowColor text-white dark:bg-darkOrangeColor' : ''
							}`}
						>
							{vote === EVoteDecisionType.SPLIT ? (
								<SplitWhite className='mr-2  hidden msm:block ' />
							) : theme === 'dark' ? (
								<DarkSplitGray className='mr-2 hidden msm:block ' />
							) : (
								<SplitGray className='mr-2 hidden msm:block ' />
							)}
							<span className={`${vote === EVoteDecisionType.SPLIT ? 'text-white' : 'dark:text-blue-dark-medium'} text-sm font-medium sm:text-base`}>Split</span>
						</div>
					),
					value: 'split'
				},
				{
					label: (
						<div
							className={` ml-2 flex h-[32px] w-[126px] items-center  justify-center rounded-[4px] text-textGreyColor ${
								vote === EVoteDecisionType.ABSTAIN ? 'bg-abstainBlueColor text-white dark:bg-abstainDarkBlueColor' : ''
							}`}
						>
							<StopOutlined className={`mb-[3px] mr-2 hidden msm:block ${vote === EVoteDecisionType.ABSTAIN ? 'dark:text-white' : 'dark:text-[#909090]'}`} />
							<span className={`${vote === EVoteDecisionType.ABSTAIN ? 'text-white' : 'dark:text-blue-dark-medium'} text-sm font-medium sm:text-base`}>Abstain</span>
						</div>
					),
					value: 'abstain'
				}
		  ]
		: ayeNayVotesArr;

	return (
		<>
			<div className={className}>
				<Modal
					open={showModal}
					onCancel={() => {
						setShowModal(false);
						handleModalReset();
					}}
					footer={false}
					className={`w-[550px] ${dmSans.variable} ${dmSans.className} alignment-close vote-referendum max-h-[675px] rounded-sm max-md:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
					closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
					wrapClassName={`${className} dark:bg-modalOverlayDark`}
					title={
						showMultisig ? (
							<div className='-mt-5 ml-[-24px] mr-[-24px] flex h-[65px] items-center gap-2 rounded-t-[6px] border-0 border-b-[1.5px] border-solid border-section-light-container dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
								<ArrowLeft
									onClick={() => {
										setShowMultisig(false);
										setMultisig('');
									}}
									className='absolute left-6 -mt-1 cursor-pointer'
								/>
								<div className='flex items-center gap-[8px]'>
									{theme === 'dark' ? (
										<WalletIcon
											which={Wallet.POLKASAFE}
											className='ml-14 mt-2.5 h-6 w-6'
										/>
									) : (
										<PolkasafeIcon className='ml-14' />
									)}

									<span className='text-xl font-semibold tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>Cast Vote with Polkasafe Multisig</span>
								</div>
							</div>
						) : (
							<div className='-mt-5 ml-[-24px] mr-[-24px] flex h-[65px] items-center justify-center gap-2 rounded-t-[6px] border-0 border-b-[1.5px] border-solid border-section-light-container dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
								{theme === 'dark' ? <DarkCastVoteIcon className='ml-6' /> : <CastVoteIcon className='ml-6' />}
								<span className='text-xl font-semibold tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>Cast Your Vote</span>
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
								<div className='my-6'>
									<div className='mt-1 flex items-center justify-center text-sm font-normal text-lightBlue dark:text-blue-dark-medium'>Select a wallet</div>
									<div className='mt-1 flex items-center justify-center gap-x-2'>
										{availableWallets[Wallet.POLKADOT] && (
											<WalletButton
												className={`${wallet === Wallet.POLKADOT ? 'h-12 w-16 border border-solid border-pink_primary hover:border-pink_primary' : 'h-[48px] w-[64px]'}`}
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
												className={`${wallet === Wallet.TALISMAN ? 'h-[48px] w-16 border border-solid border-pink_primary hover:border-pink_primary' : 'h-[48px] w-[64px]'}`}
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
												className={`${wallet === Wallet.SUBWALLET ? 'h-[48px] w-16 border border-solid border-pink_primary hover:border-pink_primary' : 'h-[48px] w-[64px]'}`}
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
												className={`${wallet === Wallet.POLKAGATE ? 'h-[48px] w-16 border border-solid border-pink_primary hover:border-pink_primary' : 'h-[48px] w-[64px]'}`}
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
												className={`${wallet === Wallet.NOVAWALLET ? 'h-[48px] w-16 border  border-solid border-pink_primary' : 'h-[48px] w-[64px]'}`}
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
												className={`${wallet === Wallet.POLYWALLET ? 'h-[48px] w-16 border  border-solid border-pink_primary' : 'h-[48px] w-[64px]'}`}
												name='PolyWallet'
												icon={
													<WalletIcon
														which={Wallet.POLYWALLET}
														className='h-6 w-6'
													/>
												}
											/>
										) : null}
										{canUsePolkasafe(network) && !showMultisig && (
											<div className='flex-col'>
												<div className='flex w-full justify-center'>
													<WalletButton
														className='h-[50px] w-16 !border-section-light-container text-sm font-semibold text-bodyBlue dark:border-[#3B444F] dark:text-blue-dark-high'
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
								{!extensionNotFound && !accounts.length && !!wallet && !loadingStatus.isLoading && (
									<Alert
										description={
											<div className=' text-xs text-lightBlue dark:text-blue-dark-high'>
												<h3 className='p-0 text-[13px] text-lightBlue dark:text-blue-dark-high'>Link your wallet</h3>
												<div className='p-0 text-[13px] text-lightBlue dark:text-blue-dark-high'>Add an address to the selected wallet by your extension.</div>
											</div>
										}
										showIcon
										className='mb-2 mt-1 p-3'
										type='info'
									/>
								)}
								{accounts.length === 0 && wallet && !loadingStatus.isLoading && (
									<Alert
										message={<span className='dark:text-blue-dark-high'>No addresses found in the address selection tab.</span>}
										showIcon
										type='info'
										className='mt-2'
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
											className={`${dmSans.variable} ${dmSans.className} text-sm font-normal text-lightBlue dark:text-blue-dark-medium`}
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
											isTruncateUsername={false}
											accounts={accounts}
											address={address}
											withBalance
											onAccountChange={onAccountChange}
											onBalanceChange={handleOnBalanceChange}
											className={`${dmSans.variable} ${dmSans.className} text-sm font-normal text-lightBlue dark:text-blue-dark-medium`}
											inputClassName='rounded-[4px] px-3 py-1'
											withoutInfo={true}
											theme={theme}
											showProxyDropdown={showProxyDropdown}
											isVoting
										/>
									)
								) : walletErr.message.length === 0 && !wallet && !loadingStatus.isLoading ? (
									<Alert
										message={<span className='dark:text-blue-dark-high'>Please select a wallet.</span>}
										showIcon
										type='info'
									/>
								) : null}

								{!!delegatedTo && (
									<Alert
										message={
											<span className='flex items-center dark:text-blue-dark-high'>
												This account has already delegated vote to
												<Address
													address={delegatedTo}
													className='ml-2 text-sm'
													iconSize={20}
													displayInline
													isTruncateUsername={true}
													isUsedIndelegationNudge={true}
												/>
											</span>
										}
										showIcon
										type='warning'
										className='mt-4'
									/>
								)}
								{!!proxyAddresses?.length && (
									<div className='mt-2'>
										<Checkbox
											value=''
											className='text-xs text-bodyBlue dark:text-blue-dark-medium'
											onChange={(value) => {
												setShowProxyDropdown(value?.target?.checked);
											}}
										>
											<p className='m-0 mt-1 p-0'>Vote with proxy</p>
										</Checkbox>
									</div>
								)}
								{showProxyDropdown && (
									<ProxyAccountSelectionForm
										proxyAddresses={proxyAddresses}
										theme={theme}
										address={address}
										withBalance
										className={`${dmSans.variable} ${dmSans.className} rounded-[4px] px-3 py-1 text-sm font-normal text-lightBlue dark:text-blue-dark-medium`}
										inputClassName='rounded-[4px] px-3 py-1'
										wallet={wallet}
										setIsProxyExistsOnWallet={setIsProxyExistsOnWallet}
										setSelectedProxyAddress={setSelectedProxyAddress}
										selectedProxyAddress={selectedProxyAddress}
										onBalanceChange={handleProxyAddressBalnceChange}
									/>
								)}
								{showProxyDropdown && !isProxyExistsOnWallet && (
									<div className='mt-2 flex items-center gap-x-1'>
										<InfoIcon />
										<p className='m-0 p-0 text-xs text-errorAlertBorderDark'>Proxy address does not exist on selected wallet</p>
									</div>
								)}
								{/* delegate voting power */}
								{delegatedVotingPower.gt(ZERO_BN) && (
									<div className='mb-4 mt-6 flex flex-col gap-0.5 text-sm'>
										<span className='flex gap-1 text-sm text-lightBlue dark:text-blue-dark-medium'>
											{' '}
											Delegated power <HelperTooltip text='Total amount of voting power' />
										</span>
										<Input
											value={formatedBalance(delegatedVotingPower?.toString() || '0', chainProperties[network]?.tokenSymbol, 0)}
											disabled
											className='h-10 rounded-[4px] border-[1px] border-solid dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high'
										/>
									</div>
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
											(showMultisig && multisigBalance.lte(lockedBalance)) ||
											(showProxyDropdown && proxyAddressBalance.lte(lockedBalance))
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
										isProxyExistsOnWallet={isProxyExistsOnWallet}
										showProxyDropdown={showProxyDropdown}
										ayeVoteValue={ayeVoteValue
											.add(nayVoteValue)
											.add(abstainVoteValue)
											.add(lockedBalance)
											.gte(showMultisig ? multisigBalance : showProxyDropdown ? proxyAddressBalance : availableBalance)}
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
											(showProxyDropdown && proxyAddressBalance.lte(lockedBalance)) ||
											!wallet ||
											ayeVoteValue.add(nayVoteValue).lte(ZERO_BN) ||
											(showMultisig && !multisig) ||
											(showMultisig && initiatorBalance.lte(totalDeposit)) ||
											isBalanceErr ||
											(showProxyDropdown && proxyAddressBalance.lte(lockedBalance)) ||
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
										isProxyExistsOnWallet={isProxyExistsOnWallet}
										showProxyDropdown={showProxyDropdown}
										wallet={wallet}
										ayeVoteValue={ayeVoteValue
											.add(nayVoteValue)
											.add(abstainVoteValue)
											.add(lockedBalance)
											.gte(showMultisig ? multisigBalance : showProxyDropdown ? proxyAddressBalance : availableBalance)}
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
											ayeVoteValue.add(nayVoteValue).add(abstainVoteValue).lte(ZERO_BN) ||
											(showMultisig && !multisig) ||
											isBalanceErr ||
											(showMultisig && multisigBalance.lte(ayeVoteValue.add(nayVoteValue).add(abstainVoteValue).add(lockedBalance))) ||
											(showProxyDropdown && proxyAddressBalance.lte(lockedBalance))
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
										isProxyExistsOnWallet={isProxyExistsOnWallet}
										showProxyDropdown={showProxyDropdown}
										ayeVoteValue={ayeVoteValue
											.add(nayVoteValue)
											.add(abstainVoteValue)
											.add(lockedBalance)
											.gte(showMultisig ? multisigBalance : showProxyDropdown ? proxyAddressBalance : availableBalance)}
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
					delegatedVotingPower={delegatedVotingPower}
					setOpen={setSuccessModal}
					address={address}
					multisig={multisig ? multisig : ''}
					conviction={conviction}
					votedAt={dayjs().format('HH:mm, Do MMMM YYYY')}
					ayeVoteValue={voteValues.ayeVoteValue}
					nayVoteValue={voteValues.nayVoteValue}
					abstainVoteValue={voteValues.abstainVoteValue}
					icon={
						multisig ? (
							<Image
								src='/assets/multi-vote-initiated.svg'
								alt='multi vote initiated icon'
								width={220}
								height={220}
							/>
						) : (
							<div className='-mt-[116px]'>
								<Image
									src={!isGifLoaded ? '/assets/Gifs/voted.svg' : '/assets/Gifs/voted.gif'}
									alt='Voted-successfully'
									width={363}
									height={347}
									priority={true}
								/>
							</div>
						)
					}
				/>
			</div>
		</>
	);
};

export default React.memo(styled(VoteReferendumModal)`
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
		border: 1px solid !important;
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
`);
