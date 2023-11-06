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
import { useUserDetailsSelector } from '~src/redux/selectors';
import { setUserDetailsState } from '~src/redux/userDetails';
import { useDispatch } from 'react-redux';

const ChangeUsername = ({ open, onConfirm, onCancel, username }: { open: boolean; onConfirm?: () => void; onCancel: () => void; username: string }) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [form] = Form.useForm();
	const currentUser = useUserDetailsSelector();
	const dispatch = useDispatch();
	const handleClick = async () => {
		try {
			const values = await form.validateFields();
			const { newUsername } = values;
			setLoading(true);

			const { data, error } = await nextApiClientFetch<any>('api/v1/auth/actions/changeUsername', {
				username: newUsername
			});
			if (error) {
				queueNotification({
					header: 'Failed!',
					message: error || 'Not able to change username please try again later',
					status: NotificationStatus.ERROR
				});
			}
			if (data) {
				dispatch(setUserDetailsState({ ...currentUser, username: newUsername }));
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
			wrapClassName='dark:bg-modalOverlayDark'
			title={
				<div className='ml-[-24px] mr-[-24px] text-blue-light-high dark:bg-section-dark-overlay dark:text-blue-dark-high'>
					<h3 className='md:text-md mb-0 ml-[24px] flex items-center gap-2 text-base'>
						<ChangeUserIcon /> Change your username
					</h3>
					<Divider />
				</div>
			}
			open={open}
			closable
			className='min-w-[350px] dark:bg-section-dark-overlay md:min-w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay'
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
					<Form.Item
						name={'oldUsername'}
						className='m-0 w-full min-w-[250px]'
					>
						<label
							className='dark:text-white'
							htmlFor='old-username'
						>
							Old Username
						</label>
						<Input
							className='p-2 text-sm leading-[21px] dark:border-separatorDark dark:bg-disableStateDark dark:text-blue-dark-high'
							value={username}
							disabled
						/>
					</Form.Item>
					<div>
						<label
							className='dark:text-white'
							htmlFor='new-username'
						>
							New Username
						</label>
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
								className='p-2 text-sm leading-[21px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								placeholder='Enter your username'
							/>
						</Form.Item>
					</div>
					<div>
						<div className='ml-[-24px] mr-[-24px]'>
							<Divider className='my-4 mt-0' />
						</div>
						<div className='flex justify-end gap-4'>
							<Button
								key='1'
								onClick={onCancel}
								className='h-10 rounded-[6px] border border-solid border-pink_primary bg-[#FFFFFF] px-[36px] py-[4px] text-sm font-medium capitalize leading-[21px] tracking-[0.0125em] text-pink_primary dark:bg-section-dark-overlay'
							>
								Cancel
							</Button>
							<Button
								loading={loading}
								htmlType='submit'
								className='h-10 rounded-[6px] border border-solid border-pink_primary bg-[#E5007A] px-[36px] py-[4px] text-sm font-medium capitalize leading-[21px] tracking-[0.0125em] text-white'
							>
								Save
							</Button>
						</div>
					</div>
				</Form>
			</div>
		</Modal>
	);
};

export default ChangeUsername;
