// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Checkbox, MenuProps, Skeleton, Spin } from 'antd';
import { Badge, Button, Col, Divider, Dropdown, Row, Space } from 'antd';
import { dayjs } from 'dayjs-init';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Calendar, DateHeaderProps, dayjsLocalizer, View } from 'react-big-calendar';
import SidebarRight from 'src/components/SidebarRight';
import { approvalStatus } from 'src/global/statuses';
import { NetworkEvent, NotificationStatus } from 'src/types';
import { Role } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';

import chainLink from '~assets/chain-link.png';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useApiContext } from '~src/context';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import CreateEventSidebar from '../../src/components/Calendar/CreateEventSidebar';
import CustomToolbar from '../../src/components/Calendar/CustomToolbar';
import CustomToolbarMini from '../../src/components/Calendar/CustomToolbarMini';
import CustomWeekHeader, { TimeGutterHeader } from '../../src/components/Calendar/CustomWeekHeader';
import NetworkSelect from '../../src/components/Calendar/NetworkSelect';
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
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import { useUserDetailsSelector } from '~src/redux/selectors';

interface ICalendarViewProps {
	className?: string;
	small?: boolean;
	network: string;
	emitCalendarEvents?: React.Dispatch<React.SetStateAction<any[]>> | undefined;
}

const ALLOWED_ROLE = Role.EVENT_BOT;

const localizer = dayjsLocalizer(dayjs);

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return {
		props: {
			network
		}
	};
};

const categoryOptions = [
	{ label: 'Staking', value: 'Staking' },
	{ label: 'Council', value: 'Council' },
	{ label: 'Schedule', value: 'Schedule' },
	{ label: 'Treasury', value: 'Treasury' },
	{ label: 'Democracy', value: 'Democracy' },
	{ label: 'Society', value: 'Society' },
	{ label: 'Parachains', value: 'Parachains' }
];

const initCategories = ['Staking', 'Council', 'Schedule', 'Treasury', 'Democracy', 'Society', 'Parachains'];

