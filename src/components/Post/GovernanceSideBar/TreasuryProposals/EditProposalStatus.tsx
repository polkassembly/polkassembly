// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DownOutlined, EditOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { DatePickerProps } from 'antd';
import { DatePicker, Form, Modal, Space } from 'antd';
import { Dropdown } from '~src/ui-components/Dropdown';
import { dayjs } from 'dayjs-init';
import React, { useCallback, useEffect, useState } from 'react';
import { NetworkEvent, NotificationStatus } from 'src/types';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import HelperTooltip from 'src/ui-components/HelperTooltip';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';

import { ChallengeMessage } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useTheme } from 'next-themes';
import CustomButton from '~src/basic-components/buttons/CustomButton';

interface Props {
	canEdit?: boolean | '' | undefined;
	className?: string;
	proposalId?: number | null | undefined;
	startTime: string;
}

const statusOptions: MenuProps['items'] = [
	{ key: 'overdue', label: 'Overdue' },
	{ key: 'completed', label: 'Completed' },
	{ key: 'in_progress', label: 'In Progress' }
];

const EditProposalStatus = ({ canEdit, className, proposalId, startTime }: Props) => {
	const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
	const [status, setStatus] = useState<string>('in_progress');
	const [loading, setLoading] = useState<boolean>(false);
	const [errorsFound, setErrorsFound] = useState<string[]>([]);
	const [isUpdate, setIsUpdate] = useState<boolean>(false);
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	const getProposalStatus = useCallback(async () => {
		const { data, error } = await nextApiClientFetch<NetworkEvent>('api/v1/events/getEventByPostId', {
			post_id: Number(proposalId)
		});

		if (error) {
			console.log('error fetching proposal status', error);
			setStatus('Not found');
		}

		if (data) {
			setStatus(data.status || 'Not Set');

			if (data.end_time) {
				setIsUpdate(true);
				setDeadlineDate((data.end_time as any)?.toDate() || null);
			}
		}
	}, [proposalId]);

	useEffect(() => {
		getProposalStatus();
	}, [getProposalStatus]);

	const onStatusChange: MenuProps['onClick'] = ({ key }) => {
		const status = key as string;
		setStatus(status);
	};

	const handleSave = async () => {
		if (!canEdit) return;

		setLoading(true);

		const errorsFound: string[] = [];

		if (Object.prototype.toString.call(deadlineDate) !== '[object Date]') {
			errorsFound.push('deadlineDate');
		}

		if (!status) {
			errorsFound.push('status');
		}

		setErrorsFound(errorsFound);

		if (errorsFound.length > 0) {
			setLoading(false);
			return;
		}

		if (!isUpdate) {
			const { data, error } = await nextApiClientFetch<ChallengeMessage>('api/v1/auth/actions/createProposalTracker', {
				deadline: dayjs(deadlineDate).toDate(),
				onchain_proposal_id: Number(proposalId),
				start_time: startTime,
				status
			});

			if (error) {
				queueNotification({
					header: 'Error!',
					message: 'Proposal status was not saved',
					status: NotificationStatus.ERROR
				});
				console.error('Error saving status : ', error);
			}

			if (data && data.message) {
				queueNotification({
					header: 'Success!',
					message: 'Proposal status was saved',
					status: NotificationStatus.SUCCESS
				});
			}
		} else {
			const { data, error } = await nextApiClientFetch<ChallengeMessage>('api/v1/auth/actions/updateProposalTracker', {
				id: Number(proposalId),
				status
			});

			if (error) {
				queueNotification({
					header: 'Error!',
					message: 'Proposal status was not updated',
					status: NotificationStatus.ERROR
				});
				console.error('Error updating status : ', error);
			}

			if (data && data.message) {
				queueNotification({
					header: 'Success!',
					message: 'Proposal status was updated',
					status: NotificationStatus.SUCCESS
				});
			}
		}

		setLoading(false);
	};

	const onChange: DatePickerProps['onChange'] = (dayJSDate) => {
		const date = dayJSDate || dayjs();
		setDeadlineDate(date.toDate());
	};

	return (
		<>
			{canEdit && !isUpdate ? (
				<CustomButton
					text='Set Deadline Date'
					onClick={() => setModalOpen(true)}
					height={60}
					className='w-full transition-colors duration-300'
					variant='primary'
				/>
			) : canEdit && isUpdate ? (
				<div className='transition:colors duration:500 edit-icon-wrapper flex h-[60px] w-full items-center justify-center rounded-md bg-white drop-shadow-md dark:bg-section-dark-overlay'>
					<div className='text-center text-[18px] font-medium text-sidebarBlue'>
						<>Deadline: {dayjs(deadlineDate).format('MMM Do YY')}</>
					</div>
					<EditOutlined
						className='edit-icon text-lg text-white'
						onClick={() => setModalOpen(true)}
					/>
				</div>
			) : isUpdate ? (
				<div className='transition:colors duration:500 flex h-[60px] w-full items-center justify-center rounded-md bg-white drop-shadow-md dark:bg-section-dark-overlay'>
					<div className='text-center text-[18px] font-medium text-sidebarBlue'>
						<>Deadline: {dayjs(deadlineDate).format('MMM Do YY')}</>
					</div>
				</div>
			) : (
				<div className='dark:text-lightblue flex h-[60px] w-full items-center justify-center rounded-md bg-white text-[18px] font-medium text-sidebarBlue drop-shadow-md dark:bg-section-dark-overlay'>
					Deadline: Not Set
				</div>
			)}

			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				open={modalOpen}
				className={`${className} dark:text-lightblue dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				title={<span className='dark:text-white'>Set Deadline Date</span>}
				centered
				footer={[
					<div
						key='footer'
						className='flex items-center justify-end gap-x-1'
					>
						<CustomButton
							text='Close'
							key='close'
							onClick={() => setModalOpen(false)}
							height={40}
							variant='default'
						/>
						<CustomButton
							text='Save'
							key='submit'
							onClick={handleSave}
							loading={loading}
							disabled={loading}
							height={40}
							variant='primary'
							className='transition-colors duration-300'
						/>
					</div>
				]}
				onCancel={() => setModalOpen(false)}
			>
				<div className=' flex flex-col'>
					{errorsFound.includes('proposalTracker') && <ErrorAlert errorMsg='Error in updating proposal status, please try again.' />}

					<Form>
						<Form.Item className='date-input-form-field'>
							<label className=' text-md flex items-center font-medium text-sidebarBlue'>
								Deadline Date
								<HelperTooltip
									className='ml-2 align-middle'
									text='This timeline will be used by the community to track the progress of the proposal. The team will be responsible for delivering the proposed items before the deadline.'
								/>
							</label>

							{canEdit && !isUpdate ? (
								<DatePicker
									className={`date-input ${errorsFound.includes('deadlineDate') ? 'deadline-date-error' : ''}`}
									disabled={loading}
									onChange={onChange}
									format='DD-MM-YYYY'
								/>
							) : canEdit && isUpdate ? (
								<DatePicker
									className={`date-input ${errorsFound.includes('deadlineDate') ? 'deadline-date-error' : ''}`}
									disabled={loading}
									onChange={onChange}
									format='DD-MM-YYYY'
									value={dayjs(deadlineDate, 'DD-MM-YYYY')}
								/>
							) : (
								<span className='deadline-date text-sidebarBlue'>{deadlineDate == null ? 'Not Set' : dayjs(deadlineDate).format('MMMM Do YYYY')}</span>
							)}
						</Form.Item>

						<Form.Item className='status-input-form-field'>
							<label className=' text-md flex items-center font-medium text-sidebarBlue dark:text-sidebarBlue'>Status</label>

							{canEdit ? (
								// eslint-disable-next-line sort-keys
								<>
									<Dropdown
										theme={theme}
										className='status-dropdown text-sidebarBlue'
										overlayClassName='z-[1056]'
										disabled={loading}
										menu={{ items: statusOptions, onClick: onStatusChange }}
									>
										<Space className='cursor-pointer'>
											{status
												.toString()
												.split('_')
												.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
												.join(' ')}{' '}
											<DownOutlined className='align-middle' />
										</Space>
									</Dropdown>
								</>
							) : (
								<span className='text-sidebarBlue'>
									{status == 'Not Set'
										? status
										: statusOptions
												.find((o) => o?.key === status)
												?.key?.toString()
												.split('_')
												.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
												.join(' ')}
								</span>
							)}
						</Form.Item>
					</Form>
				</div>
			</Modal>
		</>
	);
};

export default styled(EditProposalStatus)`
	.deadline-date {
		font-size: 14px;
	}
	.date-input {
		width: 100%;
		margin-top: 2px;
		font-family: 'Roboto' !important;
		&.deadline-date-error {
			.react-date-picker__wrapper {
				border: #e06b5e 1px solid;
				color: #e06b5e !important;
			}
			.react-date-picker__inputGroup__input {
				color: #e06b5e !important;
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
	.status-input-form-field {
		margin-top: 16px !important;
		.input-label {
			margin-bottom: 4px;
		}
		.status-dropdown {
			font-size: 14px;
			width: 100%;
		}
	}
	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none !important;
		margin: 0 !important;
	}
	/* Firefox */
	input[type='number'] {
		-moz-appearance: textfield !important;
	}
`;
