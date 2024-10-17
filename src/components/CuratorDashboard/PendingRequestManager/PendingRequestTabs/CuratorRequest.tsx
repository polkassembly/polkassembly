// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import { spaceGrotesk } from 'pages/_app';
import React, { useState } from 'react';
import Alert from '~src/basic-components/Alert';
import { CheckCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { useNetworkSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';

const CuratorRequest = () => {
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
};

function ReceivedRequests() {
	const [isOnChainExpanded, setOnChainExpanded] = useState(false);
	const { theme } = useTheme();
	const [expandedBountyId, setExpandedBountyId] = useState<number | null>(null);
	const [isChildBountyExpanded, setChildBountyExpanded] = useState(false);
	const { network } = useNetworkSelector();

	const bounties = [
		{
			description:
				'Based on the income to the treasuries, the amounts getting burned and the amounts going to proposals, the treasury can be utilized more: this includes spending more funds, extending the categories  ......',
			index: 1,
			proposer: 'Larry Page',
			reward: '10000000000000000000',
			status: 'Approved',
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

	return (
		<div>
			<div className={`${spaceGrotesk.variable} ${spaceGrotesk.className} mb-4`}>
				<Alert
					type='info'
					showIcon
					closable
					message='Requests to become a curator for bounties can be viewed here'
				/>
				<div
					className='mb-4 mt-5 flex cursor-pointer justify-between pr-5'
					onClick={() => setOnChainExpanded(!isOnChainExpanded)}
				>
					<span className={'text-[16px] font-semibold text-blue-light-high dark:text-white'}>
						ON-CHAIN BOUNTY REQUESTS <span className='text-[14px] font-medium dark:text-icon-dark-inactive'>({bounties.length})</span>
					</span>
					<DownOutlined
						className={`${isOnChainExpanded ? '-rotate-180' : ''} transition-transform`}
						style={{ fontSize: '16px', fontWeight: 'bold' }}
					/>
				</div>
				<Divider className='m-0 border-[1px] border-solid border-[#D2D8E0] dark:border-[#494b4d]' />
				{isOnChainExpanded && (
					<div className='mt-5'>
						{bounties.map((bounty) => (
							<div
								key={bounty.index}
								className={`mt-3 rounded-lg border-solid ${
									expandedBountyId === bounty.index ? 'border-[1px] border-[#E5007A] dark:border-[#E5007A]' : 'border-[0.7px] border-[#D2D8E0]'
								} bg-white  dark:border-[#4B4B4B] dark:bg-[#0d0d0d]`}
							>
								<div className='flex items-center justify-between gap-3 px-3 pt-3'>
									<div className='flex gap-1 pt-2'>
										<span className='text-[14px] font-medium text-blue-light-medium dark:text-icon-dark-inactive dark:text-white'>{bounty.proposer} </span>

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

										<span className='ml-1 whitespace-nowrap text-[16px] font-bold text-pink_primary dark:text-[#FF4098]'>
											{parseBalance(String(bounty.reward || '0'), 2, true, network)}
										</span>
									</div>
									<div className='-mt-1 flex items-center gap-3'>
										{bounty.status === 'Pending' ? (
											<span className='w-40 whitespace-nowrap rounded-md bg-pink_primary py-2 text-center text-[14px] font-medium text-white'>Approve</span>
										) : (
											<span className='w-40 whitespace-nowrap rounded-md bg-[#E0F7E5] py-2 text-center text-[14px] font-medium text-[#07641C] dark:bg-[#122d15] dark:text-[#1BC240]'>
												<CheckCircleOutlined /> Approved
											</span>
										)}{' '}
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
									<span className={'text-[17px] font-medium text-blue-light-high hover:underline dark:text-white'}>{bounty.title}</span>
								</div>

								{expandedBountyId === bounty.index && bounty.description && (
									<div className='px-3 pb-3'>
										<span className='text-[14px] text-blue-light-high dark:text-white'>{bounty.description}</span>
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
							</div>
						))}
					</div>
				)}

				<div
					className='mb-4 mt-6 flex cursor-pointer justify-between pr-5'
					onClick={() => setChildBountyExpanded(!isChildBountyExpanded)}
				>
					<span className={'text-[16px] font-semibold text-blue-light-high dark:text-white'}>
						CHILD BOUNTY REQUESTS <span className='text-[14px] font-medium dark:text-icon-dark-inactive'>(0)</span>
					</span>
					<DownOutlined
						className={`${isChildBountyExpanded ? '-rotate-180' : ''} transition-transform`}
						style={{ fontSize: '16px', fontWeight: 'bold' }}
					/>
				</div>
				<Divider className='m-0 border-[1px] border-solid border-[#D2D8E0] dark:border-[#494b4d]' />
				{isChildBountyExpanded && <div className='mt-4'>Content for Child Bounty Requests</div>}
			</div>
		</div>
	);
}

function SentRequests() {
	const [isOnChainExpanded, setOnChainExpanded] = useState(false);
	const { theme } = useTheme();
	const [expandedBountyId, setExpandedBountyId] = useState<number | null>(null);
	const [isChildBountyExpanded, setChildBountyExpanded] = useState(false);
	const { network } = useNetworkSelector();

	const bounties = [
		{
			description:
				'Based on the income to the treasuries, the amounts getting burned and the amounts going to proposals, the treasury can be utilized more: this includes spending more funds, extending the categories  ......',
			index: 1,
			proposer: 'Larry Page',
			reward: '10000000000000000000',
			status: 'Approved',
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

	return (
		<div>
			<div className={`${spaceGrotesk.variable} ${spaceGrotesk.className} mb-4`}>
				<Alert
					type='info'
					showIcon
					closable
					message='Requests to become a curator for bounties can be viewed here'
				/>
				<div
					className='mb-4 mt-5 flex cursor-pointer justify-between pr-5'
					onClick={() => setOnChainExpanded(!isOnChainExpanded)}
				>
					<span className={'text-[16px] font-semibold text-blue-light-high dark:text-white'}>
						ON-CHAIN BOUNTY REQUESTS <span className='text-[14px] font-medium dark:text-icon-dark-inactive'>({bounties.length})</span>
					</span>
					<DownOutlined
						className={`${isOnChainExpanded ? '-rotate-180' : ''} transition-transform`}
						style={{ fontSize: '16px', fontWeight: 'bold' }}
					/>
				</div>
				<Divider className='m-0 border-[1px] border-solid border-[#D2D8E0] dark:border-[#494b4d]' />
				{isOnChainExpanded && (
					<div className='mt-5'>
						{bounties.map((bounty) => (
							<div
								key={bounty.index}
								className={`mt-3 rounded-lg border-solid ${
									expandedBountyId === bounty.index ? 'border-[1px] border-[#E5007A] dark:border-[#E5007A]' : 'border-[0.7px] border-[#D2D8E0]'
								} bg-white  dark:border-[#4B4B4B] dark:bg-[#0d0d0d]`}
							>
								<div className='flex items-center justify-between gap-3 px-3 pt-3'>
									<div className='flex gap-1 pt-2'>
										<span className='text-[14px] font-medium text-blue-light-medium dark:text-icon-dark-inactive dark:text-white'>{bounty.proposer} </span>

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

										<span className='ml-1 whitespace-nowrap text-[16px] font-bold text-pink_primary dark:text-[#FF4098]'>
											{parseBalance(String(bounty.reward || '0'), 2, true, network)}
										</span>
									</div>
									<div className='-mt-1 flex items-center gap-3'>
										{bounty.status === 'Pending' ? (
											<span className='w-40 whitespace-nowrap rounded-md bg-pink_primary py-2 text-center text-[14px] font-medium text-white'>Approve</span>
										) : (
											<span className='w-40 whitespace-nowrap rounded-md bg-[#E0F7E5] py-2 text-center text-[14px] font-medium text-[#07641C] dark:bg-[#122d15] dark:text-[#1BC240]'>
												<CheckCircleOutlined /> Approved
											</span>
										)}{' '}
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
									<span className={'text-[17px] font-medium text-blue-light-high hover:underline dark:text-white'}>{bounty.title}</span>
								</div>

								{expandedBountyId === bounty.index && bounty.description && (
									<div className='px-3 pb-3'>
										<span className='text-[14px] text-blue-light-high dark:text-white'>{bounty.description}</span>
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
							</div>
						))}
					</div>
				)}

				<div
					className='mb-4 mt-6 flex cursor-pointer justify-between pr-5'
					onClick={() => setChildBountyExpanded(!isChildBountyExpanded)}
				>
					<span className={'text-[16px] font-semibold text-blue-light-high dark:text-white'}>
						CHILD BOUNTY REQUESTS <span className='text-[14px] font-medium dark:text-icon-dark-inactive'>(0)</span>
					</span>
					<DownOutlined
						className={`${isChildBountyExpanded ? '-rotate-180' : ''} transition-transform`}
						style={{ fontSize: '16px', fontWeight: 'bold' }}
					/>
				</div>
				<Divider className='m-0 border-[1px] border-solid border-[#D2D8E0] dark:border-[#494b4d]' />
				{isChildBountyExpanded && <div className='mt-4'>Content for Child Bounty Requests</div>}
			</div>
		</div>
	);
}

export default CuratorRequest;
