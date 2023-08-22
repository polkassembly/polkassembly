// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Button, Divider, Form, Input, Modal } from 'antd';
import ChangeUserIcon from '~assets/icons/change-username.svg';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { NotificationStatus } from '~src/types';
import messages from 'src/util/messages';
import queueNotification from '~src/ui-components/QueueNotification';
import { username as usernameValidation } from 'src/util/validation';
import { useUserDetailsContext } from '~src/context';

const ChangeUsername = ({
	open,
	onConfirm,
	onCancel,
	username
}: {
    open: boolean;
    onConfirm?: () => void;
    onCancel: () => void;
    username: string;
}) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [form] = Form.useForm();
	const { setUserDetailsContextState } = useUserDetailsContext();
	const handleClick = async () => {
		try {
			const values = await form.validateFields();
			const { newUsername } = values;
			setLoading(true);

			const { data, error } = await nextApiClientFetch<any>(
				'api/v1/auth/actions/changeUsername',
				{
					username: newUsername
				}
			);
			if (error) {
				queueNotification({
					header: 'Failed!',
					message: error || 'Not able to change username please try again later',
					status: NotificationStatus.ERROR
				});
			}
			if (data) {
				setUserDetailsContextState(prev => ({ ...prev, username: newUsername }));
				queueNotification({
					header: 'Success!',
					message: 'Username changed successfully.',
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
				message: error || 'Not able to change username please try again later',
				status: NotificationStatus.ERROR
			});
		}
	};

	return (
		<Modal
			title={
				<div className='mr-[-24px] ml-[-24px] text-blue-light-high dark:text-blue-dark-high'>
					<h3 className='ml-[24px] mb-0 flex items-center gap-2 text-base md:text-md'>
						<ChangeUserIcon /> Change your username
					</h3>
					<Divider />
				</div>
			}
			open={open}
			closable
			className='min-w-[350px] md:min-w-[600px]'
			onCancel={onCancel}
			onOk={onConfirm}
			footer={null}
		>
			<div className='flex gap-[10px] flex-wrap items-center'>
				<Form
					onFinish={handleClick}
					form={form}
					className='flex flex-col gap-6 w-full'
				>
					<Form.Item
						name={'oldUsername'}
						className='m-0 w-full min-w-[250px]'
					>
						<label htmlFor="old-username">Old Username</label>
						<Input
							className='p-2 text-sm leading-[21px]'
							value={username}
							disabled
						/>
					</Form.Item>
					<div>
						<label htmlFor="new-username">New Username</label>
						<Form.Item
							name={'newUsername'}
							className='m-0 w-full min-w-[250px]'
							rules={[
								{
									message: messages.VALIDATION_USERNAME_REQUIRED_ERROR,
									required: usernameValidation.required
								},
								{
									max: usernameValidation.maxLength,
									message: messages.VALIDATION_USERNAME_MAXLENGTH_ERROR
								},
								{
									message: messages.VALIDATION_USERNAME_MINLENGTH_ERROR,
									min: usernameValidation.minLength
								}
							]}
						>
							<Input
								disabled={loading}
								className='p-2 text-sm leading-[21px]'
								placeholder='Enter your username'
							/>
						</Form.Item>
					</div>
					<div>
						<div className='mr-[-24px] ml-[-24px]'>
							<Divider className='my-4 mt-0' />
						</div>
						<div className='flex justify-end gap-4'>
							<Button
								key='1'
								onClick={onCancel}
								className='h-10 rounded-[6px] bg-[#FFFFFF] border border-solid border-pink_primary px-[36px] py-[4px] text-pink_primary font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize'
							>
                                Cancel
							</Button>
							<Button
								loading={loading}
								htmlType='submit'
								className='h-10 rounded-[6px] bg-[#E5007A] border border-solid border-pink_primary px-[36px] py-[4px] text-white font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize'
							>
                                Save
							</Button>
						</div>
					</div>
				</Form>
			</div>
		</Modal >
	);
};

export default ChangeUsername;
