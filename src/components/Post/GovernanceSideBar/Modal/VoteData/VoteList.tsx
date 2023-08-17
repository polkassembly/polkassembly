// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import {
	DislikeFilled,
	LeftOutlined,
	LikeFilled,
	MinusCircleFilled,
	RightOutlined,
	SwapOutlined
} from '@ant-design/icons';
import { LoadingOutlined } from '@ant-design/icons';
import { Dropdown, Pagination, PaginationProps, Segmented, Spin } from 'antd';
import { IVotesResponse } from 'pages/api/v1/votes';
import React, { FC, useEffect, useRef, useState } from 'react';
import { LoadingStatusType } from 'src/types';
import { useNetworkContext } from '~src/context';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import { VoteType } from '~src/global/proposalType';
import { votesSortOptions, votesSortValues } from '~src/global/sortOptions';
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

	const { className, referendumId, voteType } = props;

	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({
		isLoading: true,
		message: 'Loading votes'
	});
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [decision, setDecision] = useState<DecisionType>();
	const [votesRes, setVotesRes] = useState<IVotesResponse>();
	const [sortBy, setSortBy] = useState<string>(votesSortValues.TIME);

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
				<div className='flex items-center justify-center'>
					<LikeFilled className='mr-1.5' /> <span>Ayes</span>
				</div>
			),
			value: 'yes'
		},
		{
			label: (
				<div className='flex items-center justify-center'>
					<DislikeFilled className='mr-1.5' /> <span>Nays</span>
				</div>
			),
			value: 'no'
		}
	];

	if (voteType === VoteType.REFERENDUM_V2) {
		decisionOptions.push({
			label: (
				<div className='flex items-center justify-center'>
					<MinusCircleFilled className='mr-1.5' /> <span>Abstain</span>
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
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const sortByDropdown = (
		<Dropdown
			menu={{
				defaultSelectedKeys: [votesSortValues.TIME],
				items: [...votesSortOptions],
				onClick: handleSortByClick,
				selectable: true
			}}
			trigger={['click']}
		>
			<div className='dropdown-div flex items-center cursor-pointer hover:text-pink_primary py-1 px-2 rounded'>
				<span className='mr-2'>Sort By</span>
				<SwapOutlined rotate={90} style={{ fontSize: '14px' }} />
			</div>
		</Dropdown>
	);
	return (
		<>
			<Spin
				className={className}
				spinning={loadingStatus.isLoading}
				indicator={<LoadingOutlined />}
			>
				{/* <div className='flex justify-between mb-6 bg-white z-10'>
					<h6 className='dashboard-heading'>Votes</h6>
					<div>{sortByDropdown}</div>
				</div> */}

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

				<div className='flex flex-col text-xs xl:text-sm xl:max-h-screen px-0 text-sidebarBlue'>
					<div className='flex text-xs items-center gap-10 font-semibold mb-2 px-2'>
						<div className='basis-36 text-lightBlue text-sm font-medium'>
              Voter
						</div>
						<div
							className='basis-20 ml-1 flex items-center gap-1 text-lightBlue'
							onClick={() => handleSortByClick({ key: votesSortValues.BALANCE })}
						>
              Amount <ExpandIcon />
						</div>
						{network !== AllNetworks.COLLECTIVES ? (
							<div
								className='basis-20 ml-1 flex items-center gap-1 text-lightBlue'
								onClick={() =>
									handleSortByClick({ key: votesSortValues.CONVICTION })
								}
							>
                Conviction <ExpandIcon />
							</div>
						) : null}
						<div className='basis-10 flex items-center gap-1 text-lightBlue'>
              Capital <ExpandIcon />
						</div>
					</div>

					{votesRes && decision && !!votesRes[decision]?.votes?.length ? (
						votesRes[decision]?.votes.map((voteData: any, index: number) => (
							<VoterRow
								key={index}
								voteType={voteType}
								voteData={voteData}
								index={index}
							/>
						))
					) : (
						<PostEmptyState />
					)}
				</div>

				<div className='flex justify-center pt-6 bg-white z-10'>
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
									currentPage > Math.floor((votesRes && decision ? votesRes[decision]?.count || 0 : 0) / VOTES_LISTING_LIMIT)
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
