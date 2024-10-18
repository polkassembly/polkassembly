// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useEffect, useState } from 'react';
import { Modal, Button, Select, Form, Divider } from 'antd';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import ImageIcon from '~src/ui-components/ImageIcon';
import Input from '~src/basic-components/Input';
import BalanceInput from '~src/ui-components/BalanceInput';
import TextEditor from '~src/ui-components/TextEditor';
import { useTheme } from 'next-themes';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { parseBalance } from '../Modal/VoteData/utils/parseBalaceToReadable';
import dayjs from 'dayjs';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ESubmissionStatus, IChildBountySubmission } from '~src/types';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Skeleton from '~src/basic-components/Skeleton';
import Link from 'next/link';
import { usePostDataContext } from '~src/context';
import getEncodedAddress from '~src/util/getEncodedAddress';
import Address from '~src/ui-components/Address';
import classNames from 'classnames';

const { Option } = Select;

interface IBountyChildBountiesProps {
	bountyId?: number | string | null;
}

const Submission: FC<IBountyChildBountiesProps> = (props) => {
	const { bountyId } = props;
	const {
		postData: { curator }
	} = usePostDataContext();
	const { resolvedTheme: theme } = useTheme();
	const { loginAddress } = useUserDetailsSelector();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [bountySubmission, setBountySubmission] = useState<IChildBountySubmission[]>([]);
	const { network } = useNetworkSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState<ESubmissionStatus | null>(null);

	const showModal = () => {
		setIsModalVisible(true);
	};
	const handleCancel = () => {
		setIsModalVisible(false);
	};

	const fetchBountySubmission = async () => {
		if (!bountyId || loading) return;
		try {
			setLoading(true);
			const { data, error } = await nextApiClientFetch<IChildBountySubmission[]>('/api/v1/bounty/curator/submissions/getAllSubmissionsForBounty', {
				parentBountyIndex: bountyId
			});
			if (error) {
				console.error('Error fetching bounty submission:', error);
				return;
			}
			if (data) {
				setBountySubmission(data || []);
			}
		} catch (err) {
			console.error('Error fetching bounty submission:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (bountyId) {
			fetchBountySubmission();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [bountyId]);

	const getFilteredSumbissions = () => {
		switch (activeTab) {
			case ESubmissionStatus.PENDING:
				return bountySubmission?.filter((item: IChildBountySubmission) => item?.status == ESubmissionStatus.PENDING);
			default:
				return bountySubmission || [];
		}
	};

	return (
		<GovSidebarCard>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-1'>
					<ImageIcon
						alt='document'
						src='/assets/icons/curator-dashboard/Document.svg'
						className='-mt-3'
					/>
					<h4 className='text-[20px] font-semibold text-[#334D6E]  dark:text-white'>
						Submissions <span className='text-[16px] font-normal'>({bountySubmission?.length || 0})</span>{' '}
					</h4>
				</div>
				{getEncodedAddress(curator, network) == getEncodedAddress(loginAddress, network) && (
					<Link href='/curator-dashboard'>
						<p className='text-sm font-medium text-pink_primary'>View All</p>
					</Link>
				)}
			</div>
			<div className='dark:text- mb-4 flex items-center gap-6 rounded-lg bg-[#F5F6F8] px-3 py-2 text-center text-sm text-bodyBlue dark:bg-section-dark-garyBackground dark:text-white'>
				<span
					onClick={() => setActiveTab(null)}
					className={classNames(activeTab == null ? 'text-pink_primary' : '', 'border-pink_primary px-4 py-1 font-medium shadow-sm')}
				>
					All
				</span>
				<span
					onClick={() => setActiveTab(ESubmissionStatus.PENDING)}
					className={activeTab == ESubmissionStatus.PENDING ? 'text-pink_primary' : ''}
				>
					Pending
				</span>
			</div>
			{loading ? (
				<Skeleton active />
			) : (
				<>
					{getFilteredSumbissions()?.map((submission: any, index: number) => {
						return (
							<div
								key={submission?.id}
								className='rounded-lg border-[1px] border-solid border-[#D2D8E0] p-3'
							>
								<div>
									<div className='flex items-center gap-1'>
											<Address
												address={submission?.proposer}
												displayInline
												isTruncateUsername
											/>
										<Divider
											type='vertical'
											className='border-l-1 border-lightBlue dark:border-icon-dark-inactive'
										/>
										<div className='flex items-center gap-1'>
											<ImageIcon
												src={theme === 'dark' ? '/assets/activityfeed/darktimer.svg' : '/assets/icons/timer.svg'}
												alt='timer'
												className='h-4 text-blue-light-medium dark:text-[#9E9E9E]'
											/>
											<p className=' whitespace-nowrap text-xs text-blue-light-medium dark:text-[#9E9E9E]'>{dayjs(submission?.createdAt)?.format('Do MMM YYYY')}</p>
										</div>
										<p className='text-blue-light-medium dark:text-[#9E9E9E]'>|</p>
										<span className='ml-1 whitespace-nowrap text-sm font-medium text-pink_primary'>{parseBalance(String(submission?.reqAmount || '0'), 2, true, network)}</span>
									</div>
									<div className='px-3 pb-3'>
										<span className='text-sm font-medium text-blue-light-medium dark:text-icon-dark-inactive'>#{index + 1} </span>
										<span className={'text-sm font-medium text-blue-light-high hover:underline dark:text-icon-dark-inactive'}>{submission?.title}</span>
									</div>
									<div className='flex w-full'>
										{submission.status === ESubmissionStatus.APPROVED ? (
											<span className='w-full cursor-default rounded-md bg-[#E0F7E5] py-2 text-center text-sm font-medium text-[#07641C]'>
												<CheckCircleOutlined /> Approved
											</span>
										) : submission.status === ESubmissionStatus.REJECTED ? (
											<>
												<span className='w-full cursor-default rounded-md bg-[#ffe3e7] py-2 text-center text-sm font-medium text-[#FB123C]'>
													<CloseCircleOutlined /> Rejected
												</span>
											</>
										) : (
											submission.status === ESubmissionStatus.PENDING && (
												<span className='w-full cursor-default rounded-md bg-[#fefced] py-2 text-center text-sm font-medium text-[#EDB10A]'>
													<ExclamationCircleOutlined /> Pending
												</span>
											)
										)}
									</div>
								</div>
							</div>
						);
					})}
				</>
			)}
			<div
				className='flex cursor-pointer items-center justify-center rounded-md border-[0.7px] border-solid border-[#D2D8E0] bg-[#E5007A] px-2 py-1 dark:border-separatorDark'
				onClick={showModal}
			>
				<ImageIcon
					src='/assets/icons/Document.svg'
					alt='submit'
				/>
				<h5 className='pt-2 text-sm text-white'>Make Submission</h5>
			</div>

			<Modal
				title='Make Submission'
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={null}
				destroyOnClose
			>
				<Form
					layout='vertical'
					onFinish={() => setIsModalVisible(false)}
				>
					<Form.Item
						label='Select Account'
						name='account'
					>
						<Select placeholder='Select an account'>
							<Option value='account1'>Account 1</Option>
							<Option value='account2'>Account 2</Option>
						</Select>
					</Form.Item>
					<Form.Item
						label={
							<div className='flex items-center gap-1.5 text-sm font-medium text-lightBlue dark:text-white'>
								Title <span className='text-red-500'>*</span>
							</div>
						}
						name='title'
						className='-mt-3'
					>
						<Input placeholder='Enter title' />
					</Form.Item>

					<BalanceInput
						label={'Request Amount'}
						helpText={'Enter an amount for your request'}
						placeholder={'Enter an amount for your request '}
						// onChange={onBalanceChange}
						className='-mt-3 border-section-light-container text-sm font-medium dark:border-[#3B444F]'
						// theme={theme}
					/>

					<Form.Item
						label='Links'
						name='links'
						className='-mt-3'
					>
						<Input placeholder='Add relevant links' />
					</Form.Item>

					<Form.Item
						label={
							<div className='flex items-center gap-1.5 text-sm font-medium text-lightBlue dark:text-white'>
								Categories <span className='text-red-500'>*</span>
							</div>
						}
						name='categories'
						className='-mt-3'
					>
						<Input placeholder='Add more context for your request' />
					</Form.Item>
					<Form.Item
						label={
							<div className='flex items-center gap-1.5 text-sm font-medium text-lightBlue dark:text-white'>
								Description <span className='text-red-500'>*</span>
							</div>
						}
						name='description'
						className='-mt-3'
					>
						<TextEditor
							name='content'
							theme={theme}
							// value={value}
							// theme={theme}
							height={150}
							onChange={() => {}}
							// onChange={onChangeWrapper}
							autofocus={false}
						/>{' '}
					</Form.Item>

					<Form.Item>
						<div className='flex justify-end gap-2'>
							<Button onClick={handleCancel}>Cancel</Button>
							<Button
								type='primary'
								htmlType='submit'
							>
								Send
							</Button>
						</div>
					</Form.Item>
				</Form>
			</Modal>
		</GovSidebarCard>
	);
};

export default Submission;
