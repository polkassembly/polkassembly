// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button, Spin } from 'antd';
import { dayjs } from 'dayjs-init';
import { GetServerSideProps } from 'next';
import React, { FC, useEffect, useState } from 'react';
import { Calendar, DateHeaderProps, dayjsLocalizer } from 'react-big-calendar';
import { approvalStatus } from 'src/global/statuses';
import { Role } from 'src/types';
import styled from 'styled-components';

import { getNetworkFromReqHeaders } from '~src/api-utils';

import CustomToolbarMini from '../../src/components/Calendar/CustomToolbarMini';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import Skeleton from '~src/basic-components/Skeleton';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';

const CalendarEvents = dynamic(() => import('~src/components/Calendar/CalendarEvents'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface ICalendarViewProps {
	className?: string;
	small?: boolean;
	network: string;
	emitCalendarEvents?: React.Dispatch<React.SetStateAction<any[]>> | undefined;
}

const StyledCalendar: any = styled(Calendar)`
	.events-calendar-mini {
		border: 2px solid ${(props: any) => (props.theme === 'dark' ? '#4B4B4B' : '#e8e8e8')} !important;
		.rbc-month-view {
			background: ${(props: any) => (props.theme === 'dark' ? '#0D0D0D' : '#fff')} !important;
			border: none !important;
		}
		/* .rbc-month-row {
			background: ${(props: any) => (props.theme === 'dark' ? '#0D0D0D' : '#fff')} !important;
		} */
		.rbc-header,
		.rbc-day-bg {
			background: ${(props: any) => (props.theme === 'dark' ? '#0D0D0D' : '#fff')} !important;
		}
		.rbc-day-bg {
			border-left: none !important;
		}
		.rbc-off-range > button {
			color: ${(props: any) => (props.theme === 'dark' ? '#9090990' : '#E8E8E8')} !important;
		}
		.rbc-month-row {
			background: ${(props: any) => (props.theme === 'dark' ? '#0D0D0D' : '#fff')} !important;
			.rbc-day-bg.rbc-today {
				border: 1px solid #e6007a;
				background-color: ${(props: any) => (props.theme === 'dark' ? '#0D0D0D' : '#fff')} !important;
			}
			.rbc-day-bg {
				border-left: 1px solid ${(props: any) => (props.theme === 'dark' ? '#4B4B4B' : '#ddd')} !important;
			}
			border-top: 1px solid ${(props: any) => (props.theme === 'dark' ? '#4B4B4B' : '#ddd')} !important;
		}
	}
	.rbc-month-view {
		background: ${(props: any) => (props.theme === 'dark' ? '#0D0D0D' : '#fff')};
		border: none !important;
	}
	.custom-calendar-toolbar {
		background: ${(props: any) => (props.theme === 'dark' ? '#0D0D0D' : '#fff')};
	}
	.rbc-off-range-bg {
		background: ${(props: any) => (props.theme === 'dark' ? '#0D0D0D' : '#fff')} !important;
	}
	.rbc-month-row {
		.rbc-day-bg.rbc-today {
			border: 1px solid #e6007a;
			background-color: ${(props: any) => (props.theme === 'dark' ? '#0D0D0D' : '#fff')} !important;
		}
		.rbc-day-bg {
			border-left: 1px solid ${(props: any) => (props.theme === 'dark' ? '#4B4B4B' : '#ddd')} !important;
		}
		border-top: 1px solid ${(props: any) => (props.theme === 'dark' ? '#4B4B4B' : '#ddd')} !important;
	}

	.rbc-month-header {
		height: 44px;
		display: flex;
		align-items: center;
		border-bottom: 1px solid ${(props: any) => (props.theme === 'dark' ? '#4B4B4B' : '#eee')} !important;

		.rbc-header {
			font-size: 16px;
			font-weight: 800 !important;
			border: none !important;
			text-align: center;
			margin-left: 2px;

			span {
				font-size: 14px;
				font-weight: 600 !important;
				text-transform: uppercase;
				color: ${(props: any) => (props.theme === 'dark' ? '#9e9e9e' : 'var(--bodyBlue)')} !important;
			}
		}
	}

	.rbc-date-cell {
		text-align: center !important;

		button {
			font-size: 12px;
			padding: 5px;
			font-weight: 500 !important;
			background: ${(props: any) => (props.theme === 'dark' ? '#0D0D0D' : '#fff')};
			border: ${(props: any) => (props.theme === 'dark' ? 'none' : '1px solid #fff')} !important;
			border-radius: 50%;
			cursor: pointer;

			&:hover {
				background: #e8e8e8;
				border: 1px solid #e8e8e8;
			}
		}

		&.rbc-current {
			button {
				background-color: #e6007a;
				color: #fff;
				border: 1px solid #e6007a;
				border-radius: 50%;
				height: 26px;
				width: 26px;
				margin-top: 2px;
			}
		}

		&.rbc-now {
			button {
				background-color: #e6007a;
				color: #fff;
				border: 1px solid #e6007a;
				border-radius: 50%;
				height: 26px;
				width: 26px;
				margin-top: 2px;
			}
		}
	}
`;

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

const CalendarView: FC<ICalendarViewProps> = ({ className, network }) => {
	const dispatch = useDispatch();
	const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [loading, setLoading] = useState<boolean>(false);
	const [queryApprovalStatus, setQueryApprovalStatus] = useState<string>(approvalStatus.APPROVED);

	const { resolvedTheme: theme } = useTheme();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { allowed_roles } = useUserDetailsSelector();
	let accessible = false;
	if (allowed_roles && allowed_roles?.length > 0 && allowed_roles.includes(ALLOWED_ROLE)) {
		accessible = true;
	}

	const togglePendingEvents = () => {
		if (queryApprovalStatus != approvalStatus.APPROVED) {
			setQueryApprovalStatus(approvalStatus.APPROVED);
		} else {
			setQueryApprovalStatus(approvalStatus.PENDING);
		}
	};

	const EventWrapperComponent = ({ event, children }: any) => {
		const newChildren = { ...children };
		const newChildrenProps = { ...newChildren.props };
		const statusClassName = dayjs(event.end_time).isBefore(new Date()) ? 'overdue-border' : `${event.status?.toLowerCase()}-border`;
		newChildrenProps.className = `${newChildrenProps.className} ${statusClassName}`;
		newChildren.props = { ...newChildrenProps };
		return <div className='custom-event-wrapper'>{newChildren}</div>;
	};

	function showDay(date: Date) {
		setSelectedDate(date);
	}

	function setCalendarToToday() {
		showDay(new Date());
	}

	const MonthDateComponentHeader = ({ date }: DateHeaderProps) => {
		return <button onClick={() => showDay(date)}>{date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}</button>;
	};

	return (
		<>
			<div className={`${className} mb-5 rounded-xl bg-white p-3 drop-shadow-md dark:border-separatorDark dark:bg-section-dark-overlay`}>
				<Spin
					spinning={loading}
					indicator={<></>}
				>
					<StyledCalendar
						theme={theme as any}
						className='events-calendar-mini dark:bg-section-dark-overlay'
						date={selectedDate}
						onNavigate={setSelectedDate}
						localizer={localizer}
						events={calendarEvents}
						startAccessor='createdAt'
						endAccessor='createdAt'
						defaultView='month'
						views={['month']}
						components={{
							event: () => null,
							eventWrapper: EventWrapperComponent,
							month: {
								dateHeader: MonthDateComponentHeader
							},
							toolbar: (props: any) => (
								<CustomToolbarMini
									{...props}
									setCalendarToToday={setCalendarToToday}
									setSelectedDate={setSelectedDate}
								/>
							)
						}}
					/>
				</Spin>
			</div>

			<div className={`${className} rounded-xl bg-white p-3 drop-shadow-md dark:border-separatorDark dark:bg-section-dark-overlay`}>
				{accessible && (
					<div className='mt-2 flex w-full items-center justify-center gap-2 text-base font-medium text-sidebarBlue dark:text-blue-dark-medium'>
						Show Pending Events:
						<Button
							className={`flex h-5 w-10 items-center rounded-full border border-pink_primary bg-pink-200 outline-none ${
								queryApprovalStatus == approvalStatus.APPROVED ? 'justify-start' : 'justify-end'
							}`}
							onClick={togglePendingEvents}
							// disabled={Boolean(sidebarEvent)}
						>
							<span className='hidden'>toggle pending events button</span>
							<span className='h-5 w-5 rounded-full border-none bg-pink_primary' />
						</Button>
					</div>
				)}
				{/* Events */}
				<CalendarEvents
					selectedDate={selectedDate}
					setCalendarEvents={setCalendarEvents}
					setCalendarLoading={setLoading}
				/>
			</div>
		</>
	);
};

export default styled(CalendarView)`
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

	.events-calendar-mini {
		height: 320px;
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

		.rbc-time-view,
		.rbc-agenda-view {
			background: #fff;
			border: none;
		}

		.rbc-month-view,
		.rbc-time-view,
		.rbc-agenda-view {
			padding: 10px 10px;
			min-height: 100px;
			td {
				border: 1px solid #ddd;
			}
		}

		.custom-calendar-toolbar {
			height: 77px;
			margin-bottom: 16px;
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
						font-size: 14px;
						padding: 8px 16px !important;
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
					font-size: 14px;
					padding: 8px 16px !important;
				}
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
