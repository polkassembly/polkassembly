// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CalendarFilled } from '@ant-design/icons';
import { Badge, Calendar, List, Spin, Tooltip } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useApiContext, useNetworkContext } from '~src/context';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { NetworkEvent } from '~src/types';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import { fetchAuctionInfo, fetchCouncilElection, fetchCouncilMotions, fetchDemocracyDispatches, fetchDemocracyLaunch, fetchParachainLease, fetchScheduled, fetchSocietyChallenge, fetchSocietyRotate, fetchStakingInfo, fetchTreasurySpend } from '~src/util/getCalendarEvents';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

dayjs.extend(localizedFormat);
interface Props{
	className?: string
}

const UpcomingEvents = ({ className }:Props) => {
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkContext();

	const [showCalendar, setShowCalendar] = useState<boolean>(false);
	const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
	const [eventDates, setEventDates] = useState<string[]>([]);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if(!api || !apiReady) return;

		(async () => {
			setLoading(true);
			const eventsArr: any[] = [];
			const eventDatesArr:string[] = [];

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
				if(eventSettled.status !== 'fulfilled' || !eventSettled.value) continue;

				switch(index) {
				case 0:
					eventSettled.value.forEach((eventObj, i) => {
						const type = eventObj?.type?.replace(/([A-Z])/g, ' $1');
						const title = type.charAt(0).toUpperCase() + type.slice(1);

						eventsArr.push({
							content: eventObj.type === 'stakingEpoch' ? `Start of a new staking session ${eventObj?.data?.index}`
								: eventObj.type === 'stakingEra' ? `Start of a new staking era ${eventObj?.data?.index}`
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
					});
					break;

				case 1:
					eventSettled.value.forEach((eventObj, i) => {
						eventsArr.push({
							content: `Council Motion ${String(eventObj?.data?.hash)?.substring(0,10)}...`,
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
					});
					break;

				case 2:
					eventSettled.value.forEach((eventObj, i) => {
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
					});
					break;

				case 3:
					eventSettled.value.forEach((eventObj, i) => {
						eventsArr.push({
							content: eventObj?.data?.id ? `Execute named scheduled task ${String(eventObj?.data?.id)?.substring(0,10)}...` : 'Execute anonymous scheduled task',
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
					});
					break;

				case 4:
					eventSettled.value.forEach((eventObj, i) => {
						eventsArr.push({
							content: `Start of next spend period ${eventObj?.data?.spendingPeriod}`,
							end_time: dayjs(eventObj.endDate).toDate(),
							id: `treasurySpendEvent_${i}`,
							location: '',
							start_time: dayjs(eventObj.endDate).toDate(),
							status: 'approved',
							title : 'Start Spend Period',
							url: ''
						});
						const eventDateStr = dayjs(eventObj.endDate).format('L');
						eventDatesArr.push(eventDateStr);
					});
					break;

				case 5:
					eventSettled.value.forEach((eventObj, i) => {
						eventsArr.push({
							content: `Democracy Dispatch ${eventObj?.data?.index}`,
							end_time: dayjs(eventObj.endDate).toDate(),
							id: `democracyDispatchEvent_${i}`,
							location: '',
							start_time: dayjs(eventObj.endDate).toDate(),
							status: 'approved',
							title : 'Democracy Dispatch',
							url: ''
						});
						const eventDateStr = dayjs(eventObj.endDate).format('L');
						eventDatesArr.push(eventDateStr);
					});
					break;

				case 6:
					eventSettled.value.forEach((eventObj, i) => {
						eventsArr.push({
							content: `Start of next referendum voting period ${eventObj?.data?.launchPeriod}`,
							end_time: dayjs(eventObj.endDate).toDate(),
							id: `democracyLaunchEvent_${i}`,
							location: '',
							start_time: dayjs(eventObj.endDate).toDate(),
							status: 'approved',
							title : 'Start Referendum Voting Period',
							url: ''
						});
						const eventDateStr = dayjs(eventObj.endDate).format('L');
						eventDatesArr.push(eventDateStr);
					});
					break;

				case 7:
					eventSettled.value.forEach((eventObj, i) => {
						eventsArr.push({
							content: `Acceptance of new members and bids ${eventObj?.data?.rotateRound}`,
							end_time: dayjs(eventObj.endDate).toDate(),
							id: `societyRotateEvent_${i}`,
							location: '',
							start_time: dayjs(eventObj.endDate).toDate(),
							status: 'approved',
							title : 'New Members & Bids',
							url: ''
						});
						const eventDateStr = dayjs(eventObj.endDate).format('L');
						eventDatesArr.push(eventDateStr);
					});
					break;

				case 8:
					eventSettled.value.forEach((eventObj, i) => {
						eventsArr.push({
							content: `Start of next membership challenge period ${eventObj?.data?.challengePeriod}`,
							end_time: dayjs(eventObj.endDate).toDate(),
							id: `societyChallengeEvent_${i}`,
							location: '',
							start_time: dayjs(eventObj.endDate).toDate(),
							status: 'approved',
							title : 'Start Membership Challenge Period',
							url: ''
						});
						const eventDateStr = dayjs(eventObj.endDate).format('L');
						eventDatesArr.push(eventDateStr);
					});
					break;

				case 9:
					eventSettled.value.forEach((eventObj, i) => {
						eventsArr.push({
							content: `End of the current parachain auction ${eventObj?.data?.leasePeriod}`,
							end_time: dayjs(eventObj.endDate).toDate(),
							id: `auctionInfoEvent_${i}`,
							location: '',
							start_time: dayjs(eventObj.endDate).toDate(),
							status: 'approved',
							title : 'End Parachain Auction',
							url: ''
						});
						const eventDateStr = dayjs(eventObj.endDate).format('L');
						eventDatesArr.push(eventDateStr);
					});
					break;

				case 10:
					eventSettled.value.forEach((eventObj, i) => {
						eventsArr.push({
							content: `Start of the next parachain lease period  ${eventObj?.data?.leasePeriod}`,
							end_time: dayjs(eventObj.endDate).toDate(),
							id: `parachainLeaseEvent_${i}`,
							location: '',
							start_time: dayjs(eventObj.endDate).toDate(),
							status: 'approved',
							title : 'Start Parachain Lease Period',
							url: ''
						});
						const eventDateStr = dayjs(eventObj.endDate).format('L');
						eventDatesArr.push(eventDateStr);
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
		const { data , error: fetchError } = await nextApiClientFetch<NetworkEvent[]>( 'api/v1/events');

		if(fetchError || !data) {
			console.log('error fetching events : ', fetchError);
			setError(fetchError || 'Error in fetching events');
		}

		if(data) {
			const eventsArr:any[] = calendarEvents;
			const eventDatesArr:string[] = eventDates;

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
		<Spin spinning={loading}>
			<Calendar
				className='border border-solid border-[#D2D8E0] rounded-[8px] mb-4'
				fullscreen={false}
				cellRender={dateCellRender}
			/>
		</Spin>
	);

	const EventsListElement = () => (
		<>
			<List
				className='h-[100%] overflow-y-auto'
				itemLayout="horizontal"
				dataSource={calendarEvents.sort((a,b) => (a?.end_time?.getTime() || a?.start_time?.getTime())- (b?.end_time?.getTime() || b?.start_time?.getTime()))}
				renderItem={item => {
					return (<List.Item className={`${item.url ? 'cursor-pointer' : 'cursor-default'} text-[#243A57]`}>
						<a {...(item.url ? { href: item.url } : {})} target='_blank' rel='noreferrer' className={`${item.url ? 'cursor-pointer' : 'cursor-default'} text-[#243A57]`}>
							<div className='text-xs mb-1 flex items-center text-[#485F7D]'>
								{dayjs(item.end_time).format('MMM D, YYYY')}
								<span className="h-[4px] w-[4px] bg-navBlue mx-2 rounded-full inline-block"></span>
								{dayjs(item.end_time).format('h:mm a')}
							</div>

							<div className='font-medium text-sm'>{item.title}</div>
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
		<div className={`${className} bg-white drop-shadow-md p-4 lg:p-6 rounded-xl h-[520px] lg:h-[550px]`}>
			<div className="flex items-center justify-between mb-5">
				<h2 className='text-[#243A57] text-[20px] font-semibold leading-8 mx-3'>Upcoming Events</h2>
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