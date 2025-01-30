// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Modal, Spin } from 'antd';
import { dmSans } from 'pages/_app';
import React, { useState } from 'react';
import { styled } from 'styled-components';
import { useCurrentTokenDataSelector, useNetworkSelector } from '~src/redux/selectors';
import { EUserCreatedBountyActions, IChildBountySubmission, NotificationStatus } from '~src/types';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import NameLabel from '~src/ui-components/NameLabel';
import formatBnBalance from '~src/util/formatBnBalance';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import { ClockCircleOutlined } from '@ant-design/icons';
import Markdown from '~src/ui-components/Markdown';
import { useTheme } from 'next-themes';
import SubmissionReactionButton from './SubmissionReactionButton';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import queueNotification from '~src/ui-components/QueueNotification';

interface Props {
	openModal: boolean;
	showReactionButtons: boolean;
	setOpenModal: (pre: boolean) => void;
	submission: IChildBountySubmission;
	submissionProposerAddress: string;
	parentBountyProposerAddress: string;
	submissionId: string;
	parentBountyIndex: number;
	isUsedForDeletingSubmission?: boolean;
	fetchSubmissions?: () => Promise<void>;
	setIsUsedForDeletingSubmission?: (pre: boolean) => void;
	setOpenModalId?: (pre: string | null) => void;
}

const SubmissionDetailModal = ({
	openModal,
	setOpenModal,
	submission,
	showReactionButtons,
	parentBountyProposerAddress,
	submissionProposerAddress,
	parentBountyIndex,
	submissionId,
	isUsedForDeletingSubmission,
	fetchSubmissions,
	setIsUsedForDeletingSubmission,
	setOpenModalId
}: Props) => {
	const { title, proposer, createdAt, reqAmount, content, link } = submission;
	const { currentTokenPrice } = useCurrentTokenDataSelector();
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const date = new Date(createdAt);
	const [isDeleting, setIsDeleting] = useState(false);

	const deleteSubmission = async (submissionId: string) => {
		setIsDeleting(true);
		try {
			const requestBody = {
				action: EUserCreatedBountyActions.DELETE,
				parentBountyIndex: parentBountyIndex,
				proposerAddress: proposer,
				submissionId: submissionId
			};
			const { data, error } = await nextApiClientFetch('/api/v1/user-created-bounties/submissions/editOrDeleteSubmission', requestBody);
			if (error || !data) {
				console.error('Failed to delete submission:', error);
				queueNotification({
					header: 'Error',
					message: 'Failed to delete submission.',
					status: NotificationStatus.ERROR
				});
			} else {
				queueNotification({
					header: 'Success!',
					message: 'Submission deleted successfully.',
					status: NotificationStatus.SUCCESS
				});
				fetchSubmissions && fetchSubmissions();
				setOpenModalId && setOpenModalId(null);
				setIsUsedForDeletingSubmission && setIsUsedForDeletingSubmission(false);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Modal
			title={
				<div className={`${dmSans.variable} ${dmSans.className} text-xl font-bold text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high`}>
					<span className='mt-1'>{title}</span>
					<Divider className='border-l-1 my-1  border-[#D2D8E0B2] dark:border-separatorDark md:inline-block' />
				</div>
			}
			open={openModal}
			footer={false}
			zIndex={1008}
			wrapClassName={' dark:bg-modalOverlayDark rounded-[14px]'}
			className={` ${dmSans.variable} ${dmSans.className} w-[605px] rounded-[14px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			onCancel={() => {
				setOpenModal(false);
				setIsUsedForDeletingSubmission && setIsUsedForDeletingSubmission(false);
			}}
			closeIcon={
				<span onClick={() => setOpenModal(false)}>
					<CloseIcon className=' text-lightBlue dark:text-icon-dark-inactive' />
				</span>
			}
		>
			<Spin spinning={isDeleting}>
				<div>
					<div className='flex items-center gap-1 rounded-full'>
						<NameLabel
							defaultAddress={proposer}
							usernameClassName='text-xs -mt-[4px] text-ellipsis overflow-hidden'
							className='flex items-center'
							isUsedInBountyPage={true}
						/>

						{!!createdAt && (
							<>
								<Divider
									type='vertical'
									className='border-l-1 mx-1 border-[#D2D8E0B2] dark:border-separatorDark md:inline-block'
								/>
								<div className='items-center text-xs font-normal text-lightBlue dark:text-icon-dark-inactive'>
									<ClockCircleOutlined className='mr-[2px]' /> <span></span>
									{getRelativeCreatedAt(date)}
								</div>
							</>
						)}
						{!!reqAmount && (
							<>
								<Divider
									type='vertical'
									className='border-l-1 mx-1 border-[#D2D8E0B2] dark:border-separatorDark md:inline-block'
								/>
								<span className='text-base font-bold text-[#E5007A]'>
									$
									{(
										Number(currentTokenPrice) * Number(formatBnBalance(String(reqAmount), { numberAfterComma: 6, withThousandDelimitor: false, withUnit: false }, network))
									).toFixed(2)}
								</span>
							</>
						)}
					</div>
					<Divider className='border-l-1 my-1 border-[#D2D8E0B2] dark:border-separatorDark md:inline-block' />
					{content && (
						<Markdown
							md={content}
							theme={theme}
							disableQuote={true}
						/>
					)}
					{!!link && (
						<div className='flex w-min items-center gap-4 rounded-[10px] border border-solid border-[#D2D8E0B2] px-3 py-2 dark:border-separatorDark'>
							<span className='text-sm text-blue-light-medium dark:text-blue-dark-medium'>Link:</span>
							<span className='whitespace-nowrap text-[13px] text-blue-light-high dark:text-blue-dark-high'>{link}</span>
						</div>
					)}
					{showReactionButtons && (
						<SubmissionReactionButton
							isUsedinModal={true}
							parentBountyProposerAddress={parentBountyProposerAddress}
							submissionProposerAddress={submissionProposerAddress}
							parentBountyIndex={parentBountyIndex}
							submissionId={submissionId}
							setOpenModal={setOpenModal}
						/>
					)}
					{isUsedForDeletingSubmission && (
						<div className='mt-4 flex justify-end'>
							<button
								onClick={() => deleteSubmission(submissionId)}
								className={`mt-3 h-9 w-[160px] cursor-pointer rounded-[4px] border border-solid border-[#E5007A] bg-[#E5007A] ${
									isDeleting ? 'cursor-not-allowed opacity-60' : ''
								} flex items-center justify-center px-4 py-2 text-sm font-medium text-white`}
								disabled={isDeleting}
							>
								{isDeleting ? <span className='spinner-border inline-block h-4 w-4 animate-spin rounded-full border-t-2 border-white'></span> : 'Delete Submission'}
							</button>
						</div>
					)}
				</div>
			</Spin>
		</Modal>
	);
};

export default styled(SubmissionDetailModal)`
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px;
	}
`;
