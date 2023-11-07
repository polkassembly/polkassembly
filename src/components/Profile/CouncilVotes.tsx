// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DislikeFilled, LeftOutlined, LikeFilled, LoadingOutlined, RightOutlined } from '@ant-design/icons';
import { PaginationProps, Spin, Table as AntdTable } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { IVoteHistory, IVotesHistoryResponse } from 'pages/api/v1/votes/history';
import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import { getFirestoreProposalType, getSinglePostLinkFromProposalType } from '~src/global/proposalType';
import { useNetworkSelector } from '~src/redux/selectors';
import { Pagination } from '~src/ui-components/Pagination';

import { ErrorState, PostEmptyState } from '~src/ui-components/UIStates';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { getBlockLink } from '~src/util/subscanCheck';

interface ICouncilVotesProps {
	address: string;
	className?: string;
}

const Table: any = styled(AntdTable)`
	.ant-table-thead > tr > th {
		background: ${(props) => (props.theme === 'dark' ? '#1C1D1F' : '#fafafa')} !important;
		color: ${(props) => (props.theme === 'dark' ? 'white' : 'black')} !important;
		font-weight: 500 !important;
		border-bottom: ${(props) => (props.theme === 'dark' ? '1px solid #323232' : '')} !important;
	}
	.ant-table-thead > tr > th::before {
		background: none !important;
	}
	.ant-table-tbody > tr {
		background-color: ${(props) => (props.theme === 'dark' ? '#0D0D0D' : 'white')} !important;
	}
	.ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before,
	.ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before {
		background-color: none !important;
	}
	td {
		background: ${(props) => (props.theme === 'dark' ? '#0D0D0D' : 'white')} !important;
		border-bottom: ${(props) => (props.theme === 'dark' ? '1px solid #323232' : '')} !important;
	}
`;

const CouncilVotes: FC<ICouncilVotesProps> = (props) => {
	const { className, address } = props;
	const { network } = useNetworkSelector();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [votesHistory, setVotesHistory] = useState<IVoteHistory[]>([]);
	const [count, setCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const { resolvedTheme: theme } = useTheme();

	const url = getBlockLink(network);

	const columns: ColumnsType<any> = [
		{
			dataIndex: 'index',
			key: 'index',
			render: (index, obj) => {
				return (
					<Link href={`/${getSinglePostLinkFromProposalType(getFirestoreProposalType(obj.proposalType) as any)}/${index}`}>
						<div className='text-sidebarBlue'>
							{obj.type} #{index}
						</div>
					</Link>
				);
			},
			title: 'Proposals'
		},
		{
			dataIndex: 'blockNumber',
			key: 'block',
			render: (block) => (
				<a
					target='_blank'
					href={`${url}${block}`}
					rel='noreferrer'
				>
					<div className='text-sidebarBlue'>#{block}</div>
				</a>
			),
			title: 'Block'
		},
		{
			dataIndex: 'decision',
			key: 'decision',
			render: (decision) => (
				<>
					{decision === 'yes' ? (
						<div className='flex items-center'>
							<LikeFilled className='text-green_primary' /> <span className='ml-2 text-green_primary'>Aye</span>
						</div>
					) : (
						<div className='flex items-center'>
							<DislikeFilled className='text-red_primary' /> <span className='ml-2 text-red_primary'>Nay</span>
						</div>
					)}
				</>
			),
			title: 'Vote'
		}
	];

	useEffect(() => {
		setLoading(true);
		nextApiClientFetch<IVotesHistoryResponse>(`api/v1/votes/history?page=${currentPage}&voterAddress=${address}`)
			.then((res) => {
				if (res.error) {
					setError(res.error);
				} else {
					setVotesHistory(res.data?.votes || []);
					setCount(res.data?.count || 0);
				}
				setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				setLoading(false);
			});
	}, [currentPage, address]);

	const onChange: PaginationProps['onChange'] = (page) => {
		setCurrentPage(page);
	};
	console.log(votesHistory);
	return (
		<div className={`${className}`}>
			{error ? <ErrorState errorMessage={error} /> : null}
			<Spin
				spinning={loading}
				indicator={<LoadingOutlined />}
			>
				{votesHistory.length > 0 ? (
					<div>
						<Table
							theme={theme}
							dataSource={votesHistory}
							columns={columns}
							pagination={false}
						/>
						<div className='z-10 mt-6 flex justify-end bg-white dark:bg-section-dark-overlay'>
							<Pagination
								size='small'
								defaultCurrent={1}
								current={currentPage}
								onChange={onChange}
								total={count}
								showSizeChanger={false}
								pageSize={VOTES_LISTING_LIMIT}
								responsive={true}
								hideOnSinglePage={true}
								nextIcon={
									<div className={`ml-1 ${currentPage > Math.floor((count || 0) / VOTES_LISTING_LIMIT) ? 'text-grey_secondary' : ''}`}>
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
				) : (
					<PostEmptyState />
				)}
			</Spin>
		</div>
	);
};

export default styled(CouncilVotes)`
	th {
		color: var(--navBlue) !important;
	}
`;
