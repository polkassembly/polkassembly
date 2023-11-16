// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import 'react-big-calendar/lib/css/react-big-calendar.css';

import type { DatePickerProps } from 'antd';
import { RadioChangeEvent } from 'antd';
import { Button, DatePicker, Form, Input, Radio } from 'antd';
import { dayjs } from 'dayjs-init';
import React, { useState } from 'react';
import SidebarRight from 'src/components/SidebarRight';
import { NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';

import { MessageType } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface Props {
	className?: string;
	open: boolean;
	setSidebarCreateEvent: React.Dispatch<React.SetStateAction<boolean>>;
	selectedNetwork: string;
	id: number | null | undefined;
}

const CreateEventSidebar = ({ className, selectedNetwork, setSidebarCreateEvent, id, open }: Props) => {
	const [eventTitle, setEventTitle] = useState<string>('');
	const [eventDescription, setEventDescription] = useState<string>('');
	const [eventType, setEventType] = useState<string>('online');
	const [eventStartDateTime, setEventStartDate] = useState<Date | null>(null);
	const [eventEndDateTime, setEventEndDate] = useState<Date | null>(null);
	const [eventJoiningLink, setEventJoiningLink] = useState<string>('');
	const [eventLocation, setEventLocation] = useState<string>('');
	const [errorsFound, setErrorsFound] = useState<string[]>([]);

	const [loading, setLoading] = useState(false);

	const onEventTypeRadioToggle = (event: RadioChangeEvent) => {
		setEventType(event.target.value?.toString() || 'online');
	};

	const closeCreateEventSidebar = () => {
		setSidebarCreateEvent(false);
		setEventTitle('');
		setEventDescription('');
		setEventType('online');
		setEventStartDate(null);
		setEventEndDate(null);
		setEventJoiningLink('');
	};

	function isFormValid() {
		const errorsFoundTemp: string[] = [];

		if (!eventTitle) {
			errorsFoundTemp.push('eventTitle');
		}

		if (!eventDescription) {
			errorsFoundTemp.push('eventDescription');
		}

		if (!eventStartDateTime) {
			errorsFoundTemp.push('eventStartDateTime');
		}

		if (!eventEndDateTime) {
			errorsFoundTemp.push('eventEndDateTime');
		}

		if (eventType == 'online' && !eventJoiningLink) {
			errorsFoundTemp.push('eventJoiningLink');
		} else if (eventType == 'offline' && !eventLocation) {
			errorsFoundTemp.push('eventLocation');
		}

		setErrorsFound(errorsFoundTemp);

		if (errorsFoundTemp.length > 0) {
			return false;
		}

		return true;
	}

	const handleCreateEvent = async () => {
		if (!isFormValid() || !id) return;

		setLoading(true);
		const { data, error: fetchError } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/createEvent', {
			content: eventDescription,
			end_time: eventEndDateTime,
			event_type: eventType,
			location: eventLocation,
			module: '',
			network: selectedNetwork,
			start_time: eventStartDateTime,
			title: eventTitle,
			url: eventJoiningLink,
			user_id: id
		});

		if (fetchError) {
			queueNotification({
				header: 'Error!',
				message: 'Error saving event',
				status: NotificationStatus.ERROR
			});
			console.error('Error saving event :', fetchError);
		}

		if (data) {
			closeCreateEventSidebar();
			queueNotification({
				header: 'Success!',
				message: 'Event has been sent for approval and should be live in 48 hours. Please contact hello@polkassembly.io in case of any queries',
				status: NotificationStatus.SUCCESS
			});
			window.location.reload();
		}

		setLoading(false);
	};

	const onEventStartDateChange: DatePickerProps['onChange'] = (date) => {
		setEventStartDate(dayjs(date).toDate());
	};

	const onEventEndDateChange: DatePickerProps['onChange'] = (date) => {
		setEventEndDate(dayjs(date).toDate());
	};

	return (
		<SidebarRight
			className={`${className} dark:bg-section-dark-overlay`}
			open={open}
			closeSidebar={() => setSidebarCreateEvent(false)}
		>
			<div className='dashboard-heading dark:font-medium dark:text-white'>
				<h1>Create Event</h1>
			</div>

			<div className='create-event-form'>
				<Form>
					<div>
						<label className='input-label dark:text-blue-dark-medium'>Event Title</label>
						<Form.Item validateStatus={errorsFound.includes('eventTitle') ? 'error' : ''}>
							<Input
								type='text'
								className='text-input dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								value={eventTitle}
								onChange={(e) => setEventTitle(e.target.value)}
								disabled={loading}
							/>
						</Form.Item>
					</div>

					<div>
						<label className='input-label'>Description</label>
						<Form.Item validateStatus={errorsFound.includes('eventDescription') ? 'error' : ''}>
							<Input
								type='text'
								className='text-input dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								value={eventDescription}
								onChange={(e) => setEventDescription(e.target.value)}
								disabled={loading}
							/>
						</Form.Item>
					</div>

					<label className='input-label mr-3'>Event Type</label>
					<Radio.Group
						onChange={onEventTypeRadioToggle}
						value={eventType}
						className='radio-input-group dark:text-white'
					>
						<Radio
							value='online'
							checked={eventType === 'online'}
							disabled={loading}
							className='dark:text-white'
						>
							Online
						</Radio>
						<Radio
							value='offline'
							checked={eventType === 'offline'}
							disabled={loading}
							className='dark:text-white'
						>
							Offline
						</Radio>
					</Radio.Group>

					<div className='d-flex date-input-row'>
						<div className='start-date-div'>
							<label className='input-label'>Start Date</label>
							<Form.Item validateStatus={errorsFound.includes('eventStartDateTime') ? 'error' : ''}>
								<DatePicker
									onChange={onEventStartDateChange}
									value={eventStartDateTime && dayjs(eventStartDateTime, 'DD-MM-YYYY')}
									disabled={loading}
									format='DD-MM-YYYY'
								/>
							</Form.Item>
						</div>

						<div>
							<label className='input-label'>End Date</label>
							<Form.Item validateStatus={errorsFound.includes('eventEndDateTime') ? 'error' : ''}>
								<DatePicker
									onChange={onEventEndDateChange}
									value={eventEndDateTime && dayjs(eventEndDateTime, 'DD-MM-YYYY')}
									disabled={loading || eventStartDateTime === null}
									format='DD-MM-YYYY'
									disabledDate={(current) => {
										const customDate = dayjs(eventStartDateTime).format('YYYY-MM-DD');
										return current && current < dayjs(customDate, 'YYYY-MM-DD');
									}}
								/>
							</Form.Item>
						</div>
					</div>

					{eventType == 'online' ? (
						<div>
							<label className='input-label'>Joining Link</label>
							<Form.Item validateStatus={errorsFound.includes('eventJoiningLink') ? 'error' : ''}>
								<Input
									type='text'
									className='text-input dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
									value={eventJoiningLink}
									onChange={(e) => setEventJoiningLink(e.target.value)}
									disabled={loading}
								/>
							</Form.Item>
						</div>
					) : (
						<div>
							<label className='input-label'>Location</label>
							<Form.Item validateStatus={errorsFound.includes('eventLocation') ? 'error' : ''}>
								<Input
									type='text'
									className='text-input dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
									value={eventLocation}
									onChange={(e) => setEventLocation(e.target.value)}
									disabled={loading}
								/>
							</Form.Item>
						</div>
					)}

					<div className='form-actions'>
						<Button
							onClick={closeCreateEventSidebar}
							disabled={loading}
							className='dark:bg-transparent dark:text-white'
						>
							Cancel
						</Button>
						<Button
							className='ml-1 rounded-md  bg-pink_primary text-white transition-colors duration-300 hover:bg-pink_secondary'
							onClick={handleCreateEvent}
							loading={loading}
						>
							Create Event
						</Button>
					</div>
				</Form>
			</div>
		</SidebarRight>
	);
};

