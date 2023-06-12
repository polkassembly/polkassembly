// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import { Signer } from '@polkadot/api/types';
import { isWeb3Injected, web3Enable } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Button, Form, Modal } from 'antd';
import { IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useEffect, useState } from 'react';
import { APPNAME } from 'src/global/appName';
import { gov2ReferendumStatus, motionStatus, proposalStatus, referendumStatus } from 'src/global/statuses';
import { Wallet } from 'src/types';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import getEncodedAddress from 'src/util/getEncodedAddress';
import styled from 'styled-components';

import { useApiContext, useNetworkContext, usePostDataContext, useUserDetailsContext } from '~src/context';
import { ProposalType, VoteType } from '~src/global/proposalType';
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
import SplitGray from '~assets/icons/split-gray.svg';
import AbstainGray from '~assets/icons/abstain-gray.svg';
import { IVotesHistoryResponse } from 'pages/api/v1/votes/history';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

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
}

const GovernanceSideBar: FC<IGovernanceSidebarProps> = (props) => {
	const { network } = useNetworkContext();
	const { canEdit, className, onchainId, proposalType, startTime, status, tally, post, toggleEdit } = props;
	const [address, setAddress] = useState<string>('');
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [extensionNotFound, setExtensionNotFound] = useState(false);
	const [accountsNotFound, setAccountsNotFound] = useState(false);
	const [accountsMap, setAccountsMap] = useState<{[key:string]:string}>({});
	const [signersMap, setSignersMap] = useState<{[key:string]: Signer}>({});
	const [open, setOpen] = useState(false);
	const [graphicOpen, setGraphicOpen] = useState<boolean>(true);

	const { api, apiReady } = useApiContext();
	const [lastVote, setLastVote] = useState<string | null | undefined>(undefined);

	const { walletConnectProvider } = useUserDetailsContext();
	const { postData: { created_at, track_number, post_link } } = usePostDataContext();
	const [thresholdOpen, setThresholdOpen] = useState(false);

	const metaMaskError = useHandleMetaMask();
	const [curvesLoading, setCurvesLoading] = useState(true);
	const [curvesError, setCurvesError] = useState('');
	const [data, setData] = useState<any>({
		datasets: [],
		labels: []
	});
	const [progress, setProgress] = useState({
		approval: 0,
		approvalThreshold: 0,
		support: 0,
		supportThreshold: 0
	});

	const canVote = !!post.status && !![proposalStatus.PROPOSED, referendumStatus.STARTED, motionStatus.PROPOSED, tipStatus.OPENED, gov2ReferendumStatus.SUBMITTED, gov2ReferendumStatus.DECIDING, gov2ReferendumStatus.SUBMITTED, gov2ReferendumStatus.CONFIRM_STARTED].includes(post.status);

	useEffect(() => {
		if ([ProposalType.OPEN_GOV, ProposalType.FELLOWSHIP_REFERENDUMS].includes(proposalType)) {
			if (!api || !apiReady) {
				return;
			}
			setCurvesLoading(true);
			const getData = async () => {
				const tracks = api.consts.referenda.tracks.toJSON();
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

	const onAccountChange = (address: string) => {
		setAddress(address);
	};

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		const signer: Signer = signersMap[accountsMap[address]];
		api?.setSigner(signer);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	useEffect( () => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}
		const encoded = getEncodedAddress(address, network);
		const substrateAddress = getSubstrateAddress(address);

		nextApiClientFetch<IVotesHistoryResponse>(`api/v1/votes/history?page=${2}&voterAddress=${substrateAddress}&network=${network}&numListingLimit=${2}`)
			.then((res) => {
				if (res.error) {
					console.log('error');
				} else {
					console.log('address = ',substrateAddress);
					console.log('encoded = ',encoded);
					console.log('info = ',res.data);
					//setCount(res.data?.count || 0);
				}
				//setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				//setLoading(false);
			});

	}, [address,api,apiReady,network]);

	const getWalletAccounts = async (chosenWallet: Wallet): Promise<InjectedAccount[] | undefined> => {
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

		if(!injected) {
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
		let polakadotJSAccounts : InjectedAccount[] | undefined;
		let polywalletJSAccounts : InjectedAccount[] | undefined;
		let subwalletAccounts: InjectedAccount[] | undefined;
		let talismanAccounts: InjectedAccount[] | undefined;

		const signersMapLocal = signersMap as {[key:string]: Signer};
		const accountsMapLocal = accountsMap as {[key:string]: string};

		for (const extObj of extensions) {
			if(extObj.name == 'polkadot-js') {
				signersMapLocal['polkadot-js'] = extObj.signer;
				polakadotJSAccounts = await getWalletAccounts(Wallet.POLKADOT);
			} else if(extObj.name == 'subwallet-js') {
				signersMapLocal['subwallet-js'] = extObj.signer;
				subwalletAccounts = await getWalletAccounts(Wallet.SUBWALLET);
			} else if(extObj.name == 'talisman') {
				signersMapLocal['talisman'] = extObj.signer;
				talismanAccounts = await getWalletAccounts(Wallet.TALISMAN);
			} else if (['polymesh'].includes(network) && extObj.name === 'polywallet') {
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

		setAccounts(accounts);
		if (accounts.length > 0) {
			setAddress(accounts[0].address);
			const signer: Signer = signersMapLocal[accountsMapLocal[accounts[0].address]];
			api.setSigner(signer);
		}

		return;
	};

	if (extensionNotFound) {
		return (
			<div className={className}>
				<GovSidebarCard>
					<ExtensionNotDetected />
				</GovSidebarCard>
			</div>
		);
	}

	if (accountsNotFound) {
		return (
			<GovSidebarCard>
				<div className='mb-4'>You need at least one account in Polkadot-js extenstion to use this feature.</div>
				<div className='text-muted'>Please reload this page after adding accounts.</div>
			</GovSidebarCard>
		);
	}
	return (
		<>
			{<div className={className}>
				<Form>
					{
						!post_link && canEdit && <>
							<PostEditOrLinkCTA />
						</>
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
								getAccounts={getAccounts}
								motionId={onchainId as number}
								motionProposalHash={post.hash}
								onAccountChange={onAccountChange}
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
								getAccounts={getAccounts}
								motionId={onchainId as number}
								motionProposalHash={post.hash}
								onAccountChange={onAccountChange}
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
							getAccounts={getAccounts}
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
												{['moonbase', 'moonbeam', 'moonriver'].includes(network) ?
													<>
														{metaMaskError && !walletConnectProvider?.wc.connected && <GovSidebarCard>{metaMaskError}</GovSidebarCard>}

														{(!metaMaskError || walletConnectProvider?.wc.connected) &&

													<GovSidebarCard>
														<h6 className="dashboard-heading mb-6">Cast your Vote!</h6>
														<VoteReferendumEth
															referendumId={onchainId as number}
															onAccountChange={onAccountChange}
															setLastVote={setLastVote}
															lastVote={lastVote} />
													</GovSidebarCard>

														}
													</> : <GovSidebarCard>
														<h6 className="dashboard-heading mb-6">Cast your Vote!</h6>
														<VoteReferendum
															address={address}
															lastVote={lastVote}
															setLastVote={setLastVote}
															onAccountChange={onAccountChange}
															referendumId={onchainId  as number}
															proposalType={proposalType}
														/>
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
												{['moonbase', 'moonbeam', 'moonriver'].includes(network) ?
													<>
														{metaMaskError && !walletConnectProvider?.wc.connected && <GovSidebarCard>{metaMaskError}</GovSidebarCard>}

														{(!metaMaskError || walletConnectProvider?.wc.connected) &&

													<GovSidebarCard>
														<h6 className="dashboard-heading mb-6">Cast your Vote!</h6>
														<VoteReferendumEthV2
															referendumId={onchainId as number}
															onAccountChange={onAccountChange}
															setLastVote={setLastVote}
															lastVote={lastVote} />
													</GovSidebarCard>

														}
													</> : <GovSidebarCard>
														<h6 className="dashboard-heading mb-6">Cast your Vote!</h6>
														<VoteReferendum
															address={address}
															lastVote={lastVote}
															setLastVote={setLastVote}
															onAccountChange={onAccountChange}
															referendumId={onchainId  as number}
															proposalType={proposalType}
														/>
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
																<h2 className='text-sidebarBlue tracking-[0.01em] text-xl leading-[30px] font-semibold'>Threshold Curves</h2>
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
									<GovSidebarCard className='flex items-center'>

										You Voted: { lastVote == 'aye' && <LikeFilled className='text-aye_green ml-2' />}
										{ lastVote == 'nay' && <DislikeFilled className='text-nay_red ml-2' />}
										{ lastVote == 'split' && <SplitGray className=' ml-2 mr-1' />}
										{ lastVote == 'abstain' && <AbstainGray className=' ml-2 mr-1' />}
										<span className={`last-vote-text ${lastVote == 'aye' ? 'green-text' : 'red-text'}`}>{lastVote}</span>

									</GovSidebarCard>
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
								getAccounts={getAccounts}
								tipHash={onchainId as string}
								onAccountChange={onAccountChange}
							/>
						}

						<TipInfo
							status={post.status}
							onChainId={post.hash}
							proposer={post.proposer}
							receiver={post.payee || post.proposer}
							tippers={post.tippers}
						/>
					</GovSidebarCard>
					}

					{proposalType === ProposalType.BOUNTIES && <>
						<BountyChildBounties
							childBounties={post.child_bounties}
							childBountiesCount={post.child_bounties_count}
						/>
					</>
					}
				</Form>
			</div>
			}
		</>
	);
};

export default styled(GovernanceSideBar)`
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
`;
