// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider } from 'antd';
import dayjs from 'dayjs';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import Alert from '~src/basic-components/Alert';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { EChildbountySubmissionStatus, IChildBountySubmission, NotificationStatus } from '~src/types';
import ImageIcon from '~src/ui-components/ImageIcon';
import Markdown from '~src/ui-components/Markdown';
import NameLabel from '~src/ui-components/NameLabel';
import RejectModal from '../CuratorActionModals/RejectModal';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import queueNotification from '~src/ui-components/QueueNotification';
import { MessageType } from '~src/auth/types';
import SubmissionAction from '~src/components/Post/GovernanceSideBar/Bounty/Curator/SubmissionAction';
import MakeChildBountySubmisionModal from '~src/components/Post/GovernanceSideBar/Bounty/Curator/MakeChildBountySubmision';

interface Props {
	className?: string;
	submission: IChildBountySubmission;
	index: number;
	submissions: IChildBountySubmission[];
	updateData: (pre: IChildBountySubmission[]) => void;
	bountyId: number;
}

const Submission = ({ className, submission, index, updateData, submissions, bountyId }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();
	const { loginAddress } = useUserDetailsSelector();
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
	const [comment, setComment] = useState<string>('');

	const handleApprove = () => {
		handleStatusUpdate(EChildbountySubmissionStatus.APPROVED);
	};

	const handleStatusUpdate = async (updatedStatus: EChildbountySubmissionStatus.APPROVED | EChildbountySubmissionStatus.REJECTED, rejectionMessage = '') => {
		if (!submission) return;

		const payload = {
			curatorAddress: loginAddress,
			parentBountyIndex: submission?.parentBountyIndex,
			proposerAddress: submission?.proposer,
			rejectionMessage,
			submissionId: submission?.id,
			updatedStatus
		};

		const { data, error } = await nextApiClientFetch<MessageType>('/api/v1/bounty/curator/submissions/updateSubmissionStatus', payload);

		if (error) {
			queueNotification({
				header: 'Error!',
				message: error,
				status: NotificationStatus.ERROR
			});
		}
		if (data) {
			const updatedData = submissions?.map((item: IChildBountySubmission) => {
				if (item?.id !== submission?.id) {
					return { ...item, status: updatedStatus };
				}
				return item;
			});
			updateData(updatedData);
			queueNotification({
				header: 'Success!',
				message: data?.message,
				status: NotificationStatus.SUCCESS
			});
		}
		if (error) {
			queueNotification({
				header: 'Error!',
				message: error,
				status: NotificationStatus.ERROR
			});
		}
	};

	const handleDelete = async () => {
		const payload = {
			curatorAddress: loginAddress,
			parentBountyIndex: submission?.parentBountyIndex,
			proposerAddress: submission?.proposer,
			rejectionMessage: '',
			submissionId: submission?.id,
			updatedStatus: EChildbountySubmissionStatus.DELETED
		};

		const { data, error } = await nextApiClientFetch<MessageType>('/api/v1/bounty/curator/submissions/updateSubmissionStatus', payload);

		if (data) {
			const updatedData = submissions?.filter((item: IChildBountySubmission) => item?.id !== submission?.id);
			updateData(updatedData);
			queueNotification({
				header: 'Success!',
				message: data?.message,
				status: NotificationStatus.SUCCESS
			});
		}
		if (error) {
			queueNotification({
				header: 'Error!',
				message: error,
				status: NotificationStatus.ERROR
			});
		}
	};

	return (
		<div className={className}>
			<div
				key={submission?.id}
				className='mt-3 rounded-lg border-[1px] border-solid border-section-light-container bg-white dark:bg-[#1a1a1a]'
			>
				<div className='flex items-center justify-between gap-3 px-4 pt-2'>
					<div className='flex gap-1 pt-2'>
						<span className='text-[14px] font-medium text-lightBlue dark:text-icon-dark-inactive'>
							<NameLabel defaultAddress={submission?.proposer} />
						</span>
						<p className='ml-1 text-lightBlue dark:text-[#9E9E9E]'>|</p>
						<div className='-mt-1 flex items-center gap-1'>
							<ImageIcon
								src={`${theme === 'dark' ? '/assets/activityfeed/darktimer.svg' : '/assets/icons/timer.svg'}`}
								alt='timer'
								className='-mt-3 h-4 text-lightBlue dark:text-[#9E9E9E]'
							/>
							<p className='pt-1 text-[10px] text-lightBlue dark:text-[#9E9E9E] xl:text-sm'>{dayjs(submission?.createdAt).format('Do MMM YYYY')} </p>
						</div>
						<p className='text-lightBlue dark:text-[#9E9E9E]'>|</p>
						<span className='ml-1 whitespace-nowrap text-[16px] font-bold text-pink_primary dark:text-[#FF4098]'>
							{parseBalance(String(submission?.reqAmount || '0'), 2, true, network)}
						</span>
					</div>
				</div>
				<div className='px-4 pb-2'>
					<span className='text-base font-medium text-lightBlue dark:text-icon-dark-inactive'>#{index + 1}</span>
					<span className='pl-2 text-base font-medium text-blue-light-high dark:text-white'>{submission?.title}</span>
					<div className='flex flex-col'>
						<Markdown
							md={submission?.content}
							className='mt-1 text-[14px] text-blue-light-high dark:text-white'
						/>
						<span className='mt-2 cursor-pointer text-[14px] font-medium text-[#1B61FF] hover:text-[#1B61FF]'>Read More</span>
					</div>
				</div>
				{submission?.status === EChildbountySubmissionStatus.OUTDATED && (
					<Alert
						showIcon={true}
						message={'This Bounty has been closed'}
						className='mx-4 mb-2'
					/>
				)}
				<Divider className='m-0 mb-2 border-[1px] border-solid border-section-light-container dark:border-separatorDark' />
				<div className='flex justify-between gap-4 p-2'>
					<SubmissionAction
						submission={submission}
						handleApprove={handleApprove}
						showRejectModal={setIsRejectModalOpen}
						handleDelete={handleDelete}
						handleEditClick={setIsEditModalOpen}
						isApproveButton
					/>
				</div>
			</div>

			{isRejectModalOpen && (
				<RejectModal
					open={isRejectModalOpen}
					setOpen={setIsRejectModalOpen}
					handleReject={() => handleStatusUpdate(EChildbountySubmissionStatus.REJECTED, comment)}
					comment={comment}
					setComment={setComment}
				/>
			)}

			<MakeChildBountySubmisionModal
				bountyId={bountyId}
				open={isEditModalOpen}
				setOpen={setIsEditModalOpen}
				editing
				submission={submission}
				ModalTitle={'Edit Submission'}
				onSubmissionCreated={(updatedData: IChildBountySubmission) => {
					updateData(
						submissions?.map((item) => {
							if (item?.id == updatedData?.id) {
								return updatedData || item;
							}
							return item;
						})
					);
				}}
			/>
		</div>
	);
};
export default Submission;
