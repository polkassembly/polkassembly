// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Form, Input, Modal, Select } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC, useState } from 'react';
import { NotificationStatus } from 'src/types';
import FilteredError from 'src/ui-components/FilteredError';
import queueNotification from 'src/ui-components/QueueNotification';
import cleanError from 'src/util/cleanError';
import styled from 'styled-components';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import { MessageType } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { Collapse } from './Notifications/common-ui/Collapse';
import DeleteIcon from '~assets/icons/delete-icon-settings.svg';
import { useDispatch } from 'react-redux';
import { logout } from '~src/redux/userDetails';
const { Panel } = Collapse;

const Delete: FC<{ className?: string }> = ({ className }) => {
	const [error, setError] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [isOther, setIsOther] = useState(false);
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();
	const router = useRouter();
	const dispatch = useDispatch();

	const handleLogout = async () => {
		dispatch(logout());
		router.replace('/');
	};

	const handleSubmit = async (formData: any) => {
		if (formData?.password) {
			setLoading(true);

			const { data, error } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/deleteAccount', { password: formData?.password });
			if (error) {
				setError(cleanError(error));
				queueNotification({
					header: 'Failed!',
					message: cleanError(error),
					status: NotificationStatus.ERROR
				});
				console.error('Delete account error', error);
			}

			if (data) handleLogout();

			setLoading(true);
		}
	};
	const openModal = () => {
		setShowModal(true);
	};

	const dismissModal = () => {
		form.resetFields();
		setError('');
		setShowModal(false);
	};
	const Title = <span className='text-lg font-medium tracking-wide text-sidebarBlue'>Delete Account</span>;
	const { Option } = Select;
	return (
		<Collapse
			size='large'
			className='bg-white'
			expandIconPosition='end'
			expandIcon={({ isActive }) => {
				return isActive ? <CollapseIcon /> : <ExpandIcon />;
			}}
		>
			<Panel
				header={
					<div className='channel-header flex items-center gap-[6px]'>
						<DeleteIcon />
						<h3 className='mb-0 mt-[2px] text-[16px] font-semibold leading-[21px] tracking-wide text-blue-light-high dark:text-blue-dark-high md:text-[18px]'>Delete Account</h3>
					</div>
				}
				key='1'
			>
				<Form
					className={className}
					form={form}
					onFinish={handleSubmit}
				>
					<p className='text-[14px] text-blue-light-high dark:text-blue-dark-high'>
						Please note that this action is irreversible and all the data associated with your account will be permanently deleted.
					</p>
					<Modal
						wrapClassName='dark:bg-modalOverlayDark'
						closable={false}
						title={Title}
						open={showModal}
						footer={[
							<Button
								htmlType='submit'
								key='delete'
								onClick={() => {
									form.submit();
								}}
								loading={loading}
								className='inline-flex items-center justify-center rounded-lg border-none bg-pink_primary px-7 py-5 text-lg font-semibold leading-7 text-white outline-none'
							>
								Delete
							</Button>,
							<Button
								key='cancel'
								onClick={dismissModal}
								className='inline-flex items-center justify-center rounded-lg border-none bg-pink_primary px-7 py-5 text-lg font-semibold leading-7 text-white outline-none'
							>
								Cancel
							</Button>
						]}
						className={`${className} dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
					>
						{error && (
							<div className='mb-4'>
								<FilteredError text={error} />
							</div>
						)}
						<article>
							<label
								className='text-sm font-normal leading-6 tracking-wide text-sidebarBlue'
								htmlFor='reason'
							>
								Why are you deleting your account?
							</label>
							<Form.Item
								name='reason'
								className='m-0 mt-2.5'
							>
								<Select
									onChange={(value) => {
										if (value === 'other') {
											setIsOther(true);
										} else {
											if (isOther) {
												setIsOther(false);
											}
										}
									}}
									size='large'
									placeholder='Select a reason'
									className='select-reason rounded-md border-grey_border'
								>
									<Option value='I use another platform for my governance needs'>I use another platform for my governance needs</Option>
									<Option value='I do not hold any DOT and would not be using Polkassembly anymore'>I do not hold any DOT and would not be using Polkassembly.</Option>
									<Option value='I have a duplicate account'>I have a duplicate account</Option>
									<Option
										htmlFor='other'
										value='other'
									>
										Other
									</Option>
								</Select>
							</Form.Item>
							{isOther ? (
								<Form.Item
									name='other'
									className='mt-4'
								>
									<Input.TextArea
										placeholder='Other reason'
										id='other'
										className='dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
									/>
								</Form.Item>
							) : null}
						</article>
						<article className='mt-12'>
							<label
								className='text-sm font-normal leading-6 tracking-wide text-sidebarBlue'
								htmlFor='password'
							>
								To continue, re-enter your password
							</label>
							<Form.Item
								name='password'
								className='m-0 mt-2.5'
							>
								<Input.Password
									placeholder='Password'
									className='rounded-md border-grey_border px-4 py-3 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
									id='password'
								/>
							</Form.Item>
							<div className='my-2.5 text-right text-pink_primary'>
								<Link
									onClick={dismissModal}
									href='/request-reset-password'
								>
									Forgot Password?
								</Link>
							</div>
						</article>
					</Modal>
					<Button
						onClick={openModal}
						htmlType='submit'
						className='text-md mt-5 flex items-center justify-center rounded-lg border-none bg-[#F53C3C] px-7 py-5 font-semibold leading-7 text-white outline-none'
					>
						Delete My Account
					</Button>
				</Form>
			</Panel>
		</Collapse>
	);
};

export default styled(Delete)`
	.ant-select-item-option-content {
		white-space: unset !important;
		background-color: red !important;
	}
`;
