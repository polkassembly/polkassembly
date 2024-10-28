// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import { spaceGrotesk } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useTheme } from 'next-themes';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';
import { EPendingCuratorReqType, IChildBountySubmission } from '~src/types';
import NameLabel from '~src/ui-components/NameLabel';
import dayjs from 'dayjs';
import Markdown from '~src/ui-components/Markdown';
import Skeleton from '~src/basic-components/Skeleton';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import Image from 'next/image';
import Link from 'next/link';
import Submission from './Submission';

const getGroupBountyData = (bounties: IChildBountySubmission[]) => {
	const groupedBounties: { [key: number]: { bountyData: any; submissions: IChildBountySubmission[] } } = {};

	bounties?.forEach((bounty) => {
		const parentBountyIndex = bounty?.parentBountyIndex;

		if (!groupedBounties[parentBountyIndex]) {
			groupedBounties[parentBountyIndex] = {
				bountyData: bounty?.bountyData,
				submissions: [{ ...bounty }]
			};
		} else {
			groupedBounties[parentBountyIndex]?.submissions?.push(bounty);
		}
	});

	return groupedBounties;
};
interface ReceivedSubmissionsProps {
	className?: string;
	reqType: EPendingCuratorReqType;
}

const CuratorSubmission: React.FC<ReceivedSubmissionsProps> = ({ className, reqType }) => {
	const { theme } = useTheme();
	const { loginAddress } = useUserDetailsSelector();
	const [expandedBountyId, setExpandedBountyId] = useState<number | null>(null);
	const { network } = useNetworkSelector();
	const [submissions, setSubmissions] = useState<IChildBountySubmission[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	const getSubmissions = async () => {
		if (!loginAddress) return;
		setLoading(true);
		const url = reqType === EPendingCuratorReqType.RECEIVED ? '/api/v1/bounty/curator/submissions/getReceivedSubmissions' : '/api/v1/bounty/curator/submissions/getSentSubmissions';
		const payload = reqType === EPendingCuratorReqType.RECEIVED ? { curatorAddress: loginAddress } : { userAddress: loginAddress };
		const { data, error } = await nextApiClientFetch<IChildBountySubmission[]>(url, payload);

		if (data?.length) {
			setSubmissions(data);
		} else {
			setSubmissions([]);
			console.log('error', error);
		}

		setLoading(false);
	};

	useEffect(() => {
		getSubmissions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reqType, loginAddress]);

	const toggleBountyDescription = (parentBountyIndex: number) => {
		setExpandedBountyId(expandedBountyId === parentBountyIndex ? null : parentBountyIndex);
	};

	return (
		<div>
			{loading ? (
				<>
					<Skeleton active />
				</>
			) : (
				<div className={`${spaceGrotesk.variable} ${spaceGrotesk.className} mb-4`}>
					<div>
						{Object.keys(getGroupBountyData?.(submissions) || {}).length === 0 ? (
							<div className={'flex h-[650px] flex-col  items-center rounded-xl  px-5 pt-5'}>
								<Image
									src='/assets/Gifs/find.gif'
									alt='empty state'
									className='m-0 h-96 w-96 p-0'
									width={350}
									height={350}
								/>
								<span className='-mt-10 text-xl font-semibold text-bodyBlue dark:text-white'>No Submissions Found</span>
								<span className='flex items-center gap-1 pt-3 text-center text-bodyBlue dark:text-white'>
									<span
										onClick={() => {
											// setBountyId(50);
											// setIsEditing(false);
											// setEditSubmission(undefined);
											// setIsModalVisible(true);
										}}
										className='cursor-pointer font-semibold text-pink_primary'
									>
										Make
									</span>{' '}
									or Receive submissions to view them here
								</span>
							</div>
						) : (
							<div className={className}>
								{Object?.keys(getGroupBountyData?.(submissions) || {})?.map((parentBountyIndex) => {
									const bountyGroup = getGroupBountyData?.(submissions)?.[Number(parentBountyIndex)];
									const bountyData = bountyGroup?.bountyData;
									const requests = bountyGroup?.submissions || [];
									const trimmedContentForComment = bountyData?.content?.length > 250 ? bountyData?.content?.slice(0, 200) + '...' : bountyData?.content;

									const startsWithBulletPoint = trimmedContentForComment?.trim()?.startsWith('•') || trimmedContentForComment?.trim()?.startsWith('-');

									return (
										<div
											key={parentBountyIndex}
											className={`mt-3 rounded-lg border-solid ${
												expandedBountyId === Number(parentBountyIndex)
													? 'border-[1px] border-pink_primary bg-[#f6f8fa] dark:border-pink_primary dark:bg-[#272727]'
													: 'border-[0.7px] border-[#D2D8E0]'
											} dark:border-[#4B4B4B] dark:bg-[#0d0d0d]`}
										>
											<div className='flex items-center justify-between gap-3 px-3 pt-3'>
												<div className='flex gap-1 pt-2'>
													{bountyData?.curator && (
														<>
															<span className='text-[14px] font-medium text-bodyBlue dark:text-icon-dark-inactive'>
																<NameLabel defaultAddress={bountyData?.curator} />
															</span>
															<p className='ml-1 text-bodyBlue dark:text-[#9E9E9E]'>|</p>
														</>
													)}
													<div className='-mt-1 flex items-center gap-1'>
														<ImageIcon
															src={`${theme === 'dark' ? '/assets/activityfeed/darktimer.svg' : '/assets/icons/timer.svg'}`}
															alt='timer'
															className='-mt-3 h-4 text-bodyBlue dark:text-[#9E9E9E]'
														/>
														<p className='pt-1 text-[10px] text-bodyBlue dark:text-[#9E9E9E] xl:text-[12px]'>{dayjs(bountyData?.createdAt)?.format('Do MMM YYYY')}</p>
													</div>
													<p className='text-bodyBlue dark:text-[#9E9E9E]'>|</p>
													<span className='ml-1 text-base font-bold text-pink_primary dark:text-[#FF4098]'>
														{parseBalance(String(bountyData?.reqAmount || '0'), 2, true, network)}
													</span>
												</div>
												<div className='-mt-1 flex items-center gap-3'>
													{expandedBountyId !== Number(parentBountyIndex) && requests?.length > 0 && (
														<span className='whitespace-nowrap rounded-md py-2 text-base font-semibold text-pink_primary dark:text-[#FF4098]'>
															Submissions ({requests?.length})
														</span>
													)}
													{requests?.length > 0 && (
														<div
															className='cursor-pointer'
															onClick={() => toggleBountyDescription(Number(parentBountyIndex))}
														>
															{expandedBountyId === Number(parentBountyIndex) ? (
																<UpOutlined
																	style={{
																		background: theme === 'dark' ? '#4f4f4f' : 'linear-gradient(264.95deg, #333333 19.45%, #0A0A0A 101.3%)'
																	}}
																	className='rounded-full p-2 text-white'
																/>
															) : (
																<DownOutlined
																	style={{
																		background: theme === 'dark' ? '#4f4f4f' : 'linear-gradient(264.95deg, #333333 19.45%, #0A0A0A 101.3%)'
																	}}
																	className=' rounded-full p-2 text-white dark:text-icon-dark-inactive'
																/>
															)}
														</div>
													)}
												</div>
											</div>
											<Divider className='m-0 mb-2 mt-1 border-[1px] border-solid border-[#D2D8E0] dark:border-[#494b4d]' />
											<div className='px-3 pb-3'>
												<span className='text-base font-medium text-bodyBlue dark:text-icon-dark-inactive'>#{parentBountyIndex} </span>
												<span
													className={`text-base font-medium text-blue-light-high hover:underline ${
														expandedBountyId === Number(parentBountyIndex) ? 'dark:text-white' : 'dark:text-icon-dark-inactive'
													}`}
												>
													{bountyData?.title}
												</span>
												<div className='flex flex-col'>
													<span className='mt-1 text-[14px] text-blue-light-high dark:text-white'>
														<Markdown
															className={`xl:text-md text-[14px] text-bodyBlue dark:text-white ${startsWithBulletPoint ? '-ml-8' : ''}`}
															md={trimmedContentForComment}
														/>
													</span>
													<Link
														href={`/bounty/${parentBountyIndex}`}
														className='cursor-pointer text-[14px] font-medium text-[#1B61FF] hover:text-[#1B61FF]'
													>
														Read More
													</Link>
												</div>
											</div>

											{expandedBountyId === Number(parentBountyIndex) && (
												<div className='px-3 pb-3'>
													<Divider className='m-0 mb-3 mt-1 border-[1px] border-solid border-[#D2D8E0] dark:border-[#494b4d]' />
													{requests?.length > 0 && (
														<span className='text-[20px] font-semibold text-blue-light-high dark:text-lightWhite'>
															Submissions <span className='text-base font-medium'>({requests?.length})</span>
														</span>
													)}
													{requests?.map((request, index) => (
														<Submission
															submission={request}
															index={index}
															key={request?.id}
															updateData={setSubmissions}
															submissions={submissions}
															bountyId={Number(parentBountyIndex)}
														/>
													))}
												</div>
											)}
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default CuratorSubmission;
