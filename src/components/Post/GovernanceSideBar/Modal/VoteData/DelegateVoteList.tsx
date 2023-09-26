// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { LoadingOutlined } from '@ant-design/icons';
import { Pagination, Spin } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { LoadingStatusType } from 'src/types';
import { useNetworkContext, usePostDataContext } from '~src/context';
import { ProposalType, VoteType } from '~src/global/proposalType';
import { PostEmptyState } from '~src/ui-components/UIStates';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { network as AllNetworks } from '~src/global/networkConstants';
import VoterRow from './VoterRow';
import { votesSortValues } from '~src/global/sortOptions';
import ExpandIcon from '~assets/icons/expand-small-icon.svg';

interface IVotersListProps {
	className?: string;
	referendumId: number;
	voteType: VoteType;
	thresholdData?: any;
	voter: string;
	decision: DecisionType;
}

interface IDelegationList {
	count: number;
	votes: any[];
}

type DecisionType = 'yes' | 'no' | 'abstain';

const VOTES_LISTING_LIMIT = 10;

const sortedCheck = {
	balanceIsAsc: false,
	convictionIsAsc: false,
	votingIsAsc: false
};

const DelegationVotersList: FC<IVotersListProps> = (props) => {
	const { network } = useNetworkContext();
	const {
		postData: { postType }
	} = usePostDataContext();
	const isReferendum2 = postType === ProposalType.REFERENDUM_V2;
	const { className, referendumId, voteType, voter, decision } = props;

	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({
		isLoading: true,
		message: 'Loading votes'
	});
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [votesRes, setVotesRes] = useState<IDelegationList>();
	const [sortBy, setSortBy] = useState<string>(votesSortValues.VOTING_POWER_DESC);
	const [orderBy, setOrderBy] = useState<{ [key: string]: boolean }>(sortedCheck);

	const handleSortByClick = ({ key }: { key: string }) => {
		setSortBy(key);
	};

	useEffect(() => {
		setLoadingStatus({
			isLoading: true,
			message: 'Loading votes'
		});
		const url = `api/v1/votes/delegationVoteList?listingLimit=${VOTES_LISTING_LIMIT}&postId=${referendumId}&page=${currentPage}&decision=${
			decision || 'yes'
		}&type=${voteType}&voter=${voter}&sortBy=${sortBy}`;
		nextApiClientFetch<IDelegationList>(url)
			.then((res) => {
				if (res.error) {
					console.log(res.error);
				} else {
					const votesRes = res.data;
					setVotesRes(votesRes);
				}
			})
			.catch((err) => {
				console.log(err);
			})
			.finally(() => {
				setLoadingStatus({
					isLoading: false,
					message: ''
				});
			});
	}, [referendumId, currentPage, voteType, decision, voter, sortBy]);
	return (
		<div>
			<Spin
				className={className}
				spinning={loadingStatus.isLoading}
				indicator={<LoadingOutlined />}
			>
				<div className='flex gap-6'>
					<div className='overflow-x-auto md:overflow-visible'>
						<div className='flex flex-col overflow-x-auto px-0 text-xs text-sidebarBlue'>
							<div className='mb-2 flex w-[552px] items-center px-2 text-xs font-semibold'>
								<div className={`${isReferendum2 ? 'w-[190px]' : 'w-[250px]'} text-sm font-medium text-lightBlue`}>Delegator</div>
								<div
									className={`${isReferendum2 ? 'w-[110px]' : 'w-[140px]'} flex items-center gap-1 text-lightBlue`}
									onClick={() => {
										handleSortByClick({
											key: orderBy.balanceIsAsc ? votesSortValues.BALANCE_ASC : votesSortValues.BALANCE_DESC
										});
										setOrderBy((prev) => ({ ...sortedCheck, balanceIsAsc: !prev.balanceIsAsc }));
									}}
								>
									Amount
									<ExpandIcon className={orderBy.balanceIsAsc ? 'rotate-180' : ''} />
								</div>
								{network !== AllNetworks.COLLECTIVES ? (
									<div
										className={`${isReferendum2 ? 'w-[110px]' : 'w-[150px]'} flex items-center gap-1 text-lightBlue`}
										onClick={() => {
											handleSortByClick({
												key: orderBy.convictionIsAsc ? votesSortValues.CONVICTION_ASC : votesSortValues.CONVICTION_DESC
											});
											setOrderBy((prev) => ({ ...sortedCheck, convictionIsAsc: !prev.convictionIsAsc }));
										}}
									>
										Conviction
										<ExpandIcon className={orderBy.convictionIsAsc ? 'rotate-180' : ''} />
									</div>
								) : null}
								{isReferendum2 && (
									<div
										className='flex w-[110px] items-center gap-1 text-lightBlue'
										onClick={() => {
											handleSortByClick({
												key: orderBy.votingIsAsc ? votesSortValues.VOTING_POWER_ASC : votesSortValues.VOTING_POWER_DESC
											});
											setOrderBy((prev) => ({ ...sortedCheck, votingIsAsc: !prev.votingIsAsc }));
										}}
									>
										Voting Power
										<ExpandIcon className={orderBy.votingIsAsc ? 'rotate-180' : ''} />
									</div>
								)}
							</div>

							{votesRes && decision && !!votesRes?.votes?.length ? (
								votesRes?.votes.map((voteData: any, index: number) => (
									<VoterRow
										className={`${index % 2 == 0 ? 'bg-[#FBFBFC]' : 'bg-white'} ${index === votesRes?.votes.length - 1 ? 'border-b' : ''}`}
										key={index}
										voteType={voteType}
										voteData={voteData}
										index={index}
										isReferendum2={isReferendum2}
										setDelegationVoteModal={() => {}}
									/>
								))
							) : (
								<PostEmptyState />
							)}
						</div>

						<div className='z-10 flex items-center justify-between bg-white pt-6'>
							<Pagination
								size='small'
								defaultCurrent={1}
								current={currentPage}
								onChange={setCurrentPage}
								total={votesRes && decision ? votesRes?.count || 0 : 0}
								showSizeChanger={false}
								pageSize={VOTES_LISTING_LIMIT}
								responsive={true}
								hideOnSinglePage={true}
								nextIcon={
									<div className={`ml-1 ${currentPage > Math.floor((votesRes && decision ? votesRes?.count || 0 : 0) / VOTES_LISTING_LIMIT) ? 'text-grey_secondary' : ''}`}>
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
					</div>
				</div>
			</Spin>
		</div>
	);
};

export default React.memo(DelegationVotersList);
