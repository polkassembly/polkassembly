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
import { useUserDetailsContext } from '~src/context';
import { handleTokenChange } from '~src/services/auth.service';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import Header from '../Header';

interface IPasswordProps {
    name: string;
    placeholder: string;
    rules?: Rule[];
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

interface IEmailProps {
	value: string;
	name: string;
	label: string;
	rules?: Rule[];
	disabled: boolean;
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

const ChangeEmail: FC<IEmailProps> = ({ disabled, value, name, label, rules, onChange }) => {
	return (
		<div className='flex flex-col gap-y-2 h-full max-w-[250px]'>
			<label
				className="text-sm text-sidebarBlue font-normal leading-6 tracking-wide"
				htmlFor={name}
			>
				{label}
			</label>
			<Form.Item
				name={name}
				rules={rules}
			>
				<Input
					disabled={disabled}
					defaultValue={value}
					value={value}
					onChange={onChange}
					placeholder="email@example.com"
					className="rounded-md py-3 px-4 w-[320px]"
					id="email"
					type='email'
				/>
			</Form.Item>
		</div>
	);
};

const initialPasswordsState = { new: '', old: '' };

const Profile = () => {
	const [form] = Form.useForm();
	const { password, email: emailValidation } = validation;

	const currentUser = useUserDetailsContext();
	const { email: currentEmail } = currentUser;

	const [isChange, setIsChange] = useState(false);
	const [currentPassword, setCurrentPassword] = useState('');
	const [email, setEmail] = useState(currentEmail);
	const [passwords, setPasswords] = useState(initialPasswordsState);
	const [err, setErr] = useState('');
	const [loading, setLoading] = useState(false);
	const { web3signup } = useUserDetailsContext();

	const isSubmitDisabled =web3signup ? email === '' : isChange ? (!passwords.old || !passwords.new) : (!currentPassword || currentEmail === email);

	const handleSubmit = async (values: any) => {
		if(email === currentEmail){
			setErr('You already verified this email');
			return;
		}
		try {
			await form.validateFields();
		} catch (error) {
			// validation failed
			setErr(error);
			return;
		}

		//validation is successful
		setErr('');
		if(web3signup){
			try {
				setLoading(true);
				const { data, error } = await nextApiClientFetch<any>(
					'api/v1/auth/actions/sendVerificationEmail',
					{
						email
					}
				);
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
		}

		const { new_password, old_password } = values;
		if(currentEmail !== email && currentPassword){
			setLoading(true);
			// nextApiClientFetch<ChangeResponseType | MessageType>
			const { data , error } = await nextApiClientFetch<any>( 'api/v1/auth/actions/changeEmail', {
				email: email,
				password: currentPassword
			});

			if (error || !data || !data.message) {
				setErr(error || 'Something went wrong');
				form.resetFields();
				setIsChange(false);
				queueNotification({
					header: 'Failed!',
					message: cleanError(error || 'Something went wrong'),
					status: NotificationStatus.ERROR
				});
			}

			if (data && data.message && data.token) {
				handleTokenChange(data.token, currentUser);

				form.resetFields();
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

		if (new_password && old_password){
			setLoading(true);
			const { data , error } = await nextApiClientFetch<MessageType>( 'api/v1/auth/actions/changePassword', {
				newPassword: new_password,
				oldPassword: old_password
			});

			if (error || !data || !data.message) {
				setErr(error || 'Something went wrong');
				form.resetFields();
				setIsChange(false);
				queueNotification({
					header: 'Failed!',
					message: cleanError(error || 'Something went wrong'),
					status: NotificationStatus.ERROR
				});
			}

			if (data && data.message) {
				form.resetFields();
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

	};

	return (
		<Row className='flex flex-col w-full'>
			<Header heading='Profile Settings' subHeading='Update your profile settings' />
			<Form form={form} onFinish={handleSubmit} className='mt-8'>
				{err && <div className='mb-4 flex items-start'>
					<Alert type='error' message={err} />
				</div>}

				<article className='w-full flex flex-col md:flex-row gap-x-4'>
					<ChangeEmail
						disabled={isChange}
						value={email || ''}
						onChange={
							(e) => {
								setEmail(e.target.value || '');
								if (err){
									setErr('');
								}
							}
						}
						name='email'
						label='Email'
						rules={[
							{
								message: messages.VALIDATION_EMAIL_ERROR,
								pattern: emailValidation.pattern
							}
						]}
					/>
				</article>

				{
					!web3signup &&
					(isChange // only allow to change password if not changing email
						? <article className='flex flex-col lg:flex-row gap-x-5'>
							<Password
								onChange={
									(e) => {
										setPasswords((prev) => ({ ...prev, old: e?.target?.value }));
									}
								}
								name='old_password'
								placeholder='Old Password'
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
								onChange={(e) => setPasswords((prev) => ({ ...prev, new: e?.target?.value }))}
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

							<Button
								loading={loading}
								size='small'
								htmlType='button'
								onClick={() => { setIsChange(false); setPasswords(initialPasswordsState); }}
								className='border-none outline-none bg-none flex items-center p-0 m-0 md:mt-10 text-pink_primary text-sm leading-6 tracking-wide'
							>
               Cancel Change
							</Button>
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
								name='current_password'
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
								size='small'
								htmlType='button'
								onClick={() => {setIsChange(true); setCurrentPassword('');}}
								className='border-none outline-none bg-none flex items-center p-0 m-0 md:mt-10 text-pink_primary text-sm leading-6 tracking-wide'
							>
               Change
							</Button>
						</article>)
				}

				<Button
					loading={loading}
					disabled={isSubmitDisabled}
					size='large'
					htmlType='submit'
					className={`${!isSubmitDisabled ? 'bg-pink_primary': 'bg-icon_grey'} mt-5 rounded-lg font-semibold text-lg leading-7 text-white py-3 outline-none border-none px-14 flex items-center justify-center bg-pink_primary`}
				>
					Save
				</Button>
			</Form>
		</Row>
	);
};

export default Profile;