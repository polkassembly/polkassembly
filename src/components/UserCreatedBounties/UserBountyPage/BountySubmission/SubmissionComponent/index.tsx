// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { EUserCreatedBountySubmissionStatus, IChildBountySubmission } from '~src/types';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import { ClockCircleOutlined } from '@ant-design/icons';
import NameLabel from '~src/ui-components/NameLabel';
import { Divider } from 'antd';
import { useCurrentTokenDataSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import formatBnBalance from '~src/util/formatBnBalance';
import dynamic from 'next/dynamic';
import SubmissionReactionButton from './SubmissionReactionButton';

const SubmissionDetailModal = dynamic(() => import('./SubmissionDetailModal'), {
	ssr: false
});
const SubmissionTippingModal = dynamic(() => import('./SubmissionTippingModal'), {
	ssr: false
});
const CreateSubmissionForm = dynamic(() => import('../CreateSubmissionForm'), {
	ssr: false
});

const SubmissionComponent = ({
	submissions,
	bountyProposer,
	bountyIndex,
	fetchSubmissions
}: {
	submissions: IChildBountySubmission[];
	bountyProposer: string;
	bountyIndex: number;
	fetchSubmissions: () => Promise<void>;
}) => {
	const { currentTokenPrice } = useCurrentTokenDataSelector();
	const { network } = useNetworkSelector();
	const { loginAddress } = useUserDetailsSelector();
	const [openModalId, setOpenModalId] = useState<string | null>(null);
	const [openTipping, setOpenTipping] = useState<boolean>(false);
	const [openEditSubmissionModal, setOpenEditSubmissionModal] = useState<boolean>(false);
	const [editingSubmission, setEditingSubmission] = useState<IChildBountySubmission | null>(null);
	const [isUsedForDeletingSubmission, setIsUsedForDeletingSubmission] = useState(false);

	const handleEditSuccess = () => {
		fetchSubmissions && fetchSubmissions();
		setOpenEditSubmissionModal(false);
	};

	return (
		<section className='mt-5 flex flex-col gap-4'>
			{submissions.map((submission) => {
				const { id, proposer, reqAmount, title, createdAt, status } = submission;
				const date = new Date(createdAt);
				return (
					<div key={id}>
						<div className='cursor-pointer rounded-[8px] border border-solid border-[#D2D8E0] p-3 dark:border-separatorDark'>
							<div
								className='flex items-center justify-between'
								onClick={() => setOpenModalId(id)}
							>
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
													Number(currentTokenPrice) * Number(formatBnBalance(String(reqAmount), { numberAfterComma: 2, withThousandDelimitor: false, withUnit: false }, network))
												).toFixed(2)}
											</span>
										</>
									)}
								</div>
								<div>
									{status === EUserCreatedBountySubmissionStatus.REJECTED && (
										<div className='flex items-center justify-between gap-[5px] rounded-sm bg-[#FF52521A] px-[6px] py-1'>
											<div className='h-[6px] w-[6px] rounded-full bg-[#DF0000]'></div>
											<span className=' text-xs font-medium text-[#DF0000]'>REJECTED</span>
										</div>
									)}

									{status === EUserCreatedBountySubmissionStatus.APPROVED && (
										<div className='flex items-center justify-between gap-[5px] rounded-sm bg-[#11C7001A] px-[6px] py-1'>
											<div className='h-[6px] w-[6px] rounded-full bg-[#0B8A00]'></div>
											<span className='text-xs font-medium text-[#0B8A00]'>APPROVED</span>
										</div>
									)}
									{status === EUserCreatedBountySubmissionStatus.PAID && (
										<div className='flex items-center justify-between gap-[5px] rounded-sm bg-[#11C7001A] px-[6px] py-1'>
											<div className='h-[6px] w-[6px] rounded-full bg-[#0B8A00]'></div>
											<span className='text-xs font-medium text-[#0B8A00]'>PAID</span>
										</div>
									)}
								</div>
							</div>
							<div
								className='mt-1'
								onClick={() => setOpenModalId(id)}
							>
								<span className='text-base font-semibold tracking-wide text-blue-light-high dark:text-blue-dark-high '>{title}</span>
							</div>
							{status === EUserCreatedBountySubmissionStatus.PENDING && bountyProposer == loginAddress && (
								<SubmissionReactionButton
									parentBountyProposerAddress={bountyProposer}
									submissionProposerAddress={submission.proposer}
									parentBountyIndex={bountyIndex}
									submissionId={submission.id}
									setOpenModal={(open) => setOpenModalId(open ? id : null)}
									fetchSubmissions={fetchSubmissions}
								/>
							)}
							{status === EUserCreatedBountySubmissionStatus.APPROVED && bountyProposer == loginAddress && (
								<button
									onClick={(e) => {
										e.stopPropagation();
										setOpenModalId(null);
										setOpenTipping(true);
									}}
									className='mt-3 h-9 w-full cursor-pointer rounded-[4px] border border-solid border-[#E5007A] bg-[#E5007A] px-4 py-2 text-sm font-medium text-white'
								>
									Pay
								</button>
							)}
							{status === EUserCreatedBountySubmissionStatus.PENDING && proposer == loginAddress && (
								<div className='flex items-center gap-3'>
									<button
										onClick={() => {
											setIsUsedForDeletingSubmission(true);
											setOpenModalId(id);
										}}
										className='mt-3 h-9 w-full cursor-pointer rounded-[4px] border border-solid border-[#E5007A] bg-transparent px-4 py-2 text-sm font-medium text-pink_primary'
									>
										Delete
									</button>
									<button
										onClick={() => {
											setOpenEditSubmissionModal(true);
											setEditingSubmission(submission);
										}}
										className='mt-3 h-9 w-full cursor-pointer rounded-[4px] border border-solid border-[#E5007A] bg-[#E5007A] px-4 py-2 text-sm font-medium text-white'
									>
										Edit
									</button>
								</div>
							)}
						</div>
						{editingSubmission && (
							<CreateSubmissionForm
								openModal={openEditSubmissionModal}
								setOpenModal={setOpenEditSubmissionModal}
								parentBountyIndex={bountyIndex}
								isUsedForEditing={true}
								submission={editingSubmission}
								onEditSuccess={handleEditSuccess}
							/>
						)}
						<SubmissionDetailModal
							openModal={openModalId === id}
							setOpenModal={(open) => setOpenModalId(open ? id : null)}
							submission={submission}
							showReactionButtons={status === EUserCreatedBountySubmissionStatus.PENDING && bountyProposer == loginAddress}
							parentBountyProposerAddress={bountyProposer}
							submissionProposerAddress={submission.proposer}
							parentBountyIndex={bountyIndex}
							submissionId={submission.id}
							isUsedForDeletingSubmission={isUsedForDeletingSubmission}
							fetchSubmissions={fetchSubmissions}
							setIsUsedForDeletingSubmission={setIsUsedForDeletingSubmission}
							setOpenModalId={setOpenModalId}
						/>
						{!!loginAddress && status === EUserCreatedBountySubmissionStatus.APPROVED && (
							<SubmissionTippingModal
								key={id}
								open={openTipping}
								setOpen={setOpenTipping}
								submissionProposer={proposer || ''}
								parentBountyIndex={bountyIndex}
								parentBountyProposerAddress={bountyProposer}
								submissionId={openModalId || id || ''}
								fetchSubmissions={fetchSubmissions}
								submissionReqAmount={reqAmount}
							/>
						)}
					</div>
				);
			})}
		</section>
	);
};

export default SubmissionComponent;
