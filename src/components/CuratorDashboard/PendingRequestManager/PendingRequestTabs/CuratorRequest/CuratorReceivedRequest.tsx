// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Spin } from 'antd';
import React, { useState } from 'react';
import Alert from '~src/basic-components/Alert';
import { CheckCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { useNetworkSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';
import { IPendingCuratorReq } from '~src/types';
import { ProposalType } from '~src/global/proposalType';
import { Pagination } from '~src/ui-components/Pagination';
import { BOUNTIES_LISTING_LIMIT } from '~src/global/listingLimit';
import { useRouter } from 'next/router';
import { handlePaginationChange } from '~src/util/handlePaginationChange';
import { EBountiesStatuses } from '~src/components/Bounties/BountiesListing/types/types';
import dayjs from 'dayjs';
import Markdown from '~src/ui-components/Markdown';

const ReceivedRequests = ({
	isBountyExpanded,
	bountyRequests,
	childBountyRequests,
	isChildBountyExpanded,
	handleBountyClick,
	handleChildBountyClick,
	loadingBounty,
	loadingChildBounty
}: {
	isBountyExpanded: boolean;
	bountyRequests: IPendingCuratorReq[];
	childBountyRequests: IPendingCuratorReq[];
	isChildBountyExpanded: boolean;
	handleBountyClick: () => void;
	handleChildBountyClick: () => void;
	loadingBounty: boolean;
	loadingChildBounty: boolean;
}) => {
	const [expandedBountyId, setExpandedBountyId] = useState<number | null>(null);
	const { theme } = useTheme();
	const { network } = useNetworkSelector();
	const router = useRouter();

	const toggleBountyDescription = (id: number) => {
		setExpandedBountyId(expandedBountyId === id ? null : id);
	};

	const onPaginationChange = (page: number, type: string) => {
		router?.push({
			query: {
				page,
				type
			}
		});
		handlePaginationChange({ limit: BOUNTIES_LISTING_LIMIT, page });
	};

	return (
		<div>
			<div className='mb-4'>
				<Alert
					type='info'
					showIcon
					closable
					message='Requests to become a curator for bounties can be viewed here'
				/>
				<div
					className='mb-4 mt-5 flex cursor-pointer justify-between pr-5'
					onClick={handleBountyClick}
				>
					<span className={'text-[16px] font-semibold text-blue-light-high dark:text-white'}>
						ON-CHAIN BOUNTY REQUESTS <span className='text-[14px] font-medium dark:text-icon-dark-inactive'>({bountyRequests?.length})</span>
					</span>
					<DownOutlined className={`${isBountyExpanded ? '-rotate-180' : ''} transition-transform`} />
				</div>
				<Divider className='m-0 border-[1px] border-solid border-[#D2D8E0] dark:border-[#494b4d]' />
				{loadingBounty ? (
					<div className='flex justify-center pt-2'>
						<Spin />
					</div>
				) : (
					<>
						{isBountyExpanded && (
							<div className='mt-5'>
								{bountyRequests?.length === 0 ? (
									<p>No Bounty Data Found</p>
								) : (
									bountyRequests?.map((bounty) => (
										<div
											key={bounty.index}
											className={`mt-3 rounded-lg border-solid ${
												expandedBountyId === bounty?.index ? 'border-[1px] border-[#E5007A] dark:border-[#E5007A]' : 'border-[0.7px] border-[#D2D8E0]'
											} bg-white  dark:border-[#4B4B4B] dark:bg-[#0d0d0d]`}
										>
											<div className='flex items-center justify-between gap-3 px-3 pt-3'>
												<div className='flex gap-1 pt-2'>
													<span className='text-[14px] font-medium text-blue-light-medium dark:text-white'>{bounty?.proposer} </span>

													<p className='ml-1 text-blue-light-medium dark:text-[#9E9E9E]'>|</p>
													<div className='-mt-1 flex items-center gap-1'>
														<ImageIcon
															src={`${theme === 'dark' ? '/assets/activityfeed/darktimer.svg' : '/assets/icons/timer.svg'}`}
															alt='timer'
															className=' -mt-3 h-4 text-blue-light-medium dark:text-[#9E9E9E]'
														/>

														<p className='pt-1 text-[10px] text-blue-light-medium dark:text-[#9E9E9E] xl:text-[12px]'>{dayjs(bounty?.createdAt)?.format('Do MMM YYYY')}</p>
													</div>
													<p className=' text-blue-light-medium dark:text-[#9E9E9E]'>|</p>

													<span className='ml-1 whitespace-nowrap text-[16px] font-bold text-pink_primary dark:text-[#FF4098]'>
														{parseBalance(String(bounty?.reward || '0'), 2, true, network)}
													</span>
												</div>
												<div className='-mt-1 flex items-center gap-3'>
													{bounty.status === EBountiesStatuses.ACTIVE ? (
														<span className='w-40 whitespace-nowrap rounded-md bg-pink_primary py-2 text-center text-[14px] font-medium text-white'>Approve</span>
													) : (
														<span className='w-40 whitespace-nowrap rounded-md bg-[#E0F7E5] py-2 text-center text-[14px] font-medium text-[#07641C] dark:bg-[#122d15] dark:text-[#1BC240]'>
															<CheckCircleOutlined /> Approved
														</span>
													)}{' '}
													{bounty?.content && (
														<div
															className='cursor-pointer'
															onClick={() => toggleBountyDescription(bounty?.index)}
														>
															{expandedBountyId === bounty?.index ? (
																<UpOutlined className='rounded-full p-2 text-white' />
															) : (
																<DownOutlined className='rounded-full p-2 text-white dark:text-icon-dark-inactive' />
															)}
														</div>
													)}
												</div>
											</div>
											<Divider className='m-0 mb-2 mt-1 border-[1px] border-solid border-[#D2D8E0] dark:border-[#494b4d]' />
											<div className='px-3 pb-3'>
												<span className='text-[17px] font-medium text-blue-light-medium dark:text-icon-dark-inactive'>#{bounty?.index} </span>
												<span className='text-[17px] font-medium text-blue-light-high hover:underline dark:text-white'>{bounty?.title}</span>
											</div>

											{expandedBountyId === bounty.index && bounty.content && (
												<div className='px-3 pb-3'>
													<Markdown
														md={bounty?.content}
														className='mt-1 text-[14px] text-blue-light-high dark:text-white'
													/>
													<br />
													<span className='mt-2 cursor-pointer text-[14px] font-medium text-[#1B61FF] hover:text-[#1B61FF]'>Read More</span>
													<div className='mt-3 flex justify-between rounded-lg border-[1px] border-solid border-[#D2D8E0] px-5 py-3'>
														<span>Full Proposal:</span>
														<div className='flex items-center gap-1'>
															<span>detailsbountyproposal.com</span>
															<Image
																src='/assets/more.svg'
																alt=''
																style={{
																	filter:
																		theme === 'dark'
																			? 'brightness(0) saturate(100%) invert(69%) sepia(37%) saturate(0%) hue-rotate(249deg) brightness(86%) contrast(87%)'
																			: 'brightness(0) saturate(100%) invert(33%) sepia(14%) saturate(1156%) hue-rotate(174deg) brightness(102%) contrast(92%)'
																}}
																width={15}
																height={15}
															/>
														</div>
													</div>
												</div>
											)}
											{bountyRequests?.length > 10 && (
												<Pagination
													defaultCurrent={1}
													pageSize={BOUNTIES_LISTING_LIMIT}
													total={bountyRequests?.length}
													showSizeChanger={false}
													hideOnSinglePage={true}
													onChange={(page: number) => onPaginationChange(page, ProposalType.BOUNTIES)}
													responsive={true}
												/>
											)}
										</div>
									))
								)}
							</div>
						)}
					</>
				)}

				<div className='mt-5'>
					<div
						className='mb-4 mt-5 flex cursor-pointer justify-between pr-5'
						onClick={handleChildBountyClick}
					>
						<span className={'text-[16px] font-semibold text-blue-light-high dark:text-white'}>
							CHILD BOUNTY REQUESTS <span className='text-[14px] font-medium dark:text-icon-dark-inactive'>({childBountyRequests?.length})</span>
						</span>
						<DownOutlined className={`${isChildBountyExpanded ? '-rotate-180' : ''} transition-transform`} />
					</div>
					<Divider className='m-0 border-[1px] border-solid border-[#D2D8E0] dark:border-[#494b4d]' />
					{loadingChildBounty ? (
						<div className='flex justify-center pt-2'>
							<Spin />
						</div>
					) : (
						<>
							{isChildBountyExpanded && (
								<>
									{childBountyRequests?.length === 0 ? (
										<p className='mt-5'>No Child Bounty Data Found</p>
									) : (
										childBountyRequests?.map((childBounty) => (
											<div
												key={childBounty?.index}
												className={`mt-3 rounded-lg border-solid ${
													expandedBountyId === childBounty?.index ? 'border-[1px] border-[#E5007A] dark:border-[#E5007A]' : 'border-[0.7px] border-[#D2D8E0]'
												} bg-white  dark:border-[#4B4B4B] dark:bg-[#0d0d0d]`}
											>
												<div className='flex items-center justify-between gap-3 px-3 pt-3'>
													<div className='flex gap-1 pt-2'>
														<span className='text-[14px] font-medium text-blue-light-medium dark:text-white'>{childBounty?.proposer} </span>

														<p className='ml-1 text-blue-light-medium dark:text-[#9E9E9E]'>|</p>
														<div className='-mt-1  flex items-center gap-1'>
															<ImageIcon
																src={`${theme === 'dark' ? '/assets/activityfeed/darktimer.svg' : '/assets/icons/timer.svg'}`}
																alt='timer'
																className=' -mt-3 h-4   text-blue-light-medium dark:text-[#9E9E9E]'
															/>

															<p className='pt-1 text-[10px] text-blue-light-medium dark:text-[#9E9E9E] xl:text-[12px]'>{dayjs(childBounty?.createdAt)?.format('Do MMM YYYY')}</p>
														</div>
														<p className=' text-blue-light-medium dark:text-[#9E9E9E]'>|</p>

														<span className='ml-1 whitespace-nowrap text-[16px] font-bold text-pink_primary dark:text-[#FF4098]'>
															{parseBalance(String(childBounty?.reward || '0'), 2, true, network)}
														</span>
													</div>
													<div className='-mt-1 flex items-center gap-3'>
														{childBounty?.status === 'Pending' ? (
															<span className='w-40 whitespace-nowrap rounded-md bg-pink_primary py-2 text-center text-[14px] font-medium text-white'>Approve</span>
														) : (
															<span className='w-40 whitespace-nowrap rounded-md bg-[#E0F7E5] py-2 text-center text-[14px] font-medium text-[#07641C] dark:bg-[#122d15] dark:text-[#1BC240]'>
																<CheckCircleOutlined /> Approved
															</span>
														)}
													</div>
												</div>
												<Divider className='m-0 mb-2 mt-1 border-[1px] border-solid border-[#D2D8E0] dark:border-[#494b4d]' />
												<div className='px-3 pb-3'>
													<span className=' text-[17px] font-medium text-blue-light-medium dark:text-icon-dark-inactive'>#{childBounty.index} </span>
													<span className={'text-[17px] font-medium text-blue-light-high hover:underline dark:text-white'}>{childBounty.title}</span>
												</div>
											</div>
										))
									)}
									{childBountyRequests?.length > 10 && (
										<Pagination
											defaultCurrent={1}
											pageSize={BOUNTIES_LISTING_LIMIT}
											total={childBountyRequests.length}
											showSizeChanger={false}
											hideOnSinglePage={true}
											onChange={(page: number) => onPaginationChange(page, ProposalType.CHILD_BOUNTIES)}
											responsive={true}
										/>
									)}
								</>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default ReceivedRequests;
