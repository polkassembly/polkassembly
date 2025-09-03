// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Collapse } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ImageIcon from '~src/ui-components/ImageIcon';
import dynamic from 'next/dynamic';
import Skeleton from '~src/basic-components/Skeleton';
import { useProgressReportSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { usePostDataContext } from '~src/context';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import { useDispatch } from 'react-redux';
import { progressReportActions } from '~src/redux/progressReport';
import { useTheme } from 'next-themes';
import UserReportInfo from '~src/components/ProgressReport/ProgressReportInfo/UserReportInfo';
import styled from 'styled-components';
const UploadModalContent = dynamic(() => import('~src/components/ProgressReport/UploadModalContent'), {
	loading: () => <Skeleton active />,
	ssr: false
});
const UploadMultipleReports = dynamic(() => import('~src/components/ProgressReport/MultipleReports'), {
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
	const { resolvedTheme: theme } = useTheme();

	const [loading, setLoading] = useState<boolean>(false);
	const { summary_content, progress_report_link } = useProgressReportSelector();
	const dispatch = useDispatch();

	const {
		postData: { postType: proposalType, postIndex },
		setPostData
	} = usePostDataContext();

	const getProgressReportViews = async () => {
		setLoading(true);
		const { data, error: editError } = await nextApiClientFetch<any>('api/v1/progressReport/getProgressReportViews', {
			postId: postIndex,
			proposalType
		});

		if (editError || !data) {
			setLoading(false);
			console.error('Error saving post', editError);
		}

		if (data) {
			setLoading(false);
			const { progress_report_views } = data;
			setPostData((prev) => ({
				...prev,
				progress_report_views
			}));
		}
	};

	useEffect(() => {
		getProgressReportViews();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentUser?.loginAddress, postIndex]);

	useEffect(() => {
		if (postData?.progress_report?.[0]?.progress_file) {
			dispatch(progressReportActions.setSummaryContent(postData?.progress_report?.[0]?.progress_summary || ''));
			dispatch(progressReportActions.setProgressReportLink(postData?.progress_report?.[0]?.progress_file || ''));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postData?.progress_report?.[0]?.progress_file, postData, dispatch]);

	const addProgressReport = async () => {
		const progress_report = {
			progress_file: progress_report_link,
			progress_summary: summary_content || '',
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
			dispatch(progressReportActions.setReportUploaded(false));
		} else {
			console.log('failed to save report');
		}
	};

	return (
		<div className={className}>
			<Collapse
				size='large'
				className={'border-section-light-container bg-white dark:border-separatorDark dark:bg-section-dark-overlay'}
				expandIconPosition='end'
				defaultActiveKey={['1']}
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
							{Object.keys(postData?.progress_report || {}).length === 0 && (
								<div className='ml-auto flex items-center justify-end gap-x-1'>
									<ImageIcon
										src='/assets/delegation-tracks/info-icon-blue.svg'
										alt='info-icon'
										imgClassName='scale-90'
									/>
									<p className='m-0 p-0 text-sm font-normal text-bodyBlue dark:text-white'>Progress Report not added</p>
								</div>
							)}
						</div>
					}
					key='1'
				>
					{postData.userId === currentUser?.id ? (
						<>
							{Object.keys(postData?.progress_report || {}).length === 0 ? (
								<>
									<UploadModalContent />
									<div className='mt-4 flex justify-end'>
										<CustomButton
											type='primary'
											text='Done'
											buttonsize='sm'
											loading={loading}
											className={`${loading ? 'opacity-60' : ''}`}
											onClick={() => {
												addProgressReport();
											}}
										/>
									</div>
								</>
							) : (
								<UploadMultipleReports theme={theme} />
							)}
						</>
					) : Object.keys(postData?.progress_report).length > 0 ? (
						<UserReportInfo theme={theme} />
					) : (
						<div className='my-[60px] flex flex-col items-center gap-6'>
							<ImageIcon
								src={theme == 'light' ? '/assets/EmptyStateLight.svg' : '/assets/EmptyStateDark.svg '}
								alt='Empty Icon'
								imgClassName='w-[225px] h-[225px]'
							/>
							<h3 className='text-blue-light-high dark:text-blue-dark-high'>No Progress Report Added</h3>
						</div>
					)}
				</Panel>
			</Collapse>
		</div>
	);
};

export default styled(ProgressReportTab)`
	.ant-collapse-large > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
		padding: 0 !important;
	}
	.ant-collapse-large > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
		padding: 20px 24px 8px 36px !important;
	}
`;
