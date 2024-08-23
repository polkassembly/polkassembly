// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Collapse } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ImageIcon from '~src/ui-components/ImageIcon';
import dynamic from 'next/dynamic';
import Skeleton from '~src/basic-components/Skeleton';
import { useProgressReportSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { usePostDataContext } from '~src/context';
import ProgressReportInfo from '~src/components/ProgressReport/ProgressReportInfo';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import { useDispatch } from 'react-redux';
import { progressReportActions } from '~src/redux/progressReport';
const UploadModalContent = dynamic(() => import('~src/components/ProgressReport/UploadModalContent'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const { Panel } = Collapse;

interface Props {
	className?: string;
}

const ProgressReportTab = ({ className }: Props) => {
	const currentUser = useUserDetailsSelector();
	const { postData } = usePostDataContext();
	const { show_nudge } = useProgressReportSelector();
	const { report_uploaded, summary_content, progress_report_link, file_name } = useProgressReportSelector();
	const dispatch = useDispatch();
	const {
		postData: { postType: proposalType, postIndex },
		setPostData
	} = usePostDataContext();

	const addProgressReport = async () => {
		const progress_report = {
			progress_addedOn: new Date(),
			progress_file: progress_report_link,
			progress_name: `${Date.now()}-${file_name}`,
			progress_summary: summary_content,
			ratings: []
		};

		const { data, error: editError } = await nextApiClientFetch<any>('api/v1/auth/actions/addProgressReport', {
			postId: postIndex,
			progress_report,
			proposalType
		});

		if (editError || !data) {
			console.error('Error saving post', editError);
			queueNotification({
				header: 'Error!',
				message: 'Error in saving your post.',
				status: NotificationStatus.ERROR
			});
		}

		if (data) {
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
		} else {
			console.log('failed to save report');
		}
	};

	return (
		<div className={`${className}`}>
			<Collapse
				size='large'
				className={'bg-white dark:border-separatorDark dark:bg-section-dark-overlay'}
				expandIconPosition='end'
				expandIcon={({ isActive }) => {
					return isActive ? <ExpandIcon /> : <CollapseIcon />;
				}}
			>
				<Panel
					header={
						<div className='channel-header flex items-center gap-[6px]'>
							<ImageIcon
								src='/assets/icons/file-icon.svg'
								alt='progress-file-icon'
							/>
							<h3 className='mb-0 ml-1 mt-[2px] text-[16px] font-semibold leading-[21px] tracking-wide text-blue-light-high dark:text-blue-dark-high md:text-[18px]'>
								Progress Reports
							</h3>
						</div>
					}
					key='1'
				>
					{/* remove ! sign check from !(postData.userId === currentUser?.id) */}
					{postData.userId === currentUser?.id && postData?.status === 'Executed' && !postData?.progress_report?.progress_file && show_nudge && (
						<>
							<UploadModalContent />
							<div className='mt-4 flex justify-end'>
								<CustomButton
									variant='primary'
									text='Done'
									buttonsize='sm'
									disabled={!report_uploaded}
									onClick={() => {
										addProgressReport();
									}}
								/>
							</div>
						</>
					)}
					{!(postData.userId === currentUser?.id) && postData?.status === 'Executed' && postData?.progress_report?.progress_file && <ProgressReportInfo />}
				</Panel>
			</Collapse>
		</div>
	);
};

export default ProgressReportTab;