const CalendarView: FC<ICalendarViewProps> = ({ className, small = false, emitCalendarEvents = undefined, network }) => {
	const { api, apiReady } = useApiContext();
	const dispatch = useDispatch();
	const [width, setWidth] = useState(0);
	const [calLeftPanelWidth, setCalLeftPanelWidth] = useState<any>(0);
	const [error, setError] = useState('');
	const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
	const [selectedView, setSelectedView] = useState<View>('month');
	const [selectedNetwork, setSelectedNetwork] = useState<string>(network);
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [miniCalSelectedDate, setMiniCalSelectedDate] = useState<Date>(new Date());
	const [selectedCategories, setSelectedCategories] = useState<CheckboxValueType[]>(initCategories);
	const [sidebarEvent, setSidebarEvent] = useState<any>();
	const [sidebarCreateEvent, setSidebarCreateEvent] = useState<boolean>(false);
	const [categoriesLoading, setCategoriesLoading] = useState(true);

	const [queryApprovalStatus, setQueryApprovalStatus] = useState<string>(approvalStatus.APPROVED);
	const [eventApprovalStatus, setEventApprovalStatus] = useState<string>(queryApprovalStatus);

	useEffect(() => {
		dispatch(setNetwork(network));
		if (window) {
			const width = window.innerWidth > 0 ? window.innerWidth : screen.width;
			setWidth(width);
			setCalLeftPanelWidth(document?.getElementById('calendar-left-panel')?.clientWidth);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!api || !apiReady || ['polymesh'].includes(network)) {
			setCategoriesLoading(false);
			return;
		}

		// TODO: use Promise.allSettled instead
		(async () => {
			setCategoriesLoading(true);
			const eventsArr: any[] = [];

			if (selectedCategories.includes('Staking')) {
				const stakingInfoEvents = await fetchStakingInfo(api, network);
				stakingInfoEvents.forEach((eventObj, i) => {
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
				});
			}

			if (selectedCategories.includes('Council')) {
				const councilMotionEvents = await fetchCouncilMotions(api, network);

				councilMotionEvents.forEach((eventObj, i) => {
					eventsArr.push({
						content: `Council Motion ${eventObj?.data?.hash}`,
						end_time: dayjs(eventObj.endDate).toDate(),
						id: `councilMotionEvent_${i}`,
						location: '',
						start_time: dayjs(eventObj.endDate).toDate(),
						status: 'approved',
						title: 'Council Motion',
						url: ''
					});
				});

				const councilElectionEvents = await fetchCouncilElection(api, network);
				councilElectionEvents.forEach((eventObj, i) => {
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
				});
			}

			if (selectedCategories.includes('Schedule')) {
				const scheduledEvents = await fetchScheduled(api, network);

				scheduledEvents.forEach((eventObj, i) => {
					eventsArr.push({
						content: eventObj?.data?.id ? `Execute named scheduled task ${eventObj?.data?.id}` : 'Execute anonymous scheduled task',
						end_time: dayjs(eventObj.endDate).toDate(),
						id: `scheduledEvent_${i}`,
						location: '',
						start_time: dayjs(eventObj.endDate).toDate(),
						status: 'approved',
						title: 'Scheduled Task',
						url: ''
					});
				});
			}

			if (selectedCategories.includes('Treasury')) {
				const treasurySpendEvents = await fetchTreasurySpend(api, network);

				treasurySpendEvents.forEach((eventObj, i) => {
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
				});
			}

			if (selectedCategories.includes('Democracy')) {
				const democracyDispatchEvents = await fetchDemocracyDispatches(api, network);

				democracyDispatchEvents.forEach((eventObj, i) => {
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
				});

				const democracyLaunchEvents = await fetchDemocracyLaunch(api, network);

				democracyLaunchEvents.forEach((eventObj, i) => {
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
				});
			}

			if (selectedCategories.includes('Society')) {
				const societyRotateEvents = await fetchSocietyRotate(api, network);

				societyRotateEvents.forEach((eventObj, i) => {
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
				});

				const societyChallengeEvents = await fetchSocietyChallenge(api, network);
				societyChallengeEvents.forEach((eventObj, i) => {
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
				});
			}

			if (selectedCategories.includes('Parachains')) {
				const auctionInfoEvents = await fetchAuctionInfo(api, network);

				auctionInfoEvents.forEach((eventObj, i) => {
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
				});

				const parachainLeaseEvents = await fetchParachainLease(api, network);

				parachainLeaseEvents.forEach((eventObj, i) => {
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
				});
			}

			setCalendarEvents(eventsArr);
			setCategoriesLoading(false);
		})();
	}, [api, apiReady, network, selectedCategories]);

	// calculate #route-wrapper height with margin for sidebar.

	// for negative margin for toolbar

	const utcDate = new Date(new Date().toISOString().slice(0, -1));

	const { id, allowed_roles } = useUserDetailsSelector();
	let accessible = false;
	if (allowed_roles && allowed_roles?.length > 0 && allowed_roles.includes(ALLOWED_ROLE)) {
		accessible = true;
	}

	const approvalStatusDropdown: MenuProps['items'] = [
		{
			key: approvalStatus.APPROVED,
			label: 'Approved'
		},
		{
			key: approvalStatus.PENDING,
			label: 'Pending'
		},
		{
			key: approvalStatus.REJECTED,
			label: 'Rejected'
		}
	];

	const getNetworkEvents = useCallback(async () => {
		const { data, error: fetchError } = await nextApiClientFetch<NetworkEvent[]>('api/v1/events', {
			approval_status: queryApprovalStatus
		});

		if (fetchError || !data) {
			console.log('error fetching events : ', fetchError);
			setError(fetchError || 'Error in fetching events');
		}

		if (data) {
			const eventsArr: any[] = calendarEvents;

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
				}
			});
			setCalendarEvents(eventsArr);
			if (emitCalendarEvents) {
				emitCalendarEvents(eventsArr);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [emitCalendarEvents, queryApprovalStatus]);

	useEffect(() => {
		getNetworkEvents();
	}, [getNetworkEvents]);

	const togglePendingEvents = () => {
		if (queryApprovalStatus != approvalStatus.APPROVED) {
			setQueryApprovalStatus(approvalStatus.APPROVED);
		} else {
			setQueryApprovalStatus(approvalStatus.PENDING);
		}
	};

	const onApprovalStatusChange: MenuProps['onClick'] = ({ key }) => {
		const status = key as string;
		setEventApprovalStatus(status);
	};

	const handleUpdateApproval = async () => {
		if (!sidebarEvent || !eventApprovalStatus || Object.keys(sidebarEvent).length === 0) {
			return;
		}

		const { data, error: fetchError } = await nextApiClientFetch<NetworkEvent[]>('api/v1/auth/actions/updateApprovalStatus', {
			approval_status: queryApprovalStatus,
			eventId: sidebarEvent.id
		});

		if (fetchError || !data) {
			setError(fetchError || 'Error in fetching events');
			queueNotification({
				header: 'Error!',
				message: 'Error updating event',
				status: NotificationStatus.ERROR
			});
			console.error('Error updating event :', fetchError);
		}

		if (data) {
			setError('');
			queueNotification({
				header: 'Success!',
				message: 'Event updated successfully',
				status: NotificationStatus.SUCCESS
			});
			setCalendarEvents((prev) => {
				return (
					prev?.map((event) => {
						if (event.id === sidebarEvent.id) {
							event.status = queryApprovalStatus.toLowerCase();
						}
						return {
							...event
						};
					}) || []
				);
			});
		}
	};

	function showEventSidebar(event: any) {
		if (small) {
			return;
		}

		setEventApprovalStatus(queryApprovalStatus);
		setSidebarEvent(event);
	}

	const EventWrapperComponent = ({ event, children }: any) => {
		const newChildren = { ...children };
		const newChildrenProps = { ...newChildren.props };
		const statusClassName = dayjs(event.end_time).isBefore(new Date()) ? 'overdue-border' : `${event.status?.toLowerCase()}-border`;
		newChildrenProps.className = `${newChildrenProps.className} ${statusClassName}`;
		newChildren.props = { ...newChildrenProps };
		return <div className='custom-event-wrapper'>{newChildren}</div>;
	};

	function Event({ event }: { event: any }) {
		return (
			<span
				className='event-container-span'
				onClick={() => showEventSidebar(event)}
			>
				{/* { (!(small || width < 768)) &&  <span className='event-time'> {dayjs(event.end_time).format('LT').toLowerCase()}</span> } */}
				{event.title}
			</span>
		);
	}

	function showDay(date: Date) {
		setSelectedDate(date);
		setSelectedView('day');
	}

	function setMiniCalendarToToday() {
		setMiniCalSelectedDate(new Date());
	}

	const MonthDateComponentHeader = ({ date }: DateHeaderProps) => {
		return <button onClick={() => showDay(date)}>{date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}</button>;
	};

	const listData = [
		{ color: '#EA8612', label: 'Working' },
		{ color: '#5BC044', label: 'Completed' },
		{ color: '#FF0000', label: 'Overdue' }
	];

	return (
		<>
			<div className={`${className} rounded-xl bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay`}>
				{error && <ErrorAlert errorMsg={error} />}

				{accessible && (
					<div className='event-bot-div'>
						<Button
							className='pending-events-btn'
							onClick={togglePendingEvents}
							disabled={Boolean(sidebarEvent)}
						>
							{queryApprovalStatus == approvalStatus.APPROVED ? 'Show' : 'Hide'} Pending Events
						</Button>
					</div>
				)}

				{!small && (
					<div className='cal-heading-div'>
						<h1> Calendar </h1>
						<div className='mobile-network-select'>
							<NetworkSelect
								selectedNetwork={selectedNetwork}
								setSelectedNetwork={setSelectedNetwork}
							/>
						</div>
					</div>
				)}

				<div>
					<Row className='pt-0'>
						{!small && width > 992 && (
							<Col
								span={8}
								id='calendar-left-panel'
								className='calendar-left-panel'
							>
								<div className='p-5 pl-2 pt-0'>
									<p className='text-md mb-2 text-center font-medium text-sidebarBlue'>Current Time: {dayjs(utcDate).format('D-MM-YY | h:mm a UTC')} </p>

									<Spin
										spinning={categoriesLoading}
										indicator={<></>}
									>
										<Calendar
											className='events-calendar-mini'
											date={miniCalSelectedDate}
											onNavigate={setMiniCalSelectedDate}
											localizer={localizer}
											events={calendarEvents}
											startAccessor='start_time'
											endAccessor='end_time'
											components={{
												event: () => null,
												eventWrapper: EventWrapperComponent,
												month: {
													dateHeader: MonthDateComponentHeader
												},
												toolbar: (props: any) => (
													<CustomToolbarMini
														{...props}
														leftPanelWidth={calLeftPanelWidth}
													/>
												)
											}}
										/>
									</Spin>

									<div className='text-md mb-3 font-medium text-sidebarBlue'>Proposal Status: </div>
									<Space direction='vertical'>
										{listData.map((item) => (
											<Badge
												key={item.color}
												text={item.label}
												color={item.color}
											/>
										))}
									</Space>

									<div className='text-md mb-3 mt-8 font-medium text-sidebarBlue'>Categories: </div>
									<Checkbox.Group
										disabled={categoriesLoading}
										className='flex-wrap'
										defaultValue={initCategories}
										onChange={(checkedValues) => setSelectedCategories(checkedValues)}
									>
										<Row>
											{categoryOptions.map((item) => (
												<Col
													key={item.value}
													span={8}
												>
													<Checkbox value={item.value}>{item.label}</Checkbox>
												</Col>
											))}
										</Row>
									</Checkbox.Group>
								</div>
							</Col>
						)}

						{
							<Col
								span={!small && width > 992 ? 16 : 24}
								className=' h-full'
							>
								<Spin spinning={categoriesLoading}>
									{!categoriesLoading ? ( // this is needed to render (+3 more) without changing views
										<Calendar
											className={`events-calendar ${small || width < 768 ? 'small' : ''}`}
											localizer={localizer}
											date={selectedDate}
											view={selectedView}
											events={calendarEvents}
											startAccessor='start_time'
											endAccessor='end_time'
											popup={false}
											components={{
												event: Event,
												eventWrapper: EventWrapperComponent,
												timeGutterHeader: () => (
													<TimeGutterHeader
														localizer={localizer}
														date={selectedDate}
														selectedView={selectedView}
													/>
												),
												toolbar: (props: any) => (
													<CustomToolbar
														{...props}
														small={small}
														width={width}
														selectedNetwork={selectedNetwork}
														setSelectedNetwork={setSelectedNetwork}
														setSidebarCreateEvent={setSidebarCreateEvent}
														isLoggedIn={Boolean(id)}
														leftPanelWidth={calLeftPanelWidth}
														setMiniCalendarToToday={setMiniCalendarToToday}
													/>
												),
												week: {
													header: (props: any) => (
														<CustomWeekHeader
															{...props}
															small={small || width < 768}
														/>
													)
												}
											}}
											formats={{
												timeGutterFormat: 'h A'
											}}
											onNavigate={setSelectedDate}
											onView={setSelectedView}
											views={{
												agenda: true,
												day: true,
												month: true,
												week: true,
												work_week: false
											}}
										/>
									) : (
										<div className='flex max-h-screen flex-col gap-y-6 overflow-y-hidden px-4'>
											<Skeleton />
											<Skeleton />
											<Skeleton />
											<Skeleton />
											<Skeleton />
										</div>
									)}
								</Spin>
							</Col>
						}
					</Row>
				</div>
			</div>

			{/* Event View Sidebar */}
			{sidebarEvent && (
				<SidebarRight
					open={sidebarEvent}
					closeSidebar={() => setSidebarEvent(false)}
				>
					<div className='events-sidebar'>
						{accessible && (
							<div className='approval-status-div'>
								<span>Status: </span>
								<Dropdown
									// value={eventApprovalStatus}
									menu={{ items: approvalStatusDropdown, onClick: onApprovalStatusChange }}
									// disabled={loadingUpdate}
								>
									{eventApprovalStatus}
								</Dropdown>
								<Button
									onClick={handleUpdateApproval}
									// disabled={loadingUpdate}
								>
									Save
								</Button>
							</div>
						)}
						<div className='event-sidebar-header d-flex'>
							<div className='d-flex'>
								<div className={`status-icon ${dayjs(sidebarEvent.end_time).isBefore(new Date()) ? 'overdue-color' : `${sidebarEvent.status?.toLowerCase()}-color`}`}></div>
								<h1 className='dashboard-heading mb-2'>{sidebarEvent.title}</h1>
							</div>
						</div>

						<div className='sidebar-event-datetime'>
							<span>{dayjs(sidebarEvent.end_time).format('MMMM D')}</span> <span>{dayjs(sidebarEvent.end_time).format('h:mm a')}</span>
						</div>

						{sidebarEvent.content && (
							<div className='sidebar-event-content'>
								{`${sidebarEvent.content.substring(0, 769)} ${sidebarEvent.content.length > 769 ? '...' : ''}`}
								{sidebarEvent.content.length > 769 && (
									<>
										<br />
										<a
											href={sidebarEvent.url}
											target='_blank'
											rel='noreferrer'
										>
											Show More
										</a>
									</>
								)}
							</div>
						)}

						<Divider />

						<div className='sidebar-event-links'>
							<h3 className='dashboard-heading mb-2 flex items-center gap-x-2'>
								{' '}
								<Image
									alt='link'
									src={chainLink}
									height={16}
									width={16}
								/>{' '}
								Relevant Links
							</h3>
							<div className='links-container'>
								<a
									href={sidebarEvent.url}
									target='_blank'
									rel='noreferrer'
								>
									{sidebarEvent.url}
								</a>
							</div>
						</div>
					</div>
				</SidebarRight>
			)}

			{/* Create Event Sidebar */}
			{sidebarCreateEvent && (
				<CreateEventSidebar
					open={sidebarCreateEvent}
					setSidebarCreateEvent={setSidebarCreateEvent}
					selectedNetwork={selectedNetwork}
					className='create-event-sidebar'
					id={id}
				/>
			)}
		</>
	);
};

