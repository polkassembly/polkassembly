// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Divider, message } from 'antd';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import ImageIcon from '~src/ui-components/ImageIcon';
import { useTheme } from 'next-themes';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { parseBalance } from '../../Modal/VoteData/utils/parseBalaceToReadable';
import dayjs from 'dayjs';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ESubmissionStatus, IChildBountySubmission } from '~src/types';
import Skeleton from '~src/basic-components/Skeleton';
import Link from 'next/link';
import { usePostDataContext } from '~src/context';
import getEncodedAddress from '~src/util/getEncodedAddress';
import Address from '~src/ui-components/Address';
import Image from 'next/image';
import MakeChildBountySubmisionModal from './MakeChildBountySubmision';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import SubmissionAction from './SubmissionAction';

interface IBountyChildBountiesProps {
	bountyId?: number | string | null;
}

export const SubmissionsEmptyState = ({ activeTab }: { activeTab: ESubmissionStatus }) => {
	return (
		<div className='flex flex-col items-center text-center text-sm text-bodyBlue dark:text-white'>
			<Image
				src='/assets/Gifs/watering.gif'
				alt='document'
				className='-mt-16 h-80 w-80'
				width={320}
				height={320}
			/>
			<span className='-mt-20 mb-5 text-base font-medium text-lightBlue dark:text-white'>No {activeTab} submissions</span>
		</div>
	);
};

