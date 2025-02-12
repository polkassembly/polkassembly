// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState, useEffect } from 'react';
import { Divider } from 'antd';
import { useTheme } from 'next-themes';
import { usePostDataContext } from '~src/context';
import { IProgressReport, IRating } from '~src/types';
import { StarFilled } from '@ant-design/icons';
import Image from 'next/image';
import classNames from 'classnames';

interface IReportDetails {
	report: IProgressReport;
	index: number;
	className?: string;
}

const ReportDetails: FC<IReportDetails> = (props) => {
	const { report, className } = props;
	const { postData } = usePostDataContext();
	const [averageRating, setAverageRating] = useState<number>();
	const { resolvedTheme: theme } = useTheme();
	const [seeMore, setSeeMore] = useState(false);

	useEffect(() => {
		getRatingInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postData?.progress_report]);

	const getRatingInfo = () => {
		const ratings = report?.ratings;
		if (!ratings?.length) {
			setAverageRating(undefined);
			return;
		}
		const sum = ratings.reduce((acc: number, curr: IRating) => acc + curr.rating, 0);
		setAverageRating(Number((sum / ratings.length).toFixed(1)));
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
						className='text-[#FFAE06]'
						key={i}
					/>
				);
			}

			if (halfStar) {
				starsArray.push(
					<StarFilled
						key='half'
						className='scale-110 text-[#FFAE06]'
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
		<article className={classNames('mt-2 flex flex-col justify-start', className)}>
			<div className='flex items-center justify-start gap-x-1'>
				{report?.ratings && report?.ratings?.length > 0 && (
					<p className='m-0 flex items-center p-0 text-sm font-normal text-lightBlue dark:text-blue-dark-medium'>
						Average Rating({report.ratings.length}): <div className='ml-2 flex gap-1'>{renderStars()}</div>
					</p>
				)}

				{!!postData?.progress_report_views?.length && (
					<Divider
						className='hidden dark:border-separatorDark md:inline-block'
						type='vertical'
						style={{ borderLeft: '1px solid var(--lightBlue)' }}
					/>
				)}

				{!!postData?.progress_report_views && postData?.progress_report_views?.length > 0 && (
					<p className='m-0 flex items-center gap-x-1 p-0 text-xs font-normal text-lightBlue dark:text-blue-dark-medium'>
						<Image
							src='/assets/icons/view-icon.svg'
							alt='view-icon'
							height={16}
							width={16}
							className={theme == 'dark' ? 'dark-icons' : ''}
						/>
						{postData?.progress_report_views?.length}
					</p>
				)}
			</div>

			<div className='mt-2 flex flex-col gap-y-2'>
				{(seeMore ? report?.tasks : report?.tasks?.slice(0, 2))?.map((task) => {
					return (
						<div
							key={task?.title}
							className='flex items-center justify-between gap-x-4 rounded-lg bg-[#F7F7F7] px-3 py-3 text-sm font-medium text-bodyBlue dark:bg-[#393939] dark:text-blue-dark-high'
						>
							<span>{task?.title}</span>
							<div
								className={classNames(
									'min-w-[93px] rounded-[20px] px-3 py-1.5 text-xs font-medium tracking-wide text-blue-dark-high',
									task?.status === 'B' ? 'bg-[#5BC044] dark:bg-[#478F37]' : 'bg-[#FF6700] dark:bg-[#D05704]'
								)}
							>
								{task?.status == 'A' ? 'In progress' : 'Completed'}
							</div>
						</div>
					);
				})}
				{!!report?.tasks?.length && report?.tasks?.length > 2 && (
					<div className='-mt-1 flex items-center justify-start'>
						<button
							onClick={() => setSeeMore(!seeMore)}
							className='cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-pink_primary'
						>
							{seeMore ? 'See Less' : 'See More'}
						</button>
					</div>
				)}
			</div>
		</article>
	);
};

export default ReportDetails;
