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
import { IChildBountiesResponse, IChildBounty } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ImageIcon from '~src/ui-components/ImageIcon';
import dayjs from 'dayjs';
import { IBountyListing } from './types/types';
import Link from 'next/link';

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
		router.push(`/bounty/${record?.index}`);
	};
	const handleExpand = async (expanded: boolean, record: IBountyListing) => {
		const newExpandedRowKeys = expanded ? [...expandedRowKeys, record.index] : expandedRowKeys.filter((key) => key !== record.index);

		if (!expanded || !!record?.childbounties?.length) {
			setExpandedRowKeys(newExpandedRowKeys);
			return;
		}

		setExpandedRowKeys(newExpandedRowKeys);
		setLoadingChildBounties((prevState) => ({ ...prevState, [record?.index]: true }));

		const childBounties = await fetchChildBounties(record?.index);

		if (childBounties) {
			setBounties((prevBounties) => {
				const updatedBounties = prevBounties.map((bounty) =>
					bounty.index === record.index
						? {
								...bounty,
								childbounties: childBounties as IChildBounty[]
						  }
						: bounty
				);
				return updatedBounties;
			});
		}

		setLoadingChildBounties((prevState) => ({ ...prevState, [record?.index]: false }));
	};

	const fetchChildBounties = async (parentBountyIndex: number) => {
		const { data, error } = await nextApiClientFetch<IChildBountiesResponse>('/api/v1/child_bounties/getAllChildBounties', {
			parentBountyIndex
		});

		if (error) {
			console.error('Error fetching child bounties:', error);
			return null;
		}

		return data?.child_bounties || [];
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
				const truncatedTitle = title?.length > maxLength ? `${title?.substring(0, maxLength)}...` : title;
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
								<span style={{ marginLeft: '8px' }}>{claimedPercentage?.toFixed(1)}%</span>
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
					? dayjs(createdAt).isBefore(dayjs()?.subtract(1, 'w'))
						? dayjs(createdAt)?.format("Do MMM 'YY")
						: dayjs(createdAt)?.startOf('day').fromNow()
					: null;

				return (
					<>
						{relativeCreatedAt ? (
							<span className='flex gap-1 text-blue-light-medium  dark:text-[#9E9E9E]'>
								<ClockCircleOutlined className='text-blue-light-medium dark:text-[#9E9E9E]' /> <span className=' whitespace-nowrap'>{relativeCreatedAt}</span>
							</span>
						) : (
							'-'
						)}
					</>
				);
			},
			title: 'Date',
			width: 300
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
				const maxLength = 10;
				const [firstCategory, secondCategory] = categories;

				const displayCategories = [];
				let remainingCount = 0;

				if (firstCategory) {
					displayCategories.push(firstCategory);
					if (secondCategory && firstCategory.length + secondCategory?.length <= maxLength) {
						displayCategories.push(secondCategory);
						remainingCount = categories?.length - 2;
					} else {
						remainingCount = categories?.length - 1;
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
			title: 'Categories',
			width: 100
		}
	];

	useEffect(() => {
		setBounties(props?.bounties);
	}, [props?.bounties]);

	return (
		<StyledTableContainer themeMode={theme}>
			<div>
				<Table
					theme={theme}
					rowKey={(record) => record.index}
					columns={columns}
					onRow={(record) => ({
						onClick: () => handleRowClick(record),
						style: { cursor: 'pointer' }
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
												{record?.childbounties?.map((childBounty: IChildBounty, index: number) => {
													const relativeCreatedAt = childBounty.createdAt
														? dayjs(childBounty?.createdAt)?.isBefore(dayjs()?.subtract(1, 'w'))
															? dayjs(childBounty?.createdAt)?.format("Do MMM 'YY")
															: dayjs(childBounty?.createdAt)
																	?.startOf('day')
																	?.fromNow()
														: null;
													return (
														<Link
															href={`/child_bounty/${childBounty?.index}`}
															key={childBounty?.index}
														>
															<div className=' flex items-center  border-[1px] border-y border-solid border-[#D2D8E0] px-4 py-2  pb-4 dark:border-[#4B4B4B]'>
																{index === record?.childbounties?.length - 1 ? (
																	<ImageIcon
																		src='/assets/bountieslistingchildlevelzero.svg'
																		className='-mt-7 h-5 w-5'
																		alt='Last child level'
																	/>
																) : (
																	<ImageIcon
																		src='/assets/bountieslistingchildlevelone.svg'
																		className=' -mt-7 h-5 w-5'
																		alt='Child level'
																	/>
																)}

																<div className='ml-7 mt-5  '>{childBounty?.index}</div>
																<div className='ml-7 mt-5 pl-10 '>{childBounty?.curator && childBounty?.curator !== '' ? childBounty?.curator : '-'}</div>
																<div className='ml-[100px] mt-5'>{childBounty?.title?.length > 12 ? `${childBounty?.title?.slice(0, 12)}...` : childBounty?.title}</div>
																<div className='ml-[81px] mt-5'>
																	{formatedBalance(childBounty?.reward, unit, 0)} {chainProperties?.[network]?.tokenSymbol}
																</div>
																<div className='ml-14 mt-5'>-</div>
																<div className='ml-20 mt-5 min-w-[110px]'>
																	{relativeCreatedAt ? (
																		<span className='text-blue-light-medium'>
																			<ClockCircleOutlined /> {relativeCreatedAt}
																		</span>
																	) : (
																		'-'
																	)}
																</div>
																<div className='ml-5 mt-5  '>{childBounty?.status ? <StatusTag status={childBounty?.status} /> : '-'}</div>
																<div className=' ml-20  mt-5'>-</div>
															</div>
														</Link>
													);
												})}
											</div>
										) : (
											<p className='pl-4 pt-4 '>No child bounties available.</p>
										)}
									</div>
								) : (
									<p className=''>No child bounties available.</p>
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
		background-color: ${(props) => (props.themeMode == 'dark' ? '#280b19' : '#fcebf5')} !important;
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
