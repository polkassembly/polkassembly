// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Signer } from '@polkadot/api/types';
import { isWeb3Injected, web3Enable } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Button, Form, Modal, Spin, Tooltip, Skeleton } from 'antd';
import { IPIPsVoting, IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { APPNAME } from 'src/global/appName';
import { gov2ReferendumStatus, motionStatus, proposalStatus, referendumStatus } from 'src/global/statuses';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import getEncodedAddress from 'src/util/getEncodedAddress';
import styled from 'styled-components';
import { useApiContext, usePostDataContext } from '~src/context';
import { ProposalType, getSubsquidProposalType, getVotingTypeFromProposalType } from '~src/global/proposalType';
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
import ReferendaV2Messages from './Referenda/ReferendaV2Messages';
import blockToTime from '~src/util/blockToTime';
import { getTrackFunctions } from './Referenda/util';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { GET_CURVE_DATA_BY_INDEX } from '~src/queries';
import dayjs from 'dayjs';
import { ChartData, Point } from 'chart.js';
import PostEditOrLinkCTA from './PostEditOrLinkCTA';
import { IVoteHistory, IVotesHistoryResponse } from 'pages/api/v1/votes/history';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import BN from 'bn.js';
import { formatBalance } from '@polkadot/util';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { EVoteDecisionType, ILastVote, NotificationStatus, Wallet } from '~src/types';
import AyeGreen from '~assets/icons/aye-green-icon.svg';
import { DislikeIcon } from '~src/ui-components/CustomIcons';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { InjectedTypeWithCouncilBoolean } from '~src/ui-components/AddressDropdown';
import PIPsVoteInfo from './PIPs/PIPsVoteInfo';
import PIPsVote from './PIPs/PIPsVote';
import dynamic from 'next/dynamic';
import { PlusOutlined } from '@ant-design/icons';
import MoneyIcon from '~assets/icons/money-icon-gray.svg';
import DarkMoneyIcon from '~assets/icons/money-icon-white.svg';
import ConvictionIcon from '~assets/icons/conviction-icon-gray.svg';
import DarkConvictionIcon from '~assets/icons/conviction-icon-white.svg';
import SplitYellow from '~assets/icons/split-yellow-icon.svg';
import CloseIcon from '~assets/icons/close.svg';
import GraphicIcon from '~assets/icons/add-tags-graphic.svg';
import AbstainGray from '~assets/icons/abstain-gray.svg';
import VoteDataModal from './Modal/VoteData';
import { ApiPromise } from '@polkadot/api';
import BigNumber from 'bignumber.js';
import VotersList from './Referenda/VotersList';
import RefV2ThresholdData from './Referenda/RefV2ThresholdData';
import { isSupportedNestedVoteNetwork } from '../utils/isSupportedNestedVotes';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import queueNotification from '~src/ui-components/QueueNotification';
import executeTx from '~src/util/executeTx';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import Web3 from 'web3';
import { useTheme } from 'next-themes';
import { setCurvesInformation } from '~src/redux/curvesInformation';
import { useDispatch } from 'react-redux';

const DecisionDepositCard = dynamic(() => import('~src/components/OpenGovTreasuryProposal/DecisionDepositCard'), {
	loading: () => <Skeleton active />,
	ssr: false
});
interface IGovernanceSidebarProps {
	canEdit?: boolean | '' | undefined;
	className?: string;
	proposalType: ProposalType;
	onchainId?: string | number | null;
	status?: string;
	startTime: string;
	tally?: any;
	post: IPostResponse;
	toggleEdit?: () => void;
	trackName?: string;
	pipsVoters?: IPIPsVoting[];
	hash: string;
}

type TOpenGov = ProposalType.REFERENDUM_V2 | ProposalType.FELLOWSHIP_REFERENDUMS;
const abi = require('src/moonbeamConvictionVoting.json');
const contractAddress = process.env.NEXT_PUBLIC_CONVICTION_VOTING_PRECOMPILE;

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

const GovernanceSideBar: FC<IGovernanceSidebarProps> = (props) => {
	const { canEdit, className, onchainId, proposalType, startTime, status, tally, post, toggleEdit, hash, trackName, pipsVoters } = props;
	const [lastVote, setLastVote] = useState<ILastVote | null>(null);

	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();

	const { loginAddress, defaultAddress, walletConnectProvider, loginWallet } = useUserDetailsSelector();
	const {
		postData: { created_at, track_number, post_link, statusHistory, postIndex }
	} = usePostDataContext();
	const metaMaskError = useHandleMetaMask();
	const [loading, setLoading] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();

	const [address, setAddress] = useState<string>('');
	const [accounts, setAccounts] = useState<InjectedTypeWithCouncilBoolean[]>([]);
	const [extensionNotFound, setExtensionNotFound] = useState(false);
	const [accountsNotFound, setAccountsNotFound] = useState(false);
	const [accountsMap, setAccountsMap] = useState<{ [key: string]: string }>({});
	const [signersMap, setSignersMap] = useState<{ [key: string]: Signer }>({});
	const [open, setOpen] = useState(false);
	const [graphicOpen, setGraphicOpen] = useState<boolean>(true);
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
	const [isLastVoteLoading, setIsLastVoteLoading] = useState(true);
	const isRun = useRef(false);
	const dispatch = useDispatch();

	const canVote =
		Boolean(post.status) &&
		[
			proposalStatus.PROPOSED,
			referendumStatus.STARTED,
			motionStatus.PROPOSED,
			tipStatus.OPENED,
			gov2ReferendumStatus.SUBMITTED,
			gov2ReferendumStatus.DECIDING,
			gov2ReferendumStatus.CONFIRM_STARTED,
			gov2ReferendumStatus.DECISION_DEPOSIT_PLACED,
			gov2ReferendumStatus.CONFIRM_ABORTED
		].includes(post.status);

	const unit = `${chainProperties[network]?.tokenSymbol}`;

	const balance = useMemo(() => {
		return onChainLastVote?.balance
			? Object.values(onChainLastVote.balance)
					.reduce((prev, curr) => {
						if (!curr) return prev;
						return prev.add(new BN(curr));
					}, new BN(0))
					.toString()
			: '';
	}, [onChainLastVote?.balance]);

	const onAccountChange = (address: string) => setAddress(address);

	const getWalletAccounts = async (chosenWallet: Wallet): Promise<InjectedAccount[] | undefined> => {
		const injectedWindow = window as Window & InjectedWindow;

		let wallet = isWeb3Injected ? injectedWindow.injectedWeb3[chosenWallet] : null;

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

				if (wallet && wallet.enable) {
					wallet!
						.enable(APPNAME)
						.then((value) => {
							clearTimeout(timeoutId);
							resolve(value);
						})
						.catch((error) => {
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

		if (accounts.length === 0) return;

		accounts.forEach((account) => {
			account.address = getEncodedAddress(account.address, network) || account.address;
		});

		return accounts;
	};

	const getAccounts = async (): Promise<undefined> => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		const extensions = await web3Enable(APPNAME);

		if (extensions.length === 0) {
			setExtensionNotFound(true);
			return;
		} else {
			setExtensionNotFound(false);
		}

		let accounts: InjectedAccount[] = [];
		let polakadotJSAccounts: InjectedAccount[] | undefined;
		let polywalletJSAccounts: InjectedAccount[] | undefined;
		let polkagateAccounts: InjectedAccount[] | undefined;
		let subwalletAccounts: InjectedAccount[] | undefined;
		let talismanAccounts: InjectedAccount[] | undefined;

		const signersMapLocal = signersMap as { [key: string]: Signer };
		const accountsMapLocal = accountsMap as { [key: string]: string };

		for (const extObj of extensions) {
			if (extObj.name == 'polkadot-js') {
				signersMapLocal['polkadot-js'] = extObj.signer;
				polakadotJSAccounts = await getWalletAccounts(Wallet.POLKADOT);
			} else if (extObj.name == 'polkagate') {
				signersMapLocal['polkagate'] = extObj.signer;
				polkagateAccounts = await getWalletAccounts(Wallet.POLKAGATE);
			} else if (extObj.name == 'subwallet-js') {
				signersMapLocal['subwallet-js'] = extObj.signer;
				subwalletAccounts = await getWalletAccounts(Wallet.SUBWALLET);
			} else if (extObj.name == 'talisman') {
				signersMapLocal['talisman'] = extObj.signer;
				talismanAccounts = await getWalletAccounts(Wallet.TALISMAN);
			} else if (['polymesh'].includes(network) && extObj.name === 'polywallet') {
				signersMapLocal['polywallet'] = extObj.signer;
				polywalletJSAccounts = await getWalletAccounts(Wallet.POLYWALLET);
			}
		}

		if (polakadotJSAccounts) {
			accounts = accounts.concat(polakadotJSAccounts);
			polakadotJSAccounts.forEach((acc: InjectedAccount) => {
				accountsMapLocal[acc.address] = 'polkadot-js';
			});
		}

		if (['polymesh'].includes(network) && polywalletJSAccounts) {
			accounts = accounts.concat(polywalletJSAccounts);
			polywalletJSAccounts.forEach((acc: InjectedAccount) => {
				accountsMapLocal[acc.address] = 'polywallet';
			});
		}

		if (polkagateAccounts) {
			accounts = accounts.concat(polkagateAccounts);
			polkagateAccounts.forEach((acc: InjectedAccount) => {
				accountsMapLocal[acc.address] = 'polkagate';
			});
		}

		if (subwalletAccounts) {
			accounts = accounts.concat(subwalletAccounts);
			subwalletAccounts.forEach((acc: InjectedAccount) => {
				accountsMapLocal[acc.address] = 'subwallet-js';
			});
		}

		if (talismanAccounts) {
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
			setAddress(accounts[0].address);
			const signer: Signer = signersMapLocal[accountsMapLocal[accounts[0].address]];
			api.setSigner(signer);
		}

		return;
	};

	const getVotingHistory = useCallback(async () => {
		setIsLastVoteLoading(true);
		const encoded = getEncodedAddress(address || loginAddress || defaultAddress || '', network);

		const { data = null, error } = await nextApiClientFetch<IVotesHistoryResponse>('api/v1/votes/history', {
			proposalIndex: onchainId,
			proposalType,
			voterAddress: encoded
		});

		if (error || !data) {
			console.error('Error in fetching votes history: ', error);
			setIsLastVoteLoading(false);
			return;
		}

		if ((data?.votes?.length || 0) <= 0) {
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
			const getData = async () => {
				if (isRun.current) {
					return;
				}
				isRun.current = true;
				setCurvesLoading(true);
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
						let supportData: { x: number; y: number }[] = [];
						let approvalData: { x: number; y: number }[] = [];
						const currentApprovalData: { x: number; y: number }[] = [];
						const currentSupportData: { x: number; y: number }[] = [];
						const { approvalCalc, supportCalc } = getTrackFunctions(trackInfo);

						// TODO: only show curves if status is deciding
						// const isDeciding = (statusHistory || [])?.find((v: any) => ['Deciding'].includes(v?.status || ''));
						setTrackInfo(trackInfo);
						for (let i = 0; i < decisionPeriodHrs; i++) {
							labels.push(i);
							if (supportCalc) {
								supportData.push({
									x: i,
									y: supportCalc(i / decisionPeriodHrs) * 100
								});
							}
							if (approvalCalc) {
								approvalData.push({
									x: i,
									y: approvalCalc(i / decisionPeriodHrs) * 100
								});
							}
						}

						let newAPI: ApiPromise = api;
						let approval: BigNumber | null = null;
						let support: BigNumber | null = null;

						try {
							const status = (statusHistory || [])?.find((v: any) => ['Rejected', 'TimedOut', 'Confirmed'].includes(v?.status || ''));

							if (status) {
								const blockNumber = status.block;
								if (blockNumber) {
									const hash = await api.rpc.chain.getBlockHash(blockNumber - 1);
									newAPI = (await api.at(hash)) as ApiPromise;
								}
							}
							if (newAPI) {
								const inactiveIssuance = await newAPI.query.balances.inactiveIssuance();
								const totalIssuance = await newAPI.query.balances.totalIssuance();
								const issuanceInfo = totalIssuance.sub(inactiveIssuance);
								const referendaInfo = await newAPI.query.referenda.referendumInfoFor(onchainId);
								const referendaInfoData = referendaInfo.toJSON() as any;
								if (referendaInfoData?.ongoing?.tally) {
									const ayesInfo = referendaInfoData.ongoing.tally.ayes;
									const ayes = typeof ayesInfo === 'string' && ayesInfo.startsWith('0x') ? new BigNumber(ayesInfo.slice(2), 16) : new BigNumber(ayesInfo);
									const naysInfo = referendaInfoData.ongoing.tally.nays;
									const nays = typeof naysInfo === 'string' && naysInfo.startsWith('0x') ? new BigNumber(naysInfo.slice(2), 16) : new BigNumber(naysInfo);
									const supportInfo = referendaInfoData.ongoing.tally.support;
									const supportBigNumber = typeof supportInfo === 'string' && supportInfo.startsWith('0x') ? new BigNumber(supportInfo.slice(2), 16) : new BigNumber(supportInfo);
									support = supportBigNumber.div(issuanceInfo as any).multipliedBy(100);
									approval = ayes.div(ayes.plus(nays)).multipliedBy(100);
								}
							}
						} catch (error) {
							// console.log(error);
						}
						let progress = {
							approval: 0,
							approvalThreshold: 0,
							support: 0,
							supportThreshold: 0
						};
						const statusBlock = statusHistory?.find((s) => s?.status === 'Deciding');
						if (statusBlock) {
							const subsquidRes = await fetchSubsquid({
								network: network,
								query: GET_CURVE_DATA_BY_INDEX,
								variables: {
									block_gte: statusBlock?.block,
									index_eq: Number(onchainId)
								}
							});
							if (subsquidRes && subsquidRes.data && subsquidRes.data.curveData && Array.isArray(subsquidRes.data.curveData)) {
								const graph_points = subsquidRes.data.curveData || [];
								if (graph_points?.length > 0) {
									const lastGraphPoint = graph_points[graph_points.length - 1];
									const proposalCreatedAt = dayjs(statusBlock?.timestamp || created_at);
									const decisionPeriodMinutes = dayjs(lastGraphPoint.timestamp).diff(proposalCreatedAt, 'hour');
									if (decisionPeriodMinutes > decisionPeriodHrs) {
										labels = [];
										approvalData = [];
										supportData = [];
									}
									graph_points?.forEach((graph_point: any) => {
										const hour = dayjs(graph_point.timestamp).diff(proposalCreatedAt, 'hour');
										const new_graph_point = {
											...graph_point,
											hour
										};

										if (decisionPeriodMinutes > decisionPeriodHrs) {
											labels.push(hour);
											approvalData.push({
												x: hour,
												y: approvalCalc(hour / decisionPeriodMinutes) * 100
											});
											supportData.push({
												x: hour,
												y: supportCalc(hour / decisionPeriodMinutes) * 100
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

									const currentApprovalDataLength = currentApprovalData.length;
									const lastCurrentApproval = currentApprovalData[currentApprovalDataLength - 1];
									for (let i = currentApprovalDataLength; i < approvalData.length; i++) {
										const approval = approvalData[i];
										if (lastCurrentApproval.x < approval.x && dayjs().diff(proposalCreatedAt.add(approval.x, 'hour')) > 0) {
											currentApprovalData.push({
												...lastCurrentApproval,
												x: approval.x
											});
										}
									}
									const currentSupportDataLength = currentSupportData.length;
									const lastCurrentSupport = currentSupportData[currentSupportDataLength - 1];
									for (let i = currentSupportDataLength; i < supportData.length; i++) {
										const support = supportData[i];
										if (lastCurrentSupport.x < support.x && dayjs().diff(proposalCreatedAt.add(support.x, 'hour')) > 0) {
											currentSupportData.push({
												...lastCurrentSupport,
												x: support.x
											});
										}
									}

									const currentApproval = currentApprovalData[currentApprovalData.length - 1];
									const currentSupport = currentSupportData[currentSupportData.length - 1];
									progress = {
										approval: approval ? approval.toFormat(2, BigNumber.ROUND_UP) : (currentApproval?.y?.toFixed(1) as any),
										approvalThreshold: (approvalData.find((data) => data && data?.x >= currentApproval?.x)?.y as any) || 0,
										support: support ? support.toFormat(2, BigNumber.ROUND_UP) : (currentSupport?.y?.toFixed(1) as any),
										supportThreshold: (supportData.find((data) => data && data?.x >= currentSupport?.x)?.y as any) || 0
									};
									setProgress(progress);
								}
							} else {
								setCurvesError(subsquidRes.errors?.[0]?.message || 'Something went wrong.');
							}
						} else {
							progress = {
								approval: Number(approval?.toFormat(2, BigNumber.ROUND_UP) || 0),
								approvalThreshold: 100,
								support: Number(support?.toFormat(2, BigNumber.ROUND_UP) || 0),
								supportThreshold: 50
							};
							setProgress(progress);
						}
						dispatch(
							setCurvesInformation({
								...progress,
								approvalData,
								currentApprovalData,
								currentSupportData,
								supportData
							})
						);
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	useEffect(() => {
		if (trackInfo) {
			const isVotingStart = checkVotingStart(post?.timeline, proposalType as TOpenGov);
			if (!isVotingStart) {
				setProgress((prev) => ({
					...prev,
					approvalThreshold: 100,
					supportThreshold: 50
				}));
				return;
			}
		}
	}, [post?.deciding, post?.timeline, proposalType, trackInfo, trackInfo.decisionPeriod]);

	useEffect(() => {
		if (!api || !!apiReady) return;

		const signer: Signer = signersMap[accountsMap[address]];
		api?.setSigner(signer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		getVotingHistory();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, address]);

	const onSuccess = () => {
		queueNotification({
			header: 'Success!',
			message: 'Your Vote has been Cleared successfully.',
			status: NotificationStatus.SUCCESS
		});
		setLastVote(null);
		setLoading(false);
		setOnChainLastVote(null);
	};
	const onFailed = (message: string) => {
		queueNotification({
			header: 'Failed!',
			message,
			status: NotificationStatus.ERROR
		});
		setLoading(false);
	};

	const handleRemoveVote = async () => {
		if (!api || !apiReady || !track_number) return;
		setLoading(true);
		if (['moonbeam', 'moonbase', 'moonriver'].includes(network)) {
			const web3 = new Web3((window as any).ethereum);

			const chainId = await web3.eth.net.getId();

			if (chainId !== chainProperties[network].chainId) {
				queueNotification({
					header: 'Wrong Network!',
					message: `Please change to ${network} network`,
					status: NotificationStatus.ERROR
				});

				setLoading(false);
				return;
			}
			const contract = new web3.eth.Contract(abi, contractAddress);
			contract.methods
				.removeVote(postIndex)
				.send({
					from: address,
					to: contractAddress
				})
				.then((result: any) => {
					console.log(result);
					onSuccess();
				})
				.catch((error: any) => {
					console.error('ERROR:', error);
					onFailed('Failed!');
				});
		} else {
			const tx = api.tx.convictionVoting.removeVote(track_number, postIndex);
			await executeTx({ address: loginAddress, api, apiReady, errorMessageFallback: 'Transactions failed!', network, onFailed, onSuccess, tx });
		}
	};
	useEffect(() => {
		if (!api || !apiReady) return;
		//for setting signer by login address
		(async () => {
			await getAccountsFromWallet({ api, apiReady, chosenAddress: loginAddress, chosenWallet: loginWallet as Wallet, loginAddress, network });
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, network, apiReady]);

	const LastVoteInfoOnChain: FC<IVoteHistory> = ({ createdAt, decision, lockPeriod, isDelegated }) => {
		const unit = `${chainProperties[network]?.tokenSymbol}`;
		return (
			<Spin
				spinning={isLastVoteLoading}
				indicator={<LoadingOutlined />}
			>
				<div className='mb-1.5 flex items-center justify-between'>
					<span className='flex h-[18px] items-center text-xs font-medium text-bodyBlue dark:text-blue-dark-high'>Last Vote:</span>
					{!isDelegated && (
						<Button
							loading={loading}
							onClick={handleRemoveVote}
							className=' flex h-[18px] items-center justify-center rounded-[4px] border-none bg-transparent p-0 text-xs font-medium text-red-500 underline shadow-none dark:bg-section-dark-overlay'
						>
							Remove Vote
						</Button>
					)}
				</div>

				<div className='mb-[-5px] flex justify-between text-[12px] font-normal leading-6 text-bodyBlue dark:text-blue-dark-high'>
					<Tooltip
						placement='bottom'
						title='Decision'
						color={'#E5007A'}
						className='max-w-[100px] max-[345px]:w-auto'
					>
						<span className='h-[25px]'>
							{decision == 'yes' ? (
								<p>
									<AyeGreen /> <span className='font-medium capitalize text-[#2ED47A]'>{'Aye'}</span>
								</p>
							) : decision == 'no' ? (
								<p>
									<DislikeIcon className='text-[#F53C3C]' /> <span className='mb-[5px] font-medium capitalize text-[#F53C3C]'>{'Nay'}</span>
								</p>
							) : decision == 'abstain' && !(balance as any).abstain ? (
								<p>
									<SplitYellow className='mb-[-2px]' /> <span className='font-medium capitalize text-[#FFBF60]'>{'Split'}</span>
								</p>
							) : decision == 'abstain' && (balance as any).abstain ? (
								<p className='flex justify-center align-middle'>
									<AbstainGray className='mb-[-8px] mr-1' />
									<span className='font-medium capitalize  text-bodyBlue dark:text-blue-dark-high'>{'Abstain'}</span>
								</p>
							) : null}
						</span>
					</Tooltip>

					<Tooltip
						placement='bottom'
						title='Vote Date'
						color={'#E5007A'}
						className=' max-[345px]:w-auto'
					>
						<span className=''>
							<ClockCircleOutlined className='mr-1' />
							{dayjs(createdAt, 'YYYY-MM-DD').format("Do MMM'YY")}
						</span>
					</Tooltip>

					<Tooltip
						placement='bottom'
						title='Amount'
						color={'#E5007A'}
						className=' max-[345px]:w-auto'
					>
						<span>
							{theme === 'dark' ? <DarkMoneyIcon className='mr-1' /> : <MoneyIcon className='mr-1' />}
							{formatedBalance(balance, unit)}
							{` ${unit}`}
						</span>
					</Tooltip>

					{!isNaN(Number(lockPeriod)) && (
						<Tooltip
							placement='bottom'
							title='Conviction'
							color={'#E5007A'}
							className='ml-[-5px]'
						>
							<span title='Conviction'>
								{theme === 'dark' ? <DarkConvictionIcon className='mr-1' /> : <ConvictionIcon className='mr-1' />}
								{Number(lockPeriod) === 0 ? '0.1' : lockPeriod}x
							</span>
						</Tooltip>
					)}
				</div>
			</Spin>
		);
	};

	const LastVoteInfoLocalState: FC<ILastVote> = ({ balance, conviction, decision }) => {
		return (
			<div>
				<div className='mb-1.5 flex items-center justify-between'>
					<span className='mb-[5px] text-[12px] font-medium leading-6 text-bodyBlue dark:text-blue-dark-high'>Last Vote:</span>
					<Button
						loading={loading}
						onClick={handleRemoveVote}
						className=' flex h-[18px] items-center justify-center rounded-[4px] border-none pr-0 text-xs font-medium text-red-500 underline shadow-none dark:bg-section-dark-overlay'
					>
						Remove Vote
					</Button>
				</div>
				<div className='mb-[-5px] flex justify-between text-[12px] font-normal leading-6 text-bodyBlue dark:text-blue-dark-high'>
					<Tooltip
						placement='bottom'
						title='Decision'
						color={'#E5007A'}
						className=''
					>
						<span className='h-[25px]'>
							{decision === EVoteDecisionType.AYE ? (
								<p>
									<AyeGreen /> <span className='font-medium capitalize text-[#2ED47A]'>{'Aye'}</span>
								</p>
							) : decision === EVoteDecisionType.NAY ? (
								<div>
									<DislikeIcon className='text-[#F53C3C]' /> <span className='mb-[5px] font-medium capitalize text-[#F53C3C]'>{'Nay'}</span>
								</div>
							) : decision === EVoteDecisionType.SPLIT ? (
								<p>
									<SplitYellow className='mb-[-2px]' /> <span className='font-medium capitalize text-[#FFBF60]'>{'Split'}</span>
								</p>
							) : decision === EVoteDecisionType.ABSTAIN ? (
								<p className='flex justify-center align-middle'>
									<AbstainGray className='mb-[-8px] mr-1' /> <span className='font-medium capitalize  text-bodyBlue dark:text-blue-dark-high'>{'Abstain'}</span>
								</p>
							) : null}
						</span>
					</Tooltip>
					<Tooltip
						placement='bottom'
						title='Vote Date'
						color={'#E5007A'}
						className=''
					>
						<span className=''>
							<ClockCircleOutlined className='mr-1' />
							{dayjs().format("Do MMM 'YY")}
						</span>
					</Tooltip>
					{balance && (
						<Tooltip
							placement='bottom'
							title='Amount'
							color={'#E5007A'}
							className=''
						>
							<span>
								<MoneyIcon className='mr-1' />
								{formatedBalance(balance?.toString(), unit)}
								{` ${unit}`}
							</span>
						</Tooltip>
					)}

					{!isNaN(Number(conviction)) && (
						<Tooltip
							placement='bottom'
							title='Conviction'
							color={'#E5007A'}
							className='ml-[-5px]'
						>
							<span title='Conviction'>
								<ConvictionIcon className='mr-1' />
								{Number(conviction) === 0 ? '0.1' : conviction}x
							</span>
						</Tooltip>
					)}
				</div>
			</div>
		);
	};
	const RenderLastVote =
		address === loginAddress ? lastVote ? <LastVoteInfoLocalState {...lastVote} /> : onChainLastVote !== null ? <LastVoteInfoOnChain {...onChainLastVote} /> : null : null;
	return (
		<>
			{
				<div className={className}>
					<Form>
						{!post_link && canEdit && (
							<>
								<PostEditOrLinkCTA />
							</>
						)}
						{/* decision deposite placed. */}
						{statusHistory &&
							statusHistory?.filter((status: any) => status.status === gov2ReferendumStatus.DECISION_DEPOSIT_PLACED)?.length === 0 &&
							statusHistory?.filter((status: any) => status?.status === gov2ReferendumStatus.TIMEDOUT)?.length === 0 &&
							trackName && <DecisionDepositCard trackName={String(trackName)} />}

						{canEdit && graphicOpen && post_link && !(post.tags && Array.isArray(post.tags) && post.tags.length > 0) && (
							<div className=' mb-8 rounded-[14px] bg-white pb-[36px] shadow-[0px_6px_18px_rgba(0,0,0,0.06)] dark:bg-section-dark-overlay'>
								<div
									className='flex items-center justify-end px-[20px] py-[17px]'
									onClick={() => setGraphicOpen(false)}
								>
									<CloseIcon />
								</div>
								<div className='flex flex-col items-center justify-center gap-6'>
									<GraphicIcon />
									<Button
										className='h-[35px] w-[176px] rounded-[4px] bg-pink_primary text-[16px] font-medium text-white'
										onClick={() => {
											toggleEdit && toggleEdit();
											setGraphicOpen(false);
										}}
									>
										<PlusOutlined />
										Add Tags
									</Button>
								</div>
							</div>
						)}
						{accountsNotFound || extensionNotFound ? (
							<GovSidebarCard>
								{accountsNotFound ? (
									<div className='mb-4'>
										<p className='mb-4'>You need at least one account in Polkadot-js extension to use this feature.</p>
										<p className='text-muted m-0'>Please reload this page after adding accounts.</p>
									</div>
								) : null}
								{extensionNotFound ? <ExtensionNotDetected /> : null}
							</GovSidebarCard>
						) : null}
						{proposalType === ProposalType.COUNCIL_MOTIONS && (
							<>
								{canVote && !extensionNotFound && (
									<VoteMotion
										setAccounts={setAccounts}
										accounts={accounts}
										address={address}
										getAccounts={getAccounts}
										motionId={onchainId as number}
										motionProposalHash={post.hash}
										onAccountChange={onAccountChange}
									/>
								)}
								{post.motion_votes && (post.motion_votes?.length || 0) > 0 && <MotionVoteInfo councilVotes={post.motion_votes} />}
							</>
						)}
						{proposalType === ProposalType.ALLIANCE_MOTION && (
							<>
								{canVote && !extensionNotFound && (
									<VoteMotion
										setAccounts={setAccounts}
										accounts={accounts}
										address={address}
										getAccounts={getAccounts}
										motionId={onchainId as number}
										motionProposalHash={post.hash}
										onAccountChange={onAccountChange}
									/>
								)}

								{post.motion_votes && post.motion_votes.length > 0 && <MotionVoteInfo councilVotes={post.motion_votes} />}
							</>
						)}

						{proposalType === ProposalType.DEMOCRACY_PROPOSALS && (
							<ProposalDisplay
								seconds={post?.seconds}
								accounts={accounts}
								address={address}
								canVote={canVote}
								getAccounts={getAccounts}
								onAccountChange={onAccountChange}
								status={status}
								proposalId={onchainId as number}
							/>
						)}

						{proposalType === ProposalType.TREASURY_PROPOSALS && (
							<EditProposalStatus
								proposalId={onchainId as number}
								canEdit={canEdit}
								startTime={startTime}
							/>
						)}
						{[
							ProposalType.OPEN_GOV,
							ProposalType.FELLOWSHIP_REFERENDUMS,
							ProposalType.REFERENDUMS,
							ProposalType.TECHNICAL_PIPS,
							ProposalType.UPGRADE_PIPS,
							ProposalType.COMMUNITY_PIPS
						].includes(proposalType) && (
							<>
								{proposalType === ProposalType.REFERENDUMS ? (
									<>
										{canVote && (
											<>
												{['moonbase', 'moonbeam', 'moonriver'].includes(network) ? (
													<>
														{metaMaskError && !walletConnectProvider?.wc.connected && <GovSidebarCard>{metaMaskError}</GovSidebarCard>}

														{(!metaMaskError || walletConnectProvider?.wc.connected) && (
															<GovSidebarCard className='overflow-y-hidden'>
																<h6 className='mx-0.5 mb-6 text-xl font-medium leading-6 text-bodyBlue dark:text-blue-dark-high'>Cast your Vote!</h6>
																<VoteReferendumEth
																	referendumId={onchainId as number}
																	onAccountChange={onAccountChange}
																	setLastVote={setLastVote}
																	lastVote={lastVote}
																/>
																{RenderLastVote}
															</GovSidebarCard>
														)}
													</>
												) : (
													<GovSidebarCard className='overflow-y-hidden'>
														<h6 className='mx-0.5 mb-6 text-xl font-medium leading-6 text-bodyBlue dark:text-blue-dark-high'>Cast your Vote!</h6>
														<VoteReferendum
															address={address}
															lastVote={lastVote}
															setLastVote={setLastVote}
															onAccountChange={onAccountChange}
															referendumId={onchainId as number}
															proposalType={proposalType}
														/>

														{RenderLastVote}
													</GovSidebarCard>
												)}
											</>
										)}

										{(onchainId || onchainId === 0) && (
											<div className={className}>
												<ReferendumVoteInfo
													setOpen={setOpen}
													voteThreshold={post.vote_threshold}
													referendumId={onchainId as number}
												/>
											</div>
										)}
									</>
								) : (
									<>
										{canVote && (
											<>
												{['moonbase', 'moonbeam', 'moonriver'].includes(network) ? (
													<>
														{metaMaskError && !walletConnectProvider?.wc.connected && <GovSidebarCard>{metaMaskError}</GovSidebarCard>}

														{(!metaMaskError || walletConnectProvider?.wc.connected) && (
															<GovSidebarCard className='overflow-y-hidden'>
																<h6 className='mx-0.5 mb-6 text-xl font-medium leading-6 text-bodyBlue dark:text-blue-dark-high'>Cast your Vote!</h6>
																<VoteReferendumEthV2
																	referendumId={onchainId as number}
																	onAccountChange={onAccountChange}
																	setLastVote={setLastVote}
																	lastVote={lastVote}
																	address={address}
																/>

																{RenderLastVote}
															</GovSidebarCard>
														)}
													</>
												) : (
													<GovSidebarCard className='overflow-y-hidden'>
														<h6 className='mx-0.5 mb-6 text-xl font-medium leading-6 text-bodyBlue dark:text-blue-dark-high'>Cast your Vote!</h6>
														{['polymesh'].includes(network) ? (
															<PIPsVote
																address={address}
																lastVote={lastVote}
																setLastVote={setLastVote}
																onAccountChange={onAccountChange}
																referendumId={onchainId as number}
																proposalType={proposalType}
																hash={hash}
															/>
														) : (
															<VoteReferendum
																address={address}
																lastVote={lastVote}
																setLastVote={setLastVote}
																onAccountChange={onAccountChange}
																referendumId={onchainId as number}
																proposalType={proposalType}
															/>
														)}
														{RenderLastVote}
													</GovSidebarCard>
												)}
											</>
										)}
										{![ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS, ProposalType.COMMUNITY_PIPS].includes(proposalType) && <ReferendaV2Messages progress={progress} />}

										{(onchainId || onchainId === 0) && (
											<>
												{proposalType === ProposalType.OPEN_GOV && (
													<div className={className}>
														<ReferendumV2VoteInfo tally={tally} />
														<RefV2ThresholdData
															canVote={canVote}
															setOpen={setOpen}
															thresholdData={{
																curvesError,
																curvesLoading,
																data,
																progress,
																setData
															}}
														/>
													</div>
												)}
												{proposalType === ProposalType.FELLOWSHIP_REFERENDUMS && (
													<div className={className}>
														<FellowshipReferendumVoteInfo
															setOpen={setOpen}
															tally={tally}
														/>
													</div>
												)}
											</>
										)}
									</>
								)}
								{(onchainId || onchainId === 0) && (
									<>
										{isSupportedNestedVoteNetwork(network) ? (
											<VoteDataModal
												onchainId={onchainId}
												open={open}
												setOpen={setOpen}
												proposalType={proposalType}
												tally={tally}
												thresholdData={{
													curvesError,
													curvesLoading,
													data,
													progress,
													setData
												}}
											/>
										) : (
											<Modal
												className='dark:[&>.ant-modal-content]:bg-section-dark-overlay'
												wrapClassName='dark:bg-modalOverlayDark'
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
													pipsVoters={pipsVoters}
													referendumId={onchainId as number}
													voteType={getVotingTypeFromProposalType(proposalType)}
													proposalType={proposalType}
													theme={theme}
												/>
											</Modal>
										)}
									</>
								)}

								<div>
									{lastVote != undefined ? (
										lastVote == null ? (
											<GovSidebarCard>You haven&apos;t voted yet, vote now and do your bit for the community</GovSidebarCard>
										) : (
											<></>
										)
									) : (
										<></>
									)}
								</div>
							</>
						)}
						{[ProposalType.UPGRADE_PIPS, ProposalType.COMMUNITY_PIPS].includes(proposalType) && (
							<>
								<GovSidebarCard>
									<PIPsVoteInfo
										setOpen={setOpen}
										proposalType={proposalType}
										className='mt-0'
										status={status}
										pipId={onchainId as number}
										tally={tally}
									/>
								</GovSidebarCard>
							</>
						)}

						{proposalType === ProposalType.TIPS && (
							<GovSidebarCard>
								{canVote && (
									<EndorseTip
										className='mb-8'
										setAccounts={setAccounts}
										accounts={accounts}
										address={address}
										getAccounts={getAccounts}
										tipHash={onchainId as string}
										onAccountChange={onAccountChange}
									/>
								)}

								<TipInfo
									status={post.status}
									onChainId={post.hash}
									proposer={post.proposer}
									receiver={post.payee || post.proposer}
									tippers={post.tippers}
								/>
							</GovSidebarCard>
						)}
						{network.includes('polymesh') ? (
							proposalType === ProposalType.TECHNICAL_PIPS || proposalType === ProposalType.UPGRADE_PIPS ? (
								<GovSidebarCard>
									<div className='mt-1 flex gap-2'>
										<span className='text-sm tracking-wide text-bodyBlue dark:text-blue-dark-high'>
											This PIP is proposed via
											{proposalType === ProposalType.TECHNICAL_PIPS ? ' Technical Committee ' : ' Upgrade Committee '}& is not open to community voting
										</span>
									</div>
								</GovSidebarCard>
							) : null
						) : null}

						{proposalType === ProposalType.BOUNTIES && (
							<>
								<BountyChildBounties bountyId={onchainId} />
							</>
						)}
					</Form>
				</div>
			}
		</>
	);
};

export default styled(memo(GovernanceSideBar))`
	.edit-icon-wrapper {
		transition: all 0.5s;
	}
	.edit-icon-wrapper .edit-icon {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		right: 20px;
		display: none;
	}
	.edit-icon-wrapper:hover {
		background-image: linear-gradient(to left, #e5007a, #ffffff);
	}
	.edit-icon-wrapper:hover .edit-icon {
		display: block;
	}
	.ant-tooltip-open {
		font-size: 12px;
		height: 20px;
	}
`;
