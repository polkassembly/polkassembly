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
import { Pagination, PaginationProps, Segmented, Spin } from 'antd';
import { IVotesResponse } from 'pages/api/v1/votes';
import React, { FC, useEffect, useRef, useState } from 'react';
import { LoadingStatusType } from 'src/types';
import { useNetworkContext, usePostDataContext } from '~src/context';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import { ProposalType, VoteType } from '~src/global/proposalType';
import { votesSortValues } from '~src/global/sortOptions';
import { PostEmptyState } from '~src/ui-components/UIStates';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { network as AllNetworks } from '~src/global/networkConstants';
import styled from 'styled-components';
import VoterRow from './VoterRow';
import ExpandIcon from '~assets/icons/expand-small-icon.svg';

const StyledSegmented = styled(Segmented)`
  .ant-segmented-group > label {
    border-radius: 20px !important;
  }
`;

interface IVotersListProps {
  className?: string;
  referendumId: number;
  voteType: VoteType;
}

type DecisionType = 'yes' | 'no' | 'abstain';

const VotersList: FC<IVotersListProps> = (props) => {
	const { network } = useNetworkContext();
	const firstRef = useRef(true);
	const { postData:{ postType } }= usePostDataContext();
	const isReferendum2 = postType === ProposalType.REFERENDUM_V2;
	const { className, referendumId, voteType } = props;

	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({
		isLoading: true,
		message: 'Loading votes'
	});
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [decision, setDecision] = useState<DecisionType>();
	const [votesRes, setVotesRes] = useState<IVotesResponse>();
	const [sortBy, setSortBy] = useState<string>(votesSortValues.TIME_DESC);
	const [balanceIsAsc, setBalanceIsAsc] = useState<boolean>(false);
	const [votingIsAsc, setVotingIsAsc] = useState<boolean>(false);
	const [convictionIsAsc, setConvictionIsAsc] = useState<boolean>(false);

	useEffect(() => {
		setLoadingStatus({
			isLoading: true,
			message: 'Loading votes'
		});
		nextApiClientFetch<IVotesResponse>(
			`api/v1/votes?listingLimit=${VOTES_LISTING_LIMIT}&postId=${referendumId}&voteType=${voteType}&page=${currentPage}&sortBy=${sortBy}`
		)
			.then((res) => {
				if (res.error) {
					console.log(res.error);
				} else {
					const votesRes = res.data;
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
	}, [referendumId, currentPage, voteType, sortBy]);

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
		<>
			<Spin
				className={className}
				spinning={loadingStatus.isLoading}
				indicator={<LoadingOutlined />}
			>
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

				<div className='flex flex-col text-xs px-0 text-sidebarBlue overflow-x-auto'>
					<div className='flex text-xs items-center font-semibold mb-2 px-2 w-[552px]'>
						<div className={`${isReferendum2 ? 'w-[220px]' : 'w-[250px]'} text-lightBlue text-sm font-medium`}>
							Voter
						</div>
						<div
							className={`${isReferendum2 ? 'w-[110px]' : 'w-[140px]'} flex items-center gap-1 text-lightBlue`}
							onClick={() => {
								handleSortByClick({
									key: balanceIsAsc
										? votesSortValues.BALANCE_ASC
										: votesSortValues.BALANCE_DESC
								});
								setBalanceIsAsc(!balanceIsAsc);
							}}
						>
							Amount <ExpandIcon className={balanceIsAsc ? 'rotate-180':''}/>
						</div>
						{network !== AllNetworks.COLLECTIVES ? (
							<div
								className={`${isReferendum2 ? 'w-[120px]' : 'w-[150px]'} flex items-center gap-1 text-lightBlue`}
								onClick={() => {
									handleSortByClick({
										key: convictionIsAsc
											? votesSortValues.CONVICTION_ASC
											: votesSortValues.CONVICTION_DESC
									});
									setConvictionIsAsc(!convictionIsAsc);
								}}
							>
								Conviction <ExpandIcon className={convictionIsAsc ? 'rotate-180':''} />
							</div>
						) : null}
						{ isReferendum2 &&
							<div className='w-[110px] flex items-center gap-1 text-lightBlue' onClick={() => {
								handleSortByClick({
									key: votingIsAsc
										? votesSortValues.VOTING_POWER_ASC
										: votesSortValues.VOTING_POWER_DESC
								});
								setVotingIsAsc(!votingIsAsc);
							}}>
								Voting Power <ExpandIcon className={ votingIsAsc ? 'rotate-180':''} />
							</div>
						}
					</div>

					{votesRes && decision && !!votesRes[decision]?.votes?.length ? (
						votesRes[decision]?.votes.map((voteData: any, index: number) => (
							<VoterRow
								className={`${index % 2 == 0 ? 'bg-[#FBFBFC]' : 'bg-white'} ${
									index === votesRes[decision]?.votes.length - 1
										? 'border-b'
										: ''
								}`}
								key={index}
								voteType={voteType}
								voteData={voteData}
								index={index}
								isReferendum2={isReferendum2}
							/>
						))
					) : (
						<PostEmptyState />
					)}
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
						total={votesRes && decision ? votesRes[decision]?.count || 0 : 0}
						showSizeChanger={false}
						pageSize={VOTES_LISTING_LIMIT}
						responsive={true}
						hideOnSinglePage={true}
						nextIcon={
							<div
								className={`ml-1 ${
									currentPage >
                  Math.floor( (votesRes && decision ? votesRes[decision]?.count || 0 : 0) / VOTES_LISTING_LIMIT
                  )
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
			</Spin>
		</>
	);
};

export default VotersList;
