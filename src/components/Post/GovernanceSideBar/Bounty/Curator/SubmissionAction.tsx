// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import { Button, Spin } from 'antd';
import { EditOutlined, ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { ESubmissionStatus } from '~src/types';

interface SubmissionActionProps {
	submission: any;
	loginAddress: string;
	network: string;
	handleDelete: (submission: any) => Promise<void>;
	handleEditClick: (submission: any) => void;
}

const SubmissionAction: React.FC<SubmissionActionProps> = ({ submission, loginAddress, network, handleDelete, handleEditClick }) => {
	const [loading, setLoading] = useState(false);
	const encodedAddress = getEncodedAddress(loginAddress, network);

	const onDelete = async (submission: any) => {
		setLoading(true);
		await handleDelete(submission);
		setLoading(false);
	};

	return (
		<div className='flex w-full'>
			{submission.proposer === encodedAddress && submission.status === ESubmissionStatus.PENDING ? (
				<div className='flex w-full gap-2'>
					<Button
						onClick={() => onDelete(submission)}
						disabled={loading}
						className='h-full w-1/2 cursor-pointer rounded-md border border-solid border-pink_primary pb-1 text-center text-[14px] font-medium text-pink_primary'
					>
						{loading ? <Spin spinning={loading} /> : 'Delete'}
					</Button>
					<Button
						onClick={() => handleEditClick(submission)}
						disabled={loading}
						className='h-full w-1/2 cursor-pointer rounded-md bg-pink_primary pb-1 text-center font-medium text-white'
					>
						<EditOutlined /> Edit
					</Button>
				</div>
			) : (
				submission.status === ESubmissionStatus.PENDING && (
					<span className='w-full cursor-default rounded-md bg-[#fefced] py-2 text-center text-sm font-medium text-[#EDB10A] dark:bg-[#30250d]'>
						<ExclamationCircleOutlined /> Pending
					</span>
				)
			)}
			{submission.status === ESubmissionStatus.APPROVED ? (
				<span className='w-full cursor-default rounded-md bg-[#E0F7E5] py-2 text-center text-sm font-medium text-[#07641C] dark:bg-[#122d15] dark:text-[#1BC240]'>
					<CheckCircleOutlined /> Approved
				</span>
			) : (
				submission.status === ESubmissionStatus.REJECTED && (
					<span className='w-full cursor-default rounded-md bg-[#ffe3e7] py-2 text-center text-sm font-medium text-[#FB123C] dark:bg-[#2f1716] dark:text-[#FF3737]'>
						<CloseCircleOutlined /> Rejected
					</span>
				)
			)}
		</div>
	);
};

export default SubmissionAction;
