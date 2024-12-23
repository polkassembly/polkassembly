// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CalendarFilled } from '@ant-design/icons';
import { Calendar as StyledCalendar, List, Spin } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useApiContext } from '~src/context';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { NetworkEvent } from '~src/types';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import {
	fetchAuctionInfo,
	fetchCouncilElection,
	fetchCouncilMotions,
	fetchDemocracyDispatches,
	fetchDemocracyLaunch,
	fetchParachainLease,
	fetchScheduled,
	fetchSocietyChallenge,
	fetchSocietyRotate,
	fetchStakingInfo,
	fetchTreasurySpend
} from '~src/util/getCalendarEvents';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useNetworkSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import Tooltip from '~src/basic-components/Tooltip';

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

const UpcomingEvents = ({ className }: Props) => {
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();

	const [showCalendar, setShowCalendar] = useState<boolean>(false);
	const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
	const [eventDates, setEventDates] = useState<string[]>([]);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!api || !apiReady) return;

		(async () => {
			setLoading(true);
			const eventsArr: any[] = [];
			const eventDatesArr: string[] = [];

			const eventPromises = [
				fetchStakingInfo(api, network),
				fetchCouncilMotions(api, network),
				fetchCouncilElection(api, network),
				fetchScheduled(api, network),
				fetchTreasurySpend(api, network),
				fetchDemocracyDispatches(api, network),
				fetchDemocracyLaunch(api, network),
				fetchSocietyRotate(api, network),
				fetchSocietyChallenge(api, network),
				fetchAuctionInfo(api, network),
				fetchParachainLease(api, network)
			];

			const eventsSettled = await Promise.allSettled(eventPromises);

			for (const [index, eventSettled] of eventsSettled.entries()) {
				if (eventSettled.status !== 'fulfilled' || !eventSettled.value) continue;
				const currDate = dayjs();
				switch (index) {
					case 0:
						eventSettled.value.forEach((eventObj, i) => {
							if (dayjs(eventObj.endDate).isAfter(currDate)) {
								const type = eventObj?.type?.replace(/([A-Z])/g, ' $1');
								const title = type.charAt(0).toUpperCase() + type.slice(1);

								eventsArr.push({
									content:
										eventObj.type === 'stakingEpoch'
											? `Start of a new staking session ${eventObj?.data?.index}`
											: eventObj.type === 'stakingEra'
											? `Start of a new staking era ${eventObj?.data?.index}`
											: `${eventObj.type} ${eventObj?.data?.index}`,
									end_time: dayjs(eventObj.startDate).toDate(),
									id: `stakingInfoEvent_${i}`,
									location: '',
									start_time: dayjs(eventObj.startDate).toDate(),
									status: 'approved',
									title,
									url: ''
								});
								const eventDateStr = dayjs(eventObj.startDate).format('L');
								eventDatesArr.push(eventDateStr);
							}
						});
						break;

					case 1:
						eventSettled.value.forEach((eventObj, i) => {
							if (dayjs(eventObj.endDate).isAfter(currDate)) {
								eventsArr.push({
									content: `Council Motion ${String(eventObj?.data?.hash)?.substring(0, 10)}...`,
									end_time: dayjs(eventObj.endDate).toDate(),
									id: `councilMotionEvent_${i}`,
									location: '',
									start_time: dayjs(eventObj.endDate).toDate(),
									status: 'approved',
									title: 'Council Motion',
									url: ''
								});
								const eventDateStr = dayjs(eventObj.endDate).format('L');
								eventDatesArr.push(eventDateStr);
							}
						});
						break;

					case 2:
						eventSettled.value.forEach((eventObj, i) => {
							if (dayjs(eventObj.endDate).isAfter(currDate)) {
								eventsArr.push({
									content: `Election of new council candidates period ${eventObj?.data?.electionRound}`,
									end_time: dayjs(eventObj.endDate).toDate(),
									id: `councilElectionEvent_${i}`,
									location: '',
									start_time: dayjs(eventObj.endDate).toDate(),
									status: 'approved',
									title: 'Start New Council Election',
									url: ''
								});
								const eventDateStr = dayjs(eventObj.endDate).format('L');
								eventDatesArr.push(eventDateStr);
							}
						});
						break;

					case 3:
						eventSettled.value.forEach((eventObj, i) => {
							if (dayjs(eventObj.endDate).isAfter(currDate)) {
								eventsArr.push({
									content: eventObj?.data?.id ? `Execute named scheduled task ${String(eventObj?.data?.id)?.substring(0, 10)}...` : 'Execute anonymous scheduled task',
									end_time: dayjs(eventObj.endDate).toDate(),
									id: `scheduledEvent_${i}`,
									location: '',
									start_time: dayjs(eventObj.endDate).toDate(),
									status: 'approved',
									title: 'Scheduled Task',
									url: ''
								});
								const eventDateStr = dayjs(eventObj.endDate).format('L');
								eventDatesArr.push(eventDateStr);
							}
						});
						break;

					case 4:
						eventSettled.value.forEach((eventObj, i) => {
							if (dayjs(eventObj.endDate).isAfter(currDate)) {
								eventsArr.push({
									content: `Start of next spend period ${eventObj?.data?.spendingPeriod}`,
									end_time: dayjs(eventObj.endDate).toDate(),
									id: `treasurySpendEvent_${i}`,
									location: '',
									start_time: dayjs(eventObj.endDate).toDate(),
									status: 'approved',
									title: 'Start Spend Period',
									url: ''
								});
								const eventDateStr = dayjs(eventObj.endDate).format('L');
								eventDatesArr.push(eventDateStr);
							}
						});
						break;

					case 5:
						eventSettled.value.forEach((eventObj, i) => {
							if (dayjs(eventObj.endDate).isAfter(currDate)) {
								eventsArr.push({
									content: `Democracy Dispatch ${eventObj?.data?.index}`,
									end_time: dayjs(eventObj.endDate).toDate(),
									id: `democracyDispatchEvent_${i}`,
									location: '',
									start_time: dayjs(eventObj.endDate).toDate(),
									status: 'approved',
									title: 'Democracy Dispatch',
									url: ''
								});
								const eventDateStr = dayjs(eventObj.endDate).format('L');
								eventDatesArr.push(eventDateStr);
							}
						});
						break;

					case 6:
						eventSettled.value.forEach((eventObj, i) => {
							if (dayjs(eventObj.endDate).isAfter(currDate)) {
								eventsArr.push({
									content: `Start of next referendum voting period ${eventObj?.data?.launchPeriod}`,
									end_time: dayjs(eventObj.endDate).toDate(),
									id: `democracyLaunchEvent_${i}`,
									location: '',
									start_time: dayjs(eventObj.endDate).toDate(),
									status: 'approved',
									title: 'Start Referendum Voting Period',
									url: ''
								});
								const eventDateStr = dayjs(eventObj.endDate).format('L');
								eventDatesArr.push(eventDateStr);
							}
						});
						break;

					case 7:
						eventSettled.value.forEach((eventObj, i) => {
							if (dayjs(eventObj.endDate).isAfter(currDate)) {
								eventsArr.push({
									content: `Acceptance of new members and bids ${eventObj?.data?.rotateRound}`,
									end_time: dayjs(eventObj.endDate).toDate(),
									id: `societyRotateEvent_${i}`,
									location: '',
									start_time: dayjs(eventObj.endDate).toDate(),
									status: 'approved',
									title: 'New Members & Bids',
									url: ''
								});
								const eventDateStr = dayjs(eventObj.endDate).format('L');
								eventDatesArr.push(eventDateStr);
							}
						});
						break;

					case 8:
						eventSettled.value.forEach((eventObj, i) => {
							if (dayjs(eventObj.endDate).isAfter(currDate)) {
								eventsArr.push({
									content: `Start of next membership challenge period ${eventObj?.data?.challengePeriod}`,
									end_time: dayjs(eventObj.endDate).toDate(),
									id: `societyChallengeEvent_${i}`,
									location: '',
									start_time: dayjs(eventObj.endDate).toDate(),
									status: 'approved',
									title: 'Start Membership Challenge Period',
									url: ''
								});
								const eventDateStr = dayjs(eventObj.endDate).format('L');
								eventDatesArr.push(eventDateStr);
							}
						});
						break;

					case 9:
						eventSettled.value.forEach((eventObj, i) => {
							if (dayjs(eventObj.endDate).isAfter(currDate)) {
								eventsArr.push({
									content: `End of the current parachain auction ${eventObj?.data?.leasePeriod}`,
									end_time: dayjs(eventObj.endDate).toDate(),
									id: `auctionInfoEvent_${i}`,
									location: '',
									start_time: dayjs(eventObj.endDate).toDate(),
									status: 'approved',
									title: 'End Parachain Auction',
									url: ''
								});
								const eventDateStr = dayjs(eventObj.endDate).format('L');
								eventDatesArr.push(eventDateStr);
							}
						});
						break;

					case 10:
						eventSettled.value.forEach((eventObj, i) => {
							if (dayjs(eventObj.endDate).isAfter(currDate)) {
								eventsArr.push({
									content: `Start of the next parachain lease period  ${eventObj?.data?.leasePeriod}`,
									end_time: dayjs(eventObj.endDate).toDate(),
									id: `parachainLeaseEvent_${i}`,
									location: '',
									start_time: dayjs(eventObj.endDate).toDate(),
									status: 'approved',
									title: 'Start Parachain Lease Period',
									url: ''
								});
								const eventDateStr = dayjs(eventObj.endDate).format('L');
								eventDatesArr.push(eventDateStr);
							}
						});
						break;
				}
			}

			setCalendarEvents(eventsArr);
			setEventDates(eventDatesArr);
			setLoading(false);
		})();
	}, [api, apiReady, network]);

	const getNetworkEvents = useCallback(async () => {
		const { data, error: fetchError } = await nextApiClientFetch<NetworkEvent[]>('api/v1/events');

		if (fetchError || !data) {
			console.log('error fetching events : ', fetchError);
			setError(fetchError || 'Error in fetching events');
		}

		if (data) {
			const eventsArr: any[] = calendarEvents;
			const eventDatesArr: string[] = eventDates;

			data.forEach((eventObj) => {
				const eventDate = new Date(eventObj.end_time);
				const currDate = new Date();
				if (eventDate.getTime() >= currDate.getTime()) {
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
		calendarEvents.forEach((eventObj) => {
			if (dayjs(eventObj.end_time).format('L') === value.format('L')) {
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
				<div>
					{eventData.map((eventObj) => (
						<div key={eventObj.id}>
							<a
								className='text-white hover:text-white hover:underline'
								href={eventObj.url}
								target='_blank'
								rel='noreferrer'
							>
								{eventObj.title}
							</a>
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
				dataSource={calendarEvents.sort((a, b) => (a?.end_time?.getTime() || a?.start_time?.getTime()) - (b?.end_time?.getTime() || b?.start_time?.getTime())).reverse()}
				renderItem={(item) => {
					return (
						<List.Item className={`${item.url ? 'cursor-pointer' : 'cursor-default'} text-blue-light-high dark:text-blue-dark-high`}>
							<a
								{...(item.url ? { href: item.url } : {})}
								target='_blank'
								rel='noreferrer'
								className={`${item.url ? 'cursor-pointer' : 'cursor-default'} text-sidebarBlue`}
							>
								<div className='mb-1 flex items-center text-xs text-lightBlue dark:text-blue-dark-medium'>
									{dayjs(item.end_time).format('MMM D, YYYY')}
									<span className='mx-2 inline-block h-[4px] w-[4px] rounded-full bg-bodyBlue dark:bg-blue-dark-medium'></span>
									{dayjs(item.end_time).format('h:mm a')}
								</div>

								<div className='text-sm text-bodyBlue dark:font-normal dark:text-blue-dark-high'>{item.content}</div>
							</a>
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
					Upcoming Events
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
