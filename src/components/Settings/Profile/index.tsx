// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Alert, Button, Form, Input, Row } from 'antd';
import { Rule } from 'antd/lib/form';
import React, { FC, useState } from 'react';
import { NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import cleanError from 'src/util/cleanError';
import messages from 'src/util/messages';
import * as validation from 'src/util/validation';

import { MessageType } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import Header from '../Header';

interface IPasswordProps {
    name: string;
    placeholder: string;
    rules?: Rule[];
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const Password: FC<IPasswordProps> = ({ name, placeholder, rules, onChange }) => {
	return (
		<div className='flex flex-col gap-y-2 h-full max-w-[250px]'>
			<label
				className="text-sm text-sidebarBlue font-normal leading-6 tracking-wide"
				htmlFor={name}
			>
				{placeholder}
			</label>
			<Form.Item
				name={name}
				rules={rules}
			>
				<Input.Password
					onChange={onChange}
					placeholder={placeholder}
					className="rounded-md py-2 px-4 md:min-w-[250px] border-grey_border"
					id={name}
				/>
			</Form.Item>
		</div>
	);
};

const Profile = () => {
	const [form] = Form.useForm();
	const { password } = validation;
	const [isSave, setIsSave] = useState(false);
	const [isChange, setIsChange] = useState(false);
	const [currentPassword, setCurrentPassword] = useState('');
	const [passwords, setPasswords] = useState({ new: '', old: '' });
	const [err, setErr] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (values: any) => {
		setErr('');
		if (values?.old_password) {
			const { old_password } = values;
			setPasswords((prevState) => ({ ...prevState, old: old_password }));
			setIsChange(true);
		} else {
			const { new_password, confirm_password } = values;
			if (new_password && confirm_password){
				setLoading(true);
				const { data , error } = await nextApiClientFetch<MessageType>( 'api/v1/auth/actions/changePassword', {
					newPassword: new_password,
					oldPassword: currentPassword
				});

				if (error || !data || !data.message) {
					setErr(error || 'Something went wrong');
					form.resetFields();
					form.setFieldValue('old_password', currentPassword);
					setIsSave(false);
					setIsChange(false);
					queueNotification({
						header: 'Failed!',
						message: cleanError(error || 'Something went wrong'),
						status: NotificationStatus.ERROR
					});
				}

				if (data && data.message) {
					form.resetFields();
					setIsSave(false);
					setIsChange(false);
					if (data && data.message) {
						queueNotification({
							header: 'Success!',
							message: data.message,
							status: NotificationStatus.SUCCESS
						});
					}
				}

				setLoading(false);
			}
		}
	};

	return (
		<Row className='flex flex-col w-full'>
			<Header heading='Profile Settings' subHeading='Update your profile settings' />
			<Form form={form} onFinish={handleSubmit} className='mt-8'>
				{err && <div className='mb-4 flex items-start'>
					<Alert type='error' message={err} />
				</div>}
				{
					isChange
						? <article className='flex flex-col lg:flex-row gap-x-5'>
							<Password
								onChange={
									(e) => {
										setPasswords((prev) => ({ ...prev, new: e?.target?.value }));
										if (passwords.old) {
											setIsSave(true);
										}
									}
								}
								name='new_password'
								placeholder='New Password'
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
							/>
							<Password
								onChange={(e) => setPasswords((prev) => ({ ...prev, old: e?.target?.value }))}
								name='confirm_password'
								placeholder='Confirm Password'
								rules={[
									{
										message: 'Password don\'t match',
										validator(rule, value, callback) {
											if (callback && value !== passwords.new){
												callback(rule?.message?.toString());
												setIsSave(false);
											}else {
												callback();
												setIsSave(true);
											}
										}
									}
								]}
							/>
						</article>
						: <article className='w-full flex flex-col md:flex-row gap-x-4'>
							<Password
								onChange={
									(e) => {
										setCurrentPassword(e.target.value || '');
										if (err){
											setErr('');
										}
									}
								}
								name='old_password'
								placeholder='Password'
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
							/>
							<Button
								loading={loading}
								size='small'
								htmlType='submit'
								className='border-none outline-none bg-none flex items-center p-0 m-0 md:mt-10 text-pink_primary text-sm leading-6 tracking-wide'
							>
                                Change
							</Button>
						</article>
				}
				<Button
					loading={loading}
					disabled={!isSave}
					size='large'
					htmlType='submit'
					className={`mt-5 rounded-lg font-semibold text-lg leading-7 text-white py-3 outline-none border-none px-14 flex items-center justify-center ${isSave?'bg-pink_primary':'bg-icon_grey'}`}
				>
                    Save
				</Button>
			</Form>
		</Row>
	);
};

export default Profile;