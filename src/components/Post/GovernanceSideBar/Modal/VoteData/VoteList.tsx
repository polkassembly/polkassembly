// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import {
	DislikeFilled,
	LeftOutlined,
	LikeFilled,
	MinusCircleFilled,
	RightOutlined
} from '@ant-design/icons';
import { LoadingOutlined } from '@ant-design/icons';
import { Divider, Modal, Pagination, PaginationProps, Segmented, Spin } from 'antd';
import { IVotesResponse } from 'pages/api/v1/votes';
import React, { FC, useEffect, useRef, useState } from 'react';
import { LoadingStatusType } from 'src/types';
import { useNetworkContext, usePostDataContext } from '~src/context';
import { ProposalType, VoteType } from '~src/global/proposalType';
import { votesSortValues } from '~src/global/sortOptions';
import { PostEmptyState } from '~src/ui-components/UIStates';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { network as AllNetworks } from '~src/global/networkConstants';
import styled from 'styled-components';
import VoterRow from './VoterRow';
import ExpandIcon from '~assets/icons/expand-small-icon.svg';
import ChartIcon from '~assets/chart-icon.svg';
import ThresholdGraph from './ThresholdGraph';
import VoteDataIcon from '~assets/icons/vote-data-icon.svg';
import CloseIcon from '~assets/icons/close-icon.svg';
import DelegationVotersList from './DelegateVoteList';
import GraphExpandIcon from '~assets/graph-expand.svg';

const StyledSegmented = styled(Segmented)`
  .ant-segmented-group > label {
    border-radius: 20px !important;
  }
`;

const Container = styled.div`
@media(max-width: 1024px) {
    display: none !important;
}
`;

interface IVotersListProps {
  className?: string;
  referendumId: number;
  voteType: VoteType;
  thresholdData?: any;
  tally:any
}

type DecisionType = 'yes' | 'no' | 'abstain';

const VOTES_LISTING_LIMIT = 10;

const sortedCheck = {
	balanceIsAsc: false,
	convictionIsAsc: false,
	votingIsAsc: false
};

