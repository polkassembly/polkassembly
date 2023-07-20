// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Button, Divider, Form, Input, Modal } from 'antd';
import ChangePasswordIcon from '~assets/icons/change-password.svg';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import messages from '~src/util/messages';
import * as validation from 'src/util/validation';

const ChangePassword = ({
	open,
	onConfirm,
	onCancel
}: {
  open: boolean;
  onConfirm?: () => void;
  onCancel: () => void;
}) => {
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
				const { data, error } = await nextApiClientFetch<any>(
					'api/v1/auth/actions/changePassword',
					{
						newPassword: newPassword,
						oldPassword: currentPassword
					}
				);

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
			title={
				<div className="mr-[-24px] ml-[-24px] text-[#243A57]">
					<h3 className="ml-[24px] mb-0 flex items-center gap-2 text-base md:text-md">
						<ChangePasswordIcon /> Change your username
					</h3>
					<Divider />
				</div>
			}
			open={open}
			closable
			className="min-w-[350px] md:min-w-[600px]"
			onCancel={onCancel}
			onOk={onConfirm}
			footer={null}
		>
			<div className="flex gap-[10px] flex-wrap items-center">
				<Form
					onFinish={handleClick}
					form={form}
					className="flex flex-col gap-6 w-full"
				>
					<div>
						<label htmlFor="currentPassword">Current Password</label>
						<Form.Item
							name="currentPassword"
							className="m-0 w-full min-w-[250px]"
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
								type="password"
								className="p-2 text-sm leading-[21px]"
								placeholder="Enter current password"
							/>
						</Form.Item>
					</div>
					<div>
						<label htmlFor="newPassword">New Password</label>
						<Form.Item
							name="newPassword"
							className="m-0 w-full min-w-[250px]"
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
								type="password"
								className="p-2 text-sm leading-[21px]"
								placeholder="Enter new password"
							/>
						</Form.Item>
					</div>
					<div>
						<label htmlFor="confirmPassword">Confirm New Password</label>
						<Form.Item
							name="confirmPassword"
							className="m-0 w-full min-w-[250px]"
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
										return Promise.reject(
											new Error('Password that you entered do not match!')
										);
									}
								})
							]}
						>
							<Input
								type="password"
								className="p-2 text-sm leading-[21px]"
								placeholder="Confirm new password"
							/>
						</Form.Item>
					</div>
					<div>
						<div className="mr-[-24px] ml-[-24px]">
							<Divider className="my-4" />
						</div>
						<div className="flex justify-end gap-4">
							<Button
								key="1"
								onClick={onCancel}
								className="h-10 rounded-[6px] bg-[#FFFFFF] border border-solid border-pink_primary px-[36px] py-[4px] text-pink_primary font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize"
							>
                Cancel
							</Button>
							<Button
								onClick={onConfirm}
								loading={loading}
								htmlType="submit"
								key="2"
								className="h-10 rounded-[6px] bg-[#E5007A] border border-solid border-pink_primary px-[36px] py-[4px] text-white font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize"
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

export default ChangePassword;
