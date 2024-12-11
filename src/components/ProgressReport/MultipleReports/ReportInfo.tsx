// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState } from 'react';
import { Button } from 'antd';
import { useTheme } from 'next-themes';
import { useDispatch } from 'react-redux';
import { usePostDataContext } from '~src/context';
import { progressReportActions } from '~src/redux/progressReport';
import { IProgressReport, NotificationStatus } from '~src/types';
import ImageIcon from '~src/ui-components/ImageIcon';
import Markdown from '~src/ui-components/Markdown';
import SummaryContentForm from '~src/components/SummaryContentForm';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import queueNotification from '~src/ui-components/QueueNotification';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface IReportInfo {
	report: IProgressReport;
	index: number;
}

const ReportInfo: FC<IReportInfo> = (props) => {
	const { report, index } = props;
	const { postData } = usePostDataContext();
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();
	const [summary_content, setSummaryContent] = useState<string | undefined>(report.progress_summary);
	const [loading, setLoading] = useState<boolean>(false);
	const [showContentForm, setShowContentForm] = useState<boolean>(false);
	const {
		postData: { postType: proposalType, postIndex },
		setPostData
	} = usePostDataContext();

	const editProgressReport = async () => {
		setLoading(true);

		const { data, error: editError } = await nextApiClientFetch<any>('api/v1/progressReport/editProgressReportSummary', {
			postId: postIndex,
			proposalType,
			reportId: report?.id,
			summary: summary_content
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
			setShowContentForm(false);
			dispatch(progressReportActions.setIsSummaryEdited(true));
			dispatch(progressReportActions.setAddProgressReportModalOpen(false));

			const { progress_report } = data;
			setPostData((prev) => ({
				...prev,
				progress_report
			}));
		} else {
			console.log('failed to save report');
		}
	};

	return (
		<article className='ml-1 mt-4 flex flex-col justify-start gap-y-1'>
			<h1 className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>{postData?.title}</h1>
			{report?.progress_summary ? (
				<div className='m-0 p-0 text-sm font-normal text-bodyBlue dark:text-white'>
					<Markdown
						className='post-content m-0 p-0'
						md={report?.progress_summary}
						theme={theme}
					/>
				</div>
			) : (
				<div className='mb-1 flex items-center gap-x-2 text-sm font-medium'>
					<p className='m-0 p-0 text-bodyBlue dark:text-blue-dark-medium'>Please update your progress report for users to rate it.</p>
					{!report?.isFromOgtracker && (
						<span
							className='flex cursor-pointer items-center gap-x-1 text-pink_primary'
							onClick={() => {
								setShowContentForm(!showContentForm);
							}}
						>
							<ImageIcon
								src='/assets/icons/add-circle.svg'
								alt='add'
							/>
							Add Summary
						</span>
					)}
				</div>
			)}
			{!report?.isFromOgtracker && (
				<div className='flex items-center justify-between'>
					{report?.progress_summary && (
						<Button
							className='m-0 mr-auto flex h-3 items-center gap-x-1 border-none bg-transparent p-0 text-xs font-medium text-pink_primary'
							onClick={() => {
								setShowContentForm(!showContentForm);
							}}
						>
							<ImageIcon
								src='/assets/icons/edit-pencil.svg'
								alt='edit-icon'
							/>{' '}
							Edit Summary
						</Button>
					)}
				</div>
			)}
			{showContentForm && (
				<>
					<SummaryContentForm
						onChange={(content: string) => {
							dispatch(progressReportActions.setSummaryContent(content));
							setSummaryContent(content);
						}}
						autofocus={true}
						height={200}
						value={report?.progress_summary || ''}
					/>
					<CustomButton
						variant='primary'
						text='Save'
						disabled={summary_content === report.progress_summary}
						loading={loading}
						onClick={() => {
							editProgressReport();
						}}
						className={`mb-2 ml-auto flex w-[100px] ${summary_content === report.progress_summary ? 'opacity-60' : ''}`}
					/>
				</>
			)}
			{report?.progress_file && (
				<div
					className='mt-4 flex flex-col rounded-md border border-solid border-[#D2D8E0] px-4 py-2 dark:border-separatorDark dark:bg-transparent'
					style={{
						background: 'rgba(210, 216, 224, 0.20)'
					}}
				>
					<div className='flex items-center justify-start gap-x-2'>
						<div className='flex h-[32px] w-[32px] items-center justify-center rounded-md bg-[#F9173E]'>
							<ImageIcon
								src='/assets/icons/pdf-icon.svg'
								alt='pdf.icon'
							/>
						</div>
						<div className='flex flex-col gap-y-0.5'>
							<a
								href={report?.progress_file}
								target='_blank'
								className='m-0 cursor-pointer p-0 text-xs font-medium capitalize text-bodyBlue dark:text-white '
								rel='noreferrer'
							>
								{`Progress Report - ${postData?.postType.replaceAll('_', ' ')} - ${postData?.postIndex}`} - {Object.keys(postData?.progress_report).length - index}
							</a>
							<p className='m-0 p-0 text-[10px] font-normal capitalize text-sidebarBlue dark:text-blue-dark-medium '>PDF Document</p>
						</div>
					</div>
				</div>
			)}
		</article>
	);
};

export default ReportInfo;