const Submissions: FC<IBountyChildBountiesProps> = (props) => {
	const { bountyId } = props;
	const {
		postData: { curator }
	} = usePostDataContext();
	const currentUser = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();
	const { loginAddress } = useUserDetailsSelector();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [bountySubmission, setBountySubmission] = useState<IChildBountySubmission[]>([]);
	const { network } = useNetworkSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState<ESubmissionStatus | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editSubmission, setEditSubmission] = useState<IChildBountySubmission | undefined>(undefined);

	const handleNewSubmission = useCallback(async (created: boolean) => {
		if (created) {
			await fetchBountySubmission();
			setIsModalVisible(false);
			setEditSubmission(undefined);
			setIsEditing(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	const handleEditClick = (submission: IChildBountySubmission) => {
		setEditSubmission(submission);
		setIsEditing(true);
		setIsModalVisible(true);
	};

	const handleSubmissionClick = () => {
		setEditSubmission(undefined);
		setIsEditing(false);
		setIsModalVisible(true);
	};

	const handleDelete = async (submission: IChildBountySubmission) => {
		const payload = {
			curatorAddress: currentUser?.loginAddress,
			parentBountyIndex: submission?.parentBountyIndex,
			proposerAddress: submission?.proposer,
			rejectionMessage: '',
			submissionId: submission?.id,
			updatedStatus: ESubmissionStatus.DELETED
		};

		const { data, error } = await nextApiClientFetch<IChildBountySubmission>('/api/v1/bounty/curator/submissions/updateSubmissionStatus', payload);

		if (error) {
			console.error('Error updating submission status:', error);
			return;
		}

		if (data) {
			setBountySubmission((prevSubmissions) => prevSubmissions.filter((sub) => sub.id !== submission.id));
			setEditSubmission(undefined);
			message.success('Submission status updated successfully');
		}
	};

	useEffect(() => {
		if (bountyId) {
			fetchBountySubmission();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [bountyId, handleNewSubmission]);

	const getFilteredSubmissions = () => {
		switch (activeTab) {
			case ESubmissionStatus.PENDING:
				return bountySubmission?.filter((item: IChildBountySubmission) => item?.status == ESubmissionStatus.PENDING);
			case ESubmissionStatus.REJECTED:
				return bountySubmission?.filter((item: IChildBountySubmission) => item?.status == ESubmissionStatus.REJECTED);
			default:
				return bountySubmission || [];
		}
	};
	const canViewAll = bountySubmission.some((submission) =>
		[getEncodedAddress(curator, network), getEncodedAddress(submission?.proposer, network)].includes(getEncodedAddress(loginAddress, network))
	);
	const hasSubmitted = bountySubmission.some((submission) => submission?.proposer === getEncodedAddress(loginAddress, network));

	return (
		<GovSidebarCard>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-1'>
					<Image
						alt='document'
						src='/assets/icons/curator-dashboard/Document.svg'
						className='-mt-3'
						width={20}
						height={20}
						style={{
							filter: theme === 'dark' ? 'invert(100%) brightness(200%)' : 'none'
						}}
					/>

					<h4 className='text-xl font-semibold text-sidebarBlue  dark:text-white'>
						Submissions <span className='text-base font-normal'>({bountySubmission?.length || 0})</span>{' '}
					</h4>
				</div>
				{canViewAll && (
					<Link href='/curator-dashboard'>
						<p className='text-sm font-medium text-pink_primary'>View All</p>
					</Link>
				)}
			</div>
			{bountySubmission?.length > 0 && (
				<div className='mb-2 flex items-center justify-between gap-3 rounded-lg bg-section-light-background px-2 py-2 text-center text-sm text-bodyBlue dark:bg-section-dark-garyBackground dark:text-white'>
					<Button
						onClick={() => setActiveTab(null)}
						className={` w-1/3 cursor-pointer rounded-md border-none p-0 py-1 text-sm font-semibold ${
							activeTab === null
								? 'bg-white text-pink_primary dark:bg-section-dark-overlay'
								: 'bg-section-light-background text-lightBlue shadow-none dark:bg-section-dark-garyBackground dark:text-[#DADADA]'
						}`}
					>
						All
					</Button>
					<Button
						onClick={() => setActiveTab(ESubmissionStatus.PENDING)}
						className={` w-1/3 cursor-pointer rounded-md border-none p-0 py-1 text-sm font-semibold ${
							activeTab === ESubmissionStatus.PENDING
								? 'bg-white text-pink_primary dark:bg-section-dark-overlay'
								: 'bg-section-light-background text-lightBlue shadow-none dark:bg-section-dark-garyBackground dark:text-[#DADADA]'
						}`}
					>
						Pending
					</Button>
					<Button
						onClick={() => setActiveTab(ESubmissionStatus.REJECTED)}
						className={` w-1/3 cursor-pointer rounded-md border-none p-0 py-1 text-sm font-semibold ${
							activeTab === ESubmissionStatus.REJECTED
								? 'bg-white text-pink_primary dark:bg-section-dark-overlay'
								: 'bg-section-light-background text-lightBlue shadow-none dark:bg-section-dark-garyBackground dark:text-[#DADADA]'
						}`}
					>
						Rejected
					</Button>
				</div>
			)}

			{loading ? (
				<Skeleton active />
			) : (
				<>
					{getFilteredSubmissions()?.length > 0 ? (
						getFilteredSubmissions()?.map((submission: any, index: number) => (
							<div
								key={submission?.id}
								className='mb-3 rounded-lg border-[1px] border-solid border-section-light-container p-3 dark:border-[#4B4B4B]'
							>
								<div>
									<div className='flex items-center gap-1'>
										<Address
											address={submission?.proposer}
											displayInline
											isTruncateUsername={true}
											className='text-xs'
										/>
										<Divider
											type='vertical'
											className='border-l-1 m-0 border-lightBlue p-0 dark:border-icon-dark-inactive'
										/>
										<div className='flex items-center gap-1'>
											<ImageIcon
												src={theme === 'dark' ? '/assets/activityfeed/darktimer.svg' : '/assets/icons/timer.svg'}
												alt='timer'
												className='text-xs text-lightBlue dark:text-icon-dark-inactive'
											/>
											<span className='whitespace-nowrap text-xs text-lightBlue dark:text-icon-dark-inactive'>{dayjs(submission?.createdAt)?.format('Do MMM YYYY')}</span>
										</div>
										<Divider
											type='vertical'
											className='border-l-1 m-0 border-lightBlue p-0 dark:border-icon-dark-inactive'
										/>
										<span className='ml-1 whitespace-nowrap text-xs font-semibold text-pink_primary'>{parseBalance(String(submission?.reqAmount || '0'), 2, true, network)}</span>
									</div>
									<div className='mt-2 pb-2'>
										<span className='text-sm font-medium text-lightBlue dark:text-icon-dark-inactive'>#{index + 1} </span>
										<span className='text-sm font-medium text-bodyBlue hover:underline dark:text-white'>{submission?.title}</span>
									</div>
									<div className='flex w-full'>
										<SubmissionAction
											submission={submission}
											loginAddress={loginAddress}
											network={network}
											handleDelete={handleDelete}
											handleEditClick={handleEditClick}
										/>
									</div>
								</div>
							</div>
						))
					) : activeTab === ESubmissionStatus.PENDING || activeTab === ESubmissionStatus.REJECTED ? (
						<SubmissionsEmptyState activeTab={activeTab} />
					) : null}
				</>
			)}
			{!!loginAddress?.length && (
				<CustomButton
					variant='primary'
					className='mt-4 flex w-full cursor-pointer items-center justify-center gap-1 rounded-md border-none'
					onClick={() => {
						if (hasSubmitted) {
							message.error('You can only make one submission per bounty.');
						} else {
							handleSubmissionClick();
						}
					}}
					disabled={hasSubmitted}
				>
					<ImageIcon
						src='/assets/icons/Document.svg'
						alt='submit'
						className='text-sm'
					/>
					<h5 className='pt-2 text-sm text-white'>Make Submission</h5>
				</CustomButton>
			)}
			<MakeChildBountySubmisionModal
				bountyId={bountyId}
				open={isModalVisible}
				setOpen={setIsModalVisible}
				editing={isEditing}
				submission={isEditing ? editSubmission : null}
				ModalTitle={isEditing ? 'Edit Submission' : 'Add Submission'}
				onSubmissionCreated={handleNewSubmission}
			/>
		</GovSidebarCard>
	);
};

export default Submissions;
