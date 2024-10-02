// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Divider, Rate } from 'antd';
import { useProgressReportSelector } from '~src/redux/selectors';
import { progressReportActions } from '~src/redux/progressReport';
import { useDispatch } from 'react-redux';
import { usePostDataContext } from '~src/context';
import Markdown from '~src/ui-components/Markdown';
import { useTheme } from 'next-themes';
import { StarOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

const desc = ['Vaporware', 'FUD', 'Neutral', 'WAGMI', 'LFG'];

const ProgressReportRatingModal = () => {
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();
	const { postData } = usePostDataContext();
	const router = useRouter();
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

	console.log('hi link:', postData);

	return (
		<>
			<section className='flex flex-col gap-y-1'>
				{postData?.progress_report?.progress_summary && <h1 className='text-normal m-0 p-0 text-lg text-bodyBlue dark:text-white'>Summary of Progress Report</h1>}
				<p className='m-0 p-0 text-sm text-bodyBlue dark:text-blue-dark-medium'>
					<Markdown
						className='post-content m-0 p-0 dark:text-blue-dark-medium'
						md={postData?.progress_report?.progress_summary}
						theme={theme}
					/>
				</p>
				<p
					className='m-0 cursor-pointer p-0 text-sm font-normal text-pink_primary'
					onClick={() => {
						router.push(`/referenda/${postData?.postIndex}?tab=evaluation`);
						dispatch(progressReportActions.setOpenRatingModal(false));
					}}
				>
					View Progress Report in detail
				</p>
				{postData?.progress_report?.progress_summary && (
					<Divider
						dashed={true}
						className='my-3'
					/>
				)}
				<div className='flex flex-col items-center justify-center gap-y-2'>
					<h1 className='text-normal flex flex-col gap-y-1 text-lg text-bodyBlue dark:text-white'>Rate Delivery</h1>
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
					{postData?.progress_report?.ratings?.length > 0 && (
						<p className='m-0 -mb-4 mt-3 p-0 text-xs text-sidebarBlue dark:text-blue-dark-medium'>
							{postData?.progress_report?.ratings?.length} users have already rated the progress report.
						</p>
					)}
				</div>
			</section>
		</>
	);
};

export default ProgressReportRatingModal;
