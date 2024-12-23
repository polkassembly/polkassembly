// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Divider, Form, Modal } from 'antd';
import ChangePasswordIcon from '~assets/icons/change-password.svg';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import messages from '~src/util/messages';
import * as validation from 'src/util/validation';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Input from '~src/basic-components/Input';

const ChangePassword = ({ open, onConfirm, onCancel }: { open: boolean; onConfirm?: () => void; onCancel: () => void }) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [form] = Form.useForm();
	const { password } = validation;

	const handleClick = async () => {
		try {
			const values = await form.validateFields();
			const { currentPassword, newPassword, confirmPassword } = values;

			if (newPassword !== confirmPassword) {
				return;
			}

			if (currentPassword && newPassword) {
				setLoading(true);
				const { data, error } = await nextApiClientFetch<any>('api/v1/auth/actions/changePassword', {
					newPassword: newPassword,
					oldPassword: currentPassword
				});

				if (error || !data || !data.message) {
					form.resetFields();
					queueNotification({
						header: 'Failed!',
						message: error || 'Something went wrong',
						status: NotificationStatus.ERROR
					});
				}

				if (data && data.message) {
					form.resetFields();
					if (data && data.message) {
						queueNotification({
							header: 'Success!',
							message: data.message,
							status: NotificationStatus.SUCCESS
						});
					}
					onCancel();
				}
				setLoading(false);
			}
		} catch (error) {
			setLoading(false);
			queueNotification({
				header: 'Failed!',
				message: error || 'Something went wrong',
				status: NotificationStatus.ERROR
			});
			return;
		}
	};

	return (
		<Modal
			wrapClassName='dark:bg-modalOverlayDark'
			title={
				<div className='ml-[-24px] mr-[-24px] text-blue-light-high dark:bg-section-dark-overlay dark:text-blue-dark-high'>
					<h3 className='md:text-md mb-0 ml-[24px] flex items-center gap-2 text-base'>
						<ChangePasswordIcon /> Change your username
					</h3>
					<Divider />
				</div>
			}
			open={open}
			closable
			className='min-w-[350px] md:min-w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay'
			onCancel={onCancel}
			onOk={onConfirm}
			footer={null}
		>
			<div className='flex flex-wrap items-center gap-[10px]'>
				<Form
					onFinish={handleClick}
					form={form}
					className='flex w-full flex-col gap-6'
				>
					<div>
						<label
							className='dark:text-white'
							htmlFor='currentPassword'
						>
							Current Password
						</label>
						<Form.Item
							name='currentPassword'
							className='m-0 w-full min-w-[250px]'
							rules={[
								{
									message: messages.VALIDATION_PASSWORD_ERROR,
									required: password.required
								},
								{
									message: messages.VALIDATION_PASSWORD_ERROR,
									min: password.minLength
								}
							]}
						>
							<Input
								type='password'
								className='p-2 text-sm leading-[21px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								placeholder='Enter current password'
							/>
						</Form.Item>
					</div>
					<div>
						<label htmlFor='newPassword'>New Password</label>
						<Form.Item
							name='newPassword'
							className='m-0 w-full min-w-[250px]'
							rules={[
								{
									message: messages.VALIDATION_PASSWORD_ERROR,
									required: password.required
								},
								{
									message: messages.VALIDATION_PASSWORD_ERROR,
									min: password.minLength
								}
							]}
						>
							<Input
								type='password'
								className='p-2 text-sm leading-[21px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								placeholder='Enter new password'
							/>
						</Form.Item>
					</div>
					<div>
						<label
							className='dark:text-white'
							htmlFor='confirmPassword'
						>
							Confirm New Password
						</label>
						<Form.Item
							name='confirmPassword'
							className='m-0 w-full min-w-[250px]'
							rules={[
								{
									message: 'Please confirm your password!',
									required: true
								},
								({ getFieldValue }) => ({
									validator(_, value) {
										if (!value || getFieldValue('newPassword') === value) {
											return Promise.resolve();
										}
										return Promise.reject(new Error('Password that you entered do not match!'));
									}
								})
							]}
						>
							<Input
								type='password'
								className='p-2 text-sm leading-[21px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								placeholder='Confirm new password'
							/>
						</Form.Item>
					</div>
					<div>
						<div className='ml-[-24px] mr-[-24px]'>
							<Divider className='my-4' />
						</div>
						<div className='flex justify-end gap-4'>
							<CustomButton
								text='Cancel'
								key='1'
								variant='default'
								onClick={onCancel}
								buttonsize='xs'
								className='px-[36px] py-[4px] capitalize'
							/>
							<CustomButton
								onClick={onConfirm}
								loading={loading}
								htmlType='submit'
								text='Save'
								key='2'
								variant='default'
								buttonsize='xs'
								className='px-[36px] py-[4px] capitalize'
							/>
						</div>
					</div>
				</Form>
			</div>
		</Modal>
	);
};

export default ChangePassword;
