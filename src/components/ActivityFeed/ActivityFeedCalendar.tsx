// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Tooltip } from 'antd';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import Skeleton from '~src/basic-components/Skeleton';

function ActivityFeedCalendar() {
	interface ActivityData {
		date: string;
		proposalsCreated?: number;
		votes?: number;
		comments?: number;
		likes?: number;
		dislikes?: number;
	}

	const [activityData, setActivityData] = useState<ActivityData[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchActivityCalendar = async () => {
		try {
			setLoading(true);
			const { data } = await nextApiClientFetch<any>('/api/v1/activity-feed/activity-calendar');
			if (data && data.data) {
				setActivityData(data.data);
			} else {
				console.error('No activity data found.');
			}
		} catch (error) {
			console.error('Error fetching activity data:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchActivityCalendar();
	}, []);

	const currentMonth = dayjs().month();
	const currentYear = dayjs().year();

	const daysInMonth = dayjs().daysInMonth();
	const firstDayOfMonth = dayjs(`${currentYear}-${currentMonth + 1}-01`).day();
	const weeks = [];
	let week = [];

	for (let i = 0; i < firstDayOfMonth; i++) {
		week.push(null);
	}

	for (let day = 1; day <= daysInMonth; day++) {
		const date = dayjs(`${currentYear}-${currentMonth + 1}-${day}`).format('YYYY-MM-DD');
		const dayData = activityData.find((data) => data.date === date) || null;
		week.push({ date, ...dayData });

		if (week.length === 7) {
			weeks.push(week);
			week = [];
		}
	}

	if (week.length > 0) {
		while (week.length < 7) {
			week.push(null);
		}
		weeks.push(week);
	}

	if (loading) {
		return <Skeleton className='mt-7' />;
	}

	return (
		<div className='mt-5 rounded-xxl border-[0.6px] border-solid border-[#D2D8E0] bg-white p-5 text-[13px] dark:border-[#4B4B4B] dark:bg-section-dark-overlay md:p-5'>
			<div className='mb-2 flex items-center justify-between gap-2'>
				<div className='flex items-center'>
					<p className='whitespace-nowrap pt-3 font-semibold text-[#243A57] dark:text-white xl:text-[18px] 2xl:text-[20px]'>Activity</p>
				</div>
				<div className='mt-[7px]'>
					<p className='flex items-center rounded-lg border-[1px] border-solid border-[#D2D8E0] p-1.5 text-sm text-[#485F7D] dark:border-[#4B4B4B] dark:text-[#9E9E9E]'>
						<CalendarOutlined className='pr-1.5 font-bold' /> {dayjs().format('MMMM')}
					</p>
				</div>
			</div>
			<div className='grid grid-cols-7 gap-3 text-center'>
				{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
					<div
						key={day}
						className='font-semibold text-[#485F7D] dark:text-[#9E9E9E] dark:text-opacity-[60%] '
					>
						{day}
					</div>
				))}
				{weeks.map((week, index) =>
					week.map((day, dayIndex) => (
						<Tooltip
							key={`${index}-${dayIndex}`}
							title={
								day && (
									<div className='m-0 flex flex-col p-0 md:p-1'>
										<span className='m-0'>
											<strong>Date:</strong> {dayjs(day.date).format('DD MMM, YYYY')}
										</span>
										{day && (day.proposalsCreated ?? 0) > 0 && (
											<span className='m-0'>
												<strong>Proposals:</strong> {day.proposalsCreated}
											</span>
										)}
										{day && (day.votes ?? 0) > 0 && (
											<span className='m-0'>
												<strong>Votes:</strong> {day.votes}
											</span>
										)}
										{day && day.likes !== undefined && day.likes > 0 && (
											<span className='m-0'>
												<strong>Likes:</strong> {day.likes}
											</span>
										)}
										{(day?.dislikes ?? 0) > 0 && (
											<span className='m-0'>
												<strong>Dislikes:</strong> {day.dislikes}
											</span>
										)}
										{(day?.comments ?? 0) > 0 && (
											<span className='m-0'>
												<strong>Comments:</strong> {day.comments}
											</span>
										)}
									</div>
								)
							}
							placement='top'
						>
							<div
								className={`h-6 w-6 rounded-md ${day ? (day.proposalsCreated ? 'bg-[#BBDDFF]' : day.votes ? 'bg-[#2352BB]' : day.comments ? 'bg-[#3473FF]' : 'bg-[#F5F5F9]') : ''}`}
							></div>
						</Tooltip>
					))
				)}
			</div>
			<div className='mt-4 flex flex-col gap-2 text-sm'>
				<span className='flex items-center text-[#2352BB]'>
					<span className='mr-2 inline-block h-5 w-5 rounded-md bg-[#BBDDFF]'></span>{' '}
					<span className='mr-1 text-[12px] font-medium text-[#243A57] text-opacity-[70%] dark:text-[#B6B6B6]'>Proposals Created:</span>
					<span className='text-[12px] font-semibold text-[#243A57] dark:text-white'>{activityData.reduce((sum, data) => sum + (data.proposalsCreated || 0), 0)}</span>
				</span>
				<span className='flex items-center text-[#2352BB]'>
					<span className='mr-2 inline-block h-5 w-5 rounded-md bg-[#2352BB] '></span>{' '}
					<span className='mr-1 text-[12px] font-medium text-[#243A57] text-opacity-[70%] dark:text-[#B6B6B6]'>Votes:</span>
					<span className='text-[12px] font-semibold text-[#243A57] dark:text-white'>{activityData.reduce((sum, data) => sum + (data.votes || 0), 0)}</span>
				</span>
				<span className='flex items-center text-[#3473FF]'>
					<span className='mr-2 inline-block h-5 w-5 rounded-md bg-[#3473FF]'></span>{' '}
					<span className='mr-1 w-20 text-[12px] font-medium leading-none text-[#243A57] text-opacity-[70%] dark:text-[#B6B6B6]'>
						Proposal
						<br />
						<span className='block'>Engagement:</span>
					</span>
					<div className=' leading-none'>
						<span className='text-[12px] font-semibold text-[#243A57] dark:text-white'>{activityData.reduce((sum, data) => sum + (data.likes || 0), 0)}</span>{' '}
						<span className='text-[12px] text-[#243A57] dark:text-white '>Likes</span>
						<span className='ml-2 text-[12px] font-semibold text-[#243A57] dark:text-white'>{activityData.reduce((sum, data) => sum + (data.dislikes || 0), 0)}</span>{' '}
						<span className='text-[12px] text-[#243A57] dark:text-white'>Dislikes</span>
						<br />
						<span className='text-[12px] font-semibold text-[#243A57] dark:text-white'>{activityData.reduce((sum, data) => sum + (data.comments || 0), 0)}</span>{' '}
						<span className='text-[12px] text-[#243A57] dark:text-white'>Comments</span>
					</div>
				</span>
			</div>
		</div>
	);
}

export default ActivityFeedCalendar;
