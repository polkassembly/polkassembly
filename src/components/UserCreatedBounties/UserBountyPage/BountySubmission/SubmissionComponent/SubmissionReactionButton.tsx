// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React, { useState } from 'react';
import { EUserCreatedBountySubmissionStatus } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

const SubmissionReactionButton = ({
	isUsedinModal,
	parentBountyProposerAddress,
	submissionProposerAddress,
	parentBountyIndex,
	submissionId,
	setOpenModal
}: {
	submissionProposerAddress: string;
	parentBountyProposerAddress: string;
	submissionId: string;
	isUsedinModal?: boolean;
	parentBountyIndex: number;
	setOpenModal: (pre: boolean) => void;
}) => {
	const [loading, setLoading] = useState(false);

	const handleSubmissionStatusChange = async (status: EUserCreatedBountySubmissionStatus) => {
		setLoading(true);

		try {
			const { data, error } = await nextApiClientFetch('/api/v1/user-created-bounties/updateSubmissionStatus', {
				parentBountyIndex,
				parentBountyProposerAddress,
				submissionId,
				submissionProposerAddress,
				updatedStatus: status
			});
			if (error || !data) {
				console.log('error in submission modal', error);
				return;
			}
			if (data) {
				setOpenModal(false);
				// window.location.reload()
			}
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			{isUsedinModal && <Divider className='border-l-1 my-4 border-[#D2D8E0B2] dark:border-separatorDark md:inline-block' />}
			<div className={`${isUsedinModal ? 'flex items-center justify-end gap-2' : ''}`}>
				<button
					className={`${
						isUsedinModal ? 'w-[156px]' : 'w-full'
					} cursor-pointer rounded-[4px] border border-solid border-[#E5007A] bg-transparent px-4 py-2 text-sm font-medium text-[#E5007A]`}
					onClick={() => handleSubmissionStatusChange(EUserCreatedBountySubmissionStatus.REJECTED)}
					disabled={loading}
				>
					{loading ? 'Rejecting...' : 'Reject'}
				</button>
				<button
					className={`${
						isUsedinModal ? 'w-[156px]' : 'w-full'
					} cursor-pointer rounded-[4px] border border-solid border-[#E5007A] bg-[#E5007A] px-4 py-2 text-sm font-medium text-white`}
					onClick={() => handleSubmissionStatusChange(EUserCreatedBountySubmissionStatus.APPROVED)}
					disabled={loading}
				>
					{loading ? 'Approving...' : 'Approve'}
				</button>
			</div>
		</div>
	);
};

export default SubmissionReactionButton;
