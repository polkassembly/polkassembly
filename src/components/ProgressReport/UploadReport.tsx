// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal } from 'antd';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { progressReportActions } from '~src/redux/progressReport';
import { useProgressReportSelector } from '~src/redux/selectors';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import Skeleton from '~src/basic-components/Skeleton';
import dynamic from 'next/dynamic';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { usePostDataContext } from '~src/context';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useTheme } from 'next-themes';
const UploadModalContent = dynamic(() => import('./UploadModalContent'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const UploadReport = () => {
	const { add_progress_report_modal_open, report_uploaded, summary_content, progress_report_link } = useProgressReportSelector();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	const router = useRouter();
	const {
		postData: { postType: proposalType, postIndex },
		setPostData
	} = usePostDataContext();

	const addProgressReport = async () => {
		const progress_report = {
			progress_file: progress_report_link,
			progress_summary: summary_content,
			ratings: []
		};
		setLoading(true);
		const { data, error: editError } = await nextApiClientFetch<any>('api/v1/progressReport/addProgressReport', {
			postId: postIndex,
			progress_report,
			proposalType
		});

		if (editError || !data) {
			setLoading(false);
			console.error('Error saving post', editError);
			queueNotification({
				header: 'Error!',
				message: 'Error in saving your post.',
				status: NotificationStatus.ERROR
			});
		}

		if (data) {
			setLoading(false);
			queueNotification({
				header: 'Success!',
				message: 'Your post is now edited',
				status: NotificationStatus.SUCCESS
			});

			const { progress_report } = data;
			setPostData((prev) => ({
				...prev,
				progress_report
			}));

			dispatch(progressReportActions.setOpenSuccessModal(true));
			dispatch(progressReportActions.setShowNudge(false));
			dispatch(progressReportActions.setAddProgressReportModalOpen(false));
			localStorage.removeItem('progress_report');
			router.reload();
		} else {
			console.error('failed to save report');
		}
	};

	return (
		<Modal
			wrapClassName='dark:bg-modalOverlayDark'
			className={classNames(poppins.className, poppins.variable, 'w-[600px]')}
			open={add_progress_report_modal_open}
			footer={
				<div className='-mx-6 mt-9 flex items-center justify-end gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-6'>
					<CustomButton
						variant='default'
						text='Cancel'
						buttonsize='sm'
						onClick={() => {
							dispatch(progressReportActions.setAddProgressReportModalOpen(false));
						}}
					/>
					<CustomButton
						variant='primary'
						text='Done'
						buttonsize='sm'
						loading={loading}
						className={`${loading ? 'opacity-60' : ''}`}
						disabled={!report_uploaded}
						onClick={() => {
							addProgressReport();
						}}
					/>
				</div>
			}
			maskClosable={false}
			closeIcon={<CloseIcon className='mt-2 text-lightBlue dark:text-icon-dark-inactive' />}
			onCancel={() => {
				dispatch(progressReportActions.setAddProgressReportModalOpen(false));
			}}
			title={
				<div className='-mx-6 flex items-center justify-start border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-5 text-lg tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
					<Image
						src={'/assets/icons/cloud-upload.svg'}
						alt='upload-icon'
						width={24}
						height={24}
						className={theme === 'dark' ? 'dark-icons mr-2' : 'mr-2'}
					/>
					Upload Progress Report{' '}
				</div>
			}
		>
			<UploadModalContent />
		</Modal>
	);
};

export default UploadReport;
