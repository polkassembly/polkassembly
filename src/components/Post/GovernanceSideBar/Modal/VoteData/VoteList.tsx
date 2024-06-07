// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DislikeFilled, LeftOutlined, LikeFilled, MinusCircleFilled, RightOutlined } from '@ant-design/icons';
import { LoadingOutlined } from '@ant-design/icons';
import { Divider, Modal as AntdModal, PaginationProps, Segmented, Spin } from 'antd';
import { IVotesResponse } from 'pages/api/v1/votes';
import React, { FC, useEffect, useRef, useState, useCallback } from 'react';
import { IVotesCount, LoadingStatusType } from 'src/types';
import { useApiContext, usePostDataContext } from '~src/context';
import { ProposalType, VoteType } from '~src/global/proposalType';
import { votesSortValues } from '~src/global/sortOptions';
import { PostEmptyState } from '~src/ui-components/UIStates';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { network as AllNetworks } from '~src/global/networkConstants';
import styled from 'styled-components';
import VoterRow from './VoterRow';
import ExpandIcon from '~assets/icons/expand-small-icon2.svg';
// import ChartIcon from '~assets/chart-icon.svg';
// import ThresholdGraph from './ThresholdGraph';
import DelegationVotersList from './DelegateVoteList';
// import GraphExpandIcon from '~assets/graph-expand.svg';
import { InfoCircleOutlined } from '@ant-design/icons';
import BN from 'bn.js';
import { useNetworkSelector } from '~src/redux/selectors';
import { Pagination } from '~src/ui-components/Pagination';
import { useTheme } from 'next-themes';
import { CloseIcon, VoteDataIcon } from '~src/ui-components/CustomIcons';
import { ApiPromise } from '@polkadot/api';
import Tooltip from '~src/basic-components/Tooltip';

const getFromatedData = (data: any) => {
	const resObj: any = {
		abstain: {
			count: 0,
			votes: []
		},
		no: {
			count: 0,
			votes: []
		},
		yes: {
			count: 0,
			votes: []
		}
	};
	data?.map((item: any) => {
		const votingPower = item.lockPeriod ? new BN(item?.balance?.value).mul(new BN(item?.lockPeriod || 1)) : new BN(item?.balance?.value).div(new BN('10'));
		resObj[item?.decision].votes = [...((resObj[item?.decision] as any)?.votes || []), { ...item, totalVotingPower: votingPower.toString() || '0' }];
		resObj[item?.decision].count = ((resObj[item?.decision] as any)?.count || 0) + 1;
	});
	return resObj;
};

// const ZERO = new BN(0);
const ZERO = '0';

const VoteContainer = styled.div`
	@media (max-width: 640px) {
		overflow-y: auto;
		overflow-x: auto;
	}
	overflow-y: auto;
	overflow-x: hidden;
`;

const Modal = styled(AntdModal)`
	.ant-modal-content {
		padding-top: 12px;
	}
`;

interface IVotersListProps {
	className?: string;
	referendumId: number;
	voteType: VoteType;
	thresholdData?: any;
	tally?: any;
	isUsedInVotedModal?: boolean;
	voterAddress?: string | null;
	ayeNayAbstainCounts?: IVotesCount;
}

type DecisionType = 'yes' | 'no' | 'abstain';

const VOTES_LISTING_LIMIT = 10;

const sortedCheck = {
	balanceIsAsc: false,
	convictionIsAsc: false,
	votingIsAsc: false
};
const formatNumber = (num: number | undefined) => {
	if (num && num >= 1000) {
		return (num / 1000).toFixed(1) + 'k';
	}
	return num;
};

