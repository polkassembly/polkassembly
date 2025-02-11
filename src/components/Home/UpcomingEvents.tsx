// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CalendarFilled } from '@ant-design/icons';
import { Calendar as StyledCalendar, List, Spin } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { ICalendarEvent } from '~src/types';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useNetworkSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import Tooltip from '~src/basic-components/Tooltip';
import { useCurrentBlock } from '~src/hooks';
import dateToBlockNo from '~src/util/dateToBlockNo';
import Link from 'next/link';
import { getSinglePostLinkFromProposalType } from '~src/global/proposalType';
import BN from 'bn.js';

dayjs.extend(localizedFormat);
interface Props {
	className?: string;
}
const Calendar = styled(StyledCalendar)`
	.ant-picker-panel {
		background: ${(props: any) => (props.theme === 'dark' ? 'black' : 'white')} !important;
	}
	th {
		color: ${(props: any) => (props.theme === 'dark' ? '#909090' : '#000')} !important;
	}
	.ant-picker-cell {
		color: ${(props: any) => (props.theme === 'dark' ? '#fff' : '#000')} !important;
	}
	.ant-select-selector {
		color: ${(props: any) => (props.theme === 'dark' ? '#fff' : '#000')} !important;
		background: ${(props: any) => (props.theme === 'dark' ? '#000' : '#fff')} !important;
	}
	.ant-select-item {
		color: ${(props: any) => (props.theme === 'dark' ? '#fff' : '#000')} !important;
		background: ${(props: any) => (props.theme === 'dark' ? '#000' : '#fff')} !important;
	}
	.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
		color: ${(props: any) => (props.theme === 'dark' ? '#fff' : '#000')} !important;
		background: ${(props: any) => (props.theme === 'dark' ? '#000' : '#fff')} !important;
	}
	.ant-radio-button-wrapper {
		color: ${(props: any) => (props.theme === 'dark' ? '#fff' : '#000')} !important;
		background: ${(props: any) => (props.theme === 'dark' ? '#000' : '#fff')} !important;
	}
	.ant-select-dropdown {
		background-color: ${(props: any) => (props.theme === 'dark' ? '#0d0d0d' : '#fff')} !important;
	}
	.ant-select-selection-item {
		color: ${(props: any) => (props.theme === 'dark' ? '#fff' : '#0d0d0d')} !important;
	}
`;

const updateEventsWithTimeStamps = (events: ICalendarEvent[], blockNo: number) => {
	if (!events?.length) return [];

	return events
		.flatMap(
			(item) =>
				item.statusHistory
					?.filter((status) => status.block >= blockNo)
					?.map((timeline) => ({
						...item,
						blockNo: timeline.block,
						createdAt: timeline.timestamp
					}))
		)
		.sort((a, b) => a.blockNo - b.blockNo);
};