const VotersList: FC<IVotersListProps> = (props) => {
	const { network } = useNetworkContext();
	const firstRef = useRef(true);
	const {
		postData: { postType }
	} = usePostDataContext();
	const isReferendum2 = postType === ProposalType.REFERENDUM_V2;
	const { className, referendumId, voteType, thresholdData, tally } = props;

	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({
		isLoading: true,
		message: 'Loading votes'
	});
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [decision, setDecision] = useState<DecisionType>();
	const [votesRes, setVotesRes] = useState<IVotesResponse>();
	const [sortBy, setSortBy] = useState<string>(votesSortValues.TIME_DESC);

	const [delegationVoteModal, setDelegationVoteModal] =useState<{isOpen: boolean, voter:string | null}>({ isOpen:false, voter: null });
	const [activeKey, setActiveKey] = useState<any>(null);
	const [orderBy, setOrderBy] = useState<{[key:string]:boolean}>(sortedCheck);
	const [thresholdOpen, setThresholdOpen] = useState<boolean>(false);

	useEffect(() => {
		setLoadingStatus({
			isLoading: true,
			message: 'Loading votes'
		});
		const url = `api/v1/votes?listingLimit=${VOTES_LISTING_LIMIT}&postId=${referendumId}&voteType=${voteType}&page=${currentPage}&sortBy=${sortBy}`;
		nextApiClientFetch<IVotesResponse>(url)
			.then((res) => {
				if (res.error) {
					setLoadingStatus({
						isLoading: false,
						message: ''
					});
					console.log(res.error);
				} else {
					const votesRes = res.data;
					setVotesRes(votesRes);
					setLoadingStatus({
						isLoading: false,
						message: ''
					});
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
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}, [currentPage, referendumId, sortBy, voteType]);

	const decisionOptions = [
		{
			label: (
				<div className='flex items-center justify-center gap-1'>
					<LikeFilled /> <span>Ayes</span>
				</div>
			),
			value: 'yes'
		},
		{
			label: (
				<div className='flex items-center justify-center gap-1'>
					<DislikeFilled /> <span>Nays</span>
				</div>
			),
			value: 'no'
		}
	];

	if (voteType === VoteType.REFERENDUM_V2) {
		decisionOptions.push({
			label: (
				<div className='flex items-center justify-center gap-1'>
					<MinusCircleFilled /> <span>Abstain</span>
				</div>
			),
			value: 'abstain'
		});
	}

	const onChange: PaginationProps['onChange'] = (page) => {
		setCurrentPage(page);
	};
	const handleSortByClick = ({ key }: {key: string}) => {
		setSortBy(key);
	};
	return (
		<div>
			<Spin
				className={className}
				spinning={loadingStatus.isLoading}
				indicator={<LoadingOutlined />}
			>
				<div className='flex gap-6'>
					<div className='md:overflow-visible overflow-x-auto flex flex-col justify-between'>
						<div>
							<div className='w-full flex items-center justify-center mb-8'>
								<StyledSegmented
									block
									className='px-3 py-2 rounded-[30px] w-full'
									size='large'
									value={decision}
									onChange={(value) => {
										setDecision(String(value) as DecisionType);
										setCurrentPage(1);
									}}
									options={decisionOptions}
								/>
							</div>
							<div className='flex flex-col text-xs px-0 text-sidebarBlue'>
								<div className='flex text-xs items-center font-semibold mb-2 px-2 w-[552px]'>
									<div
										className={`${
											isReferendum2 ? 'w-[220px]' : 'w-[250px]'
										} text-lightBlue text-sm font-medium`}
									>
									Voter
									</div>
									<div
										className={`${
											isReferendum2 ? 'w-[110px]' : 'w-[140px]'
										} flex items-center gap-1 text-lightBlue ${decision === 'abstain' ? 'w-[160px]':''}`}
										onClick={() => {
											handleSortByClick({
												key: orderBy.balanceIsAsc
													? votesSortValues.BALANCE_ASC
													: votesSortValues.BALANCE_DESC
											});
											setOrderBy((prev) => ({ ...sortedCheck, balanceIsAsc: !prev.balanceIsAsc }));
										}}
									>
									Amount
										<ExpandIcon className={orderBy.balanceIsAsc ? 'rotate-180' : ''} />
									</div>
									{network !== AllNetworks.COLLECTIVES && decision !== 'abstain' ? (
										<div
											className={`${
												isReferendum2 ? 'w-[120px]' : 'w-[150px]'
											} flex items-center gap-1 text-lightBlue`}
											onClick={() => {
												handleSortByClick({
													key: orderBy.convictionIsAsc
														? votesSortValues.CONVICTION_ASC
														: votesSortValues.CONVICTION_DESC
												});
												setOrderBy((prev) => ({ ...sortedCheck, convictionIsAsc: !prev.convictionIsAsc }));
											}}
										>
										Conviction
											<ExpandIcon className={orderBy.convictionIsAsc ? 'rotate-180' : ''}
											/>
										</div>
									) : null}
									{isReferendum2 && (
										<div
											className='w-[110px] flex items-center gap-1 text-lightBlue'
											onClick={() => {
												handleSortByClick({
													key: orderBy.votingIsAsc
														? votesSortValues.VOTING_POWER_ASC
														: votesSortValues.VOTING_POWER_DESC
												});
												setOrderBy((prev) => ({ ...sortedCheck, votingIsAsc: !prev.votingIsAsc }));
											}}
										>
										Voting Power
											<ExpandIcon className={orderBy.votingIsAsc ? 'rotate-180' : ''} />
										</div>
									)}
								</div>
								<div className='overflow-x-auto max-h-[360px]'>
									{votesRes && decision && !!votesRes[decision]?.votes?.length ? (
										votesRes[decision]?.votes.map(
											(voteData: any, index: number) => (
												<VoterRow
													className={`${
														index % 2 == 0 ? 'bg-[#FBFBFC]' : 'bg-white'
													} ${
														index === votesRes[decision]?.votes.length - 1
															? 'border-b'
															: ''
													}`}
													key={`${voteData.voter}_${index}`}
													currentKey={activeKey}
													voteType={voteType}
													voteData={voteData}
													index={index}
													isReferendum2={isReferendum2}
													setDelegationVoteModal={setDelegationVoteModal}
													setActiveKey={setActiveKey}
													tally={tally?.[decision=== 'yes'? 'ayes':decision==='no' ? 'nays': 'abstain'] || null}
													decision={decision}
													referendumId={referendumId}

												/>
											)
										)
									) : (
										<PostEmptyState />
									)}
								</div>
							</div>
						</div>
						<div className='flex justify-between items-center pt-6 bg-white z-10'>
							<p className='text-xs text-[#96A4B6] m-0'>
								d: Delegation s: Split sa: Split Abstain
							</p>
							<Pagination
								size='small'
								defaultCurrent={1}
								current={currentPage}
								onChange={onChange}
								total={
									votesRes && decision ? votesRes[decision]?.count || 0 : 0
								}
								showSizeChanger={false}
								pageSize={VOTES_LISTING_LIMIT}
								responsive={true}
								hideOnSinglePage={true}
								nextIcon={
									<div
										className={`ml-1 ${
											currentPage > Math.floor((votesRes && decision? votesRes[decision]?.count || 0 : 0) / VOTES_LISTING_LIMIT)
												? 'text-grey_secondary'
												: ''
										}`}
									>
										<RightOutlined />
									</div>
								}
								prevIcon={
									<div
										className={`mr-1 ${
											currentPage <= 1 ? 'text-grey_secondary' : ''
										}`}
									>
										<LeftOutlined />
									</div>
								}
							/>
						</div>
					</div>
					{
						thresholdData
						&& <Container className='flex flex-col gap-5 border border-x-0 border-y-0 border-l-2 border-dashed border-[#D2D8E0] pl-4'>
							{
								thresholdData.progress.approval > 50 ?
									<p className='flex row gap-1 text-sm font-medium m-0'>
										<span>
											<ChartIcon />
										</span>
										<p>
											Proposal is <span className='text-aye_green'>passing</span> as both support and approval are above the threshold
										</p>
									</p>
									:<p className='flex row gap-1 text-sm font-medium text-bodyBlue m-0'>
										<span>
											<ChartIcon />
										</span>
										<p>
											Proposal is <span className='text-nay_red'>failing</span> as both support and approval are below the threshold
										</p>
									</p>
							}
							<button className='absolute top-[50px] right-0 bg-white border-0 cursor-pointer' onClick={() => setThresholdOpen(true)}><GraphExpandIcon/></button>
							<ThresholdGraph {...thresholdData} thresholdOpen={thresholdOpen} setThresholdOpen={setThresholdOpen}/>
						</Container>
					}
				</div>
			</Spin>
			{
				delegationVoteModal.isOpen
				&& delegationVoteModal.voter
				&& decision
				&& <Modal
					title={
						<div className='mr-[-24px] ml-[-24px] text-[18px]'>
							<h3 className='ml-[24px] mb-0 font-semibold text-[#243A57] flex align-center gap-2'>
								<span className='top-1 relative'>
									<VoteDataIcon />
								</span>
								<span className='text-xl font-semibold text-bodyBlue'>
									Voting Data
								</span>
							</h3>
							<Divider className='text-[#D2D8E0]' />
						</div>
					}
					open={delegationVoteModal.isOpen}
					closable
					closeIcon={<CloseIcon />}
					className={'sm:w-[600px]'}
					onCancel={() => {
						setDelegationVoteModal({ isOpen:false, voter:null });
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
			}
		</div>
	);
};

export default VotersList;
