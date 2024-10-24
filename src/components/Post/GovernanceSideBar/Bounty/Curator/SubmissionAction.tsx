// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import { Modal } from 'antd';
import { EditOutlined, ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { ESubmissionStatus } from '~src/types';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { poppins } from 'pages/_app';
import classNames from 'classnames';

interface SubmissionActionProps {
	submission: any;
	loginAddress: string;
	network: string;
	handleDelete: (submission: any) => Promise<void>;
	handleEditClick: (submission: any) => void;
}

const StatusUI = ({ status }: { status: ESubmissionStatus }) => {
	return (
		<div
			className={classNames(
				'flex w-full cursor-default items-center justify-center gap-1.5 rounded-md py-2 text-center text-sm font-medium capitalize',
				status == ESubmissionStatus.PENDING
					? 'bg-[#fefced] text-[#EDB10A] dark:bg-[#30250d]'
					: status == ESubmissionStatus.APPROVED
					? ' bg-[#E0F7E5] text-[#07641C] dark:bg-[#122d15] dark:text-[#1BC240]'
					: 'bg-[#ffe3e7] text-[#FB123C] dark:bg-[#2f1716] dark:text-[#FF3737] '
			)}
		>
			<span>{status == ESubmissionStatus.PENDING ? <ExclamationCircleOutlined /> : status == ESubmissionStatus.APPROVED ? <CheckCircleOutlined /> : <CloseCircleOutlined />}</span>
			<span>{status}</span>
		</div>
	);
};

const SubmissionAction: React.FC<SubmissionActionProps> = ({ submission, loginAddress, network, handleDelete, handleEditClick }) => {
	const [loading, setLoading] = useState(false);
	const encodedAddress = getEncodedAddress(loginAddress, network);
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

	const handleDeleteSubmission = async () => {
		setLoading(true);
		await handleDelete(submission);
		setLoading(false);
	};

	return (
		<>
			<div className='flex w-full'>
				{submission.proposer === encodedAddress && submission.status === ESubmissionStatus.PENDING ? (
					<div className='flex w-full gap-2'>
						<CustomButton
							variant='default'
							onClick={() => setIsDeleteConfirm(true)}
							disabled={loading}
							className='h-8 w-full'
							loading={loading}
						>
							Delete
						</CustomButton>
						<CustomButton
							variant='primary'
							onClick={() => handleEditClick(submission)}
							disabled={loading}
							className='h-8 w-full'
						>
							<EditOutlined /> Edit
						</CustomButton>
					</div>
				) : (
					<StatusUI status={submission?.status} />
				)}
			</div>
			<Modal
				maskClosable={false}
				open={isDeleteConfirm}
				onCancel={() => {
					setIsDeleteConfirm(false);
				}}
				footer={false}
				className={`${poppins.className} ${poppins.variable} opengov-proposals w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={'dark:bg-modalOverlayDark'}
				closable={false}
				title={
					<div className='items-center gap-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						Delete Your Submission
					</div>
				}
			>
				<div className='mt-6 px-6'>
					<span className='text-sm text-bodyBlue dark:text-blue-dark-high'>
						Your treasury proposal information (Title, Description & Tags) would be lost. Are you sure you want to exit proposal creation process?{' '}
					</span>
					<div className='-mx-6 mt-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark'>
						<CustomButton
							onClick={handleDeleteSubmission}
							buttonsize='sm'
							text='Yes'
							variant='default'
						/>
						<CustomButton
							onClick={() => {
								setIsDeleteConfirm(false);
							}}
							height={40}
							width={200}
							text='Cancel'
							variant='primary'
						/>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default SubmissionAction;
