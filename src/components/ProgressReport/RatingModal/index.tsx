// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Divider, Rate } from 'antd';
import { useProgressReportSelector } from '~src/redux/selectors';
import { progressReportActions } from '~src/redux/progressReport';
import { useDispatch } from 'react-redux';
import { usePostDataContext } from '~src/context';

const desc = ['Vaporware', 'FUD', 'Neutral', 'WAGMI', 'LFG'];

const ProgressReportRatingModal = () => {
	const dispatch = useDispatch();
	const { postData } = usePostDataContext();
	const { report_rating } = useProgressReportSelector();

	return (
		<>
			<section className='flex flex-col gap-y-2'>
				{postData?.progress_report?.progress_summary && <h1 className='text-normal text-lg text-bodyBlue dark:text-section-dark-overlay'>Summary of Progress Report</h1>}
				<p className='text-sm text-bodyBlue dark:text-white'>{postData?.progress_report?.progress_summary}</p>
				{postData?.progress_report?.progress_summary && (
					<Divider
						dashed={true}
						className='my-4'
					/>
				)}
				<div className='flex flex-col items-center justify-center gap-y-2'>
					<h1 className='text-normal text-lg text-bodyBlue dark:text-section-dark-overlay'>Rate Delievery</h1>
					<>
						<Rate
							tooltips={desc}
							onChange={(e: any) => {
								dispatch(progressReportActions.setReportRating(e));
							}}
							value={report_rating}
							className='-mt-3 scale-[3]'
						/>
						{postData?.progress_report?.ratings.length > 0 && (
							<p className='mt-4 text-xs text-sidebarBlue dark:text-section-light-overlay'>
								{postData?.progress_report?.ratings.length} users have already rated the progress report.
							</p>
						)}
					</>
				</div>
			</section>
		</>
	);
};

export default ProgressReportRatingModal;
