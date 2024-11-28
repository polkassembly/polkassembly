// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Tooltip } from 'antd';

function ActivityFeedCalendar() {
	const [activityData] = useState([
		{ comments: 1, date: '2024-11-01', proposals: 2, votes: 5 },
		{ comments: 0, date: '2024-11-03', proposals: 1, votes: 3 },
		{ comments: 1, date: '2024-11-10', proposals: 0, votes: 2 }
	]);

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

	return (
		<div className='mt-5 rounded-xxl border-[0.6px] border-solid border-[#D2D8E0] bg-white p-5 text-[13px] dark:border-[#4B4B4B] dark:bg-section-dark-overlay md:p-5'>
			<div className='mb-2 flex items-center justify-between gap-2'>
				<div className='flex items-center'>
					<p className='whitespace-nowrap pt-3 font-semibold text-[#243A57] dark:text-white xl:text-[18px] 2xl:text-[20px]'>Activity</p>
				</div>
				<div className='mt-[7px]'>
					<p className='flex items-center rounded-lg border-[1px] border-solid border-[#D2D8E0] p-1.5 text-sm text-[#485F7D]'>
						<CalendarOutlined className='pr-1.5 font-bold' /> {dayjs().format('MMMM')}
					</p>
				</div>
			</div>
			<div className='grid grid-cols-7 gap-3 text-center'>
				{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
					<div
						key={day}
						className='font-semibold text-[#485F7D]'
					>
						{day}
					</div>
				))}
				{weeks.map((week, index) =>
					week.map((day, dayIndex) => (
						<Tooltip
							key={`${index}-${dayIndex}`}
							title={
								day ? (
									<div>
										<p>
											<strong>Date:</strong> {dayjs(day.date).format('DD MMM, YYYY')}
										</p>
										{day && day.proposals !== undefined && day.proposals > 0 && (
											<p>
												<strong>Proposals:</strong> {day.proposals}
											</p>
										)}
										{day && day.votes !== undefined && day.votes > 0 && (
											<p>
												<strong>Votes:</strong> {day.votes}
											</p>
										)}
										{day && day.comments !== undefined && day.comments > 0 && (
											<p>
												<strong>Comments:</strong> {day.comments}
											</p>
										)}
									</div>
								) : (
									''
								)
							}
						>
							<div
								className={`h-6 w-6 rounded-md ${
									day ? (day.proposals ? 'bg-[#BBDDFF]' : day.votes ? 'bg-[#2352BB]' : day.comments ? 'bg-[#3473FF]' : 'bg-[#F5F5F9]') : '' // Empty string for null days
								}`}
							></div>
						</Tooltip>
					))
				)}
			</div>
			<div className='mt-4 flex flex-col gap-2 text-sm'>
				<span className='flex items-center  text-[#2352BB]'>
					<span className='mr-2 inline-block h-5 w-5 rounded-md bg-[#BBDDFF]'></span>{' '}
					<span className='mr-1 text-[12px] font-medium text-[#243A57] text-opacity-[70%]'>Proposals Created:</span>
					<span className='text-[12px] font-semibold text-[#243A57]'>{activityData.reduce((sum, data) => sum + (data.proposals || 0), 0)}</span>
				</span>
				<span className='flex items-center text-[#2352BB]'>
					<span className='mr-2 inline-block h-5 w-5 rounded-md bg-[#2352BB]'></span> <span className='mr-1 text-[12px] font-medium text-[#243A57] text-opacity-[70%]'>Votes:</span>
					<span className='text-[12px] font-semibold text-[#243A57]'>{activityData.reduce((sum, data) => sum + (data.votes || 0), 0)}</span>
				</span>
				<span className='flex items-center text-[#3473FF]'>
					<span className='mr-2 inline-block h-5 w-5 rounded-md bg-[#3473FF]'></span>{' '}
					<span className='mr-1 w-20 text-[12px] font-medium leading-none text-[#243A57] text-opacity-[70%]'>
						Proposal
						<br />
						<span className='block'>Engagement:</span>
					</span>
					<div className=' leading-none'>
						<span className='text-[12px] font-semibold text-[#243A57]'>{activityData.reduce((sum, data) => sum + (data.comments || 0), 0)}</span>{' '}
						<span className=' text-[12px] text-[#243A57]'>Likes</span>
						<span className='ml-2 text-[12px] font-semibold text-[#243A57]'>{activityData.reduce((sum, data) => sum + (data.comments || 0), 0)}</span>{' '}
						<span className=' text-[12px] text-[#243A57]'>Dislikes</span>
						<br />
						<span className='text-[12px] font-semibold text-[#243A57]'>{activityData.reduce((sum, data) => sum + (data.comments || 0), 0)}</span>{' '}
						<span className='text-[12px] text-[#243A57]'>Comment</span>
					</div>
				</span>
			</div>
		</div>
	);
}

export default ActivityFeedCalendar;
