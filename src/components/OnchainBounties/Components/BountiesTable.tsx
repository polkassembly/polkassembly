// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useEffect, useState } from 'react';
import { Progress, Spin } from 'antd';
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
import { IChildBountiesResponse } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ImageIcon from '~src/ui-components/ImageIcon';
import dayjs from 'dayjs';
interface DataType {
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
	const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
	const [loadingChildBounties, setLoadingChildBounties] = useState<{ [key: string]: boolean }>({});
	const [bounties, setBounties] = useState<DataType[]>(props.bounties);
	useEffect(() => {
		setBounties(props.bounties);
	}, [props.bounties]);
	const handleRowClick = (record: DataType) => {
		router.push(`/bounty/${record.index}`);
	};
	const handleExpand = async (expanded: boolean, record: DataType) => {
		const newExpandedRowKeys = expanded ? [...expandedRowKeys, record.index] : expandedRowKeys.filter((key) => key !== record.index);

		setExpandedRowKeys(newExpandedRowKeys);

		if (expanded && (!record.childbounties || record.childbounties.length === 0)) {
			setLoadingChildBounties((prevState) => ({ ...prevState, [record.index]: true }));

			try {
				const { data, error } = await nextApiClientFetch<IChildBountiesResponse>('/api/v1/child_bounties/getAllChildBounties', {
					parentBountyIndex: record.index
				});
				if (error) {
					console.error('Error fetching child bounties:', error);
					setLoadingChildBounties((prevState) => ({ ...prevState, [record.index]: false }));
					return;
				}
				setBounties((prevBounties) => {
					const updatedBounties = prevBounties.map((bounty) => (bounty.index === record.index ? { ...bounty, childbounties: data?.child_bounties || [] } : bounty));
					return updatedBounties;
				});
			} catch (err) {
				console.error('An unexpected error occurred:', err);
			} finally {
				setLoadingChildBounties((prevState) => ({ ...prevState, [record.index]: false }));
			}
		}
	};

	const columns: TableColumnsType<DataType> = [
		{
			dataIndex: 'index',
			key: 'index',
			render: (index: number) => (index ? index : '-'),
			title: '#',
			width: 160
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
			title: 'Curator',
			width: 200
		},
		{
			dataIndex: 'title',
			key: 'title',
			render: (title: string) => {
				const maxLength = 22;
				const truncatedTitle = title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
				return title ? truncatedTitle : '-';
			},
			title: 'Title',
			width: 300
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
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (createdAt: string) => {
				const relativeCreatedAt = createdAt
					? dayjs(createdAt).isBefore(dayjs().subtract(1, 'w'))
						? dayjs(createdAt).format("Do MMM 'YY")
						: dayjs(createdAt).startOf('day').fromNow()
					: null;

				return (
					<>
						{relativeCreatedAt ? (
							<span>
								<ClockCircleOutlined /> {relativeCreatedAt}
							</span>
						) : (
							'-'
						)}
					</>
				);
			},
			title: 'Date',
			width: 340
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
							rowKey={(record) => record.index}
							columns={columns}
							onRow={(record) => ({
								onClick: () => handleRowClick(record)
							})}
							scroll={{ x: 1000 }}
							expandable={{
								expandIcon: ({ expanded, onExpand, record }) =>
									record.totalChildBountiesCount > 0 ? (
										expanded ? (
											<CaretUpOutlined
												className=' text-[#E5007A]'
												onClick={(e) => {
													e.stopPropagation();
													onExpand(record, e);
												}}
											/>
										) : (
											<Popover
												content='Expand to view Child Bounties'
												placement='top'
												trigger='hover'
											>
												<CaretDownOutlined
													onClick={(e) => {
														e.stopPropagation();
														onExpand(record, e);
													}}
												/>
											</Popover>
										)
									) : null,
								expandedRowKeys,
								expandedRowRender: (record) => (
									<div className='m-0 p-0'>
										{record.totalChildBountiesCount && record.totalChildBountiesCount > 0 ? (
											<div>
												{loadingChildBounties[record.index] ? (
													<div className='my-1 flex justify-center'>
														<Spin />
													</div>
												) : record?.childbounties?.length > 0 ? (
													<div className=''>
														{record.childbounties.map((childBounty: any, index: number) => (
															<div
																key={childBounty.index}
																className=' flex items-center justify-between border-[1px] border-y border-solid border-[#D2D8E0] px-4  py-2 pb-4'
															>
																{index === record.childbounties.length - 1 ? (
																	<ImageIcon
																		src='/assets/childlevel0.svg'
																		className='-mt-5 h-5 w-5'
																		alt='Last child level'
																	/>
																) : (
																	<ImageIcon
																		src='/assets/childlevel1.svg'
																		className='-mt-5 h-5 w-5'
																		alt='Child level'
																	/>
																)}

																<div className='ml-4 mt-5 w-1/4 dark:text-black'>{childBounty.index}</div>
																<div className='mt-5 w-1/4 dark:text-black'>-</div>
																<div className='mt-5 w-1/4 dark:text-black'>{childBounty.title.length > 15 ? `${childBounty.title.slice(0, 15)}...` : childBounty.title}</div>
																<div className='mt-5 w-1/4 dark:text-black'>-</div>
																<div className='mt-5 w-1/4 dark:text-black'>
																	{formatedBalance(childBounty.reward, unit, 0)} {chainProperties?.[network]?.tokenSymbol}
																</div>
																<div className=' mt-5 w-1/4 dark:text-black'>-</div>
																<div className='mt-5 w-1/4 '>{childBounty.status ? <StatusTag status={childBounty.status} /> : '-'}</div>
															</div>
														))}
													</div>
												) : (
													<p className='pl-4 pt-4'>No child bounties available.</p>
												)}
											</div>
										) : (
											<p>No child bounties available.</p>
										)}
									</div>
								),
								onExpand: (expanded, record) => handleExpand(expanded, record),
								rowExpandable: (record) => record.totalChildBountiesCount > 0
							}}
							dataSource={bounties}
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
	.ant-table-thead .ant-table-cell {
		background-color: ${(props) => (props.themeMode == 'dark' ? '#1b1d1f' : '#f9fcfb')} !important;
		border-width: 1px 0px 1px 0px;
		border-style: solid;
		border-color: #d2d8e0;
	}

	.ant-table-wrapper .hover-row:hover {
		transform: scale(1.009);
		cursor: pointer;
		transition: transform 0.2s ease-in-out;
	}

	.ant-table .ant-table-tbody .ant-table-expanded-row.ant-table-expanded-row-level-1 td {
		background-color: #fcebf5 !important;
	}

	.ant-table-expanded-row.ant-table-expanded-row-level-1 .ant-table-cell {
		padding-left: 0px !important;
		padding-right: 0px !important;
		padding-bottom: 0px !important;
		padding-top: 0px !important;
	}

	.ant-table-wrapper .ant-table-tbody > tr > td {
		color: ${(props) => (props.themeMode == 'dark' ? 'white' : 'black')};
	}
`;
export default BountiesTable;
