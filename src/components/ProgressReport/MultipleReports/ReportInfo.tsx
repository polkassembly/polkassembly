// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState, useEffect } from 'react';
import { Button } from 'antd';
import dayjs from 'dayjs';
import { useTheme } from 'next-themes';
import { useDispatch } from 'react-redux';
import { usePostDataContext } from '~src/context';
import { progressReportActions } from '~src/redux/progressReport';
import { IRating, NotificationStatus } from '~src/types';
import { ClockCircleOutlined, StarFilled } from '@ant-design/icons';
import ImageIcon from '~src/ui-components/ImageIcon';
import Markdown from '~src/ui-components/Markdown';
import SummaryContentForm from '~src/components/SummaryContentForm';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import queueNotification from '~src/ui-components/QueueNotification';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface IReportInfo {
	report: any;
	index: number;
}

const ReportInfo: FC<IReportInfo> = (props) => {
	const { report, index } = props;
	const { postData } = usePostDataContext();
	const dispatch = useDispatch();
	const [averageRating, setAverageRating] = useState<number>();
	const { resolvedTheme: theme } = useTheme();
	const [showFullSummary, setShowFullSummary] = useState<boolean>(false);
	const [summary_content, setSummaryContent] = useState<string>(report.progress_summary);
	const [loading, setLoading] = useState<boolean>(false);
	const [showContentForm, setShowContentForm] = useState<boolean>(false);
	const [summaryToShow, setSummaryToShow] = useState<string>('');
	const {
		postData: { postType: proposalType, postIndex },
		setPostData
	} = usePostDataContext();

	useEffect(() => {
		getRatingInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postData?.progress_report]);

	useEffect(() => {
		if (report?.progress_summary) {
			setSummaryToShow(report.progress_summary.length > 300 ? `${report.progress_summary.slice(0, 300)}...` : report.progress_summary);
		}
	}, [report?.progress_summary]);

	const getRatingInfo = () => {
		setAverageRating(postData?.progress_report?.[0]?.ratings?.reduce((sum: number, current: IRating) => sum + current.rating, 0) / postData?.progress_report?.[0]?.ratings?.length);
	};

	const toggleSummary = () => {
		setShowFullSummary((prev) => !prev);
		setSummaryToShow(() => (!showFullSummary && report?.progress_summary?.length > 200 ? report.progress_summary : `${report?.progress_summary.slice(0, 200)}...`));
	};

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

	const renderStars = () => {
		if (averageRating) {
			const fullStars = Math.floor(averageRating);
			const halfStar = averageRating % 1 >= 0.5 ? 1 : 0;
			const totalStars = fullStars + halfStar;

			const starsArray = [];

			for (let i = 0; i < fullStars; i++) {
				starsArray.push(
					<StarFilled
						key={i}
						style={{ color: '#fadb14' }}
						className='scale-110'
					/>
				);
			}

			if (halfStar) {
				starsArray.push(
					<StarFilled
						key='half'
						style={{ color: '#fadb14', opacity: 0.5 }}
						className='scale-110'
					/>
				);
			}

			// Fill up the remaining stars to always show a total of 5 stars
			for (let i = totalStars; i < 5; i++) {
				starsArray.push(
					<StarFilled
						key={`empty-${i}`}
						style={{ color: '#d9d9d9' }}
						className='scale-110'
					/>
				);
			}

			return starsArray;
		}

		// Default case when there's no rating
		return Array.from({ length: 5 }, (_, i) => (
			<StarFilled
				key={i}
				style={{ color: '#d9d9d9' }}
			/>
		));
	};

	return (
		<article className='ml-1 flex flex-col justify-start gap-y-2'>
			<div className='mr-auto flex items-center justify-between'>
				<div className='flex items-center gap-x-2'>
					<h1 className='m-0 p-0 text-base font-medium text-bodyBlue dark:text-white'>{`Progress Report #${Object.keys(postData?.progress_report).length - index}`}</h1>
					<ClockCircleOutlined className='dark:text-icon-dark-inactive' />
					<p className='m-0 p-0 text-xs text-sidebarBlue dark:text-icon-dark-inactive'>{dayjs.unix(report?.created_at?._seconds).format('DD MMM YYYY')}</p>
					{report?.isEdited && <p className='m-0 ml-auto p-0 text-[10px] text-sidebarBlue dark:text-blue-dark-medium'>(Edited)</p>}
				</div>
				{report?.ratings?.length > 0 && (
					<p className='m-0 flex items-center p-0 text-xs text-sidebarBlue dark:text-blue-dark-medium'>
						Average Rating({report.ratings.length}): <div className='ml-2 flex'>{renderStars()}</div>
					</p>
				)}
			</div>
			<h1 className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>{postData?.title}</h1>
			{report?.progress_summary ? (
				<div className='m-0 p-0 text-sm font-normal text-bodyBlue dark:text-white'>
					<Markdown
						className='post-content m-0 p-0'
						md={summaryToShow}
						theme={theme}
					/>
					{report?.progress_summary.length > 200 && (
						<Button
							className='m-0 -mt-4 flex items-center gap-x-1 border-none bg-transparent p-0 text-xs text-pink_primary shadow-none'
							onClick={toggleSummary}
						>
							{showFullSummary ? 'Show less' : 'Show more'}
						</Button>
					)}
				</div>
			) : (
				<div className='flex items-center gap-x-2 text-sm font-medium'>
					<p className='m-0 p-0 text-bodyBlue dark:text-blue-dark-medium'>Please update your progress report for users to rate it.</p>
					<span
						className='flex items-center gap-x-1 text-pink_primary'
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
				</div>
			)}
			{report?.progress_summary && (
				<Button
					className='m-0 -mt-4 flex items-center gap-x-1 border-none bg-transparent p-0 text-xs text-pink_primary'
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
						className={`ml-auto flex w-[100px] ${summary_content === report.progress_summary ? 'opacity-60' : ''}`}
					/>
				</>
			)}
			<div
				className='flex flex-col rounded-md border border-solid border-[#D2D8E0] px-4 py-2 dark:border-separatorDark dark:bg-transparent'
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
		</article>
	);
};

export default ReportInfo;
