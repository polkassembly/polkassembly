// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CalendarFilled } from '@ant-design/icons';
import { Badge, Calendar, List, Tooltip } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { NetworkEvent } from '~src/types';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface Props{
	className?: string
}

const UpcomingEvents = ({ className }:Props) => {
	const [showCalendar, setShowCalendar] = useState<boolean>(false);
	const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
	const [eventDates, setEventDates] = useState<string[]>([]);
	const [error, setError] = useState('');

	const getNetworkEvents = useCallback(async () => {
		const { data , error: fetchError } = await nextApiClientFetch<NetworkEvent[]>( 'api/v1/events');

		if(fetchError || !data) {
			console.log('error fetching events : ', fetchError);
			setError(fetchError || 'Error in fetching events');
		}

		if(data) {
			const eventsArr:any[] = [];
			const eventDatesArr:string[] = [];

			data.forEach(eventObj => {
				const eventDate = new Date(eventObj.end_time);
				const currDate = new Date();
				if(eventDate.getTime() >= currDate.getTime()) {
					eventsArr.push({
						content: eventObj.content,
						end_time: dayjs(eventObj.end_time).toDate(),
						id: eventObj.id,
						location: eventObj.location,
						start_time: dayjs(eventObj.end_time).toDate(),
						status: eventObj.status,
						title: eventObj.title,
						url: eventObj.url
					});
					const eventDateStr = dayjs(eventObj.end_time).format('L');
					eventDatesArr.push(eventDateStr);
				}
			});
			setCalendarEvents(eventsArr);
			setEventDates(eventDatesArr);
		}
	}, []);

	useEffect(() => {
		getNetworkEvents();
	}, [getNetworkEvents]);

	const getDateHasEvent = (value: Dayjs): boolean => {
		const valueDateStr = value.format('L');
		return eventDates.includes(valueDateStr);
	};

	const getEventData = (value: Dayjs): any[] => {
		const eventList: any[] = [];
		calendarEvents.forEach(eventObj => {
			if(dayjs(eventObj.end_time).format('L') === value.format('L')){
				eventList.push(eventObj);
			}
		});

		return eventList;
	};

	const dateCellRender = (value: Dayjs) => {
		const hasEvent = getDateHasEvent(value);
		if(hasEvent) {
			const eventData = getEventData(value);
			const eventList = <div>
				{
					eventData.map(eventObj => (
						<div key={eventObj.id}>
							<a className='text-white hover:text-white hover:underline' href={eventObj.url} target='_blank' rel='noreferrer'>{eventObj.title}</a>
							<span className="flex h-[1px] bg-[rgba(255,255,255,0.3)] w-full my-2 rounded-full"></span>
						</div>
					))
				}
			</div>;

			return (
				<Tooltip color='#E5007A' title={eventList}>
					<Badge count={value.format('D')} color='transparent' className='bg-pink-400 rounded-full absolute -ml-3 mt-[-22px] w-full' />
				</Tooltip>
			);
		}
	};

	const CalendarElement = () => (
		<>
			<Calendar
				className='border border-solid border-gray-200 rounded-md mb-4'
				fullscreen={false}
				dateCellRender={dateCellRender}
			/>
		</>
	);

	const EventsListElement = () => (
		<>
			<List
				className='h-[100%] overflow-y-auto'
				itemLayout="horizontal"
				dataSource={calendarEvents}
				renderItem={item => {
					return (<List.Item className='cursor-pointer text-sidebarBlue'>
						<a href={item.url} target='_blank' rel='noreferrer'>
							<div className='text-xs mb-1 flex items-center text-navBlue'>
								{dayjs(item.end_time).format('MMM D, YYYY')}
								<span className="h-[4px] w-[4px] bg-navBlue mx-2 rounded-full inline-block"></span>
								{dayjs(item.end_time).format('h:mm a')}
							</div>

							<div>{item.title}</div>
							<div className="text-sm">
								{item.content}
							</div>
						</a>
					</List.Item>);
				}}
			/>
		</>
	);

	if (error) {
		return <ErrorAlert errorMsg={error} />;
	}

	return (
		<div className={`${className} bg-white drop-shadow-md p-4 lg:p-6 rounded-md h-[520px] lg:h-[550px]`}>
			<div className="flex items-center justify-between mb-5">
				<h2 className='dashboard-heading'>Upcoming Events</h2>
				<CalendarFilled className='cursor-pointer inline-block lg:hidden' onClick={() => setShowCalendar(!showCalendar)} />
			</div>

			{/* Desktop */}
			<div className="hidden lg:flex lg:flex-row h-[520px] lg:h-[450px]">
				<div className="w-full lg:w-[55%] p-3">
					<CalendarElement />
					<span className='text-xs text-navBlue'>*DateTime in UTC</span>
				</div>

				<div className="w-[45%] ml-4 p-2">
					<EventsListElement />
				</div>
			</div>

			{/* Tablet and below */}
			<div className="flex lg:hidden">
				{
					showCalendar ?
						<div className="w-full lg:w-[55%] p-3">
							<CalendarElement />
							<span className='text-xs text-navBlue'>*DateTime in UTC</span>
						</div>
						:
						<div className="w-full h-[430px] ml-4 p-2">
							<EventsListElement />
						</div>
				}
			</div>
		</div>
	);
};

export default styled(UpcomingEvents)`
	.ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner {
		border-radius: 50%;
	}

	.ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
		border-radius: 50% !important;
	}
`;