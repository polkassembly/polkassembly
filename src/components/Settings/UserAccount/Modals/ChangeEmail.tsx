// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Divider, Form, Modal } from 'antd';
import ChangeEmailIcon from '~assets/icons/change-email.svg';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import messages from '~src/util/messages';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Input from '~src/basic-components/Input';

const ChangeEmail = ({ open, onConfirm, onCancel, email }: { open: boolean; onConfirm?: () => void; onCancel: () => void; email: string }) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [form] = Form.useForm();

	const handleClick = async () => {
		try {
			const values = await form.validateFields();
			const { newEmail } = values;
			setLoading(true);
			const { data, error } = await nextApiClientFetch<any>('api/v1/auth/actions/sendVerificationEmail', {
				email: newEmail
			});
			if (error) {
				queueNotification({
					header: 'Failed!',
					message: error,
					status: NotificationStatus.ERROR
				});
			}
			if (data) {
				queueNotification({
					header: 'Success!',
					message: 'Verification Email Sent.',
					status: NotificationStatus.SUCCESS
				});
				form.resetFields();
				onCancel();
			}
			setLoading(false);
		} catch (error) {
			console.log('Validation error:', error);
			setLoading(false);
			queueNotification({
				header: 'Failed!',
				message: error,
				status: NotificationStatus.ERROR
			});
		}
	};
	return (
		<Modal
			wrapClassName='dark:bg-modalOverlayDark'
			title={
				<div className='ml-[-24px] mr-[-24px] text-blue-light-high dark:bg-section-dark-overlay dark:text-blue-dark-high'>
					<h3 className='md:text-md mb-0 ml-[24px] flex items-center gap-2 text-base'>
						<ChangeEmailIcon /> Change your email
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
					{Boolean(email) && (
						<Form.Item
							name='old-email'
							className='m-0 w-full min-w-[250px]'
						>
							<label
								className='dark:text-white'
								htmlFor='old-email'
							>
								Old Email
							</label>
							<Input
								className='p-2 text-sm leading-[21px] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								value={email}
								disabled
							/>
						</Form.Item>
					)}
					<div>
						<label
							className='dark:text-white'
							htmlFor='new-email'
						>
							New Email
						</label>
						<Form.Item
							name={'newEmail'}
							className='m-0 w-full min-w-[250px]'
							rules={[
								{
									message: messages.VALIDATION_EMAIL_ERROR,
									required: true,
									type: 'email'
								}
							]}
						>
							<Input
								disabled={loading}
								className='p-2 text-sm leading-[21px] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								placeholder='Enter your email'
							/>
						</Form.Item>
					</div>
					<div>
						<div className='ml-[-24px] mr-[-24px]'>
							<Divider className='my-4 mt-0' />
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

export default ChangeEmail;
