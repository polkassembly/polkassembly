// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useEffect, useState } from 'react';
import { Progress, Spin, Tag } from 'antd';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Popover from '~src/basic-components/Popover';
import Address from '~src/ui-components/Address';
import StatusTag from '~src/ui-components/StatusTag';
import { useNetworkSelector } from '~src/redux/selectors';
import { useRouter } from 'next/router';
import Table from '~src/basic-components/Tables/Table';
import { useTheme } from 'next-themes';
import { IChildBountiesResponse, IChildBounty, IUserCreatedBounty } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ImageIcon from '~src/ui-components/ImageIcon';
import dayjs from 'dayjs';
import Link from 'next/link';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { BN } from 'bn.js';
import { IBountyListing } from '~src/components/Bounties/BountiesListing/types/types';

interface IOnchainBountiesProps {
	bounties: IUserCreatedBounty[];
}

const ZERO_BN = new BN(0);

const Categories = ({ categories }: { categories: string[] }) => {
	if (!categories?.length) {
		return <span className='text-lightBlue dark:text-blue-dark-high'>-</span>;
	}

	return (
		<div style={{ display: 'flex' }}>
			{categories?.slice(0, 2)?.map((category, index) => (
				<Tag
					key={index}
					className={`rounded-full px-3 py-1 text-[12px] ${index === 0 ? 'bg-[#dfd5ff] text-[#4800ff]' : 'bg-[#EFEFEF] text-[#4800ff]'}`}
				>
					{category}
				</Tag>
			))}
			{categories?.length - 2 > 0 && <span className='flex items-center rounded-full bg-[#dfd5ff] px-3 py-1 text-[12px] text-lightBlue'>+{categories?.length - 2}</span>}
		</div>
	);
};

