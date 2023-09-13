// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import {
	LeftOutlined,
	RightOutlined
} from '@ant-design/icons';
import { LoadingOutlined } from '@ant-design/icons';
import { Pagination, PaginationProps, Spin } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { LoadingStatusType } from 'src/types';
import { useNetworkContext, usePostDataContext } from '~src/context';
import { ProposalType, VoteType } from '~src/global/proposalType';
import { PostEmptyState } from '~src/ui-components/UIStates';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { network as AllNetworks } from '~src/global/networkConstants';
import VoterRow from './VoterRow';

interface IVotersListProps {
  className?: string;
  referendumId: number;
  voteType: VoteType;
  thresholdData?: any;
  voter:string,
  decision:DecisionType
}

interface IDelegationList {
    count: number;
	votes: any[];
}

type DecisionType = 'yes' | 'no' | 'abstain';

const VOTES_LISTING_LIMIT = 10;

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

	useEffect(() => {
		setLoadingStatus({
			isLoading: true,
			message: 'Loading votes'
		});
		const url = `api/v1/votes/delegationVoteList?listingLimit=${VOTES_LISTING_LIMIT}&postId=${referendumId}&page=${currentPage}&decision=${decision ||'yes'}&type=${voteType}&voter=${voter}`;
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
	}, [referendumId, currentPage, voteType, decision, voter]);

	const onChange: PaginationProps['onChange'] = (page) => {
		setCurrentPage(page);
	};
	return (
		<div>
			<Spin
				className={className}
				spinning={loadingStatus.isLoading}
				indicator={<LoadingOutlined />}
			>
				<div className='flex gap-6'>
					<div className='md:overflow-visible overflow-x-auto'>
						<div className='flex flex-col text-xs px-0 text-sidebarBlue overflow-x-auto'>
							<div className='flex text-xs items-center font-semibold mb-2 px-2 w-[552px]'>
								<div
									className={`${
										isReferendum2 ? 'w-[190px]' : 'w-[250px]'
									} text-lightBlue text-sm font-medium`}
								>
                                    Voter
								</div>
								<div
									className={`${
										isReferendum2 ? 'w-[110px]' : 'w-[140px]'
									} flex items-center gap-1 text-lightBlue`}
								>
                                    Amount
								</div>
								{network !== AllNetworks.COLLECTIVES ? (
									<div
										className={`${
											isReferendum2 ? 'w-[110px]' : 'w-[150px]'
										} flex items-center gap-1 text-lightBlue`}
									>
                                        Conviction
									</div>
								) : null}
								{isReferendum2 && (
									<div
										className='w-[110px] flex items-center gap-1 text-lightBlue'
									>
                                        Voting Power
									</div>
								)}
							</div>

							{votesRes && decision && !!votesRes?.votes?.length ? (
								votesRes?.votes.map(
									(voteData: any, index: number) => (
										<VoterRow
											className={`${
												index % 2 == 0 ? 'bg-[#FBFBFC]' : 'bg-white'
											} ${
												index === votesRes?.votes.length - 1
													? 'border-b'
													: ''
											}`}
											key={index}
											voteType={voteType}
											voteData={voteData}
											index={index}
											isReferendum2={isReferendum2}
											setDelegationVoteModal={() => {}}
										/>
									)
								)
							) : (
								<PostEmptyState />
							)}
						</div>

						<div className='flex justify-between items-center pt-6 bg-white z-10'>
							<Pagination
								size='small'
								defaultCurrent={1}
								current={currentPage}
								onChange={onChange}
								total={
									votesRes && decision ? votesRes?.count || 0 : 0
								}
								showSizeChanger={false}
								pageSize={VOTES_LISTING_LIMIT}
								responsive={true}
								hideOnSinglePage={true}
								nextIcon={
									<div
										className={`ml-1 ${
											currentPage > Math.floor((votesRes && decision? votesRes?.count || 0 : 0) / VOTES_LISTING_LIMIT)
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
				</div>
			</Spin>
		</div>

	);
};

export default React.memo(DelegationVotersList);
