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
import { useRouter } from 'next/router';
import Table from '~src/basic-components/Tables/Table';
import { useTheme } from 'next-themes';
import { IChildBountiesResponse } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ImageIcon from '~src/ui-components/ImageIcon';
import dayjs from 'dayjs';

interface IChildBounty {
	index: number;
	title: string;
	curator: string;
	createdAt: string;
	reward: string;
	status: string;
}

export interface IBountyListing {
	index: number;
	curator: string;
	title: string;
	reward: string;
	claimed: number;
	date: string;
	status: string;
	categories: string[];
	totalChildBountiesCount?: number;
	children?: IBountyListing;
	childbounties?: IChildBounty[];
}

interface IOnchainBountiesProps {
	bounties: IBountyListing[];
}

const BountiesTable: FC<IOnchainBountiesProps> = (props) => {
	const { resolvedTheme: theme = 'light' } = useTheme();
	const router = useRouter();
	const { network } = useNetworkSelector();
	const unit = chainProperties?.[network]?.tokenSymbol;
	const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
	const [loadingChildBounties, setLoadingChildBounties] = useState<{ [key: string]: boolean }>({});
	const [bounties, setBounties] = useState<IBountyListing[]>(props.bounties);
	const handleRowClick = (record: IBountyListing) => {
		router.push(`/bounty/${record.index}`);
	};
	const handleExpand = async (expanded: boolean, record: IBountyListing) => {
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
					const updatedBounties = prevBounties.map((bounty) =>
						bounty.index === record.index
							? { ...bounty, childbounties: data?.child_bounties.map((childBounty) => ({ ...childBounty, createdAt: childBounty.createdAt.toString() })) || [] }
							: bounty
					);
					return updatedBounties;
				});
			} catch (err) {
				console.error('An unexpected error occurred:', err);
			} finally {
				setLoadingChildBounties((prevState) => ({ ...prevState, [record.index]: false }));
			}
		}
	};
	const columns: TableColumnsType<IBountyListing> = [
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
			render: (claimed: number, record: IBountyListing) => {
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
									trailColor='#f0f0f0'
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
							<span className='text-[#485F7D] dark:text-[#9E9E9E]'>
								<ClockCircleOutlined className='text-[#485F7D] dark:text-[#9E9E9E]' /> {relativeCreatedAt}
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
				const [firstCategory, secondCategory, ...rest] = categories;

				const displayCategories = [];
				let remainingCount = 0;

				if (firstCategory) {
					displayCategories.push(firstCategory);
					if (secondCategory && firstCategory.length + secondCategory.length <= maxLength) {
						displayCategories.push(secondCategory);
						remainingCount = rest.length;
					} else {
						remainingCount = categories.length - 1;
					}
				}

				return (
					<div style={{ display: 'flex', gap: '5px' }}>
						{displayCategories.map((category, index) => (
							<span
								key={index}
								className={`rounded-full px-3 py-1 text-[12px] ${index === 0 ? 'bg-[#dfd5ff] text-[#4800ff]' : 'bg-[#EFEFEF] text-[#4800ff]'}`}
							>
								{category}
							</span>
						))}
						{remainingCount > 0 && <span className='rounded-full bg-[#dfd5ff] px-3 py-1 text-[12px] text-[#485F7D]'>+{remainingCount}</span>}
					</div>
				);
			},
			title: 'Categories'
		}
	];

	useEffect(() => {
		setBounties(props.bounties);
	}, [props?.bounties]);

	return (
		<StyledTableContainer themeMode={theme}>
			<div>
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
										content={<p className='m-0 dark:text-white'>Expand to view Child Bounties</p>}
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
												{record.childbounties.map((childBounty: IChildBounty, index: number) => {
													const relativeCreatedAt = childBounty.createdAt
														? dayjs(childBounty.createdAt).isBefore(dayjs().subtract(1, 'w'))
															? dayjs(childBounty.createdAt).format("Do MMM 'YY")
															: dayjs(childBounty.createdAt).startOf('day').fromNow()
														: null;
													return (
														<div
															key={childBounty.index}
															className=' flex items-center justify-between border-[1px] border-y border-solid border-[#D2D8E0] px-4  py-2 pb-4'
														>
															{index === record.childbounties.length - 1 ? (
																<ImageIcon
																	src='/assets/bountieslistingchildlevelzero.svg'
																	className='-mt-5 h-5 w-5'
																	alt='Last child level'
																/>
															) : (
																<ImageIcon
																	src='/assets/bountieslistingchildlevelone.svg'
																	className='-mt-5 h-5 w-5'
																	alt='Child level'
																/>
															)}

															<div className='ml-8 mt-5 w-1/4 dark:text-black'>{childBounty.index}</div>
															<div className='mt-5 w-1/4 dark:text-black'>{childBounty.curator && childBounty.curator !== '' ? childBounty.curator : '-'}</div>
															<div className='mt-5 w-1/3 dark:text-black'>{childBounty.title.length > 15 ? `${childBounty.title.slice(0, 15)}...` : childBounty.title}</div>
															<div className='mt-5 w-1/4 dark:text-black'>
																{formatedBalance(childBounty.reward, unit, 0)} {chainProperties?.[network]?.tokenSymbol}
															</div>
															<div className='mt-5 w-1/4 dark:text-black'>-</div>
															<div className='mt-5 w-1/3 dark:text-black'>
																{relativeCreatedAt ? (
																	<span className='text-[#485F7D]'>
																		<ClockCircleOutlined /> {relativeCreatedAt}
																	</span>
																) : (
																	'-'
																)}
															</div>
															<div className='mt-5 w-1/4 '>{childBounty.status ? <StatusTag status={childBounty.status} /> : '-'}</div>
															<div className=' mt-5 w-1/3 dark:text-black'>-</div>
														</div>
													);
												})}
											</div>
										) : (
											<p className='pl-4 pt-4 dark:text-black'>No child bounties available.</p>
										)}
									</div>
								) : (
									<p className='dark:text-black'>No child bounties available.</p>
								)}
							</div>
						),
						onExpand: (expanded, record) => handleExpand(expanded, record),
						rowExpandable: (record) => record.totalChildBountiesCount > 0
					}}
					dataSource={bounties}
					pagination={false}
				/>
			</div>
		</StyledTableContainer>
	);
};

const StyledTableContainer = styled.div<{ themeMode: string }>`
	.ant-table-thead .ant-table-cell {
		background-color: ${(props) => (props.themeMode == 'dark' ? '#1b1d1f' : '#f9fcfb')} !important;
		border-width: 1px 0px 1px 0px;
		border-style: solid;
		border-color: ${(props) => (props.themeMode == 'dark' ? '#323232' : '#d2d8e0')};
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

	.ant-popover-content .ant-popover-inner {
		color: ${(props) => (props.themeMode == 'dark' ? 'white' : 'black')};
	}
`;
export default BountiesTable;