const UpcomingEvents = ({ className }: Props) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const currentBlock = useCurrentBlock();
	const [showCalendar, setShowCalendar] = useState<boolean>(false);
	const [calendarEvents, setCalendarEvents] = useState<ICalendarEvent[]>([]);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);
	const [currentBlockStatic, setCurrentBlockStatic] = useState<BN | null>(null);
	const [eventDates, setEventDates] = useState<string[]>([]);

	useEffect(() => {
		if (!currentBlockStatic) {
			setCurrentBlockStatic(currentBlock || null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentBlock]);

	const getNetworkEvents = useCallback(async () => {
		if (!currentBlockStatic) return;
		setLoading(true);

		const selectedDate = new Date();
		const startDate = dayjs(selectedDate).startOf('month');
		const endDate = dayjs(selectedDate).endOf('month');

		const startBlockNo = dateToBlockNo({
			currentBlockNumber: currentBlockStatic.toNumber(),
			date: startDate.toDate(),
			network
		});
		const endBlockNo = dateToBlockNo({
			currentBlockNumber: currentBlockStatic.toNumber(),
			date: endDate.toDate(),
			network
		});

		if (startBlockNo && currentBlockStatic && startBlockNo > currentBlockStatic.toNumber()) {
			setLoading(false);
			setCalendarEvents([]);
			return;
		}

		const { data, error } = await nextApiClientFetch<ICalendarEvent[]>('/api/v1/calendar/getEventsByDate', { endBlockNo, startBlockNo });

		if (error) {
			console.error(error);
			setError(error);
			setLoading(false);
			return;
		}

		const updatedEvents = updateEventsWithTimeStamps(data || [], startBlockNo || 0);
		setCalendarEvents(updatedEvents);
		setEventDates(updatedEvents.map((event) => dayjs(event.createdAt).format('L')));
		setLoading(false);
	}, [currentBlockStatic, network]);

	useEffect(() => {
		getNetworkEvents();
	}, [getNetworkEvents]);

	const getDateHasEvent = (value: Dayjs): boolean => {
		const valueDateStr = value.format('L');
		return eventDates.includes(valueDateStr);
	};

	const getEventData = (value: Dayjs): any[] => {
		const eventList: any[] = [];
		calendarEvents.forEach((eventObj) => {
			if (dayjs(eventObj.createdAt).format('L') === value.format('L')) {
				eventList.push(eventObj);
			}
		});

		return eventList;
	};

	const dateCellRender = (value: Dayjs) => {
		const hasEvent = getDateHasEvent(value);
		if (hasEvent) {
			const eventData = getEventData(value);
			const eventList = (
				<div className='flex max-h-[200px] flex-col gap-2 overflow-y-auto'>
					{eventData.map((eventObj: any) => (
						<div key={eventObj.id}>
							<Link
								className='capitalize text-white hover:text-pink_primary hover:text-white hover:underline'
								href={`/${getSinglePostLinkFromProposalType(eventObj.proposalType)}/${eventObj.index}`}
								target='_blank'
								rel='noreferrer'
							>
								{eventObj.title}
							</Link>
							<span className='my-2 flex h-[1px] w-full rounded-full bg-[rgba(255,255,255,0.3)]'></span>
						</div>
					))}
				</div>
			);

			return (
				<Tooltip
					color='#E5007A'
					title={eventList}
				>
					<div className='calenderDate dark:bg-[#FF0088]'>{value.format('D')}</div>
				</Tooltip>
			);
		}
	};

	const CalendarElement = () => (
		<Spin spinning={loading}>
			<Calendar
				className='mb-4 rounded-xl border border-solid border-gray-300 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'
				fullscreen={false}
				cellRender={dateCellRender}
				theme={theme as any}
			/>
		</Spin>
	);

	const EventsListElement = () => (
		<>
			<List
				className='h-[100%] overflow-y-auto'
				itemLayout='horizontal'
				dataSource={calendarEvents.sort((a, b) => dayjs(a.createdAt).diff(dayjs(b.createdAt)))}
				renderItem={(item) => {
					return (
						<List.Item className={'flex cursor-pointer flex-col items-start justify-start gap-1 text-blue-light-high dark:text-blue-dark-high'}>
							<div className='mb-1 flex items-center text-xs text-lightBlue dark:text-blue-dark-medium'>{dayjs(item.createdAt).format('MMM D, YYYY')}</div>
							<Link
								href={`/${getSinglePostLinkFromProposalType(item.proposalType)}/${item.index}`}
								target='_blank'
								rel='noreferrer'
								className={'cursor-pointer text-sidebarBlue hover:text-pink_primary hover:underline'}
							>
								<div className='text-sm capitalize text-bodyBlue hover:text-pink_primary dark:font-normal dark:text-blue-dark-high hover:dark:text-pink_primary'>{item.title}</div>
							</Link>
						</List.Item>
					);
				}}
			/>
		</>
	);

	if (error) {
		return <ErrorAlert errorMsg={error} />;
	}

	return (
		<div className={`${className} h-[520px] rounded-xxl bg-white p-4 drop-shadow-md dark:border-[#29323C] dark:bg-section-dark-overlay lg:h-[550px] lg:p-6`}>
			<div className='mb-5 flex items-center justify-between'>
				<h2 className='text-xl font-semibold leading-8 tracking-tight text-bodyBlue dark:text-blue-dark-high xs:mx-1 xs:my-2 sm:mx-3 sm:my-0'>
					Events
					<CalendarFilled
						className='ml-2 inline-block scale-90 cursor-pointer lg:hidden'
						onClick={() => setShowCalendar(!showCalendar)}
					/>
				</h2>
			</div>

			{/* Desktop */}
			<div className='hidden h-[520px] lg:flex lg:h-[450px] lg:flex-row'>
				<div className='w-full p-3 lg:w-[55%]'>
					<CalendarElement />
					<span className='text-xs text-navBlue dark:text-blue-dark-medium'>*DateTime in UTC</span>
				</div>

				<div className='ml-4 w-[45%] p-2'>
					<EventsListElement />
				</div>
			</div>

			{/* Tablet and below */}
			<div className='flex lg:hidden'>
				{showCalendar ? (
					<div className='w-full p-3 lg:w-[55%]'>
						<CalendarElement />
						<span className='text-xs text-navBlue'>*DateTime in UTC</span>
					</div>
				) : (
					<div className='h-[430px] w-full p-2'>
						<EventsListElement />
					</div>
				)}
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
		border: 1.5px solid #e5007a;
	}
	.calenderDate {
		margin-top: -24px;
		background-color: #ff7ab4;
		color: #fff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}
`;
