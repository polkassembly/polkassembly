// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState, useEffect } from 'react';
import { Button, Divider } from 'antd';
import { useTheme } from 'next-themes';
import { usePostDataContext } from '~src/context';
import { IRating } from '~src/types';
import { StarFilled } from '@ant-design/icons';
import ImageIcon from '~src/ui-components/ImageIcon';
import Markdown from '~src/ui-components/Markdown';
import NameLabel from '~src/ui-components/NameLabel';

interface IReportDetails {
	report: any;
	index: number;
}

const ReportDetails: FC<IReportDetails> = (props) => {
	const { report, index } = props;
	const { postData } = usePostDataContext();
	const [averageRating, setAverageRating] = useState<number>();
	const { resolvedTheme: theme } = useTheme();
	const [showFullSummary, setShowFullSummary] = useState<boolean>(false);
	const [summaryToShow, setSummaryToShow] = useState<string>('');

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
		setAverageRating(report?.ratings?.reduce((sum: number, current: IRating) => sum + current.rating, 0) / report?.ratings?.length);
	};

	const toggleSummary = () => {
		setShowFullSummary((prev) => !prev);
		setSummaryToShow(() => (!showFullSummary && report?.progress_summary?.length > 200 ? report.progress_summary : `${report?.progress_summary.slice(0, 200)}...`));
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

		return Array.from({ length: 5 }, (_, i) => (
			<StarFilled
				key={i}
				style={{ color: '#d9d9d9' }}
			/>
		));
	};

	return (
		<article className='mt-2 flex flex-col justify-start gap-y-2'>
			<h1 className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>{postData?.title}</h1>
			<div className='flex items-center justify-start gap-x-1'>
				<NameLabel
					defaultAddress={postData?.proposer || ''}
					truncateUsername
					usernameClassName='text-xs text-ellipsis text-sidebarBlue overflow-hidden font-normal dark:text-blue-dark-medium'
				/>
				{report?.ratings?.length > 0 && (
					<Divider
						className='hidden dark:border-separatorDark md:inline-block'
						type='vertical'
						style={{ borderLeft: '1px solid var(--sidebarBlue)' }}
					/>
				)}
				{report?.ratings?.length > 0 && (
					<p className='m-0 flex items-center p-0 text-xs text-sidebarBlue dark:text-blue-dark-medium'>
						Average Rating({report.ratings.length}): <div className='ml-2 flex'>{renderStars()}</div>
					</p>
				)}
			</div>
			{report?.progress_summary && (
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

export default ReportDetails;