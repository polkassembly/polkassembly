// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState } from 'react';
import { Progress } from 'antd';
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
import { useRouter } from 'next/navigation';
import Table from '~src/basic-components/Tables/Table';
import { useTheme } from 'next-themes';
interface DataType {
	key: React.Key;
	index: number;
	curator: string;
	title: string;
	reward: string;
	claimed: number;
	date: string;
	status: string;
	categories: string[];
	totalChildBountiesCount?: number;
	children?: DataType;
	childbounties?: any;
}

interface OnchainBountiesProps {
	bounties: DataType[];
	loading: boolean;
	totalBountiesCount: number;
	onPaginationChange: (page: number) => void;
	currentPage: number;
}

const BountiesTable: FC<OnchainBountiesProps> = (props) => {
	const { resolvedTheme: theme = 'light' } = useTheme();
	const router = useRouter();
	const { network } = useNetworkSelector();
	const unit = chainProperties?.[network]?.tokenSymbol;
	const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

	const handleRowClick = (record: DataType) => {
		router.push(`/bounty/${record.index}`);
	};
	const handleExpand = (expanded: boolean, record: DataType) => {
		// Ensure only one row is expanded at a time
		const newExpandedRowKeys = expanded ? [record.key] : [];
		setExpandedRowKeys(newExpandedRowKeys);
	};

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
			render: (title: string) => {
				const maxLength = 22;
				const truncatedTitle = title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
				return title ? truncatedTitle : '-';
			},
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
			render: (categories: string[]) => {
				const maxLength = 15;
				let firstCategory = '';
				let secondCategory = '';
				let remainingCategoriesCount = 0;

				if (categories.length > 0) {
					firstCategory = categories[0];

					if (categories.length > 1) {
						secondCategory = categories[1];
					}

					const totalLength = firstCategory.length + secondCategory.length;

					if (totalLength > maxLength) {
						remainingCategoriesCount = categories.length - 1;
					} else {
						remainingCategoriesCount = categories.length - 2;
					}
				}

				return (
					<div style={{ display: 'flex', gap: '5px' }}>
						{firstCategory && <span className='rounded-full bg-[#dfd5ff] px-3 py-1 text-[12px] text-[#4800ff]'>{firstCategory}</span>}
						{secondCategory && remainingCategoriesCount === 0 && <span className='rounded-full bg-[#EFEFEF] px-3 py-1 text-[12px] text-[#4800ff]'>{secondCategory}</span>}
						{remainingCategoriesCount > 0 && <span className='rounded-full bg-[#dfd5ff] px-3 py-1 text-[12px] text-[#485F7D]'>+{remainingCategoriesCount}</span>}
					</div>
				);
			},
			title: 'Categories'
		},

		{
			dataIndex: 'children',
			key: '',
			render: (date: string) =>
				date ? (
					<span>
						<ClockCircleOutlined /> {date}
					</span>
				) : (
					'-'
				),
			title: 'Date'
		}
	];
	const handlePageChange = (page: number) => {
		props.onPaginationChange(page);
	};

	return (
		<StyledTableContainer themeMode={theme}>
			<div>
				{props.loading ? (
					<div className='flex min-h-[200px]  items-center justify-center rounded-lg bg-white px-5 dark:bg-[#141414]'>
						<Skeleton active />
					</div>
				) : (
					<>
						<Table
							theme={theme}
							columns={columns}
							onRow={(record) => ({
								onClick: () => handleRowClick(record)
							})}
							rowClassName={(record) => (record.childbounties ? 'parent-row' : 'no-children') + ' hover-row'}
							expandable={{
								expandIcon: ({ expanded, onExpand, record }) =>
									record.totalChildBountiesCount > 0 ? (
										expanded ? (
											<CaretUpOutlined
												className='pr-3 text-[#E5007A]'
												onClick={(e) => {
													e.stopPropagation();
													onExpand(record, e);
												}}
											/>
										) : (
											<Popover
												content='Expand to view child bounties'
												placement='top'
											>
												<CaretDownOutlined
													className='pr-3'
													onClick={(e) => {
														e.stopPropagation();
														onExpand(record, e);
													}}
												/>
											</Popover>
										)
									) : null,
								expandedRowKeys: expandedRowKeys,
								expandedRowRender: (record) => (
									<div>
										{record.childbounties && record.childbounties.length > 0 ? (
											<div>
												{record.childbounties.map((childBounty: any) => {
													const maxLength = 22;
													const truncatedTitle = childBounty.title.length > maxLength ? `${childBounty.title.substring(0, maxLength)}...` : childBounty.title;
													const childbountytitle = childBounty.title ? truncatedTitle : '-';
													return (
														<div
															className='flex justify-between'
															key={childBounty.index}
														>
															<p>{childBounty.index}</p>
															<p>{childbountytitle}</p>
															<p>{childBounty.reward}</p>
															<p>{childBounty.status}</p>
														</div>
													);
												})}
											</div>
										) : (
											<p>No child bounties available.</p>
										)}
									</div>
								),
								onExpand: handleExpand
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
									theme={theme}
								/>
							)}
						</div>
					</>
				)}
			</div>
		</StyledTableContainer>
	);
};

const StyledTableContainer = styled.div<{ themeMode: string }>`
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
	.ant-table-wrapper .hover-row:hover {
		transform: scale(1.009);
		cursor: pointer;
		transition: transform 0.2s ease-in-out;
	}

	.ant-table-wrapper .ant-table-tbody > tr > td {
		color: ${(props) => (props.themeMode == 'dark' ? 'white' : 'black')};
	}
`;

export default BountiesTable;