export default styled(CalendarView)`
	.event-bot-div {
		width: 100%;
		margin-bottom: 16px;

		.pending-events-btn {
			margin-left: auto;
			margin-right: auto;
			background-color: #e5007a;
			color: #fff;
			width: 50%;
			font-size: 16px;
		}
	}

	.approval-status-div {
		display: flex;
		align-items: center;
		margin-bottom: 34px;

		span,
		.dropdown {
			margin-right: 8px;
		}

		.button {
			background-color: #e5007a;
			color: #fff;
			font-size: 13px;
		}
	}

	.events-sidebar,
	.create-event-sidebar {
		min-width: 250px;
		width: 510px;
		max-width: 35vw;
		right: 0;
		top: 6.5rem;
		background: #fff;
		z-index: 100;
		padding: 40px 24px;
		box-shadow: -5px 0 15px -12px #888;

		@media only screen and (max-width: 768px) {
			max-width: 90vw;
			top: 0;
			padding: 40px 14px;
			padding-top: 70px;
			overflow-y: auto;

			h1 {
				margin-top: 0;
			}

			.sidebar-event-content {
				padding-right: 10px;
			}
		}

		.d-flex {
			display: flex !important;
		}

		.event-sidebar-header {
			justify-content: space-between;

			.status-icon {
				margin-right: 9px;
				height: 12px;
				width: 12px;
				border-radius: 50%;
				background-color: #e5007a;

				&.overdue-color {
					background-color: #ff0000;
				}

				&.completed-color {
					background-color: #5bc044;
				}

				&.in_progress-color {
					background-color: #ea8612;
				}
			}
		}

		.sidebar-event-datetime {
			margin-top: 14px;
			margin-left: 25px;

			span {
				&:first-child {
					border-right: 2px #eee solid;
					padding-right: 12px;
					margin-right: 8px;
				}
			}
		}

		.sidebar-event-content {
			margin-top: 30px;
			margin-left: 25px;
			padding-right: 25px;
			font-size: 16px;
			line-height: 24px;

			a {
				color: #e5007a;
			}
		}

		.divider {
			margin-top: 35px;
			margin-bottom: 35px;
		}

		.sidebar-event-links {
			img {
				height: 24px;
				width: 24px;
				margin-right: 12px;
			}

			h3 {
				font-size: 20px;
				display: flex;
				align-items: center;
			}

			.links-container {
				padding-left: 37px;
				a {
					margin-top: 25px;
					color: #848484;
					word-break: break-all;
				}
			}
		}
	}

	.cal-heading-div {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-right: 10px;

		.mobile-network-select {
			display: none;
			margin-top: 2rem;
			color: #e5007a;
			font-size: 14px;

			label {
				display: none !important;
			}

			.filter-by-chain-div {
				background-color: #fff;
				border-radius: 5px;
				border: 1px solid #eee;
				padding: 4px;
				display: flex;
				align-items: center;
			}

			@media only screen and (max-width: 768px) {
				display: flex;
				align-items: center;
			}
		}

		@media only screen and (max-width: 768px) {
			h1 {
				margin-bottom: 0 !important;
			}
		}

		@media only screen and (min-width: 769px) {
			h1 {
				display: none;
			}
		}
	}

	.calendar-left-panel {
		padding-top: 95px;
		background-color: #fff;
		border-top-left-radius: 10px;
		border-right: 1px solid #e8e8e8;

		.utc-time {
			color: #646464;
			font-size: 14px;
			font-weight: 500;
			margin-left: 3px;
		}

		.events-calendar-mini {
			height: 320px;
			border: 2px solid #e8e8e8;
			border-radius: 10px;
			padding: 15px 8px;
			margin-bottom: 24px;

			.rbc-show-more {
				display: none !important;
			}

			.custom-calendar-toolbar-mini {
				display: flex;
				justify-content: center;
				align-items: center;
				margin-bottom: 8px;

				.button {
					background: #fff !important;

					i {
						font-weight: 900;
					}
				}

				span {
					width: 104px;
					min-width: 104px;
					max-width: 104px;
					text-align: center;
					font-weight: 500 !important;
					margin-left: 4px;
					margin-right: 4px;
				}
			}

			.rbc-month-header {
				margin-bottom: 8px;
			}

			.rbc-header {
				span {
					font-size: 10px;
					font-weight: 400 !important;
					text-transform: uppercase;
					color: #bbb;
				}
			}

			.rbc-month-view,
			.rbc-header,
			.rbc-month-row,
			.rbc-day-bg {
				background: #fff;
				border: none;
			}

			.rbc-date-cell {
				text-align: center !important;

				button {
					font-size: 12px;
					padding: 5px;
					font-weight: 500 !important;
					background: #fff;
					border: 1px solid #fff;
					border-radius: 50%;
					cursor: pointer;

					&:hover {
						background: #e8e8e8;
						border: 1px solid #e8e8e8;
					}
				}

				&.rbc-off-range {
					button {
						color: #e8e8e8;
					}
				}

				&.rbc-now {
					button {
						background-color: #e6007a;
						color: #fff;
						border: 1px solid #e6007a;
						border-radius: 50%;
						height: 30px;
						width: 30px;
					}
				}
			}

			.custom-event-wrapper {
				display: flex;
				justify-content: center;
				align-items: center;
				margin-left: -3px;
				margin-top: -2px;

				.rbc-event {
					background: #e6007a;
					cursor: default;
					padding: 0 !important;
					width: 5px;
					height: 5px;
					border-radius: 50%;
					border: 2px solid #e6007a;

					&.overdue-border {
						background: #ff0000 !important;
						border: 2px solid #ff0000;
					}

					&.completed-border {
						background: #5bc044 !important;
						border: 2px solid #5bc044;
					}

					&.in_progress-border {
						background: #ea8612 !important;
						border: 2px solid #ea8612;
					}

					&:focus {
						outline: none;
					}
				}
			}
		}

		.font-medium text-md text-sidebarBlue {
			margin-left: 8px;
			color: #646464;
			font-size: 14px;
			font-weight: 500;
		}

		.legend-list {
			margin-left: 10px;
		}
	}

	.events-calendar {
		height: 88vh;
		width: 99%;
		max-width: 1920px;

		@media only screen and (max-width: 768px) {
			width: 100%;
			max-width: 100%;
			padding: 1em 0 1em 0;
			max-height: 650px;
		}

		.rbc-toolbar {
			@media only screen and (max-width: 576px) {
				flex-direction: column;

				span {
					margin-bottom: 1em;
				}
			}
		}

		.rbc-show-more {
			color: #e5007a;
			margin-top: 6px;
		}

		.custom-calendar-toolbar,
		.rbc-month-view,
		.rbc-time-view,
		.rbc-agenda-view {
			background: #fff;
			border: none;
		}

		.rbc-month-view,
		.rbc-time-view,
		.rbc-agenda-view {
			padding: 10px 10px;
			td {
				border: 1px solid #ddd;
			}
		}

		.custom-calendar-toolbar {
			height: 77px;
			padding: 6px 26px;
			border-top-right-radius: 10px;
			border-bottom: 1px solid #e8e8e8;
			display: flex;
			align-items: center;

			.select-div {
				&:nth-of-type(2) {
					padding-left: 19px;
					width: 115px;
					min-width: 115px;
					max-width: 115px;
				}

				display: flex;
				flex-direction: column;
				justify-content: center;
				height: 65px;
				border-right: 1px solid #e8e8e8;
				padding-right: 19px;
				label {
					font-size: 14px;
					margin-bottom: 5px;
				}

				.dropdown {
					color: #e5007a;
				}

				&.filter-by-chain-div {
					.dropdown {
						display: flex;
						align-items: center;
					}
				}
			}

			.date-text {
				margin-left: 24px;
				margin-right: 16px;
				font-size: 20px;
				color: #787878;
				width: 140px;
				min-width: 140px;
				max-width: 140px;
			}

			.mobile-cal-nav {
				display: flex;
				margin-left: 2px;

				.button {
					padding: 0 !important;
				}
			}

			.button {
				background: none;
				padding: 8px;
				font-size: 14px;

				&:hover {
					background: #eee;
				}
			}

			span {
				word-wrap: none;
				white-space: nowrap;
			}

			.search-btn {
				margin-left: auto;
				margin-right: 22px;
				font-size: 20px;
			}

			.right-actions {
				display: flex;
				align-items: center;
				margin-left: auto;

				.today-btn {
					/* margin-right: 22px; */
					border-radius: 5px;
					font-size: 16px;
					padding: 10px 20px !important;

					@media only screen and (max-width: 576px) {
						margin-right: 8px;
					}
				}

				.btn-disabled {
					border: rgba(229, 0, 122, 0.5) !important;
					color: rgba(229, 0, 122, 0.5) !important;
					cursor: default;
				}
			}

			.create-event-btn {
				border-radius: 5px;
				border: solid 1px #e5007a;
				color: #e5007a !important;
				font-size: 16px;
				padding: 10px 20px !important;
				margin-right: 0 !important;
				font-weight: 500;

				@media only screen and (max-width: 768px) {
					margin-right: 8px;
				}
			}

			&.small {
				height: auto;
				padding: 10px 2%;
				border-bottom: none;
				justify-content: space-between;
				border-top-left-radius: 0;
				border-top-right-radius: 0;

				.actions-right {
					display: flex;
					align-items: center;
				}

				.today-btn-img {
					cursor: pointer;
					margin-right: 8px;
				}

				.select-month-dropdown,
				.select-view-dropdown {
					padding-left: 5px !important;
					border: 1px solid #eee;
					border-radius: 5px;
					padding: 2px;
					font-size: 12px;
					white-space: nowrap;

					.icon {
						padding-right: 2px !important;
					}
				}

				.select-month-dropdown {
					width: 50px;
					min-width: 50px;
					max-width: 50px;
				}

				.year-text {
					margin-right: 8px;
				}

				.create-event-btn {
					padding: 6px 6px !important;
					font-size: 12px;
					margin-left: 8px;
				}
			}
		}

		&.small {
			.custom-calendar-toolbar {
				margin-bottom: 2px !important;
			}

			.rbc-month-view,
			.rbc-time-view,
			.rbc-agenda-view {
				padding: 0 !important;
			}

			.rbc-time-header-cell {
				.rbc-header {
					&.rbc-today {
						.week-header-text {
							.day-num {
								background-color: #e6007a;
								color: #fff;
								width: 24px;
								height: 24px;
								display: flex;
								justify-content: center;
								align-items: center;
								border-radius: 50%;
							}
						}
					}

					.week-header-text {
						.day-num {
							font-size: 14px;
						}
					}
				}
			}

			.rbc-date-cell {
				button {
					font-size: 12px;
					font-weight: 500 !important;
				}
			}
		}

		.rbc-month-header {
			height: 44px;
			display: flex;
			align-items: center;
			border-bottom: 2px solid #eee;

			.rbc-header {
				font-size: 16px;
				font-weight: 400 !important;
				border: none !important;
				text-align: left;
				margin-left: 2px;
			}
		}

		.rbc-time-header-cell {
			min-height: inherit;

			.rbc-header {
				border-bottom: none;
				border-left: none;
				padding-top: 6px;
				padding-bottom: 13px;

				.week-header-text {
					height: min-content;
					color: #787878;
					font-family: 'Roboto' !important;

					.day-of-week {
						text-transform: uppercase;
						font-size: 12px;
						margin-bottom: 8px;
						font-weight: 500;
					}

					.day-num {
						font-size: 22px;
					}
				}
			}
		}

		.rbc-date-cell {
			button {
				font-size: 15px;
				padding: 5px;
				font-weight: 600 !important;
			}

			&.rbc-now {
				button {
					background-color: #e6007a;
					color: #fff;
					border: 1px solid #e6007a;
					border-radius: 50%;
					height: 32px;
					width: 32px;
				}
			}
		}

		.rbc-time-header-content {
			border-left: none;
		}

		.rbc-off-range-bg {
			background: #fff !important;
		}

		.rbc-off-range {
			color: #cfcfcf;
		}

		.rbc-date-cell {
			text-align: left;
			padding: 5px 8px;
		}

		.rbc-time-header-gutter {
			display: flex;
			align-items: end;
			justify-content: center;
			text-align: center;
			font-weight: 400;
			font-size: 12px;
			color: #777777;
			padding-bottom: 4px;

			.day-num {
				display: flex;
				align-items: center;
				justify-content: center;
				background: #e6007a;
				color: #fff;
				height: 26px;
				width: 26px;
				border-radius: 50%;
				font-size: 14px;
			}
		}

		.rbc-timeslot-group {
			padding-left: 10px;
			padding-right: 10px;
			font-size: 12px;
			color: #777777;
		}

		.rbc-month-row {
			.rbc-day-bg.rbc-today {
				border: 1px solid #e6007a;
				background-color: #fff;
			}
		}

		.rbc-today {
			background-color: rgba(229, 0, 122, 0.02);

			.week-header-text {
				color: #e5007a !important;
			}
		}

		.rbc-events-container {
			.custom-event-wrapper {
				.rbc-event {
					border: 1px solid #e6007a;
					border-left: 4px solid #e6007a;
					display: flex;
					justify-content: center;
					padding-top: 4px;

					.rbc-event-label {
						display: none;
					}

					&.overdue-border {
						border: 1px solid #ff0000 !important;
						border-left: 4px solid #ff0000 !important;
					}

					&.completed-border {
						border: 1px solid #5bc044 !important;
						border-left: 4px solid #5bc044 !important;
					}

					&.in_progress-border {
						border: 1px solid #ea8612 !important;
						border-left: 4px solid #ea8612 !important;
					}
				}
			}
		}

		.custom-event-wrapper {
			.rbc-event {
				background-color: #fff;
				border-radius: 0;
				color: #000;
				font-weight: 500;
				font-size: 12px;
				border-left: 4px solid #e6007a;

				.event-container-span {
					cursor: pointer;
				}

				&.overdue-border {
					border-left: 4px solid #ff0000 !important;
				}

				&.completed-border {
					border-left: 4px solid #5bc044 !important;
				}

				&.in_progress-border {
					border-left: 4px solid #ea8612 !important;
				}

				.event-time {
					margin-right: 5px;
					font-weight: 400;
					color: #747474;
				}

				&:focus {
					outline: none;
				}
			}
		}

		.rbc-current-time-indicator {
			background-color: #e6007a;
		}
	}

	.pt-0 {
		padding-top: 0 !important;
	}
`;