const BountiesTable: FC<IOnchainBountiesProps> = (props) => {
	const { resolvedTheme: theme = 'light' } = useTheme();
	const router = useRouter();
	const { network } = useNetworkSelector();
	const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
	const [loadingChildBounties, setLoadingChildBounties] = useState<{ [key: string]: boolean }>({});
	const [bounties, setBounties] = useState<IUserCreatedBounty[]>([]);
	const handleRowClick = (record: IBountyListing) => {
		router.push(`/user-created-bounty/${record?.post_index}`);
	};
	const handleExpand = async (expanded: boolean, record: IBountyListing) => {
		const newExpandedRowKeys = expanded ? [...expandedRowKeys, record.index] : expandedRowKeys.filter((key) => key !== record.index);

		if (!expanded || !!record?.childBounties?.length) {
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

	useEffect(() => {
		const sortedBounties = props.bounties.sort((a, b) => b.post_index - a.post_index); // Sorting in descending order
		setBounties(sortedBounties);
	}, [props.bounties]);

	const columns: TableColumnsType<IBountyListing> = [
		{
			className: 'w-[20px] pl-0',
			dataIndex: 'post_index',
			key: 'post_index',
			render: (post_index: number) => <div className='p-0 text-blue-light-high dark:text-blue-dark-high '>{post_index}</div>,
			title: <span className='text-blue-light-medium  dark:text-[#C7C1C1]'>#</span>
		},
		{
			className: 'w-[117px] pr-0',
			dataIndex: 'proposer',
			key: 'proposer',
			render: (proposer: string) => (
				<div className='px-0'>
					{proposer ? (
						<Address
							iconSize={22}
							address={proposer}
							className='text-blue-light-high dark:text-blue-dark-high'
							displayInline
							isTruncateUsername={true}
							disableTooltip
						/>
					) : (
						'-'
					)}
				</div>
			),
			title: <span className='text-blue-light-medium  dark:text-[#C7C1C1]'>Proposer</span>
		},
		{
			className: 'w-[100px] p-0 text-center',
			dataIndex: 'max_claim',
			key: 'max_claim',
			render: (max_claim: string) => <p className='m-0 p-0 text-base font-medium text-blue-light-high dark:text-blue-dark-high'>{max_claim}</p>,
			title: <span className='text-blue-light-medium dark:text-[#C7C1C1]'>Max claims</span>
		},
		{
			className: 'w-[225px] m-0 py-1',
			dataIndex: 'title',
			key: 'title',
			render: (title: string) => {
				const maxLength = 25;
				const truncatedTitle = title?.length > maxLength ? `${title?.substring(0, maxLength)}...` : title;
				return (
					<div
						className='m-0 truncate p-0 pt-3 text-blue-light-high dark:text-blue-dark-high'
						style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
					>
						<p>{title ? truncatedTitle : '-'}</p>
					</div>
				);
			},
			title: <span className='text-blue-light-medium dark:text-[#C7C1C1]'>Title</span>
		},
		{
			className: 'w-[80px] min-w-[80px] px-1',
			dataIndex: 'claimedAmount',
			key: 'claimed',
			render: (claimed: string, record: IBountyListing) => {
				const claimedBn = new BN(claimed || '0');
				const rewardBn = new BN(record?.totalChildBountiesAmt || '0');

				const percentage = !rewardBn.eq(ZERO_BN) ? claimedBn.mul(new BN('100')).div(rewardBn) : ZERO_BN;

				return (
					<div style={{ alignItems: 'center', display: 'flex' }}>
						{!rewardBn.eq(ZERO_BN) ? (
							<>
								<Progress
									type='circle'
									percent={percentage.toNumber()}
									width={25}
									showInfo={false}
									strokeColor='#ffc500'
									trailColor='#F0F0F0'
								/>
								<span
									className='text-blue-light-high dark:text-blue-dark-high'
									style={{ marginLeft: '8px' }}
								>
									{percentage.toNumber().toFixed(1)}%
								</span>
							</>
						) : (
							'-'
						)}
					</div>
				);
			},
			title: <span className='text-blue-light-medium dark:text-[#C7C1C1]'>Claimed</span>
		},
		{
			className: 'w-[120px] px-1',
			dataIndex: 'created_at',
			key: 'created_at',
			render: (created_at: string) => {
				return (
					<>
						{created_at ? (
							<span className='flex gap-1 text-blue-light-medium  dark:text-icon-dark-inactive'>
								<ClockCircleOutlined className='text-blue-light-medium dark:text-icon-dark-inactive' />
								<span className='whitespace-nowrap text-sm'>{dayjs(created_at).format('DD MMM YYYY')}</span>
							</span>
						) : (
							'-'
						)}
					</>
				);
			},
			title: <span className='text-blue-light-medium dark:text-[#C7C1C1]'>Date</span>
		},
		{
			className: 'w-[80px] px-1',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => {
				const capitalizedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : '-';
				return <div>{capitalizedStatus ? <StatusTag status={capitalizedStatus} /> : '-'}</div>;
			},
			title: <span className='text-blue-light-medium dark:text-[#C7C1C1]'>Status</span>
		},

		{
			className: 'w-[80px] min-w-[80px] px-0',
			dataIndex: 'reward',
			key: 'reward',
			render: (reward: string) =>
				reward ? (
					<>
						<div className='whitespace-nowrap text-blue-light-high dark:text-blue-dark-high'>{parseBalance(reward || '0', 2, true, network)}</div>
					</>
				) : (
					'-'
				),
			title: <span className='text-blue-light-medium dark:text-[#C7C1C1]'>Reward</span>
		},
		{
			className: 'px-0 pl-[6px] ml-0 max-w-[140px] overflow-auto scroll-hidden',
			dataIndex: 'tags',
			key: 'tags',
			render: (tags: string[]) => {
				return <Categories categories={tags || []} />;
			},
			title: <span className='text-blue-light-medium dark:text-[#C7C1C1]'>Categories</span>
		}
	];

	useEffect(() => {
		setBounties(props.bounties);
	}, [props.bounties]);

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
										className='px-1 py-2 text-[#E5007A]'
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
											className='px-1 py-2'
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
															className=' hover:text-black dark:hover:text-white'
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

																<div className='ml-5 mt-5 w-[48px] px-1'>{childBounty?.index}</div>
																<div className='mt-4 w-[160px] pl-5 '>
																	{childBounty?.curator?.length ? (
																		<Address
																			iconSize={22}
																			address={childBounty?.curator}
																			displayInline
																			isTruncateUsername={true}
																			disableTooltip
																		/>
																	) : (
																		'-'
																	)}
																</div>
																<div className='mt-5 w-[227px] px-5'>{childBounty?.title?.length > 25 ? `${childBounty?.title?.slice(0, 25)}...` : childBounty?.title}</div>
																<div className='mt-5 w-[126px] pl-5'>{parseBalance(childBounty?.reward || '0', 2, true, network)}</div>

																<div className='mt-5 w-[120px] pl-5'>-</div>
																<div className='mt-5 w-[133px] pl-5'>
																	{relativeCreatedAt ? (
																		<span className='text-blue-light-medium dark:text-icon-dark-inactive'>
																			<ClockCircleOutlined /> {relativeCreatedAt}
																		</span>
																	) : (
																		'-'
																	)}
																</div>
																<div className='mt-5 w-[132px] pl-5'>{childBounty?.status ? <StatusTag status={childBounty?.status} /> : '-'}</div>
																<div className='mt-5 pl-5 '>{<Categories categories={childBounty?.categories || []} />}</div>
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
		background-color: ${(props) => (props.themeMode == 'dark' ? '#303030' : '#F5F6F880')} !important;
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
