// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import React, { useEffect, useState } from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';
import CreateSubmissionButton from './CreateSubmissionButton';
import CustomTabs from './CustomTabs';
import Image from 'next/image';
import { dmSans } from 'pages/_app';
import dynamic from 'next/dynamic';
import { IChildBountySubmission, IUserCreatedBounty } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import SubmissionComponent from './SubmissionComponent';
import { Spin } from 'antd';

const CreateSubmissionForm = dynamic(() => import('./CreateSubmissionForm'), {
	ssr: false
});

const BountySubmission = ({ post }: { post: IUserCreatedBounty }) => {
	const [openModal, setOpenModal] = useState(false);
	const [submissions, setSubmissions] = useState<IChildBountySubmission[]>([]);
	const [loadingStatus, setLoadingStatus] = useState<{ isLoading: boolean; message: string }>({
		isLoading: false,
		message: ''
	});

	const fetchSubmissions = async () => {
		setLoadingStatus({ isLoading: true, message: '' });
		try {
			const { data, error } = await nextApiClientFetch<{ submissions: IChildBountySubmission[] }>('/api/v1/user-created-bounties/submissions/getSubmissionForBountyIndex', {
				parentBountyIndex: post?.post_index,
				page: 1
			});

			if (error || !data) {
				console.log('Submission failed:', error);
				setLoadingStatus({ isLoading: false, message: '' });
				return;
			}
			if (data) {
				setLoadingStatus({ isLoading: false, message: '' });
				setSubmissions(data.submissions);
			}
		} catch (error) {
			setLoadingStatus({ isLoading: false, message: '' });
			console.log(error);
		}
	};

	useEffect(() => {
		if (post?.post_index) {
			fetchSubmissions();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [post?.post_index]);

	if (!loadingStatus.isLoading && submissions.length < 1) {
		return (
			<section className='my-6 w-full rounded-xxl bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay md:p-4 lg:p-6'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-1'>
						<ImageIcon
							alt='icon'
							src='/assets/icons/user-bounties/submission-icon.svg'
						/>
						<span className='text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>Submissions</span>
						<span className=' text-base text-[#334D6E]'>(0)</span>
					</div>
					<CreateSubmissionButton setOpenModal={setOpenModal} />
				</div>
				<div className={`flex h-[500px] flex-col ${dmSans.className} ${dmSans.variable} items-center rounded-xl  px-5   `}>
					<Image
						src='/assets/Gifs/find.gif'
						alt='empty state'
						className='m-0 h-96 w-96 p-0'
						width={350}
						height={350}
					/>
					<span className='-mt-10 text-xl font-semibold text-[#243A57] dark:text-white'>No Submissions Yet</span>
					<div className='pt-3 text-center'>
						<span
							onClick={() => setOpenModal(true)}
							className='cursor-pointer font-semibold text-pink_primary'
						>
							Add Submission
						</span>{' '}
						<span className='text-blue-light-high dark:text-blue-dark-high'>to view it here</span>
					</div>
				</div>
				<CreateSubmissionForm
					openModal={openModal}
					setOpenModal={setOpenModal}
					parentBountyIndex={post?.post_index}
				/>
			</section>
		);
	}

	return (
		<section className='my-6 w-full rounded-xxl bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay md:p-4 lg:p-6'>
			<Spin spinning={loadingStatus.isLoading}>
				<div>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-1'>
							<ImageIcon
								alt='icon'
								src='/assets/icons/user-bounties/submission-icon.svg'
							/>
							<span className='text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>Submissions</span>
							<span className=' text-base text-[#334D6E]'>({`${submissions.length}`})</span>
						</div>
						<CreateSubmissionButton setOpenModal={setOpenModal} />
					</div>
					<CustomTabs />
					<SubmissionComponent
						submissions={submissions}
						bountyProposer={post?.proposer}
						bountyIndex={post?.post_index}
					/>
					<CreateSubmissionForm
						openModal={openModal}
						setOpenModal={setOpenModal}
						parentBountyIndex={post?.post_index}
					/>
				</div>
			</Spin>
		</section>
	);
};

export default BountySubmission;
