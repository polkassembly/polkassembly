// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, message, Modal } from 'antd';
import { spaceGrotesk } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { CheckCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { useTheme } from 'next-themes';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';
import { EChildbountySubmissionStatus, IChildBountySubmission } from '~src/types';
import NameLabel from '~src/ui-components/NameLabel';
import dayjs from 'dayjs';
import Markdown from '~src/ui-components/Markdown';
import Skeleton from '~src/basic-components/Skeleton';
import AddressDropdown from '~src/ui-components/AddressDropdown';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import SubmissionAction from '~src/components/Post/GovernanceSideBar/Bounty/Curator/SubmissionAction';
import Alert from '~src/basic-components/Alert';
import Link from 'next/link';

const groupBountyData = (bounties: IChildBountySubmission[]) => {
	const groupedBounties: { [key: number]: { bountyData: any; requests: IChildBountySubmission[] } } = {};

	bounties.forEach((bounty) => {
		const parentBountyIndex = bounty?.parentBountyIndex;

		if (!groupedBounties[parentBountyIndex]) {
			groupedBounties[parentBountyIndex] = {
				bountyData: bounty?.bountyData,
				requests: [{ ...bounty }]
			};
		} else {
			groupedBounties[parentBountyIndex]?.requests?.push(bounty);
		}
	});

	return groupedBounties;
};
function SentSubmissions({
	isloading,
	sentSubmissions,
	setSentSubmissions,
	setIsEditing,
	setEditSubmission,
	setIsModalVisible,
	setBountyId
}: {
	isloading: boolean;
	sentSubmissions: any;
	setSentSubmissions: any;
	setIsEditing: (isEditing: boolean) => void;
	setEditSubmission: any;
	setIsModalVisible: any;
	setBountyId: any;
}) {
	const { theme } = useTheme();
	const currentUser = useUserDetailsSelector();
	const [expandedBountyId, setExpandedBountyId] = useState<number | null>(null);
	const [groupedBounties, setGroupedBounties] = useState(groupBountyData(sentSubmissions));
	const { network } = useNetworkSelector();
	const [isSumbitModalVisible, setIsSubmitModalVisible] = useState<boolean>(false);
	const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

	const toggleBountyDescription = (parentBountyIndex: number) => {
		setExpandedBountyId(expandedBountyId === parentBountyIndex ? null : parentBountyIndex);
	};

	const showEditModal = (submission: any) => {
		setIsModalVisible(true);
		setIsEditing(true);
		setEditSubmission(submission);
		setBountyId(submission.parentBountyIndex);
	};

	const handleCancel = () => {
		setIsSubmitModalVisible(false);
	};

	const handleSubmit = () => {
		setIsSubmitModalVisible(false);
	};

	const updateGroupedBounties = (submission: any) => {
		const parentBountyIndex = submission?.parentBountyIndex;
		const updatedRequests = groupedBounties[parentBountyIndex]?.requests?.filter((req) => req?.id !== submission?.id);

		if (updatedRequests?.length === 0) {
			const updatedGroupedBounties = { ...groupedBounties };
			delete updatedGroupedBounties[parentBountyIndex];
			setGroupedBounties(updatedGroupedBounties);
		} else {
			const updatedGroupedBounties = {
				...groupedBounties,
				[parentBountyIndex]: {
					...groupedBounties[parentBountyIndex],
					requests: updatedRequests
				}
			};
			setGroupedBounties(updatedGroupedBounties);
		}
	};

	const handleDelete = async (submission: IChildBountySubmission) => {
		setSelectedSubmission(submission);

		const payload = {
			curatorAddress: currentUser?.loginAddress,
			parentBountyIndex: submission?.parentBountyIndex,
			proposerAddress: submission?.proposer,
			rejectionMessage: '',
			submissionId: submission?.id,
			updatedStatus: EChildbountySubmissionStatus.DELETED
		};

		const { data, error } = await nextApiClientFetch<IChildBountySubmission>('/api/v1/bounty/curator/submissions/updateSubmissionStatus', payload);

		if (error) {
			console.error('Error updating submission status:', error);
			return;
		}

		if (data) {
			updateGroupedBounties(selectedSubmission);
			const newSubmissions = sentSubmissions.filter((sub: IChildBountySubmission) => sub?.id !== submission?.id);
			setSentSubmissions(newSubmissions);
			setEditSubmission(undefined);
			message.success('Submission status updated successfully');
		}
	};

	useEffect(() => {
		setGroupedBounties(groupBountyData(sentSubmissions));
	}, [sentSubmissions]);

	return (
		<div>
			{isloading ? (
				<>
					<Skeleton active />
				</>
			) : (
				<div className={`${spaceGrotesk.variable} ${spaceGrotesk.className} mb-4`}>
					<div>
						{Object.keys(groupedBounties).length === 0 ? (
							<div className={'flex h-[650px] flex-col  items-center rounded-xl  px-5 pt-5'}>
								<Image
									src='/assets/Gifs/find.gif'
									alt='empty state'
									className='m-0 h-96 w-96 p-0'
									width={350}
									height={350}
								/>
								<span className='-mt-10 text-xl font-semibold text-[#243A57] dark:text-white'>No Submissions Found</span>
								<span className='flex items-center gap-1 pt-3 text-center text-[#243A57] dark:text-white'>
									<span
										onClick={() => {
											setBountyId(50);
											setIsEditing(false);
											setEditSubmission(undefined);
											setIsModalVisible(true);
										}}
										className='cursor-pointer font-semibold text-pink_primary'
									>
										Make
									</span>{' '}
									or Receive submissions to view them here
								</span>
							</div>
						) : (
							<>
								{Object?.keys(groupedBounties)?.map((parentBountyIndex) => {
									const bountyGroup = groupedBounties[Number(parentBountyIndex)];
									const bountyData = bountyGroup?.bountyData;
									const requests = bountyGroup?.requests;
									const trimmedContentForComment = bountyData?.content?.length > 250 ? bountyData?.content?.slice(0, 200) + '...' : bountyData?.content;

									const startsWithBulletPoint = trimmedContentForComment?.trim()?.startsWith('•') || trimmedContentForComment?.trim()?.startsWith('-');

									return (
										<div
											key={parentBountyIndex}
											className={`mt-3 rounded-lg border-solid ${
												expandedBountyId === Number(parentBountyIndex)
													? 'border-[1px] border-[#E5007A] bg-[#f6f8fa] dark:border-[#E5007A] dark:bg-[#272727]'
													: 'border-[0.7px] border-[#D2D8E0]'
											} dark:border-[#4B4B4B] dark:bg-[#0d0d0d]`}
										>
											<div className='flex items-center justify-between gap-3 px-3 pt-3'>
												<div className='flex gap-1 pt-2'>
													<span className='text-[14px] font-medium text-blue-light-medium dark:text-icon-dark-inactive'>
														<NameLabel defaultAddress={bountyData?.curator} />
													</span>
													<p className='ml-1 text-blue-light-medium dark:text-[#9E9E9E]'>|</p>
													<div className='-mt-1 flex items-center gap-1'>
														<ImageIcon
															src={`${theme === 'dark' ? '/assets/activityfeed/darktimer.svg' : '/assets/icons/timer.svg'}`}
															alt='timer'
															className='-mt-3 h-4 text-blue-light-medium dark:text-[#9E9E9E]'
														/>
														<p className='pt-1 text-[10px] text-blue-light-medium dark:text-[#9E9E9E] xl:text-[12px]'>{dayjs(bountyData?.createdAt).format('Do MMM YYYY')}</p>
													</div>
													<p className='text-blue-light-medium dark:text-[#9E9E9E]'>|</p>
													<span className='ml-1 text-[16px] font-bold text-pink_primary dark:text-[#FF4098]'>
														{parseBalance(String(bountyData?.reqAmount || '0'), 2, true, network)}
													</span>
												</div>
												<div className='-mt-1 flex items-center gap-3'>
													{expandedBountyId !== Number(parentBountyIndex) && requests?.length > 0 && (
														<span className='whitespace-nowrap rounded-md py-2 text-[16px] font-semibold text-pink_primary dark:text-[#FF4098]'>
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
												<span className='text-[17px] font-medium text-blue-light-medium dark:text-icon-dark-inactive'>#{parentBountyIndex} </span>
												<span
													className={`text-[17px] font-medium text-blue-light-high hover:underline ${
														expandedBountyId === Number(parentBountyIndex) ? 'dark:text-white' : 'dark:text-icon-dark-inactive'
													}`}
												>
													{bountyData?.title}
												</span>
												<div className='flex flex-col'>
													<span className='mt-1 text-[14px] text-blue-light-high dark:text-white'>
														<Markdown
															className={`xl:text-md text-[14px] text-[#243A57] dark:text-white ${startsWithBulletPoint ? '-ml-8' : ''}`}
															md={trimmedContentForComment}
														/>
													</span>
													<Link
														href={`/bounty/${parentBountyIndex}`}
														className='cursor-pointer text-[14px] font-medium text-[#1B61FF] hover:text-[#1B61FF]'
													>
														Read More
													</Link>{' '}
												</div>
											</div>

											{expandedBountyId === Number(parentBountyIndex) && (
												<div className='px-3 pb-3'>
													<Divider className='m-0 mb-3 mt-1 border-[1px] border-solid border-[#D2D8E0] dark:border-[#494b4d]' />
													{requests?.length > 0 && (
														<span className='text-[20px] font-semibold text-blue-light-high dark:text-lightWhite'>
															Submissions <span className='text-[16px] font-medium'>({requests?.length})</span>
														</span>
													)}
													{requests?.map((request, index) => (
														<div
															key={request.id}
															className='mt-3 rounded-lg border-[1px] border-solid border-[#D2D8E0] bg-white dark:bg-[#1a1a1a]'
														>
															<div className='flex items-center justify-between gap-3 px-4 pt-2'>
																<div className='flex gap-1 pt-2'>
																	<span className='text-[14px] font-medium text-blue-light-medium dark:text-icon-dark-inactive'>
																		<NameLabel defaultAddress={request?.proposer} />
																	</span>
																	<p className='ml-1 text-blue-light-medium dark:text-[#9E9E9E]'>|</p>
																	<div className='-mt-1 flex items-center gap-1'>
																		<ImageIcon
																			src={`${theme === 'dark' ? '/assets/activityfeed/darktimer.svg' : '/assets/icons/timer.svg'}`}
																			alt='timer'
																			className='-mt-3 h-4 text-blue-light-medium dark:text-[#9E9E9E]'
																		/>
																		<p className='pt-1 text-[10px] text-blue-light-medium dark:text-[#9E9E9E] xl:text-[12px]'>
																			{new Date(request?.createdAt)?.toLocaleDateString()}
																		</p>
																	</div>
																	<p className='text-blue-light-medium dark:text-[#9E9E9E]'>|</p>
																	<span className='ml-1 whitespace-nowrap text-[16px] font-bold text-pink_primary dark:text-[#FF4098]'>
																		{parseBalance(String(request?.reqAmount || '0'), 2, true, network)}
																	</span>
																</div>
															</div>
															<div className='px-4 pb-2'>
																<span className='text-[17px] font-medium text-blue-light-medium dark:text-icon-dark-inactive'>#{index + 1}</span>
																<span className='pl-2 text-[17px] font-medium text-blue-light-high dark:text-white'>{request?.title}</span>
																<div className='flex flex-col'>
																	<Markdown
																		md={request?.content}
																		className='mt-1 text-[14px] text-blue-light-high dark:text-white'
																	/>
																	<span className='mt-2 cursor-pointer text-[14px] font-medium text-[#1B61FF] hover:text-[#1B61FF]'>Read More</span>
																</div>
															</div>
															{request?.status === EChildbountySubmissionStatus.OUTDATED && (
																<>
																	<Alert
																		showIcon={true}
																		message={'This proposal is outdated'}
																		className='mx-4 mb-2'
																	/>
																</>
															)}
															<Divider className='m-0 mb-2 border-[1px] border-solid border-[#D2D8E0] dark:border-[#494b4d]' />
															<div className='flex justify-between gap-4 p-2 px-4'>
																<SubmissionAction
																	submission={request}
																	loginAddress={currentUser?.loginAddress}
																	network={network}
																	handleDelete={handleDelete}
																	handleEditClick={showEditModal}
																/>
															</div>
														</div>
													))}
												</div>
											)}
										</div>
									);
								})}
							</>
						)}
					</div>

					<Modal
						title={
							<>
								<CheckCircleOutlined className='pr-2 text-lg' /> <span className='text-[18px] font-bold'>Edit Submission</span>
							</>
						}
						visible={isSumbitModalVisible}
						onCancel={handleCancel}
						footer={[
							<Button
								key='cancel'
								onClick={handleCancel}
								className='w-24 rounded-md border border-solid border-pink_primary pb-2 text-center text-[14px] font-medium text-pink_primary'
							>
								Cancel
							</Button>,
							<Button
								key='reject'
								type='primary'
								className='w-24 rounded-md bg-pink_primary pb-2 text-center font-medium text-white'
								onClick={handleSubmit}
							>
								Submit
							</Button>
						]}
					>
						<Divider
							className='m-0 mb-3'
							style={{ borderColor: '#D2D8E0' }}
						/>
						<div>
							<label
								htmlFor='account'
								className='mb-1 block text-sm text-blue-light-medium'
							>
								Account
							</label>
							<AddressDropdown
								accounts={currentUser?.addresses?.map((address) => ({ address })) || []}
								defaultAddress={currentUser?.loginAddress}
								onAccountChange={(newAddress) => {
									console.log('Account changed to:', newAddress);
								}}
							/>
						</div>
					</Modal>
				</div>
			)}
		</div>
	);
}

export default SentSubmissions;