export default styled(CreateEventSidebar)`
	.create-event-form {
		margin-top: 48px;
		@media only screen and (max-width: 768px) {
			margin-top: 18px;
		}
		.input.error {
			border: 1px solid #ff0000;
		}
		.input-label {
			font-weight: 500;
			font-size: 16px;
			color: #7d7d7d;
			margin-bottom: 12px;
			@media only screen and (max-width: 768px) {
				font-size: 14px;
			}
		}

		.text-input {
			height: 35px;
			border-radius: 5px;
			margin-bottom: 18px;
			font-size: 16px;
			@media only screen and (max-width: 768px) {
				font-size: 14px;
				height: 38px;
				margin-bottom: 12px;
			}
		}
		.radio-input-group {
			margin-top: 12px;

			.checkbox {
				margin-right: 20px !important;
				&.checked {
					label {
						color: #e5007a;
						&::after {
							background-color: #e5007a !important;
						}
					}
				}
				label {
					font-size: 16px !important;
					padding-left: 20px !important;
					@media only screen and (max-width: 768px) {
						font-size: 14px;
					}
				}
			}
		}
		.date-input-row {
			margin-top: 28px;
			margin-bottom: 28px;
			display: flex;
			@media only screen and (max-width: 768px) {
				margin-top: 22px;
				margin-bottom: 22px;
				flex-direction: column;
			}
			.start-date-div {
				margin-right: 20px;
				@media only screen and (max-width: 768px) {
					margin-right: 0;
					margin-bottom: 14px;
				}
			}
			.input-label {
				margin-bottom: 212px !important;
			}
			.react-calendar__tile--now {
				background-color: rgba(229, 0, 122, 0.1);
			}
		}
		.date-input {
			width: 100%;
			margin-top: 2px;
			font-family: 'Roboto' !important;
			height: 38px !important;

			&.error {
				.react-date-picker__wrapper {
					border: #ff0000 1px solid;
					color: #ff0000 !important;
				}

				.react-date-picker__inputGroup__input {
					color: #ff0000 !important;
					font-family: 'Roboto' !important;
				}
			}

			.react-date-picker__wrapper {
				padding: 0 10px;
				border: 1px solid rgba(34, 36, 38, 0.15);
				border-radius: 0.29rem;

				.react-date-picker__inputGroup {
					display: flex;

					.react-date-picker__inputGroup__divider {
						height: 100%;
						display: flex;
						align-items: center;
					}
				}
			}

			.react-date-picker__clear-button {
				svg {
					stroke: #aaa !important;
					height: 14px;
				}
			}

			.react-date-picker__inputGroup__input {
				border: none !important;
				font-family: 'Roboto' !important;
				color: #333;
				height: min-content;
				margin-bottom: 0 !important;
			}

			.react-date-picker__inputGroup__divider,
			.react-date-picker__inputGroup__day,
			.react-date-picker__inputGroup__month,
			.react-date-picker__inputGroup__year {
				font-size: 14px;
				padding-left: 1px !important;
				padding-right: 1px !important;
			}
		}
		.form-actions {
			display: flex;
			justify-content: flex-end;
			margin-top: 16px;
			.button {
				font-weight: 600;
				font-size: 16px;
				&:first-of-type {
					background: transparent;
				}
			}
			.submit-btn {
				background: #e5007a;
				color: #fff;
			}
		}
	}
`;
