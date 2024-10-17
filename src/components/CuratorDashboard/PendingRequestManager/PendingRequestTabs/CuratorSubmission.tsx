// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, Input, Modal } from 'antd';
import { spaceGrotesk } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import { CheckCircleOutlined, CloseCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { useTheme } from 'next-themes';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { useNetworkSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';
import { IChildBountySubmission } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

function CuratorSubmission() {
	const [activeTab, setActiveTab] = useState('received');

	const handleTabClick = (tab: string) => {
		setActiveTab(tab);
	};

	return (
		<div className='curator-request-container'>
			<div className='flex justify-between rounded-full border-[1px] border-solid border-[#D2D8E0]'>
				<div
					className={`w-1/2 ${spaceGrotesk.className} ${spaceGrotesk.variable} cursor-pointer py-2 text-center text-[14px] ${
						activeTab === 'received'
							? 'rounded-l-full bg-[#F6F8FA] font-bold text-blue-light-high dark:bg-[#4B4B4B] dark:text-white'
							: 'font-medium text-[#475569] dark:text-icon-dark-inactive'
					}`}
					onClick={() => handleTabClick('received')}
				>
					Received Requests <span className={'text-[12px] font-medium text-[#475569] dark:text-icon-dark-inactive'}>(0)</span>
				</div>
				<div
					className={`w-1/2 ${spaceGrotesk.className} ${spaceGrotesk.variable} cursor-pointer py-2 text-center text-[14px] ${
						activeTab === 'sent'
							? 'rounded-r-full bg-[#F6F8FA] font-bold text-blue-light-high dark:bg-[#4B4B4B] dark:text-white'
							: 'font-medium text-[#475569] dark:text-icon-dark-inactive'
					}`}
					onClick={() => handleTabClick('sent')}
				>
					Sent Requests <span className={'text-[12px] font-medium text-[#475569] dark:text-icon-dark-inactive'}>(0)</span>
				</div>
			</div>
			<div className='pt-5'>
				{activeTab === 'received' && <ReceivedRequests />}
				{activeTab === 'sent' && <SentRequests />}
			</div>
		</div>
	);
}

function ReceivedRequests() {
	const { theme } = useTheme();
	const [expandedBountyId, setExpandedBountyId] = useState<number | null>(null);
	const { network } = useNetworkSelector();
	const [isRejectModalVisible, setIsRejectModalVisible] = useState<boolean>(false);
	const [isApproveModalVisible, setIsApproveModalVisible] = useState<boolean>(false);
	const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
	const [receivedRequests, setReceivedRequests] = useState<any>([]);

	const getreceivedRequests = async () => {
		const { data, error } = await nextApiClientFetch<IChildBountySubmission>('/api/v1/bounty/curator/submissions/getReceivedSubmissions', {
			curatorAddress: '1EkXxWpyv5pY7t427CDyqLfqUzEhwPsWSAWeurqmxYxY9ea'
		});
		if (error) {
			console.error('Error fetching child bounties:', error);
			return null;
		}
		setReceivedRequests(data);
	};

	useEffect(() => {
		getreceivedRequests();
	}, []);

	console.log('receivedRequests:', receivedRequests);

	const bounties = [
		{
			bountyData: {
				content:
					"**Summary:**\nThe IBP, a collective of independent infrastructure service providers, aims to become the main ecosystem RPC and 'IT department' by providing infrastructure related services to the Polkadot ecosystem and all parachains. The unique design of the IBP creates a globally distributed and resilient ecosystem service provider. By offering RPC services to parachain teams we want to make it more lucrative for new projects to build on Polkadot and existing teams to purely focus on building.\n\n\nThe program is a specialized initiative to enhance the decentralized infrastructure of the Polkadot and Kusama network. It establishes a resilient, globally distributed setup for the core infrastructure services. All services are deployed on infrastructure owned by its members, removing value extraction by unnecessary intermediaries. \n\n**!Note!:**\nThe requested amount is set up as a bounty with 5 Polkadot native curators where costs are only paid retroactively. The charge of the hereby stated proposal only occurs in the case of full Polkadot adoption where the scale of deployment would mean:\n- \\>1140 RPC nodes (across 15 datacenters)\n- \\>37 Billion requests a month (across relay and parachains)\n\nRPC services are **all paid retroactively** for delivered services monthly by USD value.\n\n **See the Full Proposal [here](https://docs.google.com/document/d/1WENGgO1KwJKkLJ_c6AGxRkLtOhhAjd4OW1v_yWaEUqY)**\n",
				createdAt: '2024-04-04T18:58:42.000000Z',
				curator: '1EkXxWpyv5pY7t427CDyqLfqUzEhwPsWSAWeurqmxYxY9ea',
				reqAmount: '4610540000000000',
				status: 'Extended',

				title: 'Infrastructure Builders Program'
			},
			content: 'This is the content of the bounty submission.',
			createdAt: '2024-10-17T10:22:22.278Z',
			link: 'https://example.com',
			parentBountyIndex: 50,
			proposer: '15BXEztHcQLQyWESNE2s1J3Uxw7ueTKKKuzRt6C7n9zhCjqG',
			reqAmount: '1000000000000000',
			tags: ['tag1', 'tag2'],
			title: 'Sample Bounty Title'
		}
	];

	const toggleBountyDescription = (id: number) => {
		setExpandedBountyId(expandedBountyId === id ? null : id);
	};

	const showRejectModal = (submission: any) => {
		setSelectedSubmission(submission);
		setIsRejectModalVisible(true);
	};

	const showApproveModal = (submission: any) => {
		setSelectedSubmission(submission);
		setIsApproveModalVisible(true);
	};

	const handleCancel = () => {
		setIsRejectModalVisible(false);
		setIsApproveModalVisible(false);
	};

	const handleReject = () => {
		console.log('Rejecting submission:', selectedSubmission);
		setIsRejectModalVisible(false);
	};

	const handleApprove = () => {
		console.log('Approving submission:', selectedSubmission);
		setIsApproveModalVisible(false);
	};

	return (
		<div>
			<div className={`${spaceGrotesk.variable} ${spaceGrotesk.className} mb-4`}>
				<div>
					{bounties.map((bounty) => (
						<div
							key={bounty.index}
							className={`mt-3 rounded-lg border-solid ${
								expandedBountyId === bounty.index ? 'border-[1px] border-[#E5007A] bg-[#f6f8fa] dark:border-[#E5007A]' : 'border-[0.7px] border-[#D2D8E0]'
							}  dark:border-[#4B4B4B] dark:bg-[#0d0d0d]`}
						>
							<div className='flex items-center justify-between gap-3 px-3 pt-3'>
								<div className='flex gap-1 pt-2'>
									<span className='text-[14px] font-medium text-blue-light-medium dark:text-icon-dark-inactive'>{bounty.proposer} </span>

									<p className='ml-1 text-blue-light-medium dark:text-[#9E9E9E]'>|</p>
									<div className='-mt-1  flex items-center gap-1'>
										<ImageIcon
											src={`${theme === 'dark' ? '/assets/activityfeed/darktimer.svg' : '/assets/icons/timer.svg'}`}
											alt='timer'
											className=' -mt-3 h-4   text-blue-light-medium dark:text-[#9E9E9E]'
										/>
										<p className='pt-1 text-[10px] text-blue-light-medium dark:text-[#9E9E9E] xl:text-[12px]'>20th Dec 2021</p>
									</div>
									<p className=' text-blue-light-medium dark:text-[#9E9E9E]'>|</p>

									<span className='ml-1 whitespace-nowrap text-[16px] font-bold text-pink_primary'>{parseBalance(String(bounty.reward || '0'), 2, true, network)}</span>
								</div>
								<div className='-mt-1 flex items-center gap-3'>
									{expandedBountyId !== bounty.index && bounty?.submissions && bounty.submissions.length > 0 && (
										<span className='whitespace-nowrap rounded-md py-2 text-center text-[16px] font-semibold text-pink_primary'>
											Submissions (<span className='text-[14px] font-medium'>{bounty.submissions.length}</span>)
										</span>
									)}
									{bounty.description && (
										<div
											className='cursor-pointer'
											onClick={() => toggleBountyDescription(bounty.index)}
										>
											{expandedBountyId === bounty.index ? (
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
								<span className=' text-[17px] font-medium text-blue-light-medium dark:text-icon-dark-inactive'>#{bounty.index} </span>
								<span
									className={` text-[17px] font-medium text-blue-light-high hover:underline  ${
										expandedBountyId === bounty.index ? 'dark:text-white' : 'dark:text-icon-dark-inactive'
									}`}
								>
									{bounty.title}
								</span>
								<div className='flex flex-col'>
									<span className='mt-1 text-[14px] text-blue-light-high dark:text-white'>{bounty.description}</span>
									<span className='mt-2 cursor-pointer text-[14px] font-medium text-[#1B61FF] hover:text-[#1B61FF]'>Read More</span>
								</div>
							</div>

							{expandedBountyId === bounty.index && bounty.submissions && bounty.submissions.length > 0 && (
								<div className='px-3 pb-3'>
									<Divider className='m-0 mb-2 mt-1 border-[1px] border-solid border-[#D2D8E0] dark:border-[#494b4d]' />
									<div>
										<p className='text-[20px] font-semibold text-blue-light-high dark:text-lightWhite'>
											Submissions <span className='text-[16px] font-medium'>({bounty.submissions.length})</span>
										</p>
									</div>
									{bounty.submissions.map((submission, index) => (
										<div
											key={index}
											className='rounded-lg border-[1px] border-solid border-[#D2D8E0] bg-white'
										>
											<div className='flex items-center justify-between gap-3 px-3 pt-1'>
												<div className='flex gap-1 pt-2'>
													<span className='text-[14px] font-medium text-blue-light-medium dark:text-icon-dark-inactive'>{submission.curator} </span>
													<p className='ml-1 text-blue-light-medium dark:text-[#9E9E9E]'>|</p>
													<div className='-mt-1 flex items-center gap-1'>
														<ImageIcon
															src={`${theme === 'dark' ? '/assets/activityfeed/darktimer.svg' : '/assets/icons/timer.svg'}`}
															alt='timer'
															className=' -mt-3 h-4   text-blue-light-medium dark:text-[#9E9E9E]'
														/>
														<p className='pt-1 text-[10px] text-blue-light-medium dark:text-[#9E9E9E] xl:text-[12px]'>20th Dec 2021</p>
													</div>
													<p className=' text-blue-light-medium dark:text-[#9E9E9E]'>|</p>
													<span className='ml-1 whitespace-nowrap text-[16px] font-bold text-pink_primary'>{parseBalance(String(submission.amount || '0'), 2, true, network)}</span>
												</div>
											</div>
											<div className='px-3 pb-2'>
												<span className=' text-[17px] font-medium text-blue-light-medium dark:text-icon-dark-inactive'>#{index + 1} </span>
												<span className=' text-[17px] font-medium text-blue-light-high'>{submission.title}</span>
												<div className='flex flex-col'>
													<span className='mt-1 text-[14px] text-blue-light-high dark:text-white'>{submission.description}</span>
													<span className='mt-2 cursor-pointer text-[14px] font-medium text-[#1B61FF] hover:text-[#1B61FF]'>Read More</span>
												</div>
											</div>
											<Divider className='m-0 mb-2 border-[1px] border-solid border-[#D2D8E0] dark:border-[#494b4d]' />
											<div className='flex justify-between gap-4 p-2'>
												<span
													onClick={() => showRejectModal(submission)}
													className='w-1/2 cursor-pointer rounded-md border border-solid border-pink_primary py-2 text-center text-[14px] font-medium text-pink_primary'
												>
													Reject
												</span>
												<span
													onClick={() => showApproveModal(submission)}
													className='w-1/2 cursor-pointer rounded-md bg-pink_primary py-2 text-center font-medium text-white'
												>
													Approve
												</span>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					))}
				</div>
				<Modal
					title={
						<>
							<CheckCircleOutlined className='pr-2 text-lg' /> <span className='text-[18px] font-bold'>Approve Submission</span>
						</>
					}
					visible={isApproveModalVisible}
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
							onClick={handleApprove}
						>
							Approve
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
						<Input
							id='account'
							placeholder='Account'
							className='mb-4'
							name='account'
							aria-label='Account'
						/>

						<label
							htmlFor='comment'
							className='mb-1 block text-sm text-blue-light-medium'
						>
							Add Comment <span className='text-pink_primary'>*</span>
						</label>
						<Input
							id='comment'
							placeholder='Add Comment'
						/>
					</div>
				</Modal>
				<Modal
					title={
						<>
							<CloseCircleOutlined className='pr-2 text-lg' /> <span className='text-[18px] font-bold'>Reject Submission</span>
						</>
					}
					visible={isRejectModalVisible}
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
							onClick={handleReject}
						>
							Reject
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
						<Input
							id='account'
							placeholder='Account'
							className='mb-4'
							name='account'
							aria-label='Account'
						/>

						<label
							htmlFor='comment'
							className='mb-1 block text-sm text-blue-light-medium'
						>
							Add Comment <span className='text-pink_primary'>*</span>
						</label>
						<Input
							id='comment'
							placeholder='Add Comment'
						/>
					</div>
				</Modal>
			</div>
		</div>
	);
}

function SentRequests() {
	const { theme } = useTheme();
	const [expandedBountyId, setExpandedBountyId] = useState<number | null>(null);
	const { network } = useNetworkSelector();
	const [isRejectModalVisible, setIsRejectModalVisible] = useState<boolean>(false);
	const [isApproveModalVisible, setIsApproveModalVisible] = useState<boolean>(false);
	const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

	const bounties = [
		{
			description:
				'Based on the income to the treasuries, the amounts getting burned and the amounts going to proposals, the treasury can be utilized more: this includes spending more funds, extending the categories  ......',
			index: 1,
			proposer: 'Larry Page',
			reward: '10000000000000000000',
			status: 'Approved',
			submissions: [
				{
					amount: '10000000000000000000',
					curator: 'Larry Page',
					description:
						'Based on the income to the treasuries, the amounts getting burned and the amounts going to proposals, the treasury can be utilized more: this includes spending more funds, extending......',
					proposer: 'Noob Master',
					status: 'Pending',
					title: 'Standard Guidelines to judge Liquidity Treasury Proposals on the governance side - Kusama and Polkadot'
				},
				{
					amount: '10000000000000000000',
					curator: 'Larry Page',
					description:
						'Based on the income to the treasuries, the amounts getting burned and the amounts going to proposals, the treasury can be utilized more: this includes spending more funds, extending......',
					proposer: 'Noob Master',
					status: 'Pending',
					title: 'Standard Guidelines to judge Liquidity Treasury Proposals on the governance side - Kusama and Polkadot'
				}
			],
			title: 'Bounty Title 1'
		},
		{
			description:
				'Based on the income to the treasuries, the amounts getting burned and the amounts going to proposals, the treasury can be utilized more: this includes spending more funds, extending the categories  ......',
			index: 2,
			proposer: 'Larry Page',
			reward: '10000000000000000000',
			status: 'Pending',
			title: 'Bounty Title 2'
		}
	];

	const toggleBountyDescription = (id: number) => {
		setExpandedBountyId(expandedBountyId === id ? null : id);
	};

	const showRejectModal = (submission: any) => {
		setSelectedSubmission(submission);
		setIsRejectModalVisible(true);
	};

	const showApproveModal = (submission: any) => {
		setSelectedSubmission(submission);
		setIsApproveModalVisible(true);
	};

	const handleCancel = () => {
		setIsRejectModalVisible(false);
		setIsApproveModalVisible(false);
	};

	const handleReject = () => {
		console.log('Rejecting submission:', selectedSubmission);
		setIsRejectModalVisible(false);
	};

	const handleApprove = () => {
		console.log('Approving submission:', selectedSubmission);
		setIsApproveModalVisible(false);
	};

	return (
		<div>
			<div className={`${spaceGrotesk.variable} ${spaceGrotesk.className} mb-4`}>
				<div>
					{bounties.map((bounty) => (
						<div
							key={bounty.index}
							className={`mt-3 rounded-lg border-solid ${
								expandedBountyId === bounty.index ? 'border-[1px] border-[#E5007A] bg-[#f6f8fa] dark:border-[#E5007A]' : 'border-[0.7px] border-[#D2D8E0]'
							}  dark:border-[#4B4B4B] dark:bg-[#0d0d0d]`}
						>
							<div className='flex items-center justify-between gap-3 px-3 pt-3'>
								<div className='flex gap-1 pt-2'>
									<span className='text-[14px] font-medium text-blue-light-medium dark:text-icon-dark-inactive'>{bounty.proposer} </span>

									<p className='ml-1 text-blue-light-medium dark:text-[#9E9E9E]'>|</p>
									<div className='-mt-1  flex items-center gap-1'>
										<ImageIcon
											src={`${theme === 'dark' ? '/assets/activityfeed/darktimer.svg' : '/assets/icons/timer.svg'}`}
											alt='timer'
											className=' -mt-3 h-4   text-blue-light-medium dark:text-[#9E9E9E]'
										/>
										<p className='pt-1 text-[10px] text-blue-light-medium dark:text-[#9E9E9E] xl:text-[12px]'>20th Dec 2021</p>
									</div>
									<p className=' text-blue-light-medium dark:text-[#9E9E9E]'>|</p>

									<span className='ml-1 whitespace-nowrap text-[16px] font-bold text-pink_primary'>{parseBalance(String(bounty.reward || '0'), 2, true, network)}</span>
								</div>
								<div className='-mt-1 flex items-center gap-3'>
									{expandedBountyId !== bounty.index && bounty?.submissions && bounty.submissions.length > 0 && (
										<span className='whitespace-nowrap rounded-md py-2 text-center text-[16px] font-semibold text-pink_primary'>
											Submissions (<span className='text-[14px] font-medium'>{bounty.submissions.length}</span>)
										</span>
									)}
									{bounty.description && (
										<div
											className='cursor-pointer'
											onClick={() => toggleBountyDescription(bounty.index)}
										>
											{expandedBountyId === bounty.index ? (
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
								<span className=' text-[17px] font-medium text-blue-light-medium dark:text-icon-dark-inactive'>#{bounty.index} </span>
								<span
									className={` text-[17px] font-medium text-blue-light-high hover:underline  ${
										expandedBountyId === bounty.index ? 'dark:text-white' : 'dark:text-icon-dark-inactive'
									}`}
								>
									{bounty.title}
								</span>
								<div className='flex flex-col'>
									<span className='mt-1 text-[14px] text-blue-light-high dark:text-white'>{bounty.description}</span>
									<span className='mt-2 cursor-pointer text-[14px] font-medium text-[#1B61FF] hover:text-[#1B61FF]'>Read More</span>
								</div>
							</div>

							{expandedBountyId === bounty.index && bounty.submissions && bounty.submissions.length > 0 && (
								<div className='px-3 pb-3'>
									<Divider className='m-0 mb-2 mt-1 border-[1px] border-solid border-[#D2D8E0] dark:border-[#494b4d]' />
									<div>
										<p className='text-[20px] font-semibold text-blue-light-high dark:text-lightWhite'>
											Submissions <span className='text-[16px] font-medium'>({bounty.submissions.length})</span>
										</p>
									</div>
									{bounty.submissions.map((submission, index) => (
										<div
											key={index}
											className='rounded-lg border-[1px] border-solid border-[#D2D8E0] bg-white'
										>
											<div className='flex items-center justify-between gap-3 px-3 pt-1'>
												<div className='flex gap-1 pt-2'>
													<span className='text-[14px] font-medium text-blue-light-medium dark:text-icon-dark-inactive'>{submission.curator} </span>
													<p className='ml-1 text-blue-light-medium dark:text-[#9E9E9E]'>|</p>
													<div className='-mt-1 flex items-center gap-1'>
														<ImageIcon
															src={`${theme === 'dark' ? '/assets/activityfeed/darktimer.svg' : '/assets/icons/timer.svg'}`}
															alt='timer'
															className=' -mt-3 h-4   text-blue-light-medium dark:text-[#9E9E9E]'
														/>
														<p className='pt-1 text-[10px] text-blue-light-medium dark:text-[#9E9E9E] xl:text-[12px]'>20th Dec 2021</p>
													</div>
													<p className=' text-blue-light-medium dark:text-[#9E9E9E]'>|</p>
													<span className='ml-1 whitespace-nowrap text-[16px] font-bold text-pink_primary'>{parseBalance(String(submission.amount || '0'), 2, true, network)}</span>
												</div>
											</div>
											<div className='px-3 pb-2'>
												<span className=' text-[17px] font-medium text-blue-light-medium dark:text-icon-dark-inactive'>#{index + 1} </span>
												<span className=' text-[17px] font-medium text-blue-light-high'>{submission.title}</span>
												<div className='flex flex-col'>
													<span className='mt-1 text-[14px] text-blue-light-high dark:text-white'>{submission.description}</span>
													<span className='mt-2 cursor-pointer text-[14px] font-medium text-[#1B61FF] hover:text-[#1B61FF]'>Read More</span>
												</div>
											</div>
											<Divider className='m-0 mb-2 border-[1px] border-solid border-[#D2D8E0] dark:border-[#494b4d]' />
											<div className='flex justify-between gap-4 p-2'>
												<span
													onClick={() => showRejectModal(submission)}
													className='w-1/2 cursor-pointer rounded-md border border-solid border-pink_primary py-2 text-center text-[14px] font-medium text-pink_primary'
												>
													Reject
												</span>
												<span
													onClick={() => showApproveModal(submission)}
													className='w-1/2 cursor-pointer rounded-md bg-pink_primary py-2 text-center font-medium text-white'
												>
													Approve
												</span>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					))}
				</div>
				<Modal
					title={
						<>
							<CheckCircleOutlined className='pr-2 text-lg' /> <span className='text-[18px] font-bold'>Approve Submission</span>
						</>
					}
					visible={isApproveModalVisible}
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
							onClick={handleApprove}
						>
							Approve
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
						<Input
							id='account'
							placeholder='Account'
							className='mb-4'
							name='account'
							aria-label='Account'
						/>

						<label
							htmlFor='comment'
							className='mb-1 block text-sm text-blue-light-medium'
						>
							Add Comment <span className='text-pink_primary'>*</span>
						</label>
						<Input
							id='comment'
							placeholder='Add Comment'
						/>
					</div>
				</Modal>
				<Modal
					title={
						<>
							<CloseCircleOutlined className='pr-2 text-lg' /> <span className='text-[18px] font-bold'>Reject Submission</span>
						</>
					}
					visible={isRejectModalVisible}
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
							onClick={handleReject}
						>
							Reject
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
						<Input
							id='account'
							placeholder='Account'
							className='mb-4'
							name='account'
							aria-label='Account'
						/>

						<label
							htmlFor='comment'
							className='mb-1 block text-sm text-blue-light-medium'
						>
							Add Comment <span className='text-pink_primary'>*</span>
						</label>
						<Input
							id='comment'
							placeholder='Add Comment'
						/>
					</div>
				</Modal>
			</div>
		</div>
	);
}
export default CuratorSubmission;
