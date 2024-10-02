// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { Table, Progress } from 'antd';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Popover from '~src/basic-components/Popover';
import Address from '~src/ui-components/Address';
import StatusTag from '~src/ui-components/StatusTag';
import { useNetworkSelector } from '~src/redux/selectors';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import Skeleton from '~src/basic-components/Skeleton';
import { Pagination } from '~src/ui-components/Pagination';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';

interface DataType {
	key: React.Key;
	id: number;
	curator: string;
	title: string;
	reward: string;
	claimed: number;
	date: string;
	status: string;
	categories: string[];
	children?: DataType;
}

interface OnchainBountiesProps {
	bounties: DataType[];
	loading: boolean;
	totalBountiesCount: number;
	onPaginationChange: (page: number) => void;
	currentPage: number;
}

const BountiesTable: FC<OnchainBountiesProps> = (props) => {
	const { network } = useNetworkSelector();
	const unit = chainProperties?.[network]?.tokenSymbol;

	const columns: TableColumnsType<DataType> = [
		{
			dataIndex: 'index',
			key: 'index',
			render: (index: number) => (index ? index : '-'),
			title: '#'
		},
		{
			dataIndex: 'curator',
			key: 'curator',
			render: (curator: string) => (
				<div>
					{curator ? (
						<Address
							iconSize={22}
							address={curator}
							displayInline
							isTruncateUsername={false}
							disableTooltip
						/>
					) : (
						'-'
					)}
				</div>
			),
			title: 'Curator'
		},
		{
			dataIndex: 'title',
			key: 'title',
			render: (title: string) => (title ? title : '-'),
			title: 'Title'
		},
		{
			dataIndex: 'reward',

			key: 'reward',
			render: (reward: string) =>
				reward ? (
					<>
						{formatedBalance(reward, unit, 0)} {chainProperties?.[network]?.tokenSymbol}
					</>
				) : (
					'-'
				),
			title: 'Amount'
		},
		{
			dataIndex: 'claimedAmount',
			key: 'claimed',
			render: (claimed: number, record: DataType) => {
				const reward = parseFloat(record.reward);
				const claimedPercentage = reward ? (claimed / reward) * 100 : 0;

				return (
					<div style={{ alignItems: 'center', display: 'flex' }}>
						{claimed !== undefined && reward ? (
							<>
								<Progress
									type='circle'
									percent={claimedPercentage}
									width={25}
									showInfo={false}
									strokeColor='#ffc500'
								/>
								<span style={{ marginLeft: '8px' }}>{claimedPercentage.toFixed(1)}%</span>
							</>
						) : (
							'-'
						)}
					</div>
				);
			},
			title: 'Claimed'
		},
		{
			dataIndex: 'date',
			key: 'date',
			render: (date: string) =>
				date ? (
					<span>
						<ClockCircleOutlined /> {date}
					</span>
				) : (
					'-'
				),
			title: 'Date'
		},

		{
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => <div>{status ? <StatusTag status={status} /> : '-'}</div>,
			title: 'Status'
		},
		{
			dataIndex: 'categories',
			key: 'categories',
			render: (categories: string[]) => (
				<div style={{ display: 'flex', gap: '8px' }}>
					{categories && categories.length > 0
						? categories.map((category, index) => (
								<span
									key={index}
									className='rounded-full bg-[#FF6C1A] bg-opacity-[24%] px-4 py-2'
								>
									{category}
								</span>
						  ))
						: '-'}
				</div>
			),
			title: 'Categories'
		}
	];
	const handlePageChange = (page: number) => {
		props.onPaginationChange(page);
	};

	return (
		<StyledTableContainer>
			<div>
				{props.loading ? (
					<div className='flex min-h-[200px]  items-center justify-center rounded-lg bg-white px-5 dark:bg-[#141414]'>
						<Skeleton active />
					</div>
				) : (
					<>
						<Table<DataType>
							columns={columns}
							rowClassName={`${(record: DataType) => (record.children ? 'parent-row' : 'no-children')} `}
							expandable={{
								expandIcon: ({ expanded, onExpand, record }) =>
									record.children ? (
										expanded ? (
											<CaretUpOutlined
												className='pr-3 text-[#E5007A]'
												onClick={(e) => onExpand(record, e)}
											/>
										) : (
											<Popover
												content='Expand to view this'
												placement='top'
												arrow={true}
											>
												<CaretDownOutlined
													className='pr-3'
													onClick={(e) => onExpand(record, e)}
												/>
											</Popover>
										)
									) : null,
								rowExpandable: (record) => !!record.children
							}}
							dataSource={props.bounties}
							pagination={false}
						/>
						<div className='mb-5 mt-3 flex justify-end'>
							{props?.totalBountiesCount > 0 && props?.totalBountiesCount > VOTES_LISTING_LIMIT && (
								<Pagination
									current={props.currentPage}
									pageSize={VOTES_LISTING_LIMIT}
									total={props?.totalBountiesCount}
									showSizeChanger={false}
									hideOnSinglePage={true}
									onChange={handlePageChange}
									responsive={true}
								/>
							)}
						</div>
					</>
				)}
			</div>
		</StyledTableContainer>
	);
};

const StyledTableContainer = styled.div`
	.ant-table-wrapper .ant-table-thead > tr > th {
		border-width: 1px 0px 1px 0px;
		border-style: solid;
		border-color: #d2d8e0;
		padding-left: 35px;
	}

	/* Default padding for all rows without children */
	.ant-table-wrapper .ant-table-tbody > tr.no-children > td:first-child {
		padding-left: 45px;
	}

	/* Padding for parent rows that have children */
	.ant-table-wrapper .ant-table-tbody > tr.parent-row > td:first-child {
		padding-left: 20px;
	}

	/* Padding for expanded child rows */
	.ant-table-wrapper .ant-table-tbody > tr.ant-table-expanded-row > td:first-child {
		padding-left: 25px !important;
	}
`;

export default BountiesTable;
