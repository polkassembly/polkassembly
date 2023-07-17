// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined,LoadingOutlined } from '@ant-design/icons';
import { Signer } from '@polkadot/api/types';
import { isWeb3Injected, web3Enable } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedAccountWithMeta, InjectedWindow, InjectedWindowProvider } from '@polkadot/extension-inject/types';
import { Button, Form, Modal, Spin, Tooltip } from 'antd';
import { IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { APPNAME } from 'src/global/appName';
import { gov2ReferendumStatus, motionStatus, proposalStatus, referendumStatus } from 'src/global/statuses';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import getEncodedAddress from 'src/util/getEncodedAddress';
import styled from 'styled-components';

import { useApiContext, useNetworkContext, usePostDataContext, useUserDetailsContext } from '~src/context';
import { ProposalType, VoteType, getSubsquidProposalType } from '~src/global/proposalType';
import useHandleMetaMask from '~src/hooks/useHandleMetaMask';

import ExtensionNotDetected from '../../ExtensionNotDetected';
import { tipStatus } from '../Tabs/PostOnChainInfo';
import BountyChildBounties from './Bounty/BountyChildBounties';
import MotionVoteInfo from './Motions/MotionVoteInfo';
import VoteMotion from './Motions/VoteMotion';
import ProposalDisplay from './Proposals';
import FellowshipReferendumVoteInfo from './Referenda/FellowshipReferendumVoteInfo';
import ReferendumV2VoteInfo from './Referenda/ReferendumV2VoteInfo';
import ReferendumVoteInfo from './Referenda/ReferendumVoteInfo';
import VoteReferendum from './Referenda/VoteReferendum';
import VoteReferendumEth from './Referenda/VoteReferendumEth';
import VoteReferendumEthV2 from './Referenda/VoteReferendumEthV2';
import EndorseTip from './Tips/EndorseTip';
import TipInfo from './Tips/TipInfo';
import EditProposalStatus from './TreasuryProposals/EditProposalStatus';
import VotersList from './Referenda/VotersList';
import ReferendaV2Messages from './Referenda/ReferendaV2Messages';
import blockToTime from '~src/util/blockToTime';
import { makeLinearCurve, makeReciprocalCurve } from './Referenda/util';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { GET_CURVE_DATA_BY_INDEX } from '~src/queries';
import dayjs from 'dayjs';
import { ChartData, Point } from 'chart.js';
import Curves from './Referenda/Curves';
import PostEditOrLinkCTA from './PostEditOrLinkCTA';
import CloseIcon from '~assets/icons/close.svg';
import { PlusOutlined } from '@ant-design/icons';
import GraphicIcon from '~assets/icons/add-tags-graphic.svg';
import AbstainGray from '~assets/icons/abstain-gray.svg';
import { useCurrentBlock } from '~src/hooks';
import { IVoteHistory, IVotesHistoryResponse } from 'pages/api/v1/votes/history';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import SplitYellow from '~assets/icons/split-yellow-icon.svg';
import BN from 'bn.js';
import { chainProperties } from '~src/global/networkConstants';
import MoneyIcon from '~assets/icons/money-icon-gray.svg';
import ConvictionIcon from '~assets/icons/conviction-icon-gray.svg';
import { formatedBalance } from '~src/components/DelegationDashboard/ProfileBalance';
import { EVoteDecisionType, ILastVote, Wallet } from '~src/types';
import AyeGreen from '~assets/icons/aye-green-icon.svg';
import { DislikeIcon } from '~src/ui-components/CustomIcons';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { InjectedTypeWithCouncilBoolean } from '~src/ui-components/AddressDropdown';
import { isOffChainProposalTypeValid } from '~src/api-utils';
import addEthereumChain from '~src/util/addEthereumChain';
import WalletConnectProvider from '@walletconnect/web3-provider';

interface IGovernanceSidebarProps {
	canEdit?: boolean | '' | undefined
	className?: string
	proposalType: ProposalType;
	onchainId?: string | number | null
	status?: string
	startTime: string
	tally?: any;
	post: IPostResponse;
	toggleEdit?: () => void;
	lastVote: ILastVote | undefined;
	setLastVote: React.Dispatch<React.SetStateAction<ILastVote | undefined>>
}

type TOpenGov = ProposalType.REFERENDUM_V2 | ProposalType.FELLOWSHIP_REFERENDUMS;

export function getReferendumVotingFinishHeight(timeline: any[], openGovType: TOpenGov) {
	let height = 0;
	if (timeline && Array.isArray(timeline) && timeline.length > 0) {
		const singleTimeline = timeline.find((item) => item.type === getSubsquidProposalType(openGovType));
		if (singleTimeline && singleTimeline.statuses && Array.isArray(singleTimeline.statuses)) {
			const finishItem = singleTimeline.statuses.find((obj: any) => ['Approved', 'Rejected', 'TimedOut', 'Cancelled', 'Killed', 'Confirmed'].includes(obj.status));
			if (finishItem && finishItem?.block) {
				height = finishItem?.block;
			}
		}
	}
	return height;
}

export function checkVotingStart(timeline: any[], openGovType: TOpenGov) {
	let isVotingStart = false;
	if (timeline && Array.isArray(timeline) && timeline.length > 0) {
		const singleTimeline = timeline.find((item) => item.type === getSubsquidProposalType(openGovType));
		if (singleTimeline && singleTimeline.statuses && Array.isArray(singleTimeline.statuses)) {
			const finishItem = singleTimeline.statuses.find((obj: any) => obj.status === 'Deciding');
			if (finishItem) {
				isVotingStart = true;
			}
		}
	}
	return isVotingStart;
}

export function getDecidingEndPercentage(decisionPeriod: number, decidingSince: number, endHeight: number) {
	const gone = endHeight - decidingSince;
	return Math.min(gone / decisionPeriod, 1);
}

export function getTrackFunctions(trackInfo: any) {
	let supportCalc: any = null;
	let approvalCalc: any = null;
	if (trackInfo) {
		if (trackInfo.minApproval) {
			if (trackInfo.minApproval.reciprocal) {
				approvalCalc = makeReciprocalCurve(trackInfo.minApproval.reciprocal);
			} else if (trackInfo.minApproval.linearDecreasing) {
				approvalCalc = makeLinearCurve(trackInfo.minApproval.linearDecreasing);
			}
		}
		if (trackInfo.minSupport) {
			if (trackInfo.minSupport.reciprocal) {
				supportCalc = makeReciprocalCurve(trackInfo.minSupport.reciprocal);
			} else if (trackInfo.minSupport.linearDecreasing) {
				supportCalc = makeLinearCurve(trackInfo.minSupport.linearDecreasing);
			}
		}
	}
	return {
		approvalCalc,
		supportCalc
	};
}

const GovernanceSideBar: FC<IGovernanceSidebarProps> = (props) => {
	const { canEdit, className, onchainId, proposalType, startTime, status, tally, post, toggleEdit, lastVote ,setLastVote } = props;

	const { network } = useNetworkContext();
	const currentBlock = useCurrentBlock();
	const { api, apiReady } = useApiContext();
	const { loginAddress, defaultAddress, walletConnectProvider, setWalletConnectProvider, loginWallet } = useUserDetailsContext();
	const { postData: { created_at, track_number, post_link } } = usePostDataContext();
	const metaMaskError = useHandleMetaMask();

	const [address, setAddress] = useState<string>('');
	const [accounts, setAccounts] = useState<InjectedTypeWithCouncilBoolean[]>([]);
	const [extensionNotFound, setExtensionNotFound] = useState(false);
	const [accountsNotFound, setAccountsNotFound] = useState(false);
	const [accountsMap, setAccountsMap] = useState<{[key:string]:string}>({});
	const [signersMap, setSignersMap] = useState<{[key:string]: Signer}>({});
	const [open, setOpen] = useState(false);
	const [graphicOpen, setGraphicOpen] = useState<boolean>(true);
	const [thresholdOpen, setThresholdOpen] = useState(false);
	const [curvesLoading, setCurvesLoading] = useState(true);
	const [curvesError, setCurvesError] = useState('');
	const [data, setData] = useState<any>({
		datasets: [],
		labels: []
	});
	const [trackInfo, setTrackInfo] = useState<any>({});
	const [progress, setProgress] = useState({
		approval: 0,
		approvalThreshold: 0,
		support: 0,
		supportThreshold: 0
	});
	const [onChainLastVote, setOnChainLastVote] = useState<IVoteHistory | null>(null);
	const[isLastVoteLoading, setIsLastVoteLoading] = useState(true);

	const [canVote, setCanVote] = useState(false);
	const [currentCouncil, setCurrentCouncil] = useState<string[]>([]);
	const [isCouncil, setIsCouncil] = useState(false);
	const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
	const [availableWallets, setAvailableWallets] = useState<Record<string, InjectedWindowProvider>>({});
	const [isMoonbaseFamily, setIsMoonbaseFamily] = useState(false);
	const [isMetamaskWallet, setIsMetamaskWallet] = useState<boolean>(false);
	const [isTalismanEthereum, setIsTalismanEthereum] = useState<boolean>(true);

	useEffect(() => {
		setIsMoonbaseFamily(['moonbase', 'moonbeam', 'moonriver'].includes(network));
	}, [network]);

	useEffect(() => {
		const canVote = Boolean(post.status) &&
		[
			proposalStatus.PROPOSED,
			referendumStatus.STARTED,
			motionStatus.PROPOSED,
			tipStatus.OPENED,
			gov2ReferendumStatus.SUBMITTED,
			gov2ReferendumStatus.DECIDING,
			gov2ReferendumStatus.CONFIRM_STARTED,
			gov2ReferendumStatus.DECISION_DEPOSIT_PLACED
		].includes(post.status);
		setCanVote(canVote && !(extensionNotFound || accountsNotFound));
	}, [accountsNotFound, extensionNotFound, post.status]);

	const unit =`${chainProperties[network]?.tokenSymbol}`;

	const balance  = useMemo(() => {
		return onChainLastVote?.balance ? Object.values(onChainLastVote.balance).reduce((prev, curr) => {
			if(!curr) return prev;
			return prev.add(new BN(curr));
		}, new BN(0)).toString() : '';
	}, [onChainLastVote?.balance]);

	const onAccountChange = (address: string) => {
		setAddress(address);
	};

	const connect = useCallback(async () => {

		//  Create new WalletConnect Provider
		window.localStorage.removeItem('walletconnect');
		const wcProvider = new WalletConnectProvider({
			rpc: {
				1284: 'https://rpc.api.moonbeam.network',
				1285: 'https://rpc.api.moonriver.moonbeam.network',
				1287: 'https://rpc.api.moonbase.moonbeam.network'
			}
		});
		await wcProvider.wc.createSession();
		setWalletConnectProvider(wcProvider);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const getAccountsHandler = useCallback(async (addresses: string[], chainId: number) => {
		if(chainId !== chainProperties[network].chainId) {
			// setErr(new Error(`Please login using the ${NETWORK} network`));
			// setAccountsNotFound(true);
			return;
		}

		const checksumAddresses = addresses.map((address: string) => address);

		if (checksumAddresses.length === 0) {
			// setAccountsNotFound(true);
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
	}, [network]);

	const getWalletConnectAccounts = useCallback(async () => {
		if(!walletConnectProvider?.wc.connected) {
			await connect();
			if(!walletConnectProvider?.connected) return;
		}

		getAccountsHandler(walletConnectProvider.wc.accounts, walletConnectProvider.wc.chainId);

		walletConnectProvider.wc.on('session_update', (error, payload) => {
			if (error) {
				console.error(error);
				return;
			}

			// updated accounts and chainId
			const { accounts: addresses, chainId } = payload.params[0];
			getAccountsHandler(addresses, Number(chainId));
		});
	}, [connect, getAccountsHandler, walletConnectProvider?.connected, walletConnectProvider?.wc]);

	const getWalletAccounts = useCallback(async (chosenWallet: Wallet): Promise<InjectedAccount[] | undefined> => {
		const injectedWindow = window as Window & InjectedWindow;

		let wallet = isWeb3Injected
			? injectedWindow.injectedWeb3[chosenWallet]
			: null;

		if (!wallet) {
			wallet = Object.values(injectedWindow.injectedWeb3)[0];
		}

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
					wallet!.enable(APPNAME).then(value => {
						clearTimeout(timeoutId);
						resolve(value);
					}).catch(error => {
						reject(error);
					});
				}
			});
		} catch (err) {
			console.log('Error fetching wallet accounts : ', err);
		}

		if (!injected) {
			return;
		}

		const accounts = await injected.accounts.get();

		accounts.forEach((account) => {
			account.address = getEncodedAddress(account.address, network) || account.address;
		});

		return accounts;
	}, [network]);

	const getAccounts = useCallback(async (): Promise<undefined> => {
		if (!api || !apiReady) {
			return;
		}

		const signersMapLocal = {} as {[key:string]: Signer};
		const accountsMapLocal = {} as {[key:string]: string};

		let accounts: InjectedTypeWithCouncilBoolean[] = [];

		console.log('isMoonbaseFamily', isMoonbaseFamily, proposalType, selectedWallet);

		if (!selectedWallet && [ProposalType.REFERENDUMS, ProposalType.REFERENDUM_V2, ProposalType.FELLOWSHIP_REFERENDUMS].includes(proposalType)) {
			setAccounts([]);
			setAddress('');
			return;
		}
		if (!isMoonbaseFamily) {
			const extensions = await web3Enable(APPNAME);

			if (extensions.length === 0) {
				setExtensionNotFound(true);
				return;
			} else {
				setExtensionNotFound(false);
			}

			let polakadotJSAccounts : InjectedAccount[] | undefined;
			let polywalletJSAccounts : InjectedAccount[] | undefined;
			let subwalletAccounts: InjectedAccount[] | undefined;
			let talismanAccounts: InjectedAccount[] | undefined;

			for (const extObj of extensions) {
				if(extObj.name == 'polkadot-js' && (selectedWallet === Wallet.POLKADOT || !selectedWallet)) {
					signersMapLocal['polkadot-js'] = extObj.signer;
					polakadotJSAccounts = await getWalletAccounts(Wallet.POLKADOT);
				} else if(extObj.name == 'subwallet-js' && (selectedWallet === Wallet.SUBWALLET || !selectedWallet)) {
					signersMapLocal['subwallet-js'] = extObj.signer;
					subwalletAccounts = await getWalletAccounts(Wallet.SUBWALLET);
				} else if(extObj.name == 'talisman' && (selectedWallet === Wallet.TALISMAN || !selectedWallet)) {
					signersMapLocal['talisman'] = extObj.signer;
					talismanAccounts = await getWalletAccounts(Wallet.TALISMAN);
				} else if (['polymesh'].includes(network) && extObj.name === 'polywallet' && (selectedWallet === Wallet.POLYWALLET || !selectedWallet)) {
					signersMapLocal['polywallet'] = extObj.signer;
					polywalletJSAccounts = await getWalletAccounts(Wallet.POLYWALLET);
				}
			}

			if(polakadotJSAccounts) {
				accounts = accounts.concat(polakadotJSAccounts);
				polakadotJSAccounts.forEach((acc: InjectedAccount) => {
					accountsMapLocal[acc.address] = 'polkadot-js';
				});
			}

			if(['polymesh'].includes(network) && polywalletJSAccounts) {
				accounts = accounts.concat(polywalletJSAccounts);
				polywalletJSAccounts.forEach((acc: InjectedAccount) => {
					accountsMapLocal[acc.address] = 'polywallet';
				});
			}

			if(subwalletAccounts) {
				accounts = accounts.concat(subwalletAccounts);
				subwalletAccounts.forEach((acc: InjectedAccount) => {
					accountsMapLocal[acc.address] = 'subwallet-js';
				});
			}

			if(talismanAccounts) {
				accounts = accounts.concat(talismanAccounts);
				talismanAccounts.forEach((acc: InjectedAccount) => {
					accountsMapLocal[acc.address] = 'talisman';
				});
			}

			if (accounts.length === 0) {
				setAccountsNotFound(true);
				return;
			} else {
				setAccountsNotFound(false);
				setAccountsMap(accountsMapLocal);
				setSignersMap(signersMapLocal);
			}
		} else {
			const newWindow = (window as any);
			const ethereum = selectedWallet === Wallet.TALISMAN? newWindow.talismanEth : newWindow.ethereum;
			if (!ethereum) {
				setExtensionNotFound(true);
				return;
			} else {
				setExtensionNotFound(false);
			}
			try {
				await addEthereumChain({
					ethereum,
					network
				});
			} catch (error) {
				return;
			}
			const addresses = await ethereum.request({ method: 'eth_requestAccounts' });
			console.log(addresses);
			if (addresses.length === 0) {
				setAccountsNotFound(true);
				return;
			} else {
				setAccountsNotFound(false);
			}

			if (selectedWallet === Wallet.TALISMAN) {
				addresses.filter((address: string) => address.slice(0,2) === '0x').length === 0 ? setIsTalismanEthereum(false) : setIsTalismanEthereum(true);
			}

			accounts = addresses.map((address: string): InjectedTypeWithCouncilBoolean => {
				const account: InjectedTypeWithCouncilBoolean = {
					address
				} as any;

				return account;
			});
		}

		if (accounts && Array.isArray(accounts)) {
			const index = accounts.findIndex((account) => {
				const substrateAddress = getSubstrateAddress(account.address);
				return currentCouncil.some((council) => getSubstrateAddress(council) === substrateAddress);
			});
			if (index >= 0) {
				const account = accounts[index];
				setIsCouncil(true);
				accounts.splice(index, 1);
				accounts.unshift({
					...account,
					isCouncil: true
				});
				setAccounts(accounts);
				onAccountChange(account.address);
			}
		}

		if (accounts && Array.isArray(accounts)) {
			const substrate_address = getSubstrateAddress(loginAddress);
			const index = accounts.findIndex((account) => (getSubstrateAddress(account?.address) || '').toLowerCase() === (substrate_address || '').toLowerCase());
			console.log(index, substrate_address, loginAddress, accounts);
			if (index >= 0) {
				const account = accounts[index];
				accounts.splice(index, 1);
				accounts.unshift(account);
			}
		}

		setAccounts(accounts);
		if (accounts.length > 0) {
			setAddress(accounts[0].address);
			const signer: Signer = signersMapLocal[accountsMapLocal[accounts[0].address]];
			api.setSigner(signer);
		}
	}, [api, apiReady, currentCouncil, getWalletAccounts, isMoonbaseFamily, loginAddress, network, proposalType, selectedWallet]);

	useEffect(() => {
		if (loginWallet && (isMoonbaseFamily? [Wallet.TALISMAN, Wallet.METAMASK].includes(loginWallet): true)) {
			setSelectedWallet(loginWallet);
		} else {
			if(!window) return;
			const wallet = localStorage.getItem('loginWallet') as Wallet;
			if (wallet && (isMoonbaseFamily? [Wallet.TALISMAN, Wallet.METAMASK].includes(wallet): true)) {
				setSelectedWallet(wallet);
			} else {
				setSelectedWallet(null);
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginWallet, isMoonbaseFamily]);

	useEffect(() => {
		if (isMoonbaseFamily && selectedWallet && [Wallet.TALISMAN, Wallet.METAMASK].includes(selectedWallet)) {
			(async () => {
				if (walletConnectProvider) {
					await getWalletConnectAccounts();
				}
			})();
		}
	}, [selectedWallet, isMoonbaseFamily, walletConnectProvider, getWalletConnectAccounts]);

	useEffect(() => {
		if (window) {
			const injectedWindow = window as Window & InjectedWindow;
			setAvailableWallets(injectedWindow.injectedWeb3);
			setIsMetamaskWallet((injectedWindow as any)?.ethereum?.isMetaMask);
		}
	}, []);

	useEffect(() => {
		if (!api || !apiReady) {
			return;
		}

		if (isOffChainProposalTypeValid(proposalType)) {
			return;
		}

		try {
			api.query.council.members().then((memberAccounts) => {
				const members = memberAccounts.map(member => member.toString());
				const currentCouncil = members.filter((member) => !!member) as string[];
				setCurrentCouncil(currentCouncil);
			});
		} catch (error) {
			// console.log(error);
		}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, proposalType]);

	useEffect(() => {
		if (canVote) {
			try {
				getAccounts();
			} catch (error) {
				// console.log(error);
			}
		} else {
			setAccounts([]);
			setAddress('');
		}
	}, [canVote, getAccounts]);

	const getVotingHistory = useCallback(async () => {
		setIsLastVoteLoading(true);
		const encoded = getEncodedAddress(address || loginAddress || defaultAddress || '', network);

		const { data = null, error } = await nextApiClientFetch<IVotesHistoryResponse>(`api/v1/votes/history?page=${1}&voterAddress=${encoded}&network=${network}&numListingLimit=${1}&proposalType=${proposalType}&proposalIndex=${onchainId}`);
		if(error || !data) {
			console.error('Error in fetching votes history: ', error);
			setIsLastVoteLoading(false);
			return;
		}

		if((data?.votes?.length || 0) <= 0) {
			setIsLastVoteLoading(false);
			return;
		}

		setOnChainLastVote(data.votes[0]);
		setIsLastVoteLoading(false);
	}, [address, defaultAddress, loginAddress, network, onchainId, proposalType]);

	useEffect(() => {
		if ([ProposalType.OPEN_GOV, ProposalType.FELLOWSHIP_REFERENDUMS].includes(proposalType)) {
			if (!api || !apiReady) {
				return;
			}
			setCurvesLoading(true);
			const getData = async () => {
				const tracks = network != 'collectives' ? api.consts.referenda.tracks.toJSON() : api.consts.fellowshipReferenda.tracks.toJSON();
				if (tracks && Array.isArray(tracks)) {
					const track = tracks.find((track) => track && Array.isArray(track) && track.length >= 2 && track[0] === track_number);
					if (track && Array.isArray(track) && track.length > 1) {
						const trackInfo = track[1] as any;
						const { decisionPeriod } = trackInfo;
						const strArr = blockToTime(decisionPeriod, network)['time'].split(' ');
						let decisionPeriodHrs = 0;
						if (strArr && Array.isArray(strArr)) {
							strArr.forEach((str) => {
								if (str.includes('h')) {
									decisionPeriodHrs += parseInt(str.replace('h', ''));
								} else if (str.includes('d')) {
									decisionPeriodHrs += parseInt(str.replace('d', '')) * 24;
								}
							});
						}
						let labels: number[] = [];
						let supportData: { x: number; y: number; }[] = [];
						let approvalData: { x: number; y: number; }[] = [];
						const currentApprovalData: { x: number; y: number; }[] = [];
						const currentSupportData: { x: number; y: number; }[] = [];
						const { approvalCalc, supportCalc } = getTrackFunctions(trackInfo);

						setTrackInfo(trackInfo);
						for (let i = 0; i < (decisionPeriodHrs * 60); i++) {
							labels.push(i);
							if (supportCalc) {
								supportData.push({
									x: i,
									y: supportCalc((i / (decisionPeriodHrs * 60))) * 100
								});
							}
							if (approvalCalc) {
								approvalData.push({
									x: i,
									y: approvalCalc((i / (decisionPeriodHrs * 60))) * 100
								});
							}
						}
						const subsquidRes = await fetchSubsquid({
							network: network,
							query: GET_CURVE_DATA_BY_INDEX,
							variables: {
								index_eq: Number(onchainId)
							}
						});
						if (subsquidRes && subsquidRes.data && subsquidRes.data.curveData && Array.isArray(subsquidRes.data.curveData)) {
							const graph_points = subsquidRes.data.curveData || [];
							if (graph_points?.length > 0) {
								const lastGraphPoint = graph_points[graph_points.length - 1];
								const proposalCreatedAt = dayjs(created_at);
								const decisionPeriodMinutes = dayjs(lastGraphPoint.timestamp).diff(proposalCreatedAt, 'minute');
								if (decisionPeriodMinutes > decisionPeriodHrs * 60) {
									labels = [];
									approvalData = [];
									supportData = [];
								}
								graph_points?.forEach((graph_point: any) => {
									const hour = dayjs(graph_point.timestamp).diff(proposalCreatedAt, 'minute');
									const new_graph_point = {
										...graph_point,
										hour
									};

									if (decisionPeriodMinutes > decisionPeriodHrs * 60) {
										labels.push(hour);
										approvalData.push({
											x: hour,
											y: approvalCalc((hour / decisionPeriodMinutes)) * 100
										});
										supportData.push({
											x: hour,
											y: supportCalc((hour / decisionPeriodMinutes)) * 100
										});
									}
									currentApprovalData.push({
										x: hour,
										y: new_graph_point.approvalPercent
									});
									currentSupportData.push({
										x: hour,
										y: new_graph_point.supportPercent
									});
									return new_graph_point;
								});

								const currentApproval = currentApprovalData[currentApprovalData.length - 1];
								const currentSupport = currentSupportData[currentSupportData.length - 1];

								setProgress({
									approval: currentApproval?.y?.toFixed(1) as any,
									approvalThreshold: (approvalData.find((data) => data && data?.x >= currentApproval?.x)?.y as any) || 0,
									support: currentSupport?.y?.toFixed(1) as any,
									supportThreshold: (supportData.find((data) => data && data?.x >= currentSupport?.x)?.y as any) || 0
								});
							}
						} else {
							setCurvesError(subsquidRes.errors?.[0]?.message || 'Something went wrong.');
						}
						const newData: ChartData<'line', (number | Point | null)[]> = {
							datasets: [
								{
									backgroundColor: 'transparent',
									borderColor: '#5BC044',
									borderWidth: 2,
									data: approvalData,
									label: 'Approval',
									pointHitRadius: 10,
									pointHoverRadius: 5,
									pointRadius: 0,
									tension: 0.1
								},
								{
									backgroundColor: 'transparent',
									borderColor: '#E5007A',
									borderWidth: 2,
									data: supportData,
									label: 'Support',
									pointHitRadius: 10,
									pointHoverRadius: 5,
									pointRadius: 0,
									tension: 0.1
								},
								{
									backgroundColor: 'transparent',
									borderColor: '#5BC044',
									borderDash: [4, 4],
									borderWidth: 2,
									data: currentApprovalData,
									label: 'Current Approval',
									pointHitRadius: 10,
									pointHoverRadius: 5,
									pointRadius: 0,
									tension: 0.1

								},
								{
									backgroundColor: 'transparent',
									borderColor: '#E5007A',
									borderDash: [4, 4],
									borderWidth: 2,
									data: currentSupportData,
									label: 'Current Support',
									pointHitRadius: 10,
									pointHoverRadius: 5,
									pointRadius: 0,
									tension: 0.1
								}
							],
							labels
						};
						setData(JSON.parse(JSON.stringify(newData)));
					}
				}
				setCurvesLoading(false);
			};
			getData();
		}
	}, [api, apiReady, created_at, network, onchainId, proposalType, track_number]);

	useEffect(() => {
		if (trackInfo && [ProposalType.OPEN_GOV, ProposalType.FELLOWSHIP_REFERENDUMS].includes(proposalType)) {
			const isVotingStart = checkVotingStart(post?.timeline, proposalType as TOpenGov);
			if (!isVotingStart) {
				setProgress((prev) => ({
					...prev,
					approvalThreshold: 100,
					supportThreshold: 50
				}));
				return;
			}
			const endHeight = (currentBlock? currentBlock?.toNumber(): getReferendumVotingFinishHeight(post?.timeline, proposalType as TOpenGov));
			const percentage = getDecidingEndPercentage(Number(trackInfo.decisionPeriod || 0), Number(post?.deciding?.since || 0), Number(endHeight || 0));
			const { approvalCalc, supportCalc } = getTrackFunctions(trackInfo);
			if (typeof approvalCalc === 'function' && typeof supportCalc === 'function') {
				const approvalThreshold = approvalCalc(percentage) * 100;
				const supportThreshold = supportCalc(percentage) * 100;
				setProgress((prev) => {
					return {
						...prev,
						approvalThreshold,
						supportThreshold
					};
				});
			}
		}
	}, [currentBlock, post?.deciding, post?.timeline, proposalType, trackInfo, trackInfo.decisionPeriod]);

	useEffect(() => {
		if (!api || !!apiReady) return;

		const signer: Signer = signersMap[accountsMap[address]];
		api?.setSigner(signer);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	useEffect(() => {
		getVotingHistory();
	}, [getVotingHistory]);

	useEffect(() => {
		console.log('accounts.changed:-', accounts);
	}, [accounts]);

	const LastVoteInfoOnChain : FC <IVoteHistory>  = ({ createdAt, decision , lockPeriod }) => {
		const unit =`${chainProperties[network]?.tokenSymbol}`;
		return (
			<Spin spinning={ isLastVoteLoading } indicator={<LoadingOutlined />}>
				<p className='font-medium text-[12px] leading-6 text-[#243A57] mb-[5px]'>Last Vote:</p>

				<div className='flex justify-between text-[#243A57] text-[12px] font-normal leading-6 mb-[-5px]'>
					<Tooltip placement="bottom"  title="Decision"  color={'#E5007A'} className='max-w-[100px] max-[345px]:w-auto'>
						<span className='h-[25px]'>
							{decision == 'yes' ?
								<p>
									<AyeGreen /> <span className='capitalize font-medium text-[#2ED47A]'>{'Aye'}</span>
								</p> :
								decision == 'no' ?
									<p>
										<DislikeIcon className='text-[#F53C3C]'/> <span className='mb-[5px] capitalize font-medium text-[#F53C3C]'>{'Nay'}</span>
									</p> :
									decision == 'abstain' && !(balance as any).abstain ?
										<p>
											<SplitYellow className='mb-[-2px]'/> <span className='capitalize font-medium text-[#FFBF60]'>{'Split'}</span>
										</p> :
										decision == 'abstain' && (balance as any).abstain ?
											<p className='flex justify-center align-middle'>
												<AbstainGray className='mr-1 mb-[-8px]'/>
												<span className='capitalize font-medium  text-[#243A57]'>{'Abstain'}</span>
											</p> : null
							}
						</span>
					</Tooltip>

					<Tooltip placement="bottom"  title="Vote Date"  color={'#E5007A'} className=' max-[345px]:w-auto'><span className=''><ClockCircleOutlined className='mr-1' />{dayjs(createdAt, 'YYYY-MM-DD').format('Do MMM\'YY')}</span></Tooltip>

					<Tooltip placement="bottom"  title="Amount"  color={'#E5007A'}className=' max-[345px]:w-auto'>
						<span>
							<MoneyIcon className='mr-1'/>
							{formatedBalance(balance, unit)}{` ${unit}`}
						</span>
					</Tooltip>

					<Tooltip placement="bottom"  title="Conviction"  color={'#E5007A'} className='ml-[-5px]'>
						<span title='Conviction'>
							<ConvictionIcon className='mr-1'/>
							{lockPeriod}x
						</span>
					</Tooltip>
				</div>
			</Spin>);
	};

	const LastVoteInfoLocalState :FC<ILastVote> = ({ balance, conviction, decision }) => {
		return (
			<div>
				<p className='font-medium text-[12px] leading-6 text-[#243A57] mb-[5px]'>Last Vote:</p>
				<div className='flex justify-between text-[#243A57] text-[12px] font-normal leading-6 mb-[-5px]'>
					<Tooltip placement="bottom"  title="Decision"  color={'#E5007A'} className=''>
						<span className='h-[25px]'>{decision === EVoteDecisionType.AYE ? <p><AyeGreen /> <span className='capitalize font-medium text-[#2ED47A]'>{'Aye'}</span></p> :decision === EVoteDecisionType.NAY ?  <div><DislikeIcon className='text-[#F53C3C]'/> <span className='mb-[5px] capitalize font-medium text-[#F53C3C]'>{'Nay'}</span></div> : decision === EVoteDecisionType.SPLIT  ? <p><SplitYellow className='mb-[-2px]'/> <span className='capitalize font-medium text-[#FFBF60]'>{'Split'}</span></p>  : decision === EVoteDecisionType.ABSTAIN  ? <p className='flex justify-center align-middle'><AbstainGray className='mr-1 mb-[-8px]'/> <span className='capitalize font-medium  text-[#243A57]'>{'Abstain'}</span></p>: null }</span>
					</Tooltip>
					<Tooltip placement="bottom"  title="Vote Date"  color={'#E5007A'} className=''>
						<span className=''><ClockCircleOutlined className='mr-1' />{dayjs().format('Do MMM \'YY')}</span>
					</Tooltip>

					<Tooltip placement="bottom"  title="Amount"  color={'#E5007A'}className=''>
						<span>
							<MoneyIcon className='mr-1'/>
							{formatedBalance(balance.toString(), unit)}{` ${unit}`}
						</span>
					</Tooltip>

					<Tooltip placement="bottom"  title="Conviction"  color={'#E5007A'} className='ml-[-5px]'>
						<span title='Conviction'>
							<ConvictionIcon className='mr-1'/>
							{conviction}x
						</span>
					</Tooltip>
				</div>
			</div>
		);
	};

	const RenderLastVote = lastVote ?
		<LastVoteInfoLocalState {...lastVote} /> :
		onChainLastVote !== null ?
			<LastVoteInfoOnChain {...onChainLastVote}/> :
			null;
	// console.log(extensionNotFound);
	return (
		<>
			{<div className={className}>
				<Form>
					{
						!post_link && canEdit && <>
							<PostEditOrLinkCTA />
						</>
					}
					{
						(accountsNotFound || extensionNotFound)? (
							<GovSidebarCard>
								{
									accountsNotFound? (
										<div className='mb-4'>
											<p className='mb-4'>
												You need at least one account in Polkadot-js extension to use this feature.
											</p>
											<p className='text-muted m-0'>
												Please reload this page after adding accounts.
											</p>
										</div>
									): null
								}
								{
									extensionNotFound? (
										<ExtensionNotDetected />
									): null
								}
							</GovSidebarCard>
						): null
					}
					{canEdit && graphicOpen && post_link && !(post.tags && Array.isArray(post.tags) && post.tags.length > 0) && <div className=' rounded-[14px] bg-white shadow-[0px_6px_18px_rgba(0,0,0,0.06)] pb-[36px] mb-8'>
						<div className='flex justify-end py-[17px] px-[20px] items-center' onClick={ () => setGraphicOpen(false)}>
							<CloseIcon/>
						</div>
						<div className='flex items-center flex-col justify-center gap-6'>
							<GraphicIcon/>
							<Button
								className='w-[176px] text-white bg-pink_primary text-[16px] font-medium h-[35px] rounded-[4px]'
								onClick={() => { toggleEdit && toggleEdit(); setGraphicOpen(false);}}
							>
								<PlusOutlined/>
								Add Tags
							</Button>
						</div>
					</div>}
					{proposalType === ProposalType.COUNCIL_MOTIONS && <>
						{canVote &&
							<VoteMotion
								accounts={accounts}
								address={address}
								motionId={onchainId as number}
								motionProposalHash={post.hash}
								onAccountChange={onAccountChange}
								isCouncil={isCouncil}
							/>
						}
						{(post.motion_votes && (post.motion_votes?.length || 0) > 0) &&
							<MotionVoteInfo
								councilVotes={post.motion_votes}
							/>
						}
					</>}
					{proposalType === ProposalType.ALLIANCE_MOTION && <>
						{canVote &&
							<VoteMotion
								accounts={accounts}
								address={address}
								motionId={onchainId as number}
								motionProposalHash={post.hash}
								onAccountChange={onAccountChange}
								isCouncil={isCouncil}
							/>
						}

						{(post.motion_votes && post.motion_votes.length > 0 ) &&
							<MotionVoteInfo
								councilVotes={post.motion_votes}
							/>
						}
					</>}

					{proposalType === ProposalType.DEMOCRACY_PROPOSALS &&
						<ProposalDisplay
							seconds={post?.seconds}
							accounts={accounts}
							address={address}
							canVote={canVote}
							onAccountChange={onAccountChange}
							status={status}
							proposalId={onchainId  as number}
						/>
					}

					{proposalType === ProposalType.TREASURY_PROPOSALS &&
						<EditProposalStatus
							proposalId={onchainId  as number}
							canEdit={canEdit}
							startTime={startTime}
						/>
					}

					{[ProposalType.OPEN_GOV, ProposalType.FELLOWSHIP_REFERENDUMS, ProposalType.REFERENDUMS].includes(proposalType) &&
						<>
							{
								proposalType === ProposalType.REFERENDUMS?
									<>
										{canVote &&
											<>
												{isMoonbaseFamily ?
													<>
														{metaMaskError && !walletConnectProvider?.wc.connected && <GovSidebarCard>{metaMaskError}</GovSidebarCard>}

														{
															(!metaMaskError || walletConnectProvider?.wc.connected) &&

													<GovSidebarCard className='overflow-y-hidden'>
														<h6 className="text-bodyBlue font-medium text-xl mx-0.5 mb-6 leading-6">Cast your Vote!</h6>
														<VoteReferendumEth
															address={address}
															lastVote={lastVote}
															setLastVote={setLastVote}
															onAccountChange={onAccountChange}
															referendumId={onchainId as number}
															isTalismanEthereum={isTalismanEthereum}
															isMetamaskWallet={isMetamaskWallet}
															accounts={accounts}
															availableWallets={availableWallets}
															selectedWallet={selectedWallet}
															setSelectedWallet={setSelectedWallet}
														/>
														{RenderLastVote}
													</GovSidebarCard>
														}
													</> :
													<GovSidebarCard className='overflow-y-hidden'>
														<h6 className="text-bodyBlue font-medium text-xl mx-0.5 mb-6 leading-6">Cast your Vote!</h6>
														<VoteReferendum
															address={address}
															lastVote={lastVote}
															setLastVote={setLastVote}
															onAccountChange={onAccountChange}
															referendumId={onchainId  as number}
															proposalType={proposalType}
															accounts={accounts}
															availableWallets={availableWallets}
															selectedWallet={selectedWallet}
															setSelectedWallet={setSelectedWallet}
														/>

														{RenderLastVote}
													</GovSidebarCard>
												}
											</>
										}

										{(onchainId || onchainId === 0) &&
											<div className={className}>
												<ReferendumVoteInfo
													setOpen={setOpen}
													voteThreshold={post.vote_threshold}
													referendumId={onchainId as number}
												/>
											</div>
										}
									</>
									: <>
										{canVote &&
											<>
												{isMoonbaseFamily ?
													<>
														{metaMaskError && !walletConnectProvider?.wc.connected && <GovSidebarCard>{metaMaskError}</GovSidebarCard>}

														{(!metaMaskError || walletConnectProvider?.wc.connected) &&

													<GovSidebarCard className='overflow-y-hidden'>
														<h6 className="text-bodyBlue font-medium text-xl mx-0.5 mb-6 leading-6">Cast your Vote!</h6>
														<VoteReferendumEthV2
															address={address}
															lastVote={lastVote}
															setLastVote={setLastVote}
															onAccountChange={onAccountChange}
															referendumId={onchainId as number}
															isTalismanEthereum={isTalismanEthereum}
															isMetamaskWallet={isMetamaskWallet}
															accounts={accounts}
															availableWallets={availableWallets}
															selectedWallet={selectedWallet}
															setSelectedWallet={setSelectedWallet}
														/>

														{RenderLastVote}
													</GovSidebarCard>

														}
													</> : <GovSidebarCard className='overflow-y-hidden'>
														<h6 className="text-bodyBlue font-medium text-xl mx-0.5 mb-6 leading-6">Cast your Vote!</h6>
														<VoteReferendum
															address={address}
															lastVote={lastVote}
															setLastVote={setLastVote}
															onAccountChange={onAccountChange}
															referendumId={onchainId  as number}
															proposalType={proposalType}
															accounts={accounts}
															availableWallets={availableWallets}
															selectedWallet={selectedWallet}
															setSelectedWallet={setSelectedWallet}
														/>

														{RenderLastVote}

													</GovSidebarCard>}
											</>
										}
										<ReferendaV2Messages
											progress={progress}
										/>

										{(onchainId || onchainId === 0) &&
											<>
												{
													proposalType === ProposalType.OPEN_GOV &&
													<div className={className}>
														<ReferendumV2VoteInfo
															setThresholdOpen={setThresholdOpen}
															setOpen={setOpen}
															referendumId={onchainId as number}
															tally={tally}
														/>
														<Modal
															onCancel={() => {
																setThresholdOpen(false);
															}}
															open={thresholdOpen}
															footer={[]}
															className='md:min-w-[700px]'
															closeIcon={<CloseIcon />}
															title={
																<h2 className='text-bodyBlue tracking-[0.01em] text-xl leading-[30px] font-semibold'>Threshold Curves</h2>
															}
														>
															<div className='mt-5'>
																<Curves
																	curvesError={curvesError}
																	curvesLoading={curvesLoading}
																	data={data}
																	progress={progress}
																	setData={setData}
																/>
															</div>
														</Modal>
													</div>
												}
												{
													proposalType === ProposalType.FELLOWSHIP_REFERENDUMS &&
													<div className={className}>
														<FellowshipReferendumVoteInfo
															setOpen={setOpen}
															tally={tally}
														/>
													</div>
												}
											</>
										}
									</>
							}

							{
								(onchainId || onchainId === 0) &&
								<Modal
									closeIcon={false}
									onCancel={() => {
										setOpen(false);
									}}
									open={open}
									footer={[]}
									closable={false}
								>
									<VotersList
										className={className}
										referendumId={onchainId as number}
										voteType={proposalType === ProposalType.REFERENDUMS?VoteType.REFERENDUM: proposalType === ProposalType.FELLOWSHIP_REFERENDUMS? VoteType.FELLOWSHIP: VoteType.REFERENDUM_V2}
									/>
								</Modal>
							}

							<div>
								{lastVote != undefined ? lastVote == null ?
									<GovSidebarCard>
										You haven&apos;t voted yet, vote now and do your bit for the community
									</GovSidebarCard>
									:
									<></>
									: <></>
								}
							</div>
						</>
					}

					{proposalType === ProposalType.TIPS &&
					<GovSidebarCard>
						{
							canVote && <EndorseTip
								className='mb-8'
								accounts={accounts}
								address={address}
								tipHash={onchainId as string}
								onAccountChange={onAccountChange}
								isCouncil={isCouncil}
							/>
						}

						<TipInfo
							status={post.status}
							onChainId={post.hash}
							proposer={post.proposer}
							receiver={post.payee || post.proposer}
							tippers={post.tippers}
							members={currentCouncil}
						/>
					</GovSidebarCard>
					}

					{proposalType === ProposalType.BOUNTIES && <>
						<BountyChildBounties bountyId={onchainId} />
					</>
					}
				</Form>
			</div>
			}
		</>
	);
};

export default memo(styled(GovernanceSideBar)`
	.edit-icon-wrapper{
		transition: all 0.5s;
	}
	.edit-icon-wrapper .edit-icon{
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		right: 20px;
		display: none;
	}
	.edit-icon-wrapper:hover{
		background-image: linear-gradient(to left, #E5007A, #ffffff);
	}
	.edit-icon-wrapper:hover .edit-icon{
		display: block;
	}
	.ant-tooltip-open{
		font-size:12px;
		height:20px;
	}
`);