const VotersList: FC<IVotersListProps> = (props) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const {
		postData: { statusHistory }
	} = usePostDataContext();
	const firstRef = useRef(true);
	const {
		postData: { postType }
	} = usePostDataContext();
	const isReferendum2 = postType === ProposalType.REFERENDUM_V2;
	// const { className, referendumId, voteType, thresholdData, tally } = props;
	const { className, referendumId, voteType, tally, isUsedInVotedModal, voterAddress, ayeNayAbstainCounts } = props;
	const { api, apiReady } = useApiContext();

	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({
		isLoading: true,
		message: 'Loading votes'
	});
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [decision, setDecision] = useState<DecisionType>();
	const [votesRes, setVotesRes] = useState<IVotesResponse>();
	const [combinedVotes, setCombinedVotes] = useState<any[]>([]);
	const [sortBy, setSortBy] = useState<string>(votesSortValues.TIME_DESC);
	const [delegationVoteModal, setDelegationVoteModal] = useState<{ isOpen: boolean; voter: string | null }>({ isOpen: false, voter: null });
	const [activeKey, setActiveKey] = useState<any>(null);
	const [orderBy, setOrderBy] = useState<{ [key: string]: boolean }>(sortedCheck);
	// const [thresholdOpen, setThresholdOpen] = useState<boolean>(false);

	const [tallyData, setTallyData] = useState({
		abstain: ZERO,
		ayes: ZERO,
		nays: ZERO
	});

	const decisionOptions = [
		{
			label: (
				<div className='text-md mt-[9px] flex items-center justify-center gap-1 rounded-[20px] text-green-700 max-[449px]:text-xs min-[450px]:mt-0'>
					<LikeFilled /> <span>Ayes({formatNumber(ayeNayAbstainCounts?.ayes)})</span>
				</div>
			),
			value: 'yes'
		},
		{
			label: (
				<div className='text-md mt-[9px] flex items-center justify-center gap-1 rounded-[20px] text-red-600  max-[449px]:text-xs min-[450px]:mt-0'>
					<DislikeFilled /> <span>Nays({formatNumber(ayeNayAbstainCounts?.nays)})</span>
				</div>
			),
			value: 'no'
		}
	];

	if (voteType === VoteType.REFERENDUM_V2) {
		decisionOptions.push({
			label: (
				<div className='text-md mt-[9px] flex items-center justify-center gap-1 rounded-[20px] text-blue-400 max-[449px]:text-xs min-[450px]:mt-0'>
					<MinusCircleFilled /> <span>Abstain({formatNumber(ayeNayAbstainCounts?.abstain)})</span>
				</div>
			),
			value: 'abstain'
		});
	}

	const onChange: PaginationProps['onChange'] = (page) => {
		setCurrentPage(page);
	};
	const handleSortByClick = ({ key }: { key: string }) => {
		setSortBy(key);
	};

	const getReferendumV2VoteInfo = useCallback(async () => {
		if (!api || !apiReady || !network) return;
		let newAPI: ApiPromise = api;
		const status = (statusHistory || [])?.find((v: any) => ['Rejected', 'TimedOut', 'Confirmed'].includes(v?.status || ''));

		if (status) {
			const blockNumber = status.block;
			if (blockNumber) {
				const hash = await api.rpc.chain.getBlockHash(blockNumber - 1);
				newAPI = (await api.at(hash)) as ApiPromise;
			}
		}
		if (isReferendum2) {
			const referendumInfoOf = await newAPI.query.referenda.referendumInfoFor(referendumId);
			const parsedReferendumInfo: any = referendumInfoOf.toJSON();
			if (parsedReferendumInfo?.ongoing?.tally) {
				setTallyData({
					abstain:
						typeof parsedReferendumInfo.ongoing.tally.abstain === 'string'
							? new BN(parsedReferendumInfo.ongoing.tally.abstain.slice(2), 'hex').toString()
							: new BN(parsedReferendumInfo.ongoing.tally.abstain).toString(),
					ayes:
						typeof parsedReferendumInfo.ongoing.tally.ayes === 'string'
							? new BN(parsedReferendumInfo.ongoing.tally.ayes.slice(2), 'hex').toString()
							: new BN(parsedReferendumInfo.ongoing.tally.ayes).toString(),
					nays:
						typeof parsedReferendumInfo.ongoing.tally.nays === 'string'
							? new BN(parsedReferendumInfo.ongoing.tally.nays.slice(2), 'hex').toString()
							: new BN(parsedReferendumInfo.ongoing.tally.nays).toString()
				});
			}
		} else {
			setTallyData({
				abstain: new BN(tally?.abstain || 0, 'hex').toString(),
				ayes: new BN(tally?.ayes || 0, 'hex').toString(),
				nays: new BN(tally?.nays || 0, 'hex').toString()
			});
		}
	}, [api, apiReady, isReferendum2, network, referendumId, statusHistory, tally?.abstain, tally?.ayes, tally?.nays]);

	useEffect(() => {
		setLoadingStatus({
			isLoading: true,
			message: 'Loading votes'
		});
		getReferendumV2VoteInfo().then(() => {
			let url;
			let payload: any;
			if (voterAddress && isUsedInVotedModal) {
				url = 'api/v1/votes/history';
				payload = {
					listingLimit: VOTES_LISTING_LIMIT,
					page: currentPage,
					proposalIndex: referendumId,
					proposalType: postType,
					voterAddress: voterAddress
				};
			} else {
				url = `api/v1/votes?listingLimit=${VOTES_LISTING_LIMIT}&postId=${referendumId}&voteType=${voteType}&page=${currentPage}&sortBy=${sortBy}`;
			}
			nextApiClientFetch<IVotesResponse>(url, payload)
				.then((res) => {
					if (res.error) {
						console.log(res.error);
						setLoadingStatus({
							isLoading: false,
							message: ''
						});
					} else {
						const votesRes = (res.data as any)?.votes ? getFromatedData((res?.data as any)?.votes) : res?.data;
						let combinedVotes;
						setVotesRes(votesRes);
						if (votesRes && firstRef.current) {
							firstRef.current = false;
							let decision: DecisionType = 'yes';
							if (votesRes.yes.count > 0) {
								decision = 'yes';
							} else if (votesRes.no.count > 0) {
								decision = 'no';
							} else if (votesRes.abstain.count > 0) {
								decision = 'abstain';
							}
							setDecision(decision);
						}
						if (votesRes && votesRes.abstain && votesRes.no && votesRes.yes) {
							combinedVotes = [...votesRes.abstain.votes, ...votesRes.no.votes, ...votesRes.yes.votes];
							setCombinedVotes(combinedVotes);
						}
						setLoadingStatus({
							isLoading: false,
							message: ''
						});
					}
				})
				.catch((err) => {
					console.log(err);
					setLoadingStatus({
						isLoading: false,
						message: ''
					});
				});
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, getReferendumV2VoteInfo, referendumId, sortBy, voteType]);

	useEffect(() => {
		getReferendumV2VoteInfo();
	}, [api, apiReady, getReferendumV2VoteInfo]);

	return (
		<div>
			<Spin
				className={className}
				spinning={loadingStatus.isLoading}
				indicator={<LoadingOutlined />}
			>
				<div className='flex gap-6'>
					<div className='flex w-full flex-col justify-between'>
						<div className='w-full'>
							{!isUsedInVotedModal && (
								<div className='mb-4 flex w-full items-center justify-center min-[450px]:mb-8'>
									<Segmented
										block
										className='w-full rounded-[10px] px-1 py-2 min-[450px]:rounded-[30px] min-[450px]:px-3'
										size='large'
										value={decision}
										onChange={(value) => {
											setDecision(String(value) as DecisionType);
											setCurrentPage(1);
										}}
										options={decisionOptions}
									/>
								</div>
							)}
							<VoteContainer className='px-0 text-xs text-sidebarBlue'>
								<div className='mb-2 flex w-full items-center px-2 text-xs font-semibold sm:w-min'>
									{!isUsedInVotedModal ? (
										<div className={`w-[160px] text-sm font-medium text-lightBlue dark:text-white sm:w-[190px]  ${decision === 'abstain' ? 'sm:w-[220px]' : ''}`}>Voter</div>
									) : (
										<div className={`min[640px]:w-[190px] w-[160px] text-sm font-medium text-lightBlue dark:text-white  ${decision === 'abstain' ? 'sm:w-[220px]' : ''}`}>Vote</div>
									)}
									<div
										className={`hidden w-[110px] cursor-pointer items-center gap-1 text-lightBlue dark:text-white sm:flex ${decision === 'abstain' ? 'w-[160px]' : ''}`}
										onClick={() => {
											handleSortByClick({
												key: orderBy.balanceIsAsc ? votesSortValues.BALANCE_ASC : votesSortValues.BALANCE_DESC
											});
											setOrderBy((prev) => ({ ...sortedCheck, balanceIsAsc: !prev.balanceIsAsc }));
										}}
									>
										Amount
										{!isUsedInVotedModal && <ExpandIcon className={orderBy.balanceIsAsc ? 'rotate-180' : ''} />}
									</div>
									{network !== AllNetworks.COLLECTIVES && decision !== 'abstain' ? (
										<div
											className={'hidden w-[110px] cursor-pointer items-center gap-1 text-lightBlue dark:text-blue-dark-high sm:flex'}
											onClick={() => {
												handleSortByClick({
													key: orderBy.convictionIsAsc ? votesSortValues.CONVICTION_ASC : votesSortValues.CONVICTION_DESC
												});
												setOrderBy((prev) => ({ ...sortedCheck, convictionIsAsc: !prev.convictionIsAsc }));
											}}
										>
											Conviction
											{!isUsedInVotedModal && <ExpandIcon className={orderBy.convictionIsAsc ? 'rotate-180' : ''} />}
										</div>
									) : null}

									<div className='flex w-[120px] items-center justify-between space-x-1 text-lightBlue dark:text-blue-dark-high'>
										<span
											className='flex cursor-pointer'
											onClick={() => {
												handleSortByClick({
													key: orderBy.votingIsAsc ? votesSortValues.VOTING_POWER_ASC : votesSortValues.VOTING_POWER_DESC
												});
												setOrderBy((prev) => ({ ...sortedCheck, votingIsAsc: !prev.votingIsAsc }));
											}}
										>
											Voting Power
											{!isUsedInVotedModal && <ExpandIcon className={orderBy.votingIsAsc ? 'rotate-180' : ''} />}
										</span>
										<span className='mr-3'>
											<Tooltip
												color='#E5007A'
												title='Vote Power for delegated votes is the self vote power + delegated vote power.'
											>
												<InfoCircleOutlined className='text-xs text-lightBlue dark:text-blue-dark-high' />
											</Tooltip>
										</span>
									</div>
								</div>
								{!isUsedInVotedModal ? (
									<div className='max-h-[360px] w-full sm:w-min'>
										{votesRes &&
											decision &&
											!!votesRes[decision]?.votes?.length &&
											votesRes[decision]?.votes.map((voteData: any, index: number) => (
												<VoterRow
													className={`${index % 2 == 0 ? 'bg-[#FBFBFC]' : 'bg-white'} ${index === votesRes[decision]?.votes.length - 1 ? 'border-b' : ''}`}
													key={`${voteData.voter}_${index}`}
													currentKey={activeKey}
													voteType={voteType}
													voteData={voteData}
													index={index}
													isReferendum2={isReferendum2}
													setDelegationVoteModal={setDelegationVoteModal}
													setActiveKey={setActiveKey}
													tally={tallyData?.[decision === 'yes' ? 'ayes' : decision === 'no' ? 'nays' : 'abstain'] || null}
													decision={decision}
													referendumId={referendumId}
												/>
											))}
										{decision && !votesRes?.[decision]?.votes?.length && <PostEmptyState />}
									</div>
								) : (
									<div className='max-h-[360px] w-full sm:w-min'>
										{combinedVotes &&
											!!combinedVotes.length &&
											combinedVotes.map((voteData: any, index: number) => (
												<VoterRow
													className={`${index % 2 == 0 ? 'bg-[#FBFBFC]' : 'bg-white'} ${index === combinedVotes.length - 1 ? 'border-b' : ''}`}
													key={`${voteData.voter}_${index}`}
													currentKey={activeKey}
													voteType={voteType}
													voteData={voteData}
													index={index}
													isReferendum2={isReferendum2}
													setDelegationVoteModal={setDelegationVoteModal}
													setActiveKey={setActiveKey}
													tally={tallyData?.[decision === 'yes' ? 'ayes' : decision === 'no' ? 'nays' : 'abstain'] || null}
													decision={decision}
													referendumId={referendumId}
													isUsedInVotedModal={isUsedInVotedModal}
												/>
											))}
										{decision && !votesRes?.[decision]?.votes?.length && <PostEmptyState />}
									</div>
								)}
							</VoteContainer>
						</div>
						{!isUsedInVotedModal && (
							<div className='z-10 mb-2 flex flex-col items-center bg-white pt-4 dark:bg-section-dark-overlay sm:items-center '>
								<p className='m-0 mb-2 text-center text-xs text-bodyBlue dark:text-blue-dark-high'>d: Delegation s: Split sa: Split Abstain</p>
								<Pagination
									theme={theme}
									size='small'
									defaultCurrent={1}
									current={currentPage}
									onChange={onChange}
									total={votesRes && decision ? votesRes[decision]?.count || 0 : 0}
									showSizeChanger={false}
									pageSize={VOTES_LISTING_LIMIT}
									responsive={true}
									hideOnSinglePage={true}
									nextIcon={
										<div
											className={`ml-1 ${currentPage > Math.floor((votesRes && decision ? votesRes[decision]?.count || 0 : 0) / VOTES_LISTING_LIMIT) ? 'text-grey_secondary' : ''}`}
										>
											<RightOutlined />
										</div>
									}
									prevIcon={
										<div className={`mr-1 ${currentPage <= 1 ? 'text-grey_secondary' : ''}`}>
											<LeftOutlined />
										</div>
									}
								/>
							</div>
						)}
					</div>
					{/* {thresholdData && (
						<Container className='flex flex-col gap-5 border border-x-0 border-y-0 border-l-2 border-dashed border-section-light-container dark:border-[#3B444F] pl-4'>
							{thresholdData.progress.approval >= thresholdData.progress.approvalThreshold.toFixed(1) &&
							thresholdData.progress.support >= thresholdData.progress.supportThreshold.toFixed(1) ? (
								<p className='row m-0 flex gap-1 text-sm font-medium'>
									<span>
										<ChartIcon />
									</span>
									<p>
										Proposal is <span className='text-aye_green'>passing</span> as both support and approval are above the threshold
									</p>
								</p>
							) : (
								<p className='row m-0 flex gap-1 text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
									<span>
										<ChartIcon />
									</span>
									<p>
										Proposal is <span className='text-nay_red'>failing</span> as both support and approval are below the threshold
									</p>
								</p>
							)}
							<button
								className='absolute right-0 top-[50px] cursor-pointer border-0 bg-white dark:bg-section-dark-overlay'
								onClick={() => setThresholdOpen(true)}
							>
								<GraphExpandIcon />
							</button>
							<ThresholdGraph
								{...thresholdData}
								thresholdOpen={thresholdOpen}
								setThresholdOpen={setThresholdOpen}
							/>
						</Container>
					)} */}
				</div>
			</Spin>
			{delegationVoteModal.isOpen && delegationVoteModal.voter && decision && (
				<Modal
					wrapClassName='dark:bg-modalOverlayDark'
					title={
						<div className='ml-[-24px] mr-[-24px] text-[18px] dark:bg-section-dark-overlay'>
							<h3 className='align-center mb-0 ml-[24px] flex gap-2 font-semibold text-blue-light-high dark:text-blue-dark-high'>
								<VoteDataIcon className='text-lightBlue dark:text-icon-dark-inactive' />
								<span className='text-xl font-semibold text-bodyBlue dark:text-blue-dark-high'>Delegation Data</span>
							</h3>
							<Divider className='my-2 mb-5 text-section-light-container dark:text-separatorDark' />
						</div>
					}
					open={delegationVoteModal.isOpen}
					closable
					closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
					className={'sm:w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay'}
					onCancel={() => {
						setDelegationVoteModal({ isOpen: false, voter: null });
					}}
					footer={null}
				>
					<DelegationVotersList
						referendumId={referendumId as number}
						voteType={voteType}
						voter={delegationVoteModal.voter}
						decision={decision}
					/>
				</Modal>
			)}
		</div>
	);
};

export default React.memo(VotersList);
