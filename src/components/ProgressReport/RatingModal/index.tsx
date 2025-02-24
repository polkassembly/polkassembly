// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useEffect, useState } from 'react';
import { Divider, Rate } from 'antd';
import { useProgressReportSelector } from '~src/redux/selectors';
import { progressReportActions } from '~src/redux/progressReport';
import { useDispatch } from 'react-redux';
import { usePostDataContext } from '~src/context';
import Markdown from '~src/ui-components/Markdown';
import { useTheme } from 'next-themes';
import { StarOutlined } from '@ant-design/icons';
import { IProgressReport } from '~src/types';
import Link from 'next/link';

const desc = ['Vaporware', 'FUD', 'Neutral', 'WAGMI', 'LFG'];

interface IProgressReportRatingModal {
	reportId?: string | null;
}

const ProgressReportRatingModal: FC<IProgressReportRatingModal> = (props) => {
	const { reportId } = props;
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();
	const { postData } = usePostDataContext();
	const [reportData, setReportData] = useState<IProgressReport>();
	const { report_rating } = useProgressReportSelector();
	const customIcons = Object.fromEntries(
		[1, 2, 3, 4, 5].map((key, index) => [
			key,
			<StarOutlined
				key={index}
				className='dark:text-blue-dark-medium'
			/>
		])
	) as Record<number, React.ReactNode>;

	const ogTrackerUrl =
		!!postData?.track_name && !!postData?.postIndex
			? `https://app.ogtracker.io/${postData.track_name.replace(/^[A-Z]/, (c) => c.toLowerCase())}/${postData.postIndex}`
			: 'https://app.ogtracker.io/';

	useEffect(() => {
		if (postData?.progress_report) {
			Object.values(postData.progress_report).some((report: any) => {
				if (report.id === reportId) {
					setReportData(report as IProgressReport);
					return true;
				}
				return false;
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reportId, postData?.progress_report]);

	return (
		<>
			<section className='flex flex-col gap-y-1'>
				{reportData?.progress_summary && <h1 className='text-normal m-0 p-0 text-lg text-bodyBlue dark:text-white'>Summary of Progress Report</h1>}
				<p className='m-0 p-0 text-sm text-bodyBlue dark:text-blue-dark-medium'>
					<Markdown
						className='post-content m-0 p-0 dark:text-blue-dark-medium'
						md={reportData?.progress_summary || ''}
						theme={theme}
					/>
				</p>
				<Link
					className='m-0 cursor-pointer p-0 text-sm font-medium text-pink_primary hover:underline'
					href={ogTrackerUrl}
					target='_blank'
				>
					View Progress Report in detail
				</Link>
				{reportData?.progress_summary && (
					<Divider
						dashed={true}
						className='my-3'
					/>
				)}
				<div className='flex flex-col items-center justify-center gap-y-2'>
					<h1 className='text-normal flex flex-col gap-y-1 text-base font-medium text-bodyBlue dark:text-white'>Rate Delivery</h1>
					<>
						<Rate
							tooltips={desc}
							onChange={(e: any) => {
								dispatch(progressReportActions.setReportRating(e));
							}}
							value={report_rating}
							className='-mt-3 scale-[3]'
						/>
						{theme === 'dark' && (
							<Rate
								tooltips={desc}
								onChange={(e: any) => {
									dispatch(progressReportActions.setReportRating(e));
								}}
								value={report_rating}
								className='custom-rate -mt-[40px] scale-[3]'
								character={({ index = 0 }) => customIcons[index + 1]}
							/>
						)}
					</>
					{reportData?.ratings && reportData?.ratings?.length > 0 && (
						<p className='m-0 -mb-4 mt-3 p-0 text-xs text-sidebarBlue dark:text-blue-dark-medium'>{reportData?.ratings?.length} users have already rated the progress report.</p>
					)}
				</div>
			</section>
		</>
	);
};

export default ProgressReportRatingModal;
