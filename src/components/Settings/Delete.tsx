// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Form, Input, Modal, Select } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC, useState } from 'react';
import { useUserDetailsContext } from 'src/context';
import { logout } from 'src/services/auth.service';
import { NotificationStatus } from 'src/types';
import FilteredError from 'src/ui-components/FilteredError';
import queueNotification from 'src/ui-components/QueueNotification';
import cleanError from 'src/util/cleanError';
import styled from 'styled-components';
import { useTheme } from 'next-themes';
import { ExpandIcon,CollapseIcon } from '~src/ui-components/CustomIcons';
import { MessageType } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { Collapse } from './Notifications/common-ui/Collapse';
import DeleteIcon from '~assets/icons/delete-icon-settings.svg';
const { Panel } = Collapse;

const Delete: FC<{ className?: string }> = ({ className }) => {
	const [error, setError] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [isOther, setIsOther] = useState(false);
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();
	const { setUserDetailsContextState } = useUserDetailsContext();
	const router = useRouter();
	const { resolvedTheme:theme } = useTheme();

	const handleLogout = async () => {
		logout(setUserDetailsContextState);
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
<<<<<<< HEAD
	const Title = <div className='font-medium text-lg tracking-wide text-sidebarBlue dark:bg-section-dark-overlay dark:text-white'>Delete Account</div>;
=======
	const Title = <span className='text-lg font-medium tracking-wide text-sidebarBlue'>Delete Account</span>;
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
	const { Option } = Select;
	return (
		<Collapse
			size='large'
			className='bg-white dark:bg-section-dark-overlay dark:border-[#90909060]'
			expandIconPosition='end'
			theme={theme}
			expandIcon={({ isActive }) => {
				return isActive ? <CollapseIcon className='text-lightBlue dark:text-blue-dark-medium' /> : <ExpandIcon className='text-lightBlue dark:text-blue-dark-medium' />;
			}}
		>
			<Panel
				header={
					<div className='channel-header flex items-center gap-[6px]'>
						<DeleteIcon />
<<<<<<< HEAD
						<h3 className='font-semibold text-[16px] text-blue-light-high dark:text-blue-dark-high md:text-[18px] tracking-wide leading-[21px] mb-0 mt-[2px]'>
						Delete Account
						</h3>
=======
						<h3 className='mb-0 mt-[2px] text-[16px] font-semibold leading-[21px] tracking-wide text-[#243A57] md:text-[18px]'>Delete Account</h3>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
					</div>
				}
				key='1'
			>
<<<<<<< HEAD
				<Form className={className} form={form} onFinish={handleSubmit}>
					<p className='text-blue-light-high dark:text-blue-dark-high text-[14px]'>Please note that this action is irreversible and all the data associated with your account will be permanently deleted.</p>
=======
				<Form
					className={className}
					form={form}
					onFinish={handleSubmit}
				>
					<p className='text-[14px] text-[#243A57]'>Please note that this action is irreversible and all the data associated with your account will be permanently deleted.</p>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
					<Modal
						closable={false}
						title={Title}
						open={showModal}
						wrapClassName='dark:bg-modalOverlayDark'
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
						className={`${className} ${theme === 'dark'? '[&>.ant-modal-content]:bg-section-dark-overlay' : ''}`}
					>
						{error && (
							<div className='mb-4'>
								<FilteredError text={error} />
							</div>
						)}
						<article>
							<label
<<<<<<< HEAD
								className="text-sm text-sidebarBlue dark:text-blue-dark-medium font-normal tracking-wide leading-6"
								htmlFor="reason"
=======
								className='text-sm font-normal leading-6 tracking-wide text-sidebarBlue'
								htmlFor='reason'
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
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
<<<<<<< HEAD
									className='rounded-md border-grey_border select-reason dark:bg-black dark:text-white'
=======
									className='select-reason rounded-md border-grey_border'
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
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
									/>
								</Form.Item>
							) : null}
						</article>
						<article className='mt-12'>
							<label
<<<<<<< HEAD
								className="text-sm text-sidebarBlue dark:text-blue-dark-medium font-normal tracking-wide leading-6"
								htmlFor="password"
=======
								className='text-sm font-normal leading-6 tracking-wide text-sidebarBlue'
								htmlFor='password'
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
							>
								To continue, re-enter your password
							</label>
							<Form.Item
								name='password'
								className='m-0 mt-2.5'
							>
								<Input.Password
									placeholder='Password'
									className='rounded-md border-grey_border px-4 py-3'
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
